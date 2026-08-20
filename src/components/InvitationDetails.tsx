"use client";

import { invitation } from "@/lib/invitation-data";
import { useLocale } from "@/lib/i18n";
import { RevealSection } from "./RevealSection";
import { RsvpForm } from "./RsvpForm";

/**
 * Cream stationery card on the same burgundy page background as the envelope —
 * no embedded burgundy from a Canva screenshot (that caused the top/bottom mismatch).
 */
export function InvitationDetails() {
  const { t } = useLocale();

  return (
    <div className="relative w-full bg-[#3d1418] pb-[max(7rem,calc(env(safe-area-inset-bottom)+5rem))] pt-4">
      <section
        id="invitation-details"
        className="scroll-mt-6 mx-auto w-full max-w-lg px-4 sm:max-w-xl sm:px-6"
        aria-label={t("detailsAria")}
      >
        <RevealSection>
          <article className="border border-[#fff8ef]/90 bg-[#faf1da] px-5 py-9 text-center text-[#6b4a32] shadow-none sm:px-10 sm:py-12">
            <p className="font-serif text-[14px] leading-relaxed tracking-wide sm:text-base">
              {t("ceremonyLine")}
            </p>

            <h2 className="mt-5 font-serif text-[1.85rem] font-semibold tracking-[0.1em] text-[#4a1b24] sm:text-4xl">
              {t("venueLabel")}
            </h2>

            <p className="mx-auto mt-4 max-w-md font-serif text-[14px] leading-relaxed sm:text-base">
              {t("address")}
            </p>
            <p className="mx-auto mt-2 max-w-md font-serif text-[12px] leading-relaxed text-[#6b4a32]/85 sm:text-sm">
              {t("addressOld")}
            </p>

            <p
              aria-hidden
              className="mt-6 font-serif text-3xl text-[#a88a64] sm:text-4xl"
            >
              {invitation.doubleHappiness}
            </p>

            <div className="mx-auto mt-5 max-w-sm border-y border-[#a88a64]/55 py-5">
              <p className="font-serif text-[13px] tracking-[0.3em] text-[#6b4a32] sm:text-sm sm:tracking-[0.35em]">
                {t("month")}
              </p>
              <p className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-serif text-[#4a1b24]">
                <span className="text-base tracking-wide sm:text-lg">
                  {t("weekday")}
                </span>
                <span className="text-5xl font-semibold leading-none sm:text-6xl">
                  {invitation.day}
                </span>
                <span className="text-base tracking-wide sm:text-lg">
                  {t("timeOfDay")}
                </span>
              </p>
              <p className="mt-3 font-serif text-base tracking-[0.2em]">
                {invitation.year}
              </p>
            </div>

            <p className="mt-4 font-serif text-[12px] text-[#6b4a32]/85 sm:text-sm">
              {t("lunar")}
            </p>

            <p className="mt-8 font-serif text-[12px] italic leading-relaxed text-[#6b4a32]/90 sm:text-sm">
              {t("footer")}
            </p>
            <p aria-hidden className="mt-3 text-sm text-[#3d1418]">
              ♥
            </p>
          </article>
        </RevealSection>
      </section>

      <div className="mt-10 sm:mt-14">
        <RsvpForm />
      </div>
    </div>
  );
}
