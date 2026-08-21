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
  email?: string;
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

function isAttending(attend: string) {
  const value = attend.trim().toLowerCase();
  return (
    value.includes("sẽ tham dự") ||
    value.includes("will attend") ||
    value.startsWith("có,")
  );
}

function isVegetarianYes(value: string) {
  const v = value.trim().toLowerCase();
  return v === "có" || v === "yes";
}

function hasAllergyNote(allergy: string) {
  const v = allergy.trim().toLowerCase();
  if (!v) return false;
  if (["không", "khong", "no", "none", "n/a", "-", "nope"].includes(v)) {
    return false;
  }
  return true;
}

function countBy(items: string[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.trim() || "—";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const LIST_PAGE_SIZE = 8;

function ExpandControls({
  total,
  expanded,
  onToggle,
  showMoreLabel,
  showLessLabel,
  showingOfLabel,
}: {
  total: number;
  expanded: boolean;
  onToggle: () => void;
  showMoreLabel: string;
  showLessLabel: string;
  showingOfLabel: string;
}) {
  if (total <= LIST_PAGE_SIZE) return null;
  const shown = expanded ? total : LIST_PAGE_SIZE;
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
      <p className="font-serif text-[12px] text-[#d4b89a]">
        {showingOfLabel
          .replace("{shown}", String(shown))
          .replace("{total}", String(total))}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="font-serif text-[12px] tracking-[0.1em] text-[#e0c9a8] underline-offset-2 hover:underline sm:text-[13px]"
      >
        {expanded
          ? showLessLabel
          : `${showMoreLabel} (+${total - LIST_PAGE_SIZE})`}
      </button>
    </div>
  );
}

function useExpandable<T>(items: T[], expanded: boolean) {
  return useMemo(() => {
    if (expanded || items.length <= LIST_PAGE_SIZE) return items;
    return items.slice(0, LIST_PAGE_SIZE);
  }, [items, expanded]);
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
  const [live, setLive] = useState(false);
  const [deletingToken, setDeletingToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [ephemeral, setEphemeral] = useState(false);
  const [importCsv, setImportCsv] = useState("");
  const [importing, setImporting] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [expandGroups, setExpandGroups] = useState(false);
  const [expandAllergy, setExpandAllergy] = useState(false);
  const [expandAttending, setExpandAttending] = useState(false);
  const [expandDeclining, setExpandDeclining] = useState(false);
  const [expandDetails, setExpandDetails] = useState(false);

  useEffect(() => {
    setInviteUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const expandAllForPrint = () => {
      setExpandGroups(true);
      setExpandAllergy(true);
      setExpandAttending(true);
      setExpandDeclining(true);
      setExpandDetails(true);
    };
    window.addEventListener("beforeprint", expandAllForPrint);
    return () => window.removeEventListener("beforeprint", expandAllForPrint);
  }, []);

  const applyRsvps = useCallback((next: HostRsvp[]) => {
    setRsvps((prev) => {
      const prevKey = prev.map((r) => `${r.token}:${r.createdAt}`).join("|");
      const nextKey = next.map((r) => `${r.token}:${r.createdAt}`).join("|");
      if (prevKey === nextKey) return prev;
      return next;
    });
  }, []);

  const loadRsvps = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (!silent) setLoadingList(true);
      try {
        const response = await fetch("/api/host/rsvps", { cache: "no-store" });
        if (response.status === 401) {
          setAuth("login");
          setRsvps([]);
          setLive(false);
          return;
        }
        if (!response.ok) {
          setAuth("login");
          setLive(false);
          return;
        }
        const data = (await response.json()) as {
          rsvps?: HostRsvp[];
          ephemeral?: boolean;
        };
        applyRsvps(data.rsvps ?? []);
        setEphemeral(Boolean(data.ephemeral));
        setAuth("ready");
        setLive(true);
      } catch {
        if (!silent) {
          setAuth("login");
          setLive(false);
        }
      } finally {
        if (!silent) setLoadingList(false);
      }
    },
    [applyRsvps],
  );

  useEffect(() => {
    void loadRsvps();
  }, [loadRsvps]);

  useEffect(() => {
    if (auth !== "ready") return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (document.visibilityState === "hidden") return;
      void loadRsvps({ silent: true });
    };

    const id = window.setInterval(tick, 4000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [auth, loadRsvps]);

  const report = useMemo(() => {
    const attending = rsvps.filter((r) => isAttending(r.attend));
    const declining = rsvps.filter((r) => !isAttending(r.attend));
    const vegetarianYes = rsvps.filter((r) => isVegetarianYes(r.vegetarian));
    const vegetarianNo = rsvps.filter((r) => !isVegetarianYes(r.vegetarian));
    const allergyNotes = rsvps.filter((r) => hasAllergyNote(r.allergy));
    const groups = countBy(rsvps.map((r) => r.guestGroup));

    return {
      total: rsvps.length,
      attending,
      declining,
      vegetarianYes,
      vegetarianNo,
      allergyNotes,
      groups,
    };
  }, [rsvps]);

  const visibleGroups = useExpandable(report.groups, expandGroups);
  const visibleAllergy = useExpandable(report.allergyNotes, expandAllergy);
  const visibleAttending = useExpandable(report.attending, expandAttending);
  const visibleDeclining = useExpandable(report.declining, expandDeclining);
  const visibleDetails = useExpandable(rsvps, expandDetails);

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

  async function onDelete(token: string) {
    if (!window.confirm(t("hostDeleteConfirm"))) return;
    setDeletingToken(token);
    try {
      const response = await fetch(`/api/host/rsvps/${token}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        setAuth("login");
        return;
      }
      if (!response.ok) return;
      setRsvps((prev) => prev.filter((r) => r.token !== token));
    } finally {
      setDeletingToken(null);
    }
  }

  async function onUpdateEmail(token: string, email: string) {
    try {
      const response = await fetch("/api/host/rsvps/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: email.trim() }),
      });
      if (response.status === 401) {
        setAuth("login");
        return;
      }
      if (!response.ok) return;
      
      setRsvps((prev) =>
        prev.map((r) =>
          r.token === token ? { ...r, email: email.trim() || undefined } : r,
        ),
      );
      setEditingEmail(null);
      setEmailDraft("");
    } catch {
      // Failed to update
    }
  }

  function startEditingEmail(token: string, currentEmail?: string) {
    setEditingEmail(token);
    setEmailDraft(currentEmail || "");
  }

  function cancelEditingEmail() {
    setEditingEmail(null);
    setEmailDraft("");
  }

  function exportEmails() {
    const emails = rsvps
      .filter((r) => r.email && r.email.trim())
      .map((r) => `${r.name} <${r.email}>`)
      .join(", ");
    
    if (!emails) {
      alert("No email addresses available to export.");
      return;
    }

    try {
      navigator.clipboard.writeText(emails);
      alert(`Copied ${rsvps.filter((r) => r.email).length} email addresses to clipboard!`);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = emails;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert(`Copied ${rsvps.filter((r) => r.email).length} email addresses!`);
    }
  }

  async function onSyncGoogle() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/host/sync-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "merge" }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        removed?: number;
        added?: number;
        updated?: number;
      } | null;

      if (response.status === 401) {
        setAuth("login");
        return;
      }
      if (response.status === 503 || data?.error === "google_sheet_not_configured") {
        setSyncMessage(t("hostSyncNeedSheet"));
        return;
      }
      if (!response.ok || !data) {
        setSyncMessage(t("hostSyncFail"));
        return;
      }

      setSyncMessage(
        `${t("hostSyncOk")} (+${data.added ?? 0} / ~${data.updated ?? 0})`,
      );
      await loadRsvps({ silent: true });
    } catch {
      setSyncMessage(t("hostSyncFail"));
    } finally {
      setSyncing(false);
    }
  }

  async function onImportCsv() {
    const csv = importCsv.trim();
    if (!csv) return;
    setImporting(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/host/sync-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, mode: "merge" }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        added?: number;
        updated?: number;
      } | null;

      if (response.status === 401) {
        setAuth("login");
        return;
      }
      if (!response.ok || !data) {
        setSyncMessage(t("hostSyncFail"));
        return;
      }

      setSyncMessage(
        `${t("hostSyncOk")} (+${data.added ?? 0} / ~${data.updated ?? 0})`,
      );
      setImportCsv("");
      await loadRsvps({ silent: true });
    } catch {
      setSyncMessage(t("hostSyncFail"));
    } finally {
      setImporting(false);
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
    <main
      className="invite-scroller relative h-[100dvh] max-h-[100dvh] overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#3d1418] text-[#f7ecd9] touch-pan-y"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <LanguageToggle />
      <div className="mx-auto w-full max-w-5xl px-3 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.25rem))] sm:px-6 sm:pt-14">
        <p
          className={`${displayFont.className} text-center text-[clamp(1.35rem,6vw,2.2rem)] tracking-[0.12em]`}
        >
          {t("hostTitle")}
        </p>
        <p className="mt-2 px-2 text-center font-serif text-[13px] leading-relaxed text-[#d4b89a] sm:text-sm">
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
            className="mx-auto mt-10 w-full max-w-sm space-y-4 border border-[#7d4652] bg-[#5a2730]/45 px-4 py-7 sm:mt-12 sm:px-5 sm:py-8"
          >
            <label className="block text-[0.8rem] tracking-[0.1em] text-[#e0c9a8]">
              {t("hostPassword")}
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-[#7d4652] bg-[#5a2730]/60 px-3 py-3 font-serif text-[16px] text-[#f7ecd9] outline-none focus:border-[#e0c9a8]"
              />
            </label>
            {loginError ? (
              <p className="font-serif text-sm text-[#f0b8a8]">{loginError}</p>
            ) : null}
            <button
              type="submit"
              disabled={loggingIn || !password}
              className="w-full bg-[#e0c9a8] px-4 py-3.5 font-serif text-sm uppercase tracking-[0.14em] text-[#3d1418] disabled:opacity-40"
            >
              {loggingIn ? t("hostLoggingIn") : t("hostLogin")}
            </button>
          </form>
        ) : null}

        {auth === "ready" ? (
          <div className="mt-8 space-y-7 sm:mt-10 sm:space-y-8">
            <section className="border border-[#7d4652] bg-[#5a2730]/45 px-4 py-5 sm:px-5 sm:py-6">
              <p className="text-[0.75rem] tracking-[0.14em] text-[#d4b89a]">
                {t("hostInviteLink")}
              </p>
              <p className="mt-2 break-all font-serif text-[13px] leading-relaxed text-[#e0c9a8] sm:text-sm">
                {inviteUrl}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <button
                  type="button"
                  onClick={copyInvite}
                  className="bg-[#e0c9a8] px-3 py-3 font-serif text-[13px] tracking-[0.1em] text-[#3d1418] sm:px-4 sm:text-sm"
                >
                  {copied ? t("hostCopied") : t("hostCopyLink")}
                </button>
                <button
                  type="button"
                  onClick={() => void loadRsvps()}
                  className="border border-[#e0c9a8]/50 px-3 py-3 font-serif text-[13px] tracking-[0.1em] text-[#e0c9a8] sm:px-4 sm:text-sm"
                >
                  {t("hostRefresh")}
                </button>
                <button
                  type="button"
                  onClick={() => void onSyncGoogle()}
                  disabled={syncing}
                  className="border border-[#e0c9a8]/50 px-3 py-3 font-serif text-[13px] tracking-[0.1em] text-[#e0c9a8] disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  {syncing ? t("hostSyncing") : t("hostSyncGoogle")}
                </button>
                {csvHref ? (
                  <a
                    href={csvHref}
                    download="rsvp-responses.csv"
                    className="border border-[#e0c9a8]/50 px-3 py-3 text-center font-serif text-[13px] tracking-[0.1em] text-[#e0c9a8] sm:px-4 sm:text-sm"
                  >
                    {t("hostCsv")}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="border border-[#e0c9a8]/50 px-3 py-3 font-serif text-[13px] tracking-[0.1em] text-[#e0c9a8] sm:px-4 sm:text-sm"
                >
                  {t("hostPrint")}
                </button>
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="col-span-2 border border-[#e0c9a8]/35 px-3 py-3 font-serif text-[13px] tracking-[0.1em] text-[#d4b89a] print:hidden sm:col-span-1 sm:px-4 sm:text-sm"
                >
                  {t("hostLogout")}
                </button>
              </div>
              {syncMessage ? (
                <p className="mt-3 font-serif text-[13px] leading-relaxed text-[#e0c9a8] sm:text-sm">
                  {syncMessage}
                </p>
              ) : null}
            </section>

            {ephemeral || rsvps.length === 0 ? (
              <section className="border border-[#c47a6a]/55 bg-[#5a2730]/55 px-4 py-5 sm:px-5 sm:py-6">
                {ephemeral ? (
                  <p className="font-serif text-[13px] leading-relaxed text-[#f0b8a8] sm:text-sm">
                    {t("hostEphemeralWarn")}
                  </p>
                ) : null}
                <p
                  className={`text-[0.75rem] tracking-[0.14em] text-[#d4b89a] ${ephemeral ? "mt-4" : ""}`}
                >
                  {t("hostImportTitle")}
                </p>
                <p className="mt-2 font-serif text-[13px] leading-relaxed text-[#e0c9a8]/90 sm:text-sm">
                  {t("hostImportHint")}
                </p>
                <textarea
                  value={importCsv}
                  onChange={(e) => setImportCsv(e.target.value)}
                  rows={5}
                  placeholder={t("hostImportPlaceholder")}
                  className="mt-3 w-full border border-[#7d4652] bg-[#3d1418]/50 px-3 py-3 font-mono text-[12px] text-[#f7ecd9] outline-none focus:border-[#e0c9a8]"
                />
                <button
                  type="button"
                  onClick={() => void onImportCsv()}
                  disabled={importing || !importCsv.trim()}
                  className="mt-3 bg-[#e0c9a8] px-4 py-3 font-serif text-[13px] tracking-[0.1em] text-[#3d1418] disabled:opacity-40 sm:text-sm"
                >
                  {importing ? t("hostImporting") : t("hostImportBtn")}
                </button>
              </section>
            ) : null}

            <section className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="font-serif text-base tracking-[0.08em] text-[#f7ecd9] sm:text-lg">
                  {t("hostReport")}
                </h2>
                {live ? (
                  <span className="inline-flex items-center gap-2 font-serif text-[12px] text-[#e0c9a8] print:hidden sm:text-sm">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e0c9a8]"
                    />
                    {t("hostLive")}
                  </span>
                ) : null}
              </div>
              <p className="font-serif text-[13px] leading-relaxed text-[#d4b89a]/90 sm:text-sm">
                {t("hostNote")}
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                {[
                  { label: t("hostCount"), value: report.total },
                  { label: t("hostAttending"), value: report.attending.length },
                  { label: t("hostDeclining"), value: report.declining.length },
                  {
                    label: t("hostVegetarianYes"),
                    value: report.vegetarianYes.length,
                  },
                  {
                    label: t("hostVegetarianNo"),
                    value: report.vegetarianNo.length,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-[#7d4652] bg-[#5a2730]/45 px-3 py-4 text-center sm:px-4 sm:py-5"
                  >
                    <p className="font-serif text-2xl text-[#f7ecd9] sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-[0.65rem] leading-snug tracking-[0.08em] text-[#d4b89a] sm:mt-2 sm:text-[0.7rem] sm:tracking-[0.12em]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                <div className="border border-[#7d4652] bg-[#5a2730]/35 px-4 py-4 sm:px-5 sm:py-5">
                  <p className="text-[0.75rem] tracking-[0.14em] text-[#d4b89a]">
                    {t("hostByGroup")}
                  </p>
                  {report.groups.length === 0 ? (
                    <p className="mt-3 font-serif text-sm text-[#d4b89a]">
                      {t("hostEmpty")}
                    </p>
                  ) : (
                    <>
                      <ul className="mt-3 space-y-2 font-serif text-[13px] text-[#f7ecd9] sm:text-sm">
                        {visibleGroups.map(([group, count]) => (
                          <li
                            key={group}
                            className="flex items-baseline justify-between gap-3 border-b border-[#7d4652]/50 pb-2"
                          >
                            <span className="min-w-0 break-words">{group}</span>
                            <span className="shrink-0 text-[#e0c9a8]">{count}</span>
                          </li>
                        ))}
                      </ul>
                      <ExpandControls
                        total={report.groups.length}
                        expanded={expandGroups}
                        onToggle={() => setExpandGroups((v) => !v)}
                        showMoreLabel={t("hostShowMore")}
                        showLessLabel={t("hostShowLess")}
                        showingOfLabel={t("hostShowingOf")}
                      />
                    </>
                  )}
                </div>

                <div className="border border-[#7d4652] bg-[#5a2730]/35 px-4 py-4 sm:px-5 sm:py-5">
                  <p className="text-[0.75rem] tracking-[0.14em] text-[#d4b89a]">
                    {t("hostAllergyList")}
                  </p>
                  {report.allergyNotes.length === 0 ? (
                    <p className="mt-3 font-serif text-sm text-[#d4b89a]">
                      {t("hostNoAllergyNotes")}
                    </p>
                  ) : (
                    <>
                      <ul className="mt-3 space-y-2 font-serif text-[13px] text-[#f7ecd9] sm:text-sm">
                        {visibleAllergy.map((r) => (
                          <li
                            key={r.token}
                            className="border-b border-[#7d4652]/50 pb-2"
                          >
                            <span className="text-[#e0c9a8]">{r.name}</span>
                            <span className="mt-0.5 block break-words text-[#d4b89a]">
                              {r.allergy}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <ExpandControls
                        total={report.allergyNotes.length}
                        expanded={expandAllergy}
                        onToggle={() => setExpandAllergy((v) => !v)}
                        showMoreLabel={t("hostShowMore")}
                        showLessLabel={t("hostShowLess")}
                        showingOfLabel={t("hostShowingOf")}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                <div className="border border-[#7d4652] bg-[#5a2730]/35 px-4 py-4 sm:px-5 sm:py-5">
                  <p className="text-[0.75rem] tracking-[0.14em] text-[#d4b89a]">
                    {t("hostAttendingList")} ({report.attending.length})
                  </p>
                  {report.attending.length === 0 ? (
                    <p className="mt-3 font-serif text-sm text-[#d4b89a]">—</p>
                  ) : (
                    <>
                      <ul className="mt-3 space-y-1.5 font-serif text-[13px] text-[#f7ecd9] sm:text-sm">
                        {visibleAttending.map((r) => (
                          <li key={r.token} className="break-words">
                            {r.name}
                            <span className="text-[#d4b89a]"> — {r.guestGroup}</span>
                          </li>
                        ))}
                      </ul>
                      <ExpandControls
                        total={report.attending.length}
                        expanded={expandAttending}
                        onToggle={() => setExpandAttending((v) => !v)}
                        showMoreLabel={t("hostShowMore")}
                        showLessLabel={t("hostShowLess")}
                        showingOfLabel={t("hostShowingOf")}
                      />
                    </>
                  )}
                </div>
                <div className="border border-[#7d4652] bg-[#5a2730]/35 px-4 py-4 sm:px-5 sm:py-5">
                  <p className="text-[0.75rem] tracking-[0.14em] text-[#d4b89a]">
                    {t("hostDecliningList")} ({report.declining.length})
                  </p>
                  {report.declining.length === 0 ? (
                    <p className="mt-3 font-serif text-sm text-[#d4b89a]">—</p>
                  ) : (
                    <>
                      <ul className="mt-3 space-y-1.5 font-serif text-[13px] text-[#f7ecd9] sm:text-sm">
                        {visibleDeclining.map((r) => (
                          <li key={r.token} className="break-words">
                            {r.name}
                            <span className="text-[#d4b89a]"> — {r.guestGroup}</span>
                          </li>
                        ))}
                      </ul>
                      <ExpandControls
                        total={report.declining.length}
                        expanded={expandDeclining}
                        onToggle={() => setExpandDeclining((v) => !v)}
                        showMoreLabel={t("hostShowMore")}
                        showLessLabel={t("hostShowLess")}
                        showingOfLabel={t("hostShowingOf")}
                      />
                    </>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2 className="font-serif text-base tracking-[0.08em] text-[#f7ecd9] sm:text-lg">
                  {t("hostResponses")}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={exportEmails}
                    disabled={rsvps.filter((r) => r.email).length === 0}
                    className="font-serif text-[12px] tracking-[0.1em] text-[#e0c9a8] underline-offset-2 hover:underline disabled:opacity-40 disabled:cursor-not-allowed print:hidden"
                  >
                    {t("hostEmailExport")}
                  </button>
                  <span className="font-serif text-[13px] text-[#d4b89a] sm:text-sm">
                    {t("hostCount")}: {rsvps.length}
                  </span>
                </div>
              </div>

              {loadingList ? (
                <p className="font-serif text-sm text-[#d4b89a]">…</p>
              ) : rsvps.length === 0 ? (
                <p className="font-serif text-sm text-[#d4b89a]">{t("hostEmpty")}</p>
              ) : (
                <>
                  {/* Mobile: stacked cards */}
                  <div className="space-y-3 md:hidden">
                    {visibleDetails.map((r) => (
                      <article
                        key={r.token}
                        className="border border-[#7d4652] bg-[#5a2730]/45 px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 break-words font-serif text-[15px] text-[#f7ecd9]">
                            {r.name}
                          </p>
                          <div className="flex shrink-0 items-center gap-3">
                            <Link
                              href={r.path}
                              className="text-[12px] tracking-[0.1em] text-[#e0c9a8] underline-offset-2"
                            >
                              {t("hostOpen")}
                            </Link>
                            <button
                              type="button"
                              onClick={() => void onDelete(r.token)}
                              disabled={deletingToken === r.token}
                              className="text-[12px] tracking-[0.1em] text-[#f0b8a8] disabled:opacity-40 print:hidden"
                            >
                              {deletingToken === r.token
                                ? t("hostDeleting")
                                : t("hostDelete")}
                            </button>
                          </div>
                        </div>
                        <dl className="mt-3 space-y-2 font-serif text-[13px]">
                          <div>
                            <dt className="text-[0.65rem] tracking-[0.12em] text-[#d4b89a]">
                              {t("hostColGroup")}
                            </dt>
                            <dd className="mt-0.5 break-words text-[#f7ecd9]">
                              {r.guestGroup}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.65rem] tracking-[0.12em] text-[#d4b89a]">
                              {t("hostColAttend")}
                            </dt>
                            <dd className="mt-0.5 break-words text-[#f7ecd9]">
                              {r.attend}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.65rem] tracking-[0.12em] text-[#d4b89a]">
                              {t("hostColAllergy")}
                            </dt>
                            <dd className="mt-0.5 break-words text-[#f7ecd9]">
                              {r.allergy}
                            </dd>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <dt className="text-[0.65rem] tracking-[0.12em] text-[#d4b89a]">
                                {t("hostColVegetarian")}
                              </dt>
                              <dd className="mt-0.5 text-[#f7ecd9]">
                                {r.vegetarian}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[0.65rem] tracking-[0.12em] text-[#d4b89a]">
                                {t("hostColWhen")}
                              </dt>
                              <dd className="mt-0.5 text-[#f7ecd9]">
                                {formatWhen(r.createdAt, locale)}
                              </dd>
                            </div>
                          </div>
                          <div>
                            <dt className="text-[0.65rem] tracking-[0.12em] text-[#d4b89a]">
                              {t("hostColEmail")}
                            </dt>
                            <dd className="mt-0.5 break-all text-[#f7ecd9]">
                              {editingEmail === r.token ? (
                                <div className="flex gap-2 mt-1">
                                  <input
                                    type="email"
                                    value={emailDraft}
                                    onChange={(e) => setEmailDraft(e.target.value)}
                                    placeholder={t("hostEmailPlaceholder")}
                                    className="flex-1 border border-[#7d4652] bg-[#3d1418] px-2 py-1 text-[13px] text-[#f7ecd9] outline-none focus:border-[#e0c9a8]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void onUpdateEmail(r.token, emailDraft)}
                                    className="text-[12px] text-[#e0c9a8]"
                                  >
                                    {t("hostEmailSave")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditingEmail}
                                    className="text-[12px] text-[#d4b89a]"
                                  >
                                    {t("hostEmailCancel")}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>{r.email || "—"}</span>
                                  <button
                                    type="button"
                                    onClick={() => startEditingEmail(r.token, r.email)}
                                    className="text-[12px] text-[#e0c9a8] print:hidden"
                                  >
                                    {t("hostEmailEdit")}
                                  </button>
                                </div>
                              )}
                            </dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden overflow-x-auto border border-[#7d4652] md:block">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-[#5a2730]/80 text-[0.7rem] tracking-[0.1em] text-[#d4b89a]">
                        <tr>
                          <th className="px-3 py-3 font-normal">
                            {t("hostColName")}
                          </th>
                          <th className="px-3 py-3 font-normal">
                            {t("hostColGroup")}
                          </th>
                          <th className="px-3 py-3 font-normal">
                            {t("hostColAttend")}
                          </th>
                          <th className="px-3 py-3 font-normal">
                            {t("hostColAllergy")}
                          </th>
                          <th className="px-3 py-3 font-normal">
                            {t("hostColVegetarian")}
                          </th>
                          <th className="px-3 py-3 font-normal">
                            {t("hostColEmail")}
                          </th>
                          <th className="px-3 py-3 font-normal">
                            {t("hostColWhen")}
                          </th>
                          <th className="px-3 py-3 font-normal print:hidden">
                            {t("hostColLink")}
                          </th>
                          <th className="px-3 py-3 font-normal print:hidden">
                            {t("hostColActions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleDetails.map((r) => (
                          <tr
                            key={r.token}
                            className="border-t border-[#7d4652]/70 font-serif text-[#f7ecd9]"
                          >
                            <td className="px-3 py-3 align-top">{r.name}</td>
                            <td className="px-3 py-3 align-top">{r.guestGroup}</td>
                            <td className="px-3 py-3 align-top">{r.attend}</td>
                            <td className="px-3 py-3 align-top">{r.allergy}</td>
                            <td className="px-3 py-3 align-top">{r.vegetarian}</td>
                            <td className="px-3 py-3 align-top">
                              {editingEmail === r.token ? (
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="email"
                                    value={emailDraft}
                                    onChange={(e) => setEmailDraft(e.target.value)}
                                    placeholder={t("hostEmailPlaceholder")}
                                    className="w-40 border border-[#7d4652] bg-[#3d1418] px-2 py-1 text-sm text-[#f7ecd9] outline-none focus:border-[#e0c9a8]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void onUpdateEmail(r.token, emailDraft)}
                                    className="text-xs text-[#e0c9a8] hover:underline"
                                  >
                                    {t("hostEmailSave")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditingEmail}
                                    className="text-xs text-[#d4b89a] hover:underline"
                                  >
                                    {t("hostEmailCancel")}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="break-all">{r.email || "—"}</span>
                                  <button
                                    type="button"
                                    onClick={() => startEditingEmail(r.token, r.email)}
                                    className="text-xs text-[#e0c9a8] hover:underline print:hidden"
                                  >
                                    {t("hostEmailEdit")}
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 align-top">
                              {formatWhen(r.createdAt, locale)}
                            </td>
                            <td className="px-3 py-3 align-top print:hidden">
                              <Link
                                href={r.path}
                                className="text-[#e0c9a8] underline-offset-2 hover:underline"
                              >
                                {t("hostOpen")}
                              </Link>
                            </td>
                            <td className="px-3 py-3 align-top print:hidden">
                              <button
                                type="button"
                                onClick={() => void onDelete(r.token)}
                                disabled={deletingToken === r.token}
                                className="text-[#f0b8a8] underline-offset-2 hover:underline disabled:opacity-40"
                              >
                                {deletingToken === r.token
                                  ? t("hostDeleting")
                                  : t("hostDelete")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ExpandControls
                    total={rsvps.length}
                    expanded={expandDetails}
                    onToggle={() => setExpandDetails((v) => !v)}
                    showMoreLabel={t("hostShowMore")}
                    showLessLabel={t("hostShowLess")}
                    showingOfLabel={t("hostShowingOf")}
                  />
                </>
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
