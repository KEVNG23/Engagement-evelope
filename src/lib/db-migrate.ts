import { getPool } from "./db";

export async function runMigrations() {
  const pool = getPool();

  try {
    // Create rsvps table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rsvps (
        token VARCHAR(32) PRIMARY KEY,
        name TEXT NOT NULL,
        guest_group TEXT NOT NULL,
        guest_group_other TEXT NOT NULL DEFAULT '',
        attend TEXT NOT NULL,
        allergy TEXT NOT NULL,
        vegetarian TEXT NOT NULL,
        email TEXT,
        google_key TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Create index on created_at for sorting
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);
    `);

    // Create index on google_key for sync operations
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rsvps_google_key ON rsvps(google_key) WHERE google_key IS NOT NULL;
    `);

    // Create index on email for filtering
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email) WHERE email IS NOT NULL;
    `);

    console.log("✓ Database migrations completed successfully");
  } catch (error) {
    console.error("Failed to run migrations:", error);
    throw error;
  }
}
