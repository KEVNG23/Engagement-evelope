"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { displayFont } from "@/lib/fonts";

const GUEST_GROUPS = [
  "Người nhà",
  "Bạn của ba mẹ cô dâu",
  "Bạn của ba mẹ chú rể",
  "Bạn của cô dâu chú rể",
] as const;

const ATTEND_OPTIONS = [
  "Có, tôi sẽ tham dự",
  "Rất tiếc, tôi không thể tham dự",
] as const;

const STORAGE_KEY = "engagement-rsvp-token";

type Status = "idle" | "submitting" | "success" | "error" | "already";

/**
 * Native RSVP form with private view link (option 3).
 * One browser keeps the token in localStorage; the link works on any device.
 */
export function RsvpForm() {
  const [name, setName] = useState("");
  const [guestGroup, setGuestGroup] = useState("");
  const [guestGroupOther, setGuestGroupOther] = useState("");
  const [attend, setAttend] = useState("");
  const [allergy, setAllergy] = useState("");
  const [vegetarian, setVegetarian] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && /^[a-f0-9]{32}$/i.test(saved)) {
      setToken(saved);
      setStatus("already");
      setShareUrl(`${window.location.origin}/rsvp/${saved}`);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setShareUrl(`${window.location.origin}/rsvp/${token}`);
  }, [token]);

  const canSubmit = useMemo(() => {
    if (status === "already" || status === "success") return false;
    if (!name.trim() || !guestGroup || !attend || !allergy.trim() || !vegetarian)
      return false;
    if (guestGroup === "Other" && !guestGroupOther.trim()) return false;
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

      window.localStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      setStatus("success");
      setName("");
      setGuestGroup("");
      setGuestGroupOther("");
      setAttend("");
      setAllergy("");
      setVegetarian("");
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
        {status === "already"
          ? "Quý khách đã gửi phúc đáp trên thiết bị này."
          : "Cảm ơn Quý khách đã gửi phúc đáp!"}
      </p>
      <p className="mt-4 font-serif text-sm leading-relaxed text-[#d4b89a]">
        Lưu link riêng bên dưới để xem lại câu trả lời bất kỳ lúc nào — không
        cần đăng nhập.
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
            Xem phúc đáp
          </Link>
        ) : null}
        <button
          type="button"
          onClick={copyLink}
          className="border border-[#e0c9a8]/55 px-5 py-3 font-serif text-sm tracking-[0.12em] text-[#e0c9a8] transition-colors hover:border-[#e0c9a8]"
        >
          {copied ? "Đã copy" : "Copy link"}
        </button>
      </div>
    </div>
  );

  return (
    <section id="rsvp" className="bg-[#3d1418]">
      <div className="relative h-[38svh] min-h-[220px] w-full overflow-hidden">
        <Image
          src="/assets/peony.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-[rgba(53,18,24,0.55)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#3d1418]" />
        <div className="relative flex h-full items-center justify-center px-4">
          <h2
            className={`${displayFont.className} text-center text-[clamp(2rem,9vw,4rem)] tracking-[0.12em] text-[#f7ecd9] drop-shadow-[0_2px_20px_rgba(30,8,12,0.6)]`}
          >
            THIỆP PHÚC ĐÁP
          </h2>
        </div>
      </div>

      <div className="px-6 pb-24 pt-12 sm:pb-28">
        <div className="mx-auto w-full max-w-[620px]">
          <p className="mb-4 text-center font-serif text-[1rem] leading-relaxed text-[#e0c9a8]">
            Sự hiện diện của Quý khách sẽ là niềm vinh hạnh và góp phần tạo nên
            những kỷ niệm đẹp trong ngày vui của chúng tôi.
          </p>
          <p className="mb-4 text-center font-serif text-[0.95rem] leading-relaxed text-[#d4b89a] italic">
            Để chúng tôi có thể chuẩn bị chu đáo cho buổi tiệc, kính mong Quý
            khách vui lòng xác nhận tham dự trước ngày 30/11/2026 bằng cách
            điền thông tin bên dưới.
          </p>
          <p className="mb-10 text-center font-serif text-[0.95rem] leading-relaxed text-[#e0c9a8]">
            Xin chân thành cảm ơn và rất mong được đón tiếp Quý khách trong
            ngày vui của chúng tôi.
          </p>

          {status === "success" || status === "already" ? (
            doneCard
          ) : (
            <form className="mt-2 space-y-7" onSubmit={onSubmit}>
              <div>
                <label htmlFor="rsvp-name" className={fieldLabel}>
                  Họ và Tên <span className="text-[#f0b8a8]">*</span>
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
                  Bạn thuộc nhóm khách:{" "}
                  <span className="text-[#f0b8a8]">*</span>
                </p>
                <div className="space-y-2">
                  {GUEST_GROUPS.map((option) => (
                    <label key={option} className={radioRow}>
                      <input
                        type="radio"
                        required
                        name="guestGroup"
                        value={option}
                        checked={guestGroup === option}
                        onChange={() => setGuestGroup(option)}
                        className="h-4 w-4 accent-[#e0c9a8]"
                      />
                      <span className="font-serif text-[0.95rem]">{option}</span>
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
                    <span className="font-serif text-[0.95rem]">Other:</span>
                  </label>
                  {guestGroup === "Other" ? (
                    <input
                      required
                      maxLength={120}
                      value={guestGroupOther}
                      onChange={(e) => setGuestGroupOther(e.target.value)}
                      placeholder="Vui lòng ghi rõ"
                      className={`${textInput} mt-2`}
                    />
                  ) : null}
                </div>
              </div>

              <div>
                <p className={fieldLabel}>
                  Bạn có thể tham dự không?{" "}
                  <span className="text-[#f0b8a8]">*</span>
                </p>
                <div className="space-y-3">
                  {ATTEND_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={attend === option}
                      onClick={() => setAttend(option)}
                      className={choiceBtn(attend === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="rsvp-allergy" className={fieldLabel}>
                  Bạn có bị dị ứng thực phẩm nào không?{" "}
                  <span className="text-[#f0b8a8]">*</span>
                </label>
                <input
                  id="rsvp-allergy"
                  required
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                  placeholder="Nếu có, vui lòng ghi rõ"
                  className={textInput}
                />
              </div>

              <div>
                <p className={fieldLabel}>
                  Bạn có phải người ăn chay trường không{" "}
                  <span className="text-[#f0b8a8]">*</span>
                </p>
                <div className="space-y-2">
                  {(
                    [
                      ["Có", "Có"],
                      ["Không", "Không"],
                    ] as const
                  ).map(([label, value]) => (
                    <label key={value} className={radioRow}>
                      <input
                        type="radio"
                        required
                        name="vegetarian"
                        value={value}
                        checked={vegetarian === value}
                        onChange={() => setVegetarian(value)}
                        className="h-4 w-4 accent-[#e0c9a8]"
                      />
                      <span className="font-serif text-[0.95rem]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {status === "error" ? (
                <p className="text-center font-serif text-sm text-[#f0b8a8]">
                  Không gửi được. Vui lòng thử lại.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-[#e0c9a8] px-6 py-4 font-serif text-[0.9rem] uppercase tracking-[0.18em] text-[#3d1418] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "submitting" ? "Đang gửi…" : "Gửi"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
