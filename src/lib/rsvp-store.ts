import { mkdir, readFile, writeFile, access, constants } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { RsvpRecord } from "./rsvp";

async function isWritableDir(dir: string) {
  try {
    await access(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prefer an explicit RSVP_DATA_DIR, then a Railway volume at /data,
 * otherwise the app `data/` folder (ephemeral on most hosts).
 */
export function resolveDataDir() {
  const configured = process.env.RSVP_DATA_DIR?.trim();
  if (configured) return configured;
  if (existsSync("/data")) return "/data";
  return path.join(process.cwd(), "data");
}

export function isLikelyEphemeralStore() {
  const dir = resolveDataDir();
  if (process.env.RSVP_DATA_DIR?.trim()) return false;
  if (dir === "/data") return false;
  return true;
}

function storePath() {
  return path.join(resolveDataDir(), "rsvps.json");
}

async function readAll(): Promise<Record<string, RsvpRecord>> {
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Record<string, RsvpRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(records: Record<string, RsvpRecord>) {
  const dir = resolveDataDir();
  await mkdir(dir, { recursive: true });
  if (!(await isWritableDir(dir))) {
    throw new Error(`rsvp_data_dir_not_writable:${dir}`);
  }
  await writeFile(storePath(), JSON.stringify(records, null, 2), "utf8");
}

export async function saveRsvp(record: RsvpRecord) {
  const records = await readAll();
  records[record.token] = record;
  await writeAll(records);
  return record;
}

export async function getRsvp(token: string) {
  if (!/^[a-f0-9]{32}$/i.test(token)) return null;
  const records = await readAll();
  return records[token] ?? null;
}

export async function listRsvps(): Promise<RsvpRecord[]> {
  const records = await readAll();
  return Object.values(records).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  );
}

export async function deleteRsvp(token: string) {
  if (!/^[a-f0-9]{32}$/i.test(token)) return false;
  const records = await readAll();
  if (!records[token]) return false;
  delete records[token];
  await writeAll(records);
  return true;
}

export async function writeRsvps(records: Record<string, RsvpRecord>) {
  await writeAll(records);
}

export async function readRsvpMap() {
  return readAll();
}
