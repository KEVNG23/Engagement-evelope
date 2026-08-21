import { NextResponse } from "next/server";
import { createRsvpToken } from "@/lib/rsvp";
import { saveRsvp } from "@/lib/rsvp-store-unified";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSedJEnrA3OZJobiG4euB2bCMCdyYPafH4pWxZTSjJpiOJUIZA/formResponse";

type RsvpBody = {
  name?: string;
  guestGroup?: string;
  guestGroupOther?: string;
  attend?: string;
  allergy?: string;
  vegetarian?: string;
  email?: string;
};

async function syncGoogleForm(payload: {
  name: string;
  guestGroup: string;
  guestGroupOther: string;
  attend: string;
  allergy: string;
  vegetarian: string;
}) {
  const body = new URLSearchParams();
  body.set("entry.877086558", payload.name);
  if (payload.guestGroup === "Other") {
    body.set("entry.1498135098", "__other_option__");
    body.set(
      "entry.1498135098.other_option_response",
      payload.guestGroupOther,
    );
  } else {
    body.set("entry.1498135098", payload.guestGroup);
  }
  body.set("entry.1424661284", payload.attend);
  body.set("entry.220707796", payload.allergy);
  body.set("entry.806366388", payload.vegetarian);

  const response = await fetch(GOOGLE_FORM_ACTION, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (compatible; EngagementInvite/1.0; +https://github.com/KEVNG23/Engagement-evelope)",
    },
    body,
    redirect: "manual",
  });

  if (response.status === 401 || response.status === 403) {
    return { synced: false as const, error: "form_requires_sign_in" as const };
  }
  if (response.status >= 400 && response.status !== 302) {
    return { synced: false as const, error: "google_rejected" as const };
  }
  return { synced: true as const };
}

export async function POST(request: Request) {
  let payload: RsvpBody;
  try {
    payload = (await request.json()) as RsvpBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const guestGroup = payload.guestGroup?.trim() ?? "";
  const guestGroupOther = payload.guestGroupOther?.trim() ?? "";
  const attend = payload.attend?.trim() ?? "";
  const allergy = payload.allergy?.trim() ?? "";
  const vegetarian = payload.vegetarian?.trim() ?? "";
  const email = payload.email?.trim() ?? "";

  if (!name || !guestGroup || !attend || !allergy || !vegetarian || !email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (guestGroup === "Other" && !guestGroupOther) {
    return NextResponse.json({ ok: false, error: "missing_other" }, { status: 400 });
  }

  const token = createRsvpToken();
  const record = {
    token,
    name,
    guestGroup,
    guestGroupOther,
    attend,
    allergy,
    vegetarian,
    email,
    createdAt: new Date().toISOString(),
  };

  try {
    await saveRsvp(record);
  } catch {
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 500 });
  }

  // Google sync is best-effort — private link still works if Google blocks.
  let googleSynced = false;
  let googleError: string | undefined;
  try {
    const google = await syncGoogleForm(record);
    googleSynced = google.synced;
    if (!google.synced) googleError = google.error;
  } catch {
    googleError = "network";
  }

  return NextResponse.json({
    ok: true,
    token,
    path: `/rsvp/${token}`,
    googleSynced,
    googleError,
  });
}
