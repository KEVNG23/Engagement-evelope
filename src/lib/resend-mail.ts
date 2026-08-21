import { Resend } from "resend";

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
  text: string;
}) {
  const from = getResendFrom();
  if (!from) {
    throw new Error("RESEND_FROM is not set");
  }

  const resend = getClient();
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
  });

  if (error) {
    throw new Error(error.message || "resend_send_failed");
  }

  return data;
}
