import { NextResponse } from "next/server";
import { getRsvp } from "@/lib/rsvp-store";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const record = await getRsvp(token);

  if (!record) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, rsvp: record });
}
