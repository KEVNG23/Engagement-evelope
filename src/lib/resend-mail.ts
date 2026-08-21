import { Resend } from "resend";
import {
  renderInvitationEmailHtml,
  renderInvitationEmailText,
} from "./email-template";

export function resendConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim(),
  );
}

export function getResendFrom() {
  return process.env.RESEND_FROM?.trim() || "";
}

let client: Resend | null = null;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!client) client = new Resend(apiKey);
  return client;
}

export function applyNameTemplate(template: string, name: string) {
  return template.replaceAll("{{name}}", name);
}

export async function sendGuestEmail(opts: {
  to: string;
  subject: string;
  /** Host-composed body (already personalized). */
  bodyText: string;
  guestName: string;
  siteUrl?: string;
}) {
  const from = getResendFrom();
  if (!from) {
    throw new Error("RESEND_FROM is not set");
  }

  const content = {
    guestName: opts.guestName,
    subject: opts.subject,
    bodyText: opts.bodyText,
    siteUrl: opts.siteUrl,
  };

  const resend = getClient();
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    text: renderInvitationEmailText(content),
    html: renderInvitationEmailHtml(content),
  });

  if (error) {
    throw new Error(error.message || "resend_send_failed");
  }

  return data;
}
