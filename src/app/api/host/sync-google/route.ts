import { NextResponse } from "next/server";
import { isHostAuthenticated } from "@/lib/host-auth";
import {
  googleSheetCsvUrl,
  syncFromGoogleSheetCsv,
} from "@/lib/google-sheet-sync";

export async function POST() {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const csvUrl = googleSheetCsvUrl();
  if (!csvUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "google_sheet_not_configured",
        hint: "Set GOOGLE_SHEET_CSV_URL on the server to your Form response Sheet export CSV URL, then redeploy.",
      },
      { status: 503 },
    );
  }

  let csvText: string;
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

  const result = await syncFromGoogleSheetCsv(csvText);
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
