import { randomBytes } from "crypto";

export type RsvpRecord = {
  token: string;
  name: string;
  guestGroup: string;
  guestGroupOther: string;
  attend: string;
  allergy: string;
  vegetarian: string;
  createdAt: string;
  /** Fingerprint from linked Google Sheet row (Timestamp|name) for sync/delete. */
  googleKey?: string;
};

export function createRsvpToken() {
  return randomBytes(16).toString("hex");
}

export function guestGroupLabel(record: RsvpRecord) {
  if (record.guestGroup === "Other") {
    return record.guestGroupOther.trim() || "Other";
  }
  return record.guestGroup;
}
