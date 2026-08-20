/** Browser localStorage key for the private RSVP view token (option 3). */
export const RSVP_TOKEN_STORAGE_KEY = "engagement-rsvp-token";

export function getStoredRsvpToken(): string | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(RSVP_TOKEN_STORAGE_KEY);
  if (saved && /^[a-f0-9]{32}$/i.test(saved)) return saved;
  return null;
}

/** Clear a stale token so the guest can submit RSVP again on this browser. */
export function clearStoredRsvpToken(token?: string | null) {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem(RSVP_TOKEN_STORAGE_KEY);
  if (!token || !saved || saved === token) {
    window.localStorage.removeItem(RSVP_TOKEN_STORAGE_KEY);
  }
}
