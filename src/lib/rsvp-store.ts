import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { RsvpRecord } from "./rsvp";

function dataDir() {
  return process.env.RSVP_DATA_DIR || path.join(process.cwd(), "data");
}

function storePath() {
  return path.join(dataDir(), "rsvps.json");
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
  const dir = dataDir();
  await mkdir(dir, { recursive: true });
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
