/**
 * Unified storage interface that automatically uses PostgreSQL if DATABASE_URL
 * is configured, otherwise falls back to file-based storage.
 */

import type { RsvpRecord } from "./rsvp";

const USE_POSTGRES = !!process.env.DATABASE_URL;

let impl: typeof import("./rsvp-store") | typeof import("./rsvp-store-pg");

async function getImpl() {
  if (!impl) {
    if (USE_POSTGRES) {
      impl = await import("./rsvp-store-pg");
      // Run migrations on first import
      const { runMigrations } = await import("./db-migrate");
      await runMigrations();
    } else {
      impl = await import("./rsvp-store");
    }
  }
  return impl;
}

export async function saveRsvp(record: RsvpRecord): Promise<RsvpRecord> {
  const store = await getImpl();
  return store.saveRsvp(record);
}

export async function getRsvp(token: string): Promise<RsvpRecord | null> {
  const store = await getImpl();
  return store.getRsvp(token);
}

export async function listRsvps(): Promise<RsvpRecord[]> {
  const store = await getImpl();
  return store.listRsvps();
}

export async function deleteRsvp(token: string): Promise<boolean> {
  const store = await getImpl();
  return store.deleteRsvp(token);
}

export async function readRsvpMap(): Promise<Record<string, RsvpRecord>> {
  const store = await getImpl();
  return store.readRsvpMap();
}

export async function writeRsvps(
  records: Record<string, RsvpRecord>,
): Promise<void> {
  const store = await getImpl();
  return store.writeRsvps(records);
}

export async function resolveDataDir(): Promise<string> {
  const store = await getImpl();
  if (typeof store.resolveDataDir === "function") {
    return store.resolveDataDir();
  }
  return "unknown";
}

export async function isLikelyEphemeralStore(): Promise<boolean> {
  const store = await getImpl();
  if (typeof store.isLikelyEphemeralStore === "function") {
    return store.isLikelyEphemeralStore();
  }
  return false;
}
