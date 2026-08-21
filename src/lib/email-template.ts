import { invitation } from "./invitation-data";

const COLORS = {
  burgundy: "#3d1418",
  burgundySoft: "#5a2730",
  cream: "#faf1da",
  champagne: "#d4b98a",
  gold: "#a88a64",
  ink: "#4a1b24",
  muted: "#6b4a32",
} as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHtmlParagraphs(text: string) {
  const escaped = escapeHtml(text);
  const blocks = escaped
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return `<p style="margin:0;font-size:16px;line-height:1.7;color:${COLORS.muted};">&nbsp;</p>`;
  }

  return blocks
    .map((block) => {
      const withBreaks = block.replaceAll("\n", "<br />");
      return `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.75;color:${COLORS.muted};font-family:Georgia,'Times New Roman',serif;">${withBreaks}</p>`;
    })
    .join("");
}

export type InvitationEmailContent = {
  guestName: string;
  subject: string;
  bodyText: string;
  siteUrl?: string;
};

/**
 * Full-bleed burgundy frame + cream stationery card.
 * Uses bgcolor attributes (not only CSS) so Gmail/iOS don't show white gutters.
 */
export function renderInvitationEmailHtml(content: InvitationEmailContent) {
  const siteUrl = (content.siteUrl || "https://engagement.einvitation.blog").replace(
    /\/$/,
    "",
  );
  const bodyHtml = textToHtmlParagraphs(content.bodyText);
  const couple = escapeHtml(invitation.coupleShort);
  const title = escapeHtml(invitation.title);
  const guest = escapeHtml(content.guestName);
  const bg = COLORS.burgundy;

  return `<!DOCTYPE html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml" style="background-color:${bg};">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(content.subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Georgia, 'Times New Roman', serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    html, body { margin:0 !important; padding:0 !important; width:100% !important; background-color:${bg} !important; }
    body { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; outline:none; text-decoration:none; }
    a { color:${COLORS.gold}; }
    #MessageViewBody, #MessageWebViewDiv { width:100% !important; }
  </style>
</head>
<body bgcolor="${bg}" style="margin:0;padding:0;width:100%;background-color:${bg};">
  <table role="presentation" bgcolor="${bg}" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${bg};margin:0;padding:0;border-collapse:collapse;">
    <tr>
      <td bgcolor="${bg}" align="center" style="background-color:${bg};padding:0;margin:0;">
        <!-- Preheader (hidden) -->
        <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
          ${escapeHtml(content.bodyText.slice(0, 120))}
        </div>

        <table role="presentation" bgcolor="${bg}" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${bg};border-collapse:collapse;">
          <tr>
            <td bgcolor="${bg}" align="center" style="background-color:${bg};padding:24px 20px 10px 20px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${COLORS.champagne};">
              ${escapeHtml(invitation.saveTheDate)}
            </td>
          </tr>

          <tr>
            <td bgcolor="${bg}" style="background-color:${bg};padding:0 16px 8px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.cream}" style="width:100%;background-color:${COLORS.cream};border-collapse:collapse;">
                <tr>
                  <td align="center" style="padding:36px 24px 12px 24px;background-color:${COLORS.cream};">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.gold};">
                      Thanh Tuyền &amp; Trí Dũng
                    </p>
                    <h1 style="margin:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;letter-spacing:0.12em;font-weight:600;color:${COLORS.ink};">
                      ${title}
                    </h1>
                    <p style="margin:18px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1;color:${COLORS.gold};">
                      ${invitation.doubleHappiness}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 40px;background-color:${COLORS.cream};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="height:1px;line-height:1px;font-size:1px;background-color:${COLORS.gold};">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 24px 8px 24px;background-color:${COLORS.cream};">
                    <p style="margin:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;letter-spacing:0.04em;color:${COLORS.ink};">
                      Kính gửi ${guest},
                    </p>
                    ${bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 40px;background-color:${COLORS.cream};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="height:1px;line-height:1px;font-size:1px;background-color:${COLORS.gold};">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:20px 24px 12px 24px;background-color:${COLORS.cream};">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.gold};">
                      ${couple}
                    </p>
                    <p style="margin:10px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.6;font-style:italic;color:${COLORS.muted};">
                      ${escapeHtml(invitation.footer)}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 24px 32px 24px;background-color:${COLORS.cream};">
                    <a href="${escapeHtml(siteUrl)}" style="display:inline-block;padding:12px 22px;background-color:${COLORS.burgundySoft};color:#fff8ef;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;">
                      Xem thiệp mời
                    </a>
                    <p style="margin:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.5;color:${COLORS.gold};">
                      <a href="${escapeHtml(siteUrl)}" style="color:${COLORS.gold};text-decoration:underline;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>
                    </p>
                    <p style="margin:16px 0 0 0;font-size:14px;color:${COLORS.ink};">♥</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="${bg}" align="center" style="background-color:${bg};padding:16px 20px 32px 20px;font-family:Georgia,'Times New Roman',serif;font-size:11px;line-height:1.5;color:${COLORS.champagne};">
              Email từ ${couple} · ${title} · ${escapeHtml(invitation.day)} Tháng 1 ${escapeHtml(invitation.year)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderInvitationEmailText(content: InvitationEmailContent) {
  const siteUrl = (content.siteUrl || "https://engagement.einvitation.blog").replace(
    /\/$/,
    "",
  );
  return [
    `Kính gửi ${content.guestName},`,
    "",
    content.bodyText,
    "",
    "—",
    invitation.coupleShort,
    invitation.title,
    siteUrl,
  ].join("\n");
}
