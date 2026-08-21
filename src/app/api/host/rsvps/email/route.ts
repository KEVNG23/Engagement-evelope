import { NextResponse } from "next/server";
import { isHostAuthenticated } from "@/lib/host-auth";
import { getRsvp, saveRsvp } from "@/lib/rsvp-store-unified";

export async function PATCH(request: Request) {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { token?: string; email?: string };
  try {
    body = (await request.json()) as { token?: string; email?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const { token, email } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { ok: false, error: "missing_token" },
      { status: 400 },
    );
  }

  if (!/^[a-f0-9]{32}$/i.test(token)) {
    return NextResponse.json(
      { ok: false, error: "invalid_token" },
      { status: 400 },
    );
  }

  const record = await getRsvp(token);
  if (!record) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  const updatedRecord = {
    ...record,
    email: email?.trim() || undefined,
  };

  try {
    await saveRsvp(updatedRecord);
  } catch {
    return NextResponse.json(
      { ok: false, error: "store_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    token,
    email: updatedRecord.email ?? "",
  });
}
