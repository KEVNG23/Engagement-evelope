import { NextResponse } from "next/server";
import { isHostAuthenticated } from "@/lib/host-auth";
import {
  googleSheetCsvUrl,
  tryAutoRestoreFromGoogleSheet,
} from "@/lib/google-sheet-sync";
import { guestGroupLabel } from "@/lib/rsvp";
import {
  isLikelyEphemeralStore,
  listRsvps,
  resolveDataDir,
} from "@/lib/rsvp-store-unified";

export async function GET() {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let records = await listRsvps();
  let restored = false;

  // After a redeploy the local file is empty — pull Google Sheet backup if configured.
  if (records.length === 0 && googleSheetCsvUrl()) {
    const result = await tryAutoRestoreFromGoogleSheet();
    if (result?.ok && (result.added > 0 || result.updated > 0)) {
      restored = true;
      records = await listRsvps();
    }
  }

  const rsvps = records.map((r) => ({
    token: r.token,
    name: r.name,
    guestGroup: guestGroupLabel(r),
    attend: r.attend,
    allergy: r.allergy,
    vegetarian: r.vegetarian,
    email: r.email,
    createdAt: r.createdAt,
    path: `/rsvp/${r.token}`,
  }));

  return NextResponse.json({
    ok: true,
    count: rsvps.length,
    rsvps,
    source: "site_store",
    restored,
    ephemeral: await isLikelyEphemeralStore(),
    dataDir: await resolveDataDir(),
    googleSheetConfigured: Boolean(googleSheetCsvUrl()),
    note: (await isLikelyEphemeralStore())
      ? "Store is ephemeral on redeploy unless Railway Volume is mounted at /data (or RSVP_DATA_DIR)."
      : "Store path looks persistent.",
  });
}
