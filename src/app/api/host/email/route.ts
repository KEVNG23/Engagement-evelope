import { NextResponse } from "next/server";
import { isHostAuthenticated } from "@/lib/host-auth";
import {
  filterEmailRecipients,
  type EmailAttendanceFilter,
} from "@/lib/host-email-filter";
import {
  applyNameTemplate,
  resendConfigured,
  sendGuestEmail,
} from "@/lib/resend-mail";
import { listRsvps } from "@/lib/rsvp-store-unified";

const MAX_SUBJECT = 200;
const MAX_BODY = 8000;
const SEND_GAP_MS = 120;

type EmailBody = {
  subject?: string;
  body?: string;
  attendance?: string;
  guestGroup?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    configured: resendConfigured(),
  });
}

export async function POST(request: Request) {
  if (!(await isHostAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!resendConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "resend_not_configured",
        hint: "Set RESEND_API_KEY and RESEND_FROM on the server, then redeploy.",
      },
      { status: 503 },
    );
  }

  let payload: EmailBody;
  try {
    payload = (await request.json()) as EmailBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const subject = payload.subject?.trim() ?? "";
  const body = payload.body?.trim() ?? "";
  const attendanceRaw = payload.attendance?.trim() ?? "all";
  const guestGroup = payload.guestGroup?.trim() || "all";

  const attendance: EmailAttendanceFilter =
    attendanceRaw === "attending" || attendanceRaw === "declining"
      ? attendanceRaw
      : "all";

  if (!subject || !body) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 },
    );
  }
  if (subject.length > MAX_SUBJECT || body.length > MAX_BODY) {
    return NextResponse.json(
      { ok: false, error: "too_long" },
      { status: 400 },
    );
  }

  const records = await listRsvps();
  const { withEmail, skippedNoEmail } = filterEmailRecipients(records, {
    attendance,
    guestGroup,
  });

  if (withEmail.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "no_recipients",
        skippedNoEmail,
        sent: 0,
        failed: [],
        recipients: [],
      },
      { status: 400 },
    );
  }

  const failed: { name: string; email: string; error: string }[] = [];
  let sent = 0;

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    request.headers.get("origin") ||
    undefined;

  for (let i = 0; i < withEmail.length; i += 1) {
    const guest = withEmail[i];
    try {
      await sendGuestEmail({
        to: guest.email,
        subject: applyNameTemplate(subject, guest.name),
        bodyText: applyNameTemplate(body, guest.name),
        guestName: guest.name,
        siteUrl: origin,
      });
      sent += 1;
    } catch (error) {
      failed.push({
        name: guest.name,
        email: guest.email,
        error: error instanceof Error ? error.message : "send_failed",
      });
    }

    if (i < withEmail.length - 1) {
      await sleep(SEND_GAP_MS);
    }
  }

  return NextResponse.json({
    ok: failed.length === 0,
    sent,
    skippedNoEmail,
    failed,
    recipients: withEmail.map((g) => ({ name: g.name, email: g.email })),
    attendance,
    guestGroup,
  });
}
