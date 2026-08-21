"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { displayFont } from "@/lib/fonts";
import { rsvpValueMap, useLocale } from "@/lib/i18n";
import {
  RSVP_TOKEN_STORAGE_KEY,
  clearStoredRsvpToken,
  getStoredRsvpToken,
} from "@/lib/rsvp-client";

type Status =
  | "idle"
  | "checking"
  | "submitting"
  | "success"
  | "error"
  | "already"
  | "missing";

/**
 * Native RSVP form with private view link (option 3).
 * One browser keeps the token in localStorage; the link works on any device.
 * If the saved response was deleted, unlock the browser so the guest can submit again.
 */
export function RsvpForm() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [guestGroup, setGuestGroup] = useState("");
  const [guestGroupOther, setGuestGroupOther] = useState("");
  const [attend, setAttend] = useState("");
  const [allergy, setAllergy] = useState("");
  const [vegetarian, setVegetarian] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const saved = getStoredRsvpToken();
    if (!saved) return;

    let cancelled = false;
    setStatus("checking");
    setToken(saved);
    setShareUrl(`${window.location.origin}/rsvp/${saved}`);

    (async () => {
      try {
        const response = await fetch(`/api/rsvp/${saved}`, {
          method: "GET",
          cache: "no-store",
        });

        if (cancelled) return;

        if (response.ok) {
          setStatus("already");
          return;
        }

        if (response.status === 404) {
          clearStoredRsvpToken(saved);
          setToken(null);
          setShareUrl("");
          setStatus("missing");
          return;
        }

        // Network/server blip — keep the link, don't unlock yet
        setStatus("already");
      } catch {
        if (!cancelled) setStatus("already");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    setShareUrl(`${window.location.origin}/rsvp/${token}`);
  }, [token]);

  const canSubmit = useMemo(() => {
    if (
      status === "already" ||
      status === "success" ||
      status === "checking" ||
      status === "missing"
    )
      return false;
    if (!name.trim() || !guestGroup || !attend || !allergy.trim() || !vegetarian)
      return false;
    if (guestGroup === "Other" && !guestGroupOther.trim()) return false;
    // Email is optional
    return status !== "submitting";
  }, [
    name,
    guestGroup,
    guestGroupOther,
    attend,
    allergy,
    vegetarian,
    status,
  ]);

  function unlockForm() {
    clearStoredRsvpToken(token);
    setToken(null);
    setShareUrl("");
    setStatus("idle");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          guestGroup,
          guestGroupOther: guestGroupOther.trim(),
          attend,
          allergy: allergy.trim(),
          vegetarian,
          email: email.trim() || undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        token?: string;
        path?: string;
      } | null;

      if (!response.ok || !data?.ok || !data.token) {
        setStatus("error");
        return;
      }

      window.localStorage.setItem(RSVP_TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setStatus("success");
      setName("");
      setGuestGroup("");
      setGuestGroupOther("");
      setAttend("");
      setAllergy("");
      setVegetarian("");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const fieldLabel =
    "block text-[0.85rem] tracking-[0.08em] text-[#e0c9a8] mb-3";
  const textInput =
    "w-full border border-[#7d4652] bg-[#5a2730]/60 px-4 py-3 font-serif text-[1.05rem] text-[#f7ecd9] outline-none transition-colors placeholder:text-[#c2a08f]/50 focus:border-[#e0c9a8]";
  const radioRow =
    "flex items-center gap-3 cursor-pointer text-[#e0c9a8] hover:text-[#f7ecd9] transition-colors";
  const choiceBtn = (active: boolean) =>
    `w-full border px-4 py-4 text-left font-serif text-[0.95rem] transition-colors ${
      active
        ? "border-[#e0c9a8] bg-[#5a2730] text-[#f7ecd9]"
        : "border-[#7d4652] bg-[#5a2730]/60 text-[#e5c9b8] hover:border-[#b98c78]"
    }`;

  const doneCard = (
    <div className="rounded-sm border border-[#e0c9a8]/40 bg-[#5a2730]/50 px-5 py-8 text-center">
      <p className="font-serif text-[#f7ecd9]">
        {status === "already" ? t("rsvpAlready") : t("rsvpThanks")}
      </p>
      <p className="mt-4 font-serif text-sm leading-relaxed text-[#d4b89a]">
        {t("rsvpSaveLink")}
      </p>
      {shareUrl ? (
        <p className="mt-5 break-all font-serif text-sm text-[#e0c9a8]">
          {shareUrl}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {token ? (
          <Link
            href={`/rsvp/${token}`}
            className="bg-[#e0c9a8] px-5 py-3 font-serif text-sm uppercase tracking-[0.14em] text-[#3d1418] transition-opacity hover:opacity-90"
          >
            {t("rsvpView")}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={copyLink}
          className="border border-[#e0c9a8]/55 px-5 py-3 font-serif text-sm tracking-[0.12em] text-[#e0c9a8] transition-colors hover:border-[#e0c9a8]"
        >
          {copied ? t("rsvpCopied") : t("rsvpCopy")}
        </button>
      </div>
    </div>
  );

  const missingCard = (
    <div className="rounded-sm border border-[#e0c9a8]/40 bg-[#5a2730]/50 px-5 py-8 text-center">
      <p className="font-serif text-[1.05rem] text-[#f7ecd9]">
        {t("rsvpMissingTitle")}
      </p>
      <p className="mt-4 font-serif text-sm leading-relaxed text-[#d4b89a]">
        {t("rsvpMissingBody")}
      </p>
      <button
        type="button"
        onClick={unlockForm}
        className="mt-6 bg-[#e0c9a8] px-5 py-3 font-serif text-sm uppercase tracking-[0.14em] text-[#3d1418] transition-opacity hover:opacity-90"
      >
        {t("rsvpMissingCta")}
      </button>
    </div>
  );

  const checkingCard = (
    <div className="rounded-sm border border-[#e0c9a8]/25 bg-[#5a2730]/40 px-5 py-8 text-center">
      <p className="font-serif text-sm tracking-[0.08em] text-[#d4b89a]">
        {t("rsvpChecking")}
      </p>
    </div>
  );

  return (
    <section id="rsvp" className="bg-transparent">
      <div className="relative h-[38svh] min-h-[220px] w-full overflow-hidden">
        <Image
          src="/assets/rsvp-floral.webp"
          alt=""
          fill
          sizes="100vw"
          priority={false}
          className="object-cover object-left opacity-90"
        />
        <div className="absolute inset-0 bg-[rgba(53,18,24,0.48)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#3d1418]" />
        <div className="relative flex h-full items-center justify-center px-4">
          <h2
            className={`${displayFont.className} text-center text-[clamp(2rem,9vw,4rem)] tracking-[0.12em] text-[#f7ecd9] drop-shadow-[0_2px_20px_rgba(30,8,12,0.6)]`}
          >
            {t("rsvpTitle")}
          </h2>
        </div>
      </div>

      <div className="px-6 pb-10 pt-12 sm:pb-12">
        <div className="mx-auto w-full max-w-[620px]">
          <p className="mb-4 text-center font-serif text-[1rem] leading-relaxed text-[#e0c9a8]">
            {t("rsvpIntro1")}
          </p>
          <p className="mb-4 text-center font-serif text-[0.95rem] leading-relaxed text-[#d4b89a] italic">
            {t("rsvpIntro2")}
          </p>
          <p className="mb-10 text-center font-serif text-[0.95rem] leading-relaxed text-[#e0c9a8]">
            {t("rsvpIntro3")}
          </p>

          {status === "checking" ? (
            checkingCard
          ) : status === "missing" ? (
            missingCard
          ) : status === "success" || status === "already" ? (
            doneCard
          ) : (
            <form className="mt-2 space-y-7" onSubmit={onSubmit}>
              <div>
                <label htmlFor="rsvp-name" className={fieldLabel}>
                  {t("rsvpName")} <span className="text-[#f0b8a8]">*</span>
                </label>
                <input
                  id="rsvp-name"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={textInput}
                />
              </div>

              <div>
                <p className={fieldLabel}>
                  {t("rsvpGuestGroup")}{" "}
                  <span className="text-[#f0b8a8]">*</span>
                </p>
                <div className="space-y-2">
                  {rsvpValueMap.guestGroups.map((option) => (
                    <label key={option.vi} className={radioRow}>
                      <input
                        type="radio"
                        required
                        name="guestGroup"
                        value={option.vi}
                        checked={guestGroup === option.vi}
                        onChange={() => setGuestGroup(option.vi)}
                        className="h-4 w-4 accent-[#e0c9a8]"
                      />
                      <span className="font-serif text-[0.95rem]">
                        {t(option.key)}
                      </span>
                    </label>
                  ))}
                  <label className={radioRow}>
                    <input
                      type="radio"
                      required
                      name="guestGroup"
                      value="Other"
                      checked={guestGroup === "Other"}
                      onChange={() => setGuestGroup("Other")}
                      className="h-4 w-4 accent-[#e0c9a8]"
                    />
                    <span className="font-serif text-[0.95rem]">
                      {t("rsvpOther")}
                    </span>
                  </label>
                  {guestGroup === "Other" ? (
                    <input
                      required
                      maxLength={120}
                      value={guestGroupOther}
                      onChange={(e) => setGuestGroupOther(e.target.value)}
                      placeholder={t("rsvpOtherPlaceholder")}
                      className={`${textInput} mt-2`}
                    />
                  ) : null}
                </div>
              </div>

              <div>
                <p className={fieldLabel}>
                  {t("rsvpAttend")} <span className="text-[#f0b8a8]">*</span>
                </p>
                <div className="space-y-3">
                  {rsvpValueMap.attend.map((option) => (
                    <button
                      key={option.vi}
                      type="button"
                      aria-pressed={attend === option.vi}
                      onClick={() => setAttend(option.vi)}
                      className={choiceBtn(attend === option.vi)}
                    >
                      {t(option.key)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="rsvp-allergy" className={fieldLabel}>
                  {t("rsvpAllergy")} <span className="text-[#f0b8a8]">*</span>
                </label>
                <input
                  id="rsvp-allergy"
                  required
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                  placeholder={t("rsvpAllergyPlaceholder")}
                  className={textInput}
                />
              </div>

              <div>
                <p className={fieldLabel}>
                  {t("rsvpVegetarian")}{" "}
                  <span className="text-[#f0b8a8]">*</span>
                </p>
                <div className="space-y-2">
                  {rsvpValueMap.yesNo.map((option) => (
                    <label key={option.vi} className={radioRow}>
                      <input
                        type="radio"
                        required
                        name="vegetarian"
                        value={option.vi}
                        checked={vegetarian === option.vi}
                        onChange={() => setVegetarian(option.vi)}
                        className="h-4 w-4 accent-[#e0c9a8]"
                      />
                      <span className="font-serif text-[0.95rem]">
                        {t(option.key)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="rsvp-email" className={fieldLabel}>
                  {t("rsvpEmail")} <span className="text-[#d4b89a] text-xs">(optional)</span>
                </label>
                <input
                  id="rsvp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("rsvpEmailPlaceholder")}
                  className={textInput}
                />
                <p className="mt-2 text-xs text-[#d4b89a] leading-relaxed">
                  {t("rsvpEmailHelp")}
                </p>
              </div>

              {status === "error" ? (
                <p className="text-center font-serif text-sm text-[#f0b8a8]">
                  {t("rsvpError")}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-[#e0c9a8] px-6 py-4 font-serif text-[0.9rem] uppercase tracking-[0.18em] text-[#3d1418] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "submitting" ? t("rsvpSubmitting") : t("rsvpSubmit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
