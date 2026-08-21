import { NextResponse } from "next/server";
import { isHostAuthenticated } from "@/lib/host-auth";
import {
  googleSheetCsvUrl,
  syncFromGoogleSheetCsv,
  type SheetSyncMode,
} from "@/lib/google-sheet-sync";

type SyncBody = {
  csv?: string;
  mode?: SheetSyncMode;
};

export async function POST(request: Request) {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: SyncBody = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text) as SyncBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const mode: SheetSyncMode = body.mode === "replace" ? "replace" : "merge";
  let csvText = typeof body.csv === "string" ? body.csv.trim() : "";

  if (!csvText) {
    const csvUrl = googleSheetCsvUrl();
    if (!csvUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "google_sheet_not_configured",
          hint: "Paste CSV from Google Form responses, or set GOOGLE_SHEET_CSV_URL on Railway.",
        },
        { status: 503 },
      );
    }

    try {
      const response = await fetch(csvUrl, {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; EngagementInvite/1.0; +https://github.com/KEVNG23/Engagement-evelope)",
        },
      });
      if (!response.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: "sheet_fetch_failed",
            status: response.status,
          },
          { status: 502 },
        );
      }
      csvText = await response.text();
    } catch {
      return NextResponse.json(
        { ok: false, error: "sheet_fetch_failed" },
        { status: 502 },
      );
    }
  }

  const result = await syncFromGoogleSheetCsv(csvText, { mode });
  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result);
}

export async function GET() {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    configured: Boolean(googleSheetCsvUrl()),
  });
}
