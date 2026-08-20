"use client";

import { invitation, wedding } from "@/lib/invitation-data";
import { useLocale } from "@/lib/i18n";
import { RevealSection } from "./RevealSection";
import { RsvpForm } from "./RsvpForm";

/**
 * Cream stationery cards on the burgundy page —
 * engagement confirmation, then wedding save-the-date (venue TBA).
 */
export function InvitationDetails() {
  const { t } = useLocale();

  return (
    <div className="relative w-full bg-transparent pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
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

      <section
        id="wedding-save-the-date"
        className="scroll-mt-6 mx-auto mt-8 w-full max-w-lg px-4 sm:mt-10 sm:max-w-xl sm:px-6"
        aria-label={t("weddingAria")}
      >
        <RevealSection delay={0.08}>
          <article className="border border-[#fff8ef]/90 bg-[#faf1da] px-5 py-9 text-center text-[#6b4a32] shadow-none sm:px-10 sm:py-12">
            <p className="font-serif text-[11px] tracking-[0.32em] text-[#a88a64] sm:text-xs sm:tracking-[0.36em]">
              {t("weddingEyebrow")}
            </p>

            <h2 className="mt-4 font-serif text-[1.85rem] font-semibold tracking-[0.1em] text-[#4a1b24] sm:text-4xl">
              {t("weddingTitle")}
            </h2>

            <p className="mt-4 font-serif text-[14px] leading-relaxed tracking-wide sm:text-base">
              {t("weddingLine")}
            </p>

            <p className="mt-6 font-serif text-[13px] tracking-[0.28em] text-[#6b4a32] sm:text-sm sm:tracking-[0.32em]">
              {t("weddingVenueLabel")}
            </p>
            <p className="mx-auto mt-2 max-w-md font-serif text-[15px] leading-relaxed text-[#4a1b24] sm:text-base">
              {t("weddingVenue")}
            </p>
            <p className="mx-auto mt-3 max-w-sm font-serif text-[12px] leading-relaxed text-[#6b4a32]/85 sm:text-sm">
              {t("weddingNote")}
            </p>

            <p
              aria-hidden
              className="mt-6 font-serif text-3xl text-[#a88a64] sm:text-4xl"
            >
              {wedding.doubleHappiness}
            </p>

            <div className="mx-auto mt-5 max-w-sm border-y border-[#a88a64]/55 py-5">
              <p className="font-serif text-[13px] tracking-[0.3em] text-[#6b4a32] sm:text-sm sm:tracking-[0.35em]">
                {t("weddingMonth")}
              </p>
              <p className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-serif text-[#4a1b24]">
                <span className="text-base tracking-wide sm:text-lg">
                  {t("weddingWeekday")}
                </span>
                <span className="text-5xl font-semibold leading-none sm:text-6xl">
                  {wedding.day}
                </span>
                <span className="text-base tracking-wide sm:text-lg">
                  {t("weddingTimeOfDay")}
                </span>
              </p>
              <p className="mt-3 font-serif text-base tracking-[0.2em]">
                {wedding.year}
              </p>
            </div>

            <p className="mt-4 font-serif text-[12px] text-[#6b4a32]/85 sm:text-sm">
              {t("weddingLunar")}
            </p>

            <p className="mt-8 font-serif text-[12px] italic leading-relaxed text-[#6b4a32]/90 sm:text-sm">
              {t("weddingFooter")}
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
