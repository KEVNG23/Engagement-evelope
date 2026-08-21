import { NextResponse } from "next/server";
import {
  HOST_COOKIE,
  expectedHostToken,
  hostPasswordConfigured,
  passwordMatches,
} from "@/lib/host-auth";

export async function POST(request: Request) {
  if (!hostPasswordConfigured()) {
    return NextResponse.json(
      { ok: false, error: "host_password_not_set" },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!passwordMatches(password)) {
    return NextResponse.json({ ok: false, error: "invalid_password" }, { status: 401 });
  }

  const token = expectedHostToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "host_password_not_set" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(HOST_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
