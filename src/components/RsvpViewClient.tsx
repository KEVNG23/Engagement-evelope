"use client";

import Link from "next/link";
import { useEffect } from "react";
import { displayFont } from "@/lib/fonts";
import {
  LocaleProvider,
  translateStoredRsvpValue,
  useLocale,
} from "@/lib/i18n";
import type { RsvpRecord } from "@/lib/rsvp";
import { guestGroupLabel } from "@/lib/rsvp";
import { clearStoredRsvpToken } from "@/lib/rsvp-client";
import { LanguageToggle } from "./LanguageToggle";

type ViewProps = {
  rsvp: RsvpRecord;
};

type MissingProps = {
  token: string;
};

function RsvpViewContent({ rsvp }: ViewProps) {
  const { t, locale } = useLocale();
  const groupValue = guestGroupLabel(rsvp);

  const rows = [
    { label: t("rsvpLabelName"), value: rsvp.name },
    {
      label: t("rsvpLabelGroup"),
      value: translateStoredRsvpValue(groupValue, locale),
    },
    {
      label: t("rsvpLabelAttend"),
      value: translateStoredRsvpValue(rsvp.attend, locale),
    },
    { label: t("rsvpLabelAllergy"), value: rsvp.allergy },
    {
      label: t("rsvpLabelVegetarian"),
      value: translateStoredRsvpValue(rsvp.vegetarian, locale),
    },
  ];

  return (
    <main
      className="invite-scroller relative h-[100dvh] overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#3d1418] px-4 py-12 text-[#f7ecd9] touch-pan-y sm:px-6"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <LanguageToggle />
      <div className="mx-auto w-full max-w-[620px] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <p
          className={`${displayFont.className} text-center text-[clamp(1.6rem,6vw,2.4rem)] tracking-[0.14em]`}
        >
          {t("rsvpTitle")}
        </p>
        <p className="mt-3 text-center font-serif text-[#e0c9a8]">
          {t("rsvpViewTitle")}
        </p>

        <div className="mt-10 space-y-5 border border-[#7d4652] bg-[#5a2730]/45 px-5 py-8 sm:px-8">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-[0.75rem] tracking-[0.12em] text-[#d4b89a]">
                {row.label}
              </p>
              <p className="mt-1 font-serif text-[1.05rem] text-[#f7ecd9]">
                {row.value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center font-serif text-sm leading-relaxed text-[#d4b89a]">
          {t("rsvpViewHint")}
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/#rsvp"
            className="border border-[#e0c9a8]/50 px-5 py-3 font-serif text-sm tracking-[0.14em] text-[#e0c9a8] transition-colors hover:border-[#e0c9a8] hover:text-[#f7ecd9]"
          >
            {t("rsvpBack")}
          </Link>
        </div>
      </div>
    </main>
  );
}

function RsvpMissingContent({ token }: MissingProps) {
  const { t } = useLocale();

  useEffect(() => {
    clearStoredRsvpToken(token);
  }, [token]);

  return (
    <main
      className="invite-scroller relative h-[100dvh] overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#3d1418] px-4 py-12 text-[#f7ecd9] touch-pan-y sm:px-6"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <LanguageToggle />
      <div className="mx-auto w-full max-w-[620px] pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
        <p
          className={`${displayFont.className} text-[clamp(1.6rem,6vw,2.4rem)] tracking-[0.14em]`}
        >
          {t("rsvpTitle")}
        </p>
        <p className="mt-6 font-serif text-[1.15rem] text-[#f7ecd9]">
          {t("rsvpMissingTitle")}
        </p>
        <p className="mt-4 font-serif text-sm leading-relaxed text-[#d4b89a] sm:text-base">
          {t("rsvpMissingBody")}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/#rsvp"
            className="bg-[#e0c9a8] px-5 py-3 font-serif text-sm uppercase tracking-[0.14em] text-[#3d1418] transition-opacity hover:opacity-90"
          >
            {t("rsvpMissingCta")}
          </Link>
          <Link
            href="/"
            className="border border-[#e0c9a8]/50 px-5 py-3 font-serif text-sm tracking-[0.14em] text-[#e0c9a8] transition-colors hover:border-[#e0c9a8] hover:text-[#f7ecd9]"
          >
            {t("rsvpBack")}
          </Link>
        </div>
      </div>
    </main>
  );
}

export function RsvpViewClient({ rsvp }: ViewProps) {
  return (
    <LocaleProvider>
      <RsvpViewContent rsvp={rsvp} />
    </LocaleProvider>
  );
}

export function RsvpMissingClient({ token }: MissingProps) {
  return (
    <LocaleProvider>
      <RsvpMissingContent token={token} />
    </LocaleProvider>
  );
}
