"""Backend API tests for Grace Community Church"""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://faith-stream-27.preview.emergentagent.com").rstrip("/")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "test-admin-token-12345")


@pytest.fixture
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# --- Health ---
def test_health(s):
    r = s.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "ok"
    assert "Grace Community Church" in d["message"]


# --- Prayer ---
class TestPrayer:
    def test_create_prayer_and_list(self, s):
        payload = {"name": "TEST_User", "email": "test@example.com",
                   "category": "Healing", "request": "Please pray for testing",
                   "is_anonymous": False}
        r = s.post(f"{BASE_URL}/api/prayers", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "received"
        assert "id" in d
        assert "_id" not in d
        # Submitter response is non-sensitive (no name/email/request echoed back).
        assert "name" not in d
        assert "email" not in d
        assert "request" not in d

        # GET admin list — requires X-Admin-Token
        r2 = s.get(f"{BASE_URL}/api/admin/prayers",
                   headers={"X-Admin-Token": ADMIN_TOKEN})
        assert r2.status_code == 200
        items = r2.json()
        assert isinstance(items, list)
        for it in items:
            assert "_id" not in it
        assert any(p["id"] == d["id"] for p in items)

    def test_admin_prayers_requires_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/prayers")
        assert r.status_code in (401, 503)
        r2 = s.get(f"{BASE_URL}/api/admin/prayers",
                   headers={"X-Admin-Token": "wrong-token"})
        assert r2.status_code in (401, 503)

    def test_anonymous_prayer(self, s):
        r = s.post(f"{BASE_URL}/api/prayers", json={
            "name": "ShouldBeHidden", "request": "Anon prayer test", "is_anonymous": True
        })
        assert r.status_code == 200
        # Submitter no longer sees name field at all (privacy).
        assert "name" not in r.json()

    def test_validation_empty_request(self, s):
        r = s.post(f"{BASE_URL}/api/prayers", json={"name": "X", "request": ""})
        assert r.status_code == 422

    def test_validation_short_request(self, s):
        r = s.post(f"{BASE_URL}/api/prayers", json={"name": "X", "request": "a"})
        assert r.status_code == 422


# --- Donations ---
class TestDonations:
    def test_create_upi_order(self, s):
        r = s.post(f"{BASE_URL}/api/donations/create-order", json={
            "amount": 500, "donor_name": "TEST_Donor", "donor_email": "d@example.com",
            "purpose": "Tithe", "method": "upi"
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "created"
        assert d["method"] == "upi"
        assert d["amount"] == 500
        assert d["currency"] == "INR"
        assert d["order_id"].startswith("order_")
        assert "_id" not in d

    def test_create_razorpay_order(self, s):
        r = s.post(f"{BASE_URL}/api/donations/create-order", json={
            "amount": 1000, "donor_name": "TEST_Donor2", "donor_email": "d2@example.com",
            "method": "razorpay"
        })
        assert r.status_code == 200
        d = r.json()
        assert d["method"] == "razorpay"
        assert d["status"] == "created"

    def test_confirm_upi(self, s):
        # create
        r = s.post(f"{BASE_URL}/api/donations/create-order", json={
            "amount": 100, "donor_name": "TEST_UPI", "donor_email": "u@example.com",
            "method": "upi"
        })
        order_id = r.json()["order_id"]
        r2 = s.post(f"{BASE_URL}/api/donations/confirm-upi", json={
            "order_id": order_id, "upi_txn_ref": "TXN123"
        })
        assert r2.status_code == 200
        assert r2.json()["status"] == "upi_initiated"

        # verify persisted via admin list
        lst = s.get(f"{BASE_URL}/api/admin/donations",
                    headers={"X-Admin-Token": ADMIN_TOKEN}).json()
        match = [x for x in lst if x.get("order_id") == order_id]
        assert match and match[0]["status"] == "upi_initiated"

    def test_verify_razorpay_fake_signature(self, s):
        r = s.post(f"{BASE_URL}/api/donations/create-order", json={
            "amount": 200, "donor_name": "TEST_RZ", "donor_email": "r@example.com",
            "method": "razorpay"
        })
        order_id = r.json()["order_id"]
        r2 = s.post(f"{BASE_URL}/api/donations/verify-razorpay", json={
            "order_id": order_id,
            "razorpay_payment_id": "pay_fake",
            "razorpay_order_id": order_id,
            "razorpay_signature": "fake_sig"
        })
        assert r2.status_code == 200
        d = r2.json()
        assert d["verified"] is False
        assert d["status"] == "failed"

    def test_list_donations_no_objectid(self, s):
        r = s.get(f"{BASE_URL}/api/admin/donations",
                  headers={"X-Admin-Token": ADMIN_TOKEN})
        assert r.status_code == 200
        for it in r.json():
            assert "_id" not in it

    def test_admin_donations_requires_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/donations")
        assert r.status_code in (401, 503)

    def test_invalid_amount(self, s):
        r = s.post(f"{BASE_URL}/api/donations/create-order", json={
            "amount": 0, "donor_name": "X", "donor_email": "x@example.com", "method": "upi"
        })
        assert r.status_code == 422
