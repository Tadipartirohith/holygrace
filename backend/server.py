from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
import logging
import hmac
import hashlib
import uuid
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ─────────────────────────────────────────────────────────────
# Configure logging FIRST so startup errors are visible
# ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Validate required env vars with clear errors (no silent KeyError)
# ─────────────────────────────────────────────────────────────
def require_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        logger.error(
            f"FATAL: Required environment variable '{key}' is not set. "
            f"Copy backend/.env.example to backend/.env and fill it in."
        )
        sys.exit(1)
    return value


MONGO_URL = require_env("MONGO_URL")
DB_NAME = require_env("DB_NAME")

# Optional config
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_REPLACE_WITH_YOUR_KEY")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "REPLACE_WITH_YOUR_SECRET")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_API_URL = os.environ.get("RESEND_API_URL", "https://api.resend.com/emails")
RESEND_FROM_EMAIL = os.environ.get(
    "RESEND_FROM_EMAIL", "Grace Community <onboarding@resend.dev>"
)
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "pastor@gracecommunity.org")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")  # required to access admin endpoints
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Grace Community Church API")
api_router = APIRouter(prefix="/api")


# ─────────────────────────────────────────────────────────────
# Admin auth dependency — protects sensitive list endpoints
# ─────────────────────────────────────────────────────────────
async def require_admin(x_admin_token: Optional[str] = Header(default=None)):
    if not ADMIN_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="Admin access not configured. Set ADMIN_TOKEN in backend/.env.",
        )
    if not x_admin_token or not hmac.compare_digest(x_admin_token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# ─────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────
class PrayerRequestIn(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    category: str = "Other"
    request: str = Field(min_length=3)
    is_anonymous: bool = False


class PrayerRequestPublicOut(BaseModel):
    """What the submitter sees back — no other people's data."""
    id: str
    status: str
    created_at: str


class PrayerRequestAdminOut(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    category: str
    request: str
    is_anonymous: bool
    status: str
    created_at: str


class DonationOrderIn(BaseModel):
    amount: int = Field(gt=0, description="Amount in INR rupees")
    donor_name: str
    donor_email: EmailStr
    purpose: str = "Tithe"
    method: str = "razorpay"  # razorpay | upi


class DonationOrderOut(BaseModel):
    id: str
    order_id: str
    amount: int
    currency: str
    method: str
    status: str


class PaymentVerifyIn(BaseModel):
    order_id: str
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


class UpiConfirmIn(BaseModel):
    order_id: str
    upi_txn_ref: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────
async def send_prayer_email(prayer: dict) -> None:
    """Send admin notification. No-op if RESEND_API_KEY not set."""
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set — skipping email; prayer stored in DB")
        return
    try:
        import requests
        html = f"""
        <h2>New Prayer Request — Grace Community Church</h2>
        <p><b>From:</b> {'Anonymous' if prayer.get('is_anonymous') else prayer.get('name')}</p>
        <p><b>Email:</b> {prayer.get('email') or '—'}</p>
        <p><b>Category:</b> {prayer.get('category')}</p>
        <hr/>
        <p>{prayer.get('request')}</p>
        <p style="color:#888;font-size:12px;">Submitted at {prayer.get('created_at')}</p>
        """
        requests.post(
            RESEND_API_URL,
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={
                "from": RESEND_FROM_EMAIL,
                "to": [ADMIN_EMAIL],
                "subject": f"Prayer Request — {prayer.get('category')}",
                "html": html,
            },
            timeout=10,
        )
    except Exception as e:
        logger.exception(f"Email send failed: {e}")


# ─────────────────────────────────────────────────────────────
# Routes — Health
# ─────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "Grace Community Church API is alive", "status": "ok"}


# ─────────────────────────────────────────────────────────────
# Routes — Prayer Requests
# ─────────────────────────────────────────────────────────────
@api_router.post("/prayers", response_model=PrayerRequestPublicOut)
async def create_prayer(req: PrayerRequestIn):
    now = datetime.now(timezone.utc).isoformat()
    prayer = {
        "id": str(uuid.uuid4()),
        "name": "Anonymous" if req.is_anonymous else req.name,
        "email": req.email,
        "category": req.category,
        "request": req.request,
        "is_anonymous": req.is_anonymous,
        "status": "received",
        "created_at": now,
    }
    await db.prayers.insert_one(prayer.copy())
    await send_prayer_email(prayer)
    # Only return non-sensitive confirmation to the submitter.
    return PrayerRequestPublicOut(id=prayer["id"], status="received", created_at=now)


@api_router.get(
    "/admin/prayers",
    response_model=List[PrayerRequestAdminOut],
    dependencies=[Depends(require_admin)],
)
async def list_prayers_admin():
    """Admin-only: returns all prayer requests. Requires X-Admin-Token header."""
    items = await db.prayers.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [PrayerRequestAdminOut(**i) for i in items]


# ─────────────────────────────────────────────────────────────
# Routes — Donations
# ─────────────────────────────────────────────────────────────
@api_router.post("/donations/create-order", response_model=DonationOrderOut)
async def create_donation_order(req: DonationOrderIn):
    """Create an order record. For Razorpay we generate a deterministic order_id.
    In production, call Razorpay's /v1/orders endpoint with your secret.
    """
    internal_id = str(uuid.uuid4())
    order_id = f"order_{uuid.uuid4().hex[:14]}"
    record = {
        "id": internal_id,
        "order_id": order_id,
        "amount": req.amount,
        "currency": "INR",
        "donor_name": req.donor_name,
        "donor_email": req.donor_email,
        "purpose": req.purpose,
        "method": req.method,
        "status": "created",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.donations.insert_one(record.copy())
    return DonationOrderOut(
        id=internal_id,
        order_id=order_id,
        amount=req.amount,
        currency="INR",
        method=req.method,
        status="created",
    )


@api_router.post("/donations/verify-razorpay")
async def verify_razorpay(req: PaymentVerifyIn):
    """Verify Razorpay signature. Requires real RAZORPAY_KEY_SECRET in backend .env."""
    msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode()
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(), msg, hashlib.sha256
    ).hexdigest()
    verified = hmac.compare_digest(expected, req.razorpay_signature)
    new_status = "completed" if verified else "failed"
    await db.donations.update_one(
        {"order_id": req.razorpay_order_id},
        {
            "$set": {
                "status": new_status,
                "razorpay_payment_id": req.razorpay_payment_id,
                "verified_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return {"verified": verified, "status": new_status}


@api_router.post("/donations/confirm-upi")
async def confirm_upi(req: UpiConfirmIn):
    """Mark a UPI donation as awaiting verification. Bank webhook would finalize."""
    await db.donations.update_one(
        {"order_id": req.order_id},
        {
            "$set": {
                "status": "upi_initiated",
                "upi_txn_ref": req.upi_txn_ref,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return {"status": "upi_initiated"}


@api_router.get("/admin/donations", dependencies=[Depends(require_admin)])
async def list_donations_admin():
    """Admin-only: returns all donations. Requires X-Admin-Token header."""
    items = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


# ─────────────────────────────────────────────────────────────
# Mount
# ─────────────────────────────────────────────────────────────
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
