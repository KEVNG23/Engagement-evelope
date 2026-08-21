import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const HOST_COOKIE = "engagement_host";

export function hostPasswordConfigured() {
  return Boolean(process.env.HOST_PASSWORD?.trim());
}

export function expectedHostToken() {
  const password = process.env.HOST_PASSWORD?.trim();
  if (!password) return null;
  return createHash("sha256")
    .update(`engagement-host-v1:${password}`)
    .digest("hex");
}

export function passwordMatches(password: string) {
  const expected = process.env.HOST_PASSWORD?.trim();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isHostAuthenticated() {
  const token = expectedHostToken();
  if (!token) return false;
  const jar = await cookies();
  const cookie = jar.get(HOST_COOKIE)?.value;
  if (!cookie || cookie.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(cookie), Buffer.from(token));
  } catch {
    return false;
  }
}
