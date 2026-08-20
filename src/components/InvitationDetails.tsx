"use client";

import { invitation } from "@/lib/invitation-data";
import { RevealSection } from "./RevealSection";

/**
 * Cream stationery card on the same burgundy page background as the envelope —
 * no embedded burgundy from a Canva screenshot (that caused the top/bottom mismatch).
 */
export function InvitationDetails() {
  return (
    <div className="relative w-full bg-[#3d1418] pb-[max(7rem,calc(env(safe-area-inset-bottom)+5rem))] pt-4">
      <section
        id="invitation-details"
        className="scroll-mt-6 mx-auto w-full max-w-lg px-4 sm:max-w-xl sm:px-6"
        aria-label="Chi tiết lễ đính hôn"
      >
        <RevealSection>
          <article className="border border-[#fff8ef]/90 bg-[#f2eee9] px-5 py-9 text-center text-[#6b4a32] shadow-none sm:px-10 sm:py-12">
            <p className="font-serif text-[14px] leading-relaxed tracking-wide sm:text-base">
              {invitation.ceremonyLine}
            </p>

            <h2 className="mt-5 font-serif text-[1.85rem] font-semibold tracking-[0.1em] text-[#4a1b24] sm:text-4xl">
              {invitation.venueLabel}
            </h2>

            <p className="mx-auto mt-4 max-w-md font-serif text-[14px] leading-relaxed sm:text-base">
              {invitation.address}
            </p>
            <p className="mx-auto mt-2 max-w-md font-serif text-[12px] leading-relaxed text-[#6b4a32]/85 sm:text-sm">
              {invitation.addressOld}
            </p>

            <p
              aria-hidden
              className="mt-6 font-serif text-3xl text-[#a88a64] sm:text-4xl"
            >
              {invitation.doubleHappiness}
            </p>

            <div className="mx-auto mt-5 max-w-sm border-y border-[#a88a64]/55 py-5">
              <p className="font-serif text-[13px] tracking-[0.3em] text-[#6b4a32] sm:text-sm sm:tracking-[0.35em]">
                {invitation.month}
              </p>
              <p className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-serif text-[#4a1b24]">
                <span className="text-base tracking-wide sm:text-lg">
                  {invitation.weekday}
                </span>
                <span className="text-5xl font-semibold leading-none sm:text-6xl">
                  {invitation.day}
                </span>
                <span className="text-base tracking-wide sm:text-lg">
                  {invitation.timeOfDay}
                </span>
              </p>
              <p className="mt-3 font-serif text-base tracking-[0.2em]">
                {invitation.year}
              </p>
            </div>

            <p className="mt-4 font-serif text-[12px] text-[#6b4a32]/85 sm:text-sm">
              {invitation.lunar}
            </p>

            <p className="mt-8 font-serif text-[12px] italic leading-relaxed text-[#6b4a32]/90 sm:text-sm">
              {invitation.footer}
            </p>
            <p aria-hidden className="mt-3 text-sm text-[#3d1418]">
              ♥
            </p>
          </article>
        </RevealSection>
      </section>

      <RevealSection className="mx-auto mt-8 w-full max-w-lg px-4 sm:mt-10 sm:max-w-xl sm:px-6">
        <div className="border border-[#fff8ef]/90 bg-[#f2eee9] px-5 py-9 text-center sm:px-6 sm:py-10">
          <h3 className="font-serif text-base tracking-[0.3em] text-[#a88a64]">
            RSVP
          </h3>
          <p className="mx-auto mt-4 max-w-md font-serif text-base leading-relaxed text-[#4a1b24]">
            Xin vui lòng xác nhận tham dự để gia đình chuẩn bị chu đáo hơn.
          </p>
          <a
            href="mailto:?subject=RSVP%20L%E1%BB%85%20%C4%90%C3%ADnh%20H%C3%B4n%20Annie%20%26%20D%C5%A9ng"
            className="mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center border border-[#a88a64]/55 bg-[#3d1418] px-8 py-3 font-serif text-base tracking-[0.2em] text-[#f3e8d5] transition active:bg-[#4a1b24] sm:w-auto hover:bg-[#4a1b24]"
          >
            XÁC NHẬN THAM DỰ
          </a>
        </div>
      </RevealSection>
    </div>
  );
}
