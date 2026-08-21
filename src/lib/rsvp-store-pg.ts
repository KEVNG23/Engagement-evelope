import { query } from "./db";
import type { RsvpRecord } from "./rsvp";

export async function saveRsvp(record: RsvpRecord): Promise<RsvpRecord> {
  await query(
    `
    INSERT INTO rsvps (
      token, name, guest_group, guest_group_other, attend, 
      allergy, vegetarian, email, google_key, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (token) 
    DO UPDATE SET
      name = EXCLUDED.name,
      guest_group = EXCLUDED.guest_group,
      guest_group_other = EXCLUDED.guest_group_other,
      attend = EXCLUDED.attend,
      allergy = EXCLUDED.allergy,
      vegetarian = EXCLUDED.vegetarian,
      email = EXCLUDED.email,
      google_key = EXCLUDED.google_key,
      updated_at = NOW()
    `,
    [
      record.token,
      record.name,
      record.guestGroup,
      record.guestGroupOther,
      record.attend,
      record.allergy,
      record.vegetarian,
      record.email || null,
      record.googleKey || null,
      record.createdAt,
    ],
  );

  return record;
}

export async function getRsvp(token: string): Promise<RsvpRecord | null> {
  if (!/^[a-f0-9]{32}$/i.test(token)) return null;

  const rows = await query<{
    token: string;
    name: string;
    guest_group: string;
    guest_group_other: string;
    attend: string;
    allergy: string;
    vegetarian: string;
    email: string | null;
    google_key: string | null;
    created_at: string;
  }>(
    `
    SELECT token, name, guest_group, guest_group_other, attend, 
           allergy, vegetarian, email, google_key, created_at
    FROM rsvps 
    WHERE token = $1
    `,
    [token],
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    token: row.token,
    name: row.name,
    guestGroup: row.guest_group,
    guestGroupOther: row.guest_group_other,
    attend: row.attend,
    allergy: row.allergy,
    vegetarian: row.vegetarian,
    email: row.email || undefined,
    googleKey: row.google_key || undefined,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listRsvps(): Promise<RsvpRecord[]> {
  const rows = await query<{
    token: string;
    name: string;
    guest_group: string;
    guest_group_other: string;
    attend: string;
    allergy: string;
    vegetarian: string;
    email: string | null;
    google_key: string | null;
    created_at: string;
  }>(
    `
    SELECT token, name, guest_group, guest_group_other, attend, 
           allergy, vegetarian, email, google_key, created_at
    FROM rsvps 
    ORDER BY created_at DESC
    `,
  );

  return rows.map((row) => ({
    token: row.token,
    name: row.name,
    guestGroup: row.guest_group,
    guestGroupOther: row.guest_group_other,
    attend: row.attend,
    allergy: row.allergy,
    vegetarian: row.vegetarian,
    email: row.email || undefined,
    googleKey: row.google_key || undefined,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function deleteRsvp(token: string): Promise<boolean> {
  if (!/^[a-f0-9]{32}$/i.test(token)) return false;

  const result = await query(`DELETE FROM rsvps WHERE token = $1`, [token]);
  return (result as any).rowCount > 0;
}

export async function readRsvpMap(): Promise<Record<string, RsvpRecord>> {
  const rows = await listRsvps();
  const map: Record<string, RsvpRecord> = {};
  for (const row of rows) {
    map[row.token] = row;
  }
  return map;
}

export async function writeRsvps(
  records: Record<string, RsvpRecord>,
): Promise<void> {
  // This is used for bulk sync from Google Sheets
  // We'll use a transaction to ensure atomicity
  const pool = (await import("./db")).getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get all existing tokens
    const existingResult = await client.query<{ token: string }>(
      "SELECT token FROM rsvps",
    );
    const existingTokens = new Set(existingResult.rows.map((r) => r.token));
    const newTokens = new Set(Object.keys(records));

    // Delete records that are no longer in the new set
    for (const token of existingTokens) {
      if (!newTokens.has(token)) {
        await client.query("DELETE FROM rsvps WHERE token = $1", [token]);
      }
    }

    // Upsert all records
    for (const record of Object.values(records)) {
      await client.query(
        `
        INSERT INTO rsvps (
          token, name, guest_group, guest_group_other, attend, 
          allergy, vegetarian, email, google_key, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (token) 
        DO UPDATE SET
          name = EXCLUDED.name,
          guest_group = EXCLUDED.guest_group,
          guest_group_other = EXCLUDED.guest_group_other,
          attend = EXCLUDED.attend,
          allergy = EXCLUDED.allergy,
          vegetarian = EXCLUDED.vegetarian,
          email = EXCLUDED.email,
          google_key = EXCLUDED.google_key,
          updated_at = NOW()
        `,
        [
          record.token,
          record.name,
          record.guestGroup,
          record.guestGroupOther,
          record.attend,
          record.allergy,
          record.vegetarian,
          record.email || null,
          record.googleKey || null,
          record.createdAt,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function resolveDataDir(): string {
  return "postgresql";
}

export function isLikelyEphemeralStore(): boolean {
  return false;
}
