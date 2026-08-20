"use client";

import { useLocale, type Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  function select(next: Locale) {
    setLocale(next);
  }

  return (
    <div className="pointer-events-auto fixed right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-[60]">
      <div
        role="group"
        aria-label="Language"
        className="flex overflow-hidden rounded-sm border border-[#e0c9a8]/45 bg-[#3d1418]/85 backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={() => select("vi")}
          aria-pressed={locale === "vi"}
          className={`px-2.5 py-1.5 font-serif text-[11px] tracking-[0.08em] transition-colors sm:px-3 sm:text-xs ${
            locale === "vi"
              ? "bg-[#e0c9a8] text-[#3d1418]"
              : "text-[#e0c9a8]/85 hover:text-[#f7ecd9]"
          }`}
        >
          {t("langVi")}
        </button>
        <button
          type="button"
          onClick={() => select("en")}
          aria-pressed={locale === "en"}
          className={`px-2.5 py-1.5 font-serif text-[11px] tracking-[0.08em] transition-colors sm:px-3 sm:text-xs ${
            locale === "en"
              ? "bg-[#e0c9a8] text-[#3d1418]"
              : "text-[#e0c9a8]/85 hover:text-[#f7ecd9]"
          }`}
        >
          {t("langEn")}
        </button>
      </div>
    </div>
  );
}
