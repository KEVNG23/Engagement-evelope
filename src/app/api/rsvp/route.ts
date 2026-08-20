import { NextResponse } from "next/server";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSedJEnrA3OZJobiG4euB2bCMCdyYPafH4pWxZTSjJpiOJUIZA/formResponse";

type RsvpBody = {
  name?: string;
  guestGroup?: string;
  guestGroupOther?: string;
  attend?: string;
  allergy?: string;
  vegetarian?: string;
};

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

  if (!name || !guestGroup || !attend || !allergy || !vegetarian) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (guestGroup === "Other" && !guestGroupOther) {
    return NextResponse.json({ ok: false, error: "missing_other" }, { status: 400 });
  }

  const body = new URLSearchParams();
  body.set("entry.877086558", name);
  if (guestGroup === "Other") {
    body.set("entry.1498135098", "__other_option__");
    body.set("entry.1498135098.other_option_response", guestGroupOther);
  } else {
    body.set("entry.1498135098", guestGroup);
  }
  body.set("entry.1424661284", attend);
  body.set("entry.220707796", allergy);
  body.set("entry.806366388", vegetarian);

  try {
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

    // Google returns 200 or 302 on success; 401 when the form requires sign-in.
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        {
          ok: false,
          error: "form_requires_sign_in",
          message:
            "Google Form đang yêu cầu đăng nhập. Hãy tắt Restrict to users / Limit to 1 response trong Settings của form.",
        },
        { status: 502 },
      );
    }

    if (response.status >= 400 && response.status !== 302) {
      return NextResponse.json(
        { ok: false, error: "google_rejected", status: response.status },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
