import { NextResponse } from "next/server";
import { isHostAuthenticated } from "@/lib/host-auth";
import { deleteRsvp } from "@/lib/rsvp-store-unified";

type Params = { params: Promise<{ token: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const removed = await deleteRsvp(token);
  if (!removed) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, token });
}
