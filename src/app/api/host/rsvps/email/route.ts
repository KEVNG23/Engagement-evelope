import { NextResponse } from "next/server";
import { getRsvp, saveRsvp } from "@/lib/rsvp-store-unified";

function validateHostAuth(request: Request) {
  const configured = process.env.HOST_PASSWORD?.trim();
  if (!configured) {
    return { ok: false as const, status: 503, error: "not_configured" };
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false as const, status: 401, error: "missing_auth" };
  }

  const token = authHeader.slice(7);
  if (token !== configured) {
    return { ok: false as const, status: 401, error: "invalid_auth" };
  }

  return { ok: true as const };
}

export async function PATCH(request: Request) {
  const auth = validateHostAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
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

  return NextResponse.json({ ok: true });
}
