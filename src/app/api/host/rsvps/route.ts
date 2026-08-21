import { NextResponse } from "next/server";
import { isHostAuthenticated } from "@/lib/host-auth";
import { guestGroupLabel } from "@/lib/rsvp";
import { listRsvps } from "@/lib/rsvp-store";

export async function GET() {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const records = await listRsvps();
  const rsvps = records.map((r) => ({
    token: r.token,
    name: r.name,
    guestGroup: guestGroupLabel(r),
    attend: r.attend,
    allergy: r.allergy,
    vegetarian: r.vegetarian,
    createdAt: r.createdAt,
    path: `/rsvp/${r.token}`,
  }));

  return NextResponse.json({
    ok: true,
    count: rsvps.length,
    rsvps,
    source: "site_store",
    note: "Responses submitted through this website. Google Form is a backup sync only.",
  });
}
