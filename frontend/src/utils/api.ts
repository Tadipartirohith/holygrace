/**
 * API client helper.
 * Reads EXPO_PUBLIC_BACKEND_URL at module load.
 * Fails loud with a clear error if the env var is missing, so a misconfigured
 * build never silently calls `undefined/api/...`.
 */

const RAW_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!RAW_URL || typeof RAW_URL !== "string" || RAW_URL.trim().length === 0) {
  // eslint-disable-next-line no-console
  console.error(
    "[GraceApp] EXPO_PUBLIC_BACKEND_URL is not set. " +
      "Add it to /app/frontend/.env, then restart Expo. " +
      "API calls will fail until this is fixed."
  );
}

export const API_BASE_URL: string = (RAW_URL || "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      "EXPO_PUBLIC_BACKEND_URL is not configured. Set it in frontend/.env."
    );
  }
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}
