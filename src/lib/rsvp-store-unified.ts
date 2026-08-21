/**
 * Unified storage interface that automatically uses PostgreSQL if DATABASE_URL
 * is configured, otherwise falls back to file-based storage.
 */

import type { RsvpRecord } from "./rsvp";

type StoreImpl = {
  saveRsvp: (record: RsvpRecord) => Promise<RsvpRecord>;
  getRsvp: (token: string) => Promise<RsvpRecord | null>;
  listRsvps: () => Promise<RsvpRecord[]>;
  deleteRsvp: (token: string) => Promise<boolean>;
  readRsvpMap: () => Promise<Record<string, RsvpRecord>>;
  writeRsvps: (records: Record<string, RsvpRecord>) => Promise<void>;
  resolveDataDir?: () => string;
  isLikelyEphemeralStore?: () => boolean;
};

let impl: StoreImpl | null = null;
let implPromise: Promise<StoreImpl> | null = null;

async function loadImpl(): Promise<StoreImpl> {
  if (process.env.DATABASE_URL?.trim()) {
    // Dynamic path keeps `pg` out of the default webpack compile graph.
    const pgStore = await import("./rsvp-store-pg");
    const { runMigrations } = await import("./db-migrate");
    await runMigrations();
    return pgStore;
  }
  return import("./rsvp-store");
}

async function getImpl(): Promise<StoreImpl> {
  if (impl) return impl;
  if (!implPromise) {
    implPromise = loadImpl().then((store) => {
      impl = store;
      return store;
    });
  }
  return implPromise;
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
  return "postgresql";
}

export async function isLikelyEphemeralStore(): Promise<boolean> {
  const store = await getImpl();
  if (typeof store.isLikelyEphemeralStore === "function") {
    return store.isLikelyEphemeralStore();
  }
  return false;
}
