"use client";

import { invitation } from "@/lib/invitation-data";

type Props = {
  subject: string;
  body: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  subjectLabel: string;
  bodyLabel: string;
  subjectPlaceholder: string;
  bodyPlaceholder: string;
  previewLabel: string;
  previewNote: string;
  sampleGuestName: string;
  ctaLabel: string;
};

/**
 * Live stationery preview: edit subject/body inside the same layout
 * guests see in the Resend HTML email.
 */
export function HostEmailTemplateEditor({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  subjectLabel,
  bodyLabel,
  subjectPlaceholder,
  bodyPlaceholder,
  previewLabel,
  previewNote,
  sampleGuestName,
  ctaLabel,
}: Props) {
  return (
    <div className="mt-4">
      <p className="text-[0.7rem] tracking-[0.12em] text-[#d4b89a]">
        {previewLabel}
      </p>
      <p className="mt-1.5 font-serif text-[12px] leading-relaxed text-[#e0c9a8]/85 sm:text-[13px]">
        {previewNote}
      </p>

      <div
        className="mt-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(165deg, #5a2730 0%, #3d1418 45%, #2a0e12 100%)",
          border: "1px solid #7d4652",
        }}
      >
        <div className="px-3 py-5 sm:px-5 sm:py-7">
          <p className="text-center font-serif text-[11px] tracking-[0.28em] text-[#d4b98a] sm:text-xs">
            {invitation.inviteFrom}
          </p>
          <p
            className="mt-2 text-center font-serif text-[1.35rem] leading-none text-[#faf1da] sm:text-[1.6rem]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {invitation.coupleShort}
          </p>
          <p className="mt-1 text-center font-serif text-[1.75rem] leading-none text-[#d4b98a]">
            {invitation.doubleHappiness}
          </p>
          <p className="mt-3 text-center font-serif text-[10px] tracking-[0.22em] text-[#a88a64] sm:text-[11px]">
            {invitation.weekday} · {invitation.day} {invitation.month}{" "}
            {invitation.year}
          </p>
          <p className="mt-1 text-center font-serif text-[10px] text-[#a88a64]/85">
            {invitation.lunar}
          </p>

          <div
            className="mx-auto mt-5 max-w-[420px] px-4 py-5 sm:px-6 sm:py-6"
            style={{
              backgroundColor: "#faf1da",
              borderTop: "2px solid #d4b98a",
              borderBottom: "2px solid #d4b98a",
              boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-center text-[0.55rem] tracking-[0.14em] text-[#a88a64]">
                {subjectLabel}
              </span>
              <input
                type="text"
                maxLength={200}
                value={subject}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder={subjectPlaceholder}
                className="w-full border border-[#d4b98a]/50 bg-[#fff8ea] px-3 py-2 text-center font-serif text-[14px] text-[#4a1b24] outline-none placeholder:text-[#a88a64]/45 focus:border-[#a88a64]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-center text-[0.55rem] tracking-[0.14em] text-[#a88a64]">
                {bodyLabel}
              </span>
              <textarea
                rows={8}
                maxLength={8000}
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
                placeholder={bodyPlaceholder}
                className="w-full resize-y border border-[#d4b98a]/50 bg-[#fff8ea] px-3 py-3 font-serif text-[14px] leading-[1.75] text-[#6b4a32] outline-none placeholder:text-[#a88a64]/45 focus:border-[#a88a64] sm:text-[15px]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              />
            </label>

            {body.includes("{{name}}") ? (
              <p className="mt-2 text-center font-serif text-[11px] text-[#a88a64]">
                {"{{name}}"} → {sampleGuestName}
              </p>
            ) : null}

            <div className="mt-5 text-center">
              <span
                className="inline-block px-5 py-2.5 font-serif text-[12px] tracking-[0.12em] text-[#faf1da]"
                style={{ backgroundColor: "#3d1418" }}
              >
                {ctaLabel}
              </span>
            </div>

            <p
              className="mt-5 text-center font-serif text-[11px] leading-relaxed text-[#6b4a32]/80"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {invitation.venueLabel}
              <br />
              {invitation.address}
            </p>
          </div>

          <p className="mx-auto mt-5 max-w-[340px] text-center font-serif text-[10px] leading-relaxed text-[#d4b98a]/75 sm:text-[11px]">
            {invitation.footer}
          </p>
        </div>
      </div>
    </div>
  );
}
