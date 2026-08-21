"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { displayFont } from "@/lib/fonts";
import { LocaleProvider, useLocale } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

type HostRsvp = {
  token: string;
  name: string;
  guestGroup: string;
  attend: string;
  allergy: string;
  vegetarian: string;
  createdAt: string;
  path: string;
};

type AuthState = "checking" | "login" | "ready" | "missing_password";

function formatWhen(iso: string, locale: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale === "en" ? "en-AU" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function HostDashboardInner() {
  const { t, locale } = useLocale();
  const [auth, setAuth] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [rsvps, setRsvps] = useState<HostRsvp[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInviteUrl(window.location.origin);
  }, []);

  const loadRsvps = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetch("/api/host/rsvps", { cache: "no-store" });
      if (response.status === 401) {
        setAuth("login");
        setRsvps([]);
        return;
      }
      if (!response.ok) {
        setAuth("login");
        return;
      }
      const data = (await response.json()) as { rsvps?: HostRsvp[] };
      setRsvps(data.rsvps ?? []);
      setAuth("ready");
    } catch {
      setAuth("login");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadRsvps();
  }, [loadRsvps]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const response = await fetch("/api/host/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (response.status === 503 || data?.error === "host_password_not_set") {
        setAuth("missing_password");
        return;
      }
      if (!response.ok) {
        setLoginError(t("hostBadPassword"));
        return;
      }
      setPassword("");
      await loadRsvps();
    } catch {
      setLoginError(t("hostBadPassword"));
    } finally {
      setLoggingIn(false);
    }
  }

  async function onLogout() {
    await fetch("/api/host/logout", { method: "POST" });
    setRsvps([]);
    setAuth("login");
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const csvHref = useMemo(() => {
    if (!rsvps.length) return "";
    const header = [
      "name",
      "guestGroup",
      "attend",
      "allergy",
      "vegetarian",
      "createdAt",
      "privateLink",
    ];
    const rows = rsvps.map((r) =>
      [
        r.name,
        r.guestGroup,
        r.attend,
        r.allergy,
        r.vegetarian,
        r.createdAt,
        `${inviteUrl}${r.path}`,
      ]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    return URL.createObjectURL(blob);
  }, [rsvps, inviteUrl]);

  return (
    <main className="relative min-h-[100dvh] bg-[#3d1418] px-4 py-10 text-[#f7ecd9] sm:px-6">
      <LanguageToggle />
      <div className="mx-auto w-full max-w-5xl">
        <p
          className={`${displayFont.className} text-center text-[clamp(1.5rem,5vw,2.2rem)] tracking-[0.14em]`}
        >
          {t("hostTitle")}
        </p>
        <p className="mt-2 text-center font-serif text-sm text-[#d4b89a]">
          {t("hostSubtitle")}
        </p>

        {auth === "checking" ? (
          <p className="mt-16 text-center font-serif text-[#d4b89a]">…</p>
        ) : null}

        {auth === "missing_password" ? (
          <p className="mx-auto mt-12 max-w-xl text-center font-serif text-sm leading-relaxed text-[#f0b8a8]">
            {t("hostNotConfigured")}
          </p>
        ) : null}

        {auth === "login" ? (
          <form
            onSubmit={onLogin}
            className="mx-auto mt-12 w-full max-w-sm space-y-4 border border-[#7d4652] bg-[#5a2730]/45 px-5 py-8"
          >
            <label className="block text-[0.8rem] tracking-[0.1em] text-[#e0c9a8]">
              {t("hostPassword")}
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-[#7d4652] bg-[#5a2730]/60 px-3 py-3 font-serif text-[#f7ecd9] outline-none focus:border-[#e0c9a8]"
              />
            </label>
            {loginError ? (
              <p className="font-serif text-sm text-[#f0b8a8]">{loginError}</p>
            ) : null}
            <button
              type="submit"
              disabled={loggingIn || !password}
              className="w-full bg-[#e0c9a8] px-4 py-3 font-serif text-sm uppercase tracking-[0.14em] text-[#3d1418] disabled:opacity-40"
            >
              {loggingIn ? t("hostLoggingIn") : t("hostLogin")}
            </button>
          </form>
        ) : null}

        {auth === "ready" ? (
          <div className="mt-10 space-y-8">
            <section className="border border-[#7d4652] bg-[#5a2730]/45 px-5 py-6">
              <p className="text-[0.75rem] tracking-[0.14em] text-[#d4b89a]">
                {t("hostInviteLink")}
              </p>
              <p className="mt-2 break-all font-serif text-sm text-[#e0c9a8]">
                {inviteUrl}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyInvite}
                  className="bg-[#e0c9a8] px-4 py-2.5 font-serif text-sm tracking-[0.12em] text-[#3d1418]"
                >
                  {copied ? t("hostCopied") : t("hostCopyLink")}
                </button>
                <button
                  type="button"
                  onClick={() => void loadRsvps()}
                  className="border border-[#e0c9a8]/50 px-4 py-2.5 font-serif text-sm tracking-[0.12em] text-[#e0c9a8]"
                >
                  {t("hostRefresh")}
                </button>
                {csvHref ? (
                  <a
                    href={csvHref}
                    download="rsvp-responses.csv"
                    className="border border-[#e0c9a8]/50 px-4 py-2.5 font-serif text-sm tracking-[0.12em] text-[#e0c9a8]"
                  >
                    {t("hostCsv")}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="border border-[#e0c9a8]/35 px-4 py-2.5 font-serif text-sm tracking-[0.12em] text-[#d4b89a]"
                >
                  {t("hostLogout")}
                </button>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-serif text-lg tracking-[0.08em] text-[#f7ecd9]">
                  {t("hostResponses")}
                </h2>
                <p className="font-serif text-sm text-[#d4b89a]">
                  {t("hostCount")}: {rsvps.length}
                </p>
              </div>
              <p className="mb-5 max-w-3xl font-serif text-sm leading-relaxed text-[#d4b89a]/90">
                {t("hostNote")}
              </p>

              {loadingList ? (
                <p className="font-serif text-sm text-[#d4b89a]">…</p>
              ) : rsvps.length === 0 ? (
                <p className="font-serif text-sm text-[#d4b89a]">{t("hostEmpty")}</p>
              ) : (
                <div className="overflow-x-auto border border-[#7d4652]">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-[#5a2730]/80 text-[0.7rem] tracking-[0.1em] text-[#d4b89a]">
                      <tr>
                        <th className="px-3 py-3 font-normal">{t("hostColName")}</th>
                        <th className="px-3 py-3 font-normal">{t("hostColGroup")}</th>
                        <th className="px-3 py-3 font-normal">{t("hostColAttend")}</th>
                        <th className="px-3 py-3 font-normal">{t("hostColAllergy")}</th>
                        <th className="px-3 py-3 font-normal">
                          {t("hostColVegetarian")}
                        </th>
                        <th className="px-3 py-3 font-normal">{t("hostColWhen")}</th>
                        <th className="px-3 py-3 font-normal">{t("hostColLink")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsvps.map((r) => (
                        <tr
                          key={r.token}
                          className="border-t border-[#7d4652]/70 font-serif text-[#f7ecd9]"
                        >
                          <td className="px-3 py-3 align-top">{r.name}</td>
                          <td className="px-3 py-3 align-top">{r.guestGroup}</td>
                          <td className="px-3 py-3 align-top">{r.attend}</td>
                          <td className="px-3 py-3 align-top">{r.allergy}</td>
                          <td className="px-3 py-3 align-top">{r.vegetarian}</td>
                          <td className="px-3 py-3 align-top whitespace-nowrap">
                            {formatWhen(r.createdAt, locale)}
                          </td>
                          <td className="px-3 py-3 align-top">
                            <Link
                              href={r.path}
                              className="text-[#e0c9a8] underline-offset-2 hover:underline"
                            >
                              {t("hostOpen")}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="font-serif text-sm tracking-[0.12em] text-[#e0c9a8] underline-offset-4 hover:underline"
              >
                {t("rsvpBack")}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export function HostDashboard() {
  return (
    <LocaleProvider>
      <HostDashboardInner />
    </LocaleProvider>
  );
}
