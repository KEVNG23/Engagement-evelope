import { createRsvpToken, type RsvpRecord } from "./rsvp";
import { readRsvpMap, writeRsvps } from "./rsvp-store";

export type SheetSyncMode = "merge" | "replace";

export type SheetSyncResult = {
  ok: boolean;
  error?: string;
  mode: SheetSyncMode;
  added: number;
  updated: number;
  removed: number;
  keptLocalOnly: number;
  sheetRows: number;
};

type SheetRow = {
  googleKey: string;
  name: string;
  guestGroup: string;
  guestGroupOther: string;
  attend: string;
  allergy: string;
  vegetarian: string;
  createdAt: string;
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else if (ch === "\r") {
      // ignore
    } else {
      cell += ch;
    }
  }

  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

function findCol(headers: string[], needles: string[]) {
  return headers.findIndex((header) =>
    needles.some((needle) => header.includes(needle)),
  );
}

function cell(row: string[], index: number) {
  if (index < 0 || index >= row.length) return "";
  return row[index]?.trim() ?? "";
}

function toIsoFromSheetTimestamp(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return new Date().toISOString();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  const m = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]) - 1;
    const year = Number(m[3]);
    const hour = Number(m[4] ?? 0);
    const minute = Number(m[5] ?? 0);
    const second = Number(m[6] ?? 0);
    const d = new Date(year, month, day, hour, minute, second);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

function parseGuestGroup(raw: string): {
  guestGroup: string;
  guestGroupOther: string;
} {
  const value = raw.trim();
  if (!value) return { guestGroup: "", guestGroupOther: "" };

  const known = [
    "Gia đình nhà trai",
    "Gia đình nhà gái",
    "Bạn chú rể",
    "Bạn cô dâu",
    "Đồng nghiệp chú rể",
    "Đồng nghiệp cô dâu",
  ];
  if (known.includes(value)) {
    return { guestGroup: value, guestGroupOther: "" };
  }
  return { guestGroup: "Other", guestGroupOther: value };
}

export function parseSheetCsv(csvText: string): SheetRow[] {
  const table = parseCsv(csvText.replace(/^\uFEFF/, ""));
  if (table.length < 2) return [];

  const headers = table[0].map(normalizeHeader);
  const nameIdx = findCol(headers, ["ho va ten", "name", "full name"]);
  const groupIdx = findCol(headers, ["nhom khach", "guest group", "group"]);
  const attendIdx = findCol(headers, ["tham du", "attend", "attendance"]);
  const allergyIdx = findCol(headers, ["di ung", "allergy", "allerg"]);
  const vegIdx = findCol(headers, ["chay", "vegetarian", "veg"]);
  const timeIdx = findCol(headers, [
    "timestamp",
    "thoi gian",
    "dau thoi gian",
    "submitted",
  ]);

  if (nameIdx < 0) {
    throw new Error("sheet_missing_name_column");
  }

  const rows: SheetRow[] = [];
  for (let i = 1; i < table.length; i += 1) {
    const line = table[i];
    const name = cell(line, nameIdx);
    if (!name) continue;
    const timestamp = cell(line, timeIdx);
    const groupRaw = cell(line, groupIdx);
    const { guestGroup, guestGroupOther } = parseGuestGroup(groupRaw);
    const createdAt = toIsoFromSheetTimestamp(timestamp);
    const googleKey = `${timestamp || createdAt}|${normalizeName(name)}`;

    rows.push({
      googleKey,
      name,
      guestGroup,
      guestGroupOther,
      attend: cell(line, attendIdx),
      allergy: cell(line, allergyIdx),
      vegetarian: cell(line, vegIdx),
      createdAt,
    });
  }

  return rows;
}

export async function syncFromGoogleSheetCsv(
  csvText: string,
  options?: { mode?: SheetSyncMode },
): Promise<SheetSyncResult> {
  // merge = restore/add only (safe). replace = also delete local rows missing from sheet.
  const mode: SheetSyncMode = options?.mode === "replace" ? "replace" : "merge";

  let sheetRows: SheetRow[];
  try {
    sheetRows = parseSheetCsv(csvText);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "sheet_parse_failed";
    return {
      ok: false,
      error: message,
      mode,
      added: 0,
      updated: 0,
      removed: 0,
      keptLocalOnly: 0,
      sheetRows: 0,
    };
  }

  const local = await readRsvpMap();
  const next: Record<string, RsvpRecord> = { ...local };
  const usedKeys = new Set<string>();
  let updated = 0;
  let added = 0;
  let removed = 0;
  let keptLocalOnly = 0;

  const sheetByKey = new Map(sheetRows.map((r) => [r.googleKey, r]));
  const unusedByName = new Map<string, SheetRow[]>();
  for (const row of sheetRows) {
    const key = normalizeName(row.name);
    const list = unusedByName.get(key) ?? [];
    list.push(row);
    unusedByName.set(key, list);
  }

  function takeSheetMatch(record: RsvpRecord): SheetRow | null {
    if (record.googleKey && sheetByKey.has(record.googleKey)) {
      const row = sheetByKey.get(record.googleKey)!;
      usedKeys.add(row.googleKey);
      const nameList = unusedByName.get(normalizeName(row.name));
      if (nameList) {
        const idx = nameList.findIndex((r) => r.googleKey === row.googleKey);
        if (idx >= 0) nameList.splice(idx, 1);
      }
      return row;
    }

    const list = unusedByName.get(normalizeName(record.name));
    if (!list?.length) return null;
    const row = list.shift()!;
    usedKeys.add(row.googleKey);
    return row;
  }

  for (const [token, record] of Object.entries(local)) {
    const match = takeSheetMatch(record);
    if (match) {
      next[token] = {
        ...record,
        name: match.name,
        guestGroup: match.guestGroup,
        guestGroupOther: match.guestGroupOther,
        attend: match.attend,
        allergy: match.allergy,
        vegetarian: match.vegetarian,
        createdAt: match.createdAt || record.createdAt,
        googleKey: match.googleKey,
      };
      updated += 1;
      continue;
    }

    if (mode === "replace") {
      if (record.googleKey) {
        delete next[token];
        removed += 1;
        continue;
      }

      const stillOnSheet = sheetRows.some(
        (r) => normalizeName(r.name) === normalizeName(record.name),
      );
      if (sheetRows.length > 0 && !stillOnSheet) {
        delete next[token];
        removed += 1;
        continue;
      }
    }

    keptLocalOnly += 1;
  }

  for (const row of sheetRows) {
    if (usedKeys.has(row.googleKey)) continue;
    const token = createRsvpToken();
    next[token] = {
      token,
      name: row.name,
      guestGroup: row.guestGroup,
      guestGroupOther: row.guestGroupOther,
      attend: row.attend,
      allergy: row.allergy,
      vegetarian: row.vegetarian,
      createdAt: row.createdAt,
      googleKey: row.googleKey,
    };
    added += 1;
  }

  await writeRsvps(next);

  return {
    ok: true,
    mode,
    added,
    updated,
    removed,
    keptLocalOnly,
    sheetRows: sheetRows.length,
  };
}

export function googleSheetCsvUrl() {
  return process.env.GOOGLE_SHEET_CSV_URL?.trim() || "";
}

export async function tryAutoRestoreFromGoogleSheet() {
  const csvUrl = googleSheetCsvUrl();
  if (!csvUrl) return null;

  try {
    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; EngagementInvite/1.0; +https://github.com/KEVNG23/Engagement-evelope)",
      },
    });
    if (!response.ok) return null;
    const csvText = await response.text();
    return syncFromGoogleSheetCsv(csvText, { mode: "merge" });
  } catch {
    return null;
  }
}
