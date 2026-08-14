"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { invitation, TIMING } from "@/lib/invitation-data";
import { displayFont, scriptFont } from "@/lib/fonts";
import { luxuryTransition } from "@/lib/motion";

export type EnvelopePhase = "idle" | "opening" | "risen" | "done";

type EnvelopeOpeningProps = {
  opened?: boolean;
  onComplete: () => void;
  onSkip: () => void;
  /** Fires once when the user starts opening the envelope */
  onOpenStart?: () => void;
};

/**
 * Same closed envelope always.
 * Click → lid lifts (3D) → then letter rises.
 * No image swap to envelope-open.png.
 */
export function EnvelopeOpening({
  opened = false,
  onComplete,
  onSkip,
  onOpenStart,
}: EnvelopeOpeningProps) {
  const reduceMotion = useReducedMotion();
  const labelId = useId();
  const [phase, setPhase] = useState<EnvelopePhase>("idle");
  const [hovered, setHovered] = useState(false);
  const phaseRef = useRef<EnvelopePhase>("idle");
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onOpenStartRef = useRef(onOpenStart);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onOpenStartRef.current = onOpenStart;
  }, [onOpenStart]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (!opened) return;
    completedRef.current = true;
    if (phaseRef.current === "idle") setPhase("done");
  }, [opened]);

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function openEnvelope() {
    if (phaseRef.current !== "idle" || completedRef.current) return;

    if (reduceMotion) {
      completedRef.current = true;
      setPhase("done");
      onOpenStartRef.current?.();
      onCompleteRef.current();
      return;
    }

    clearTimers();
    setPhase("opening");
    onOpenStartRef.current?.();

    const letterDelay = TIMING.flapMs + TIMING.delayMs;

    timersRef.current.push(
      window.setTimeout(() => {
        if (phaseRef.current === "opening") setPhase("risen");
      }, letterDelay),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        setPhase("done");
        onCompleteRef.current();
      }, letterDelay + TIMING.letterMs + TIMING.holdMs),
    );
  }

  function handleSkip() {
    clearTimers();
    completedRef.current = true;
    setPhase("done");
    onSkip();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope();
    }
    if (event.key === "Escape") handleSkip();
  }

  const lidOpen = phase !== "idle";
  const letterUp = phase === "risen" || phase === "done";
  const finished = phase === "done" || opened;

  return (
    <section className="relative flex min-h-[100svh] min-h-[100dvh] w-full flex-col items-center justify-center bg-[#3d1418] px-4 py-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5">
      {/* Names stay above the open lid */}
      <motion.div
        className="relative z-40 mb-3 max-w-[22rem] shrink-0 text-center sm:mb-5 sm:max-w-none"
        initial={false}
        animate={
          lidOpen
            ? { opacity: 0, scale: 0.7, y: -18, height: "auto" }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={luxuryTransition(0.45)}
        style={{ pointerEvents: lidOpen ? "none" : "auto" }}
      >
        <p
          className={`${displayFont.className} text-[9px] uppercase tracking-[0.28em] text-[#f3e8d5] sm:text-[11px] sm:tracking-[0.42em]`}
        >
          {invitation.inviteFrom}
        </p>
        <h1
          className={`${scriptFont.className} mt-2 text-[clamp(2.4rem,11vw,4.75rem)] leading-[1.08] text-[#fff8ef] sm:mt-3`}
        >
          Annie <span className="text-[0.9em]">&</span> Dũng
        </h1>
      </motion.div>

      <div className="relative z-20 w-full max-w-[400px] shrink-0">
        <motion.button
          type="button"
          aria-labelledby={labelId}
          aria-describedby={phase === "idle" ? `${labelId}-hint` : undefined}
          onClick={openEnvelope}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          disabled={phase !== "idle"}
          className="relative mx-auto block w-full max-w-[min(86vw,360px)] origin-center cursor-pointer touch-manipulation border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d4b98a]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#3d1418] disabled:cursor-default"
          whileTap={
            reduceMotion || phase !== "idle" ? undefined : { scale: 0.98 }
          }
          animate={
            reduceMotion
              ? { y: 0, scale: 1 }
              : phase === "idle"
                ? {
                    y: hovered ? [-3, -9, -3] : [-4, -10, -4],
                    scale: hovered ? 1.03 : 1.01,
                  }
                : {
                    // Pull envelope down slightly so open lid stays below the title area
                    y: 12,
                    scale: 0.94,
                  }
          }
          transition={
            phase === "idle"
              ? { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
              : luxuryTransition(0.45)
          }
        >
          <AnimatePresence>
            {phase === "idle" && !reduceMotion ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-40 overflow-hidden rounded-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="absolute -inset-y-10 w-[35%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-[#f5e6c4]/35 to-transparent"
                  animate={{ left: ["-45%", "125%"] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                />
              </motion.span>
            ) : null}
          </AnimatePresence>

          <motion.div
            className="relative mx-auto w-full overflow-visible"
            initial={false}
            animate={{ paddingTop: lidOpen ? (letterUp ? 100 : 64) : 0 }}
            transition={luxuryTransition(TIMING.flapMs / 1000)}
          >
            {/* 3D stage — overflow visible so the open lid is not clipped */}
            <div
              className="relative mx-auto aspect-[800/579] w-full overflow-visible"
              style={{ perspective: "1600px", perspectiveOrigin: "50% 0%" }}
            >
              <div
                className="absolute inset-0 overflow-visible"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Envelope body */}
                <div className="absolute inset-0" style={{ zIndex: 1 }}>
                  <Image
                    src="/assets/envelope-closed.png"
                    alt=""
                    fill
                    priority
                    draggable={false}
                    sizes="360px"
                    className="object-contain object-center drop-shadow-[0_22px_55px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {/* Hide the flap painted on the PNG once lid lifts */}
                <motion.div
                  aria-hidden
                  className="absolute inset-[2%]"
                  style={{
                    zIndex: 2,
                    clipPath: "polygon(-2% -2%, 102% -2%, 50% 86%)",
                    background:
                      "linear-gradient(180deg, #f7f0e4 0%, #efe3d2 50%, #e9d8c4 100%)",
                  }}
                  initial={false}
                  animate={{ opacity: lidOpen ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />

                {/* Letter — stays in the pocket so it does not cut the open lid */}
                <motion.div
                  className="absolute left-1/2 w-[42%]"
                  style={{
                    top: "28%",
                    zIndex: letterUp ? 16 : 3,
                    transformOrigin: "center bottom",
                    transformStyle: "preserve-3d",
                  }}
                  initial={false}
                  animate={
                    letterUp
                      ? {
                          x: "-50%",
                          y: -72,
                          opacity: 1,
                          scale: 1.02,
                          rotateX: 0,
                          scaleY: 1,
                        }
                      : {
                          x: "-50%",
                          y: 48,
                          opacity: 0,
                          scale: 0.92,
                          rotateX: 62,
                          scaleY: 0.55,
                        }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0.01 }
                      : {
                          ...luxuryTransition(TIMING.letterMs / 1000),
                          rotateX: {
                            duration: TIMING.letterMs / 1000,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          scaleY: {
                            duration: TIMING.letterMs / 1000,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        }
                  }
                >
                  <div className="relative aspect-[3/4] w-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)]">
                    <Image
                      src="/assets/lace-frame.png"
                      alt=""
                      fill
                      draggable={false}
                      sizes="180px"
                      className="object-contain"
                    />
                    <div className="absolute inset-[17%] flex flex-col items-center justify-center px-1.5 text-center">
                      <p className="font-serif text-[6px] tracking-[0.28em] text-[#6b4a32] sm:text-[7px]">
                        {invitation.saveTheDate}
                      </p>
                      <p className="mt-0.5 font-serif text-[8px] tracking-[0.14em] text-[#3d1418] sm:text-[9px]">
                        {invitation.title}
                      </p>
                      <p
                        className={`${scriptFont.className} mt-1 text-sm leading-tight text-[#3d1418] sm:text-base`}
                      >
                        {invitation.bride}
                      </p>
                      <p className="my-0.5 font-serif text-[9px] text-[#3d1418]">
                        &
                      </p>
                      <p
                        className={`${scriptFont.className} text-sm leading-tight text-[#3d1418] sm:text-base`}
                      >
                        {invitation.groom}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Pocket lip — under letter, under lid */}
                <motion.div
                  aria-hidden
                  className="absolute inset-x-[10%] bottom-[10%] h-[38%]"
                  style={{
                    zIndex: 12,
                    clipPath:
                      "polygon(0 48%, 50% 100%, 100% 48%, 100% 100%, 0 100%)",
                    background:
                      "linear-gradient(180deg, transparent, rgba(232,214,194,0.9))",
                  }}
                  initial={false}
                  animate={{ opacity: lidOpen ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                />

                {/*
                  Full lid triangle — z above letter so the flap is never
                  sliced by the oval card. Same closed lace on both faces.
                */}
                <motion.div
                  className="absolute inset-x-[0.5%] top-[0.5%] overflow-visible"
                  style={{
                    zIndex: 10,
                    height: "78%",
                    transformStyle: "preserve-3d",
                    transformOrigin: "50% 0%",
                  }}
                  initial={false}
                  animate={{
                    rotateX: lidOpen ? -162 : 0,
                    transformPerspective: 1600,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0.01 }
                      : {
                          duration: TIMING.flapMs / 1000,
                          ease: [0.33, 1, 0.32, 1],
                        }
                  }
                >
                  {/* Front — closed lace flap */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      filter: "drop-shadow(0 16px 22px rgba(0,0,0,0.45))",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/envelope-closed.png"
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
                    />
                  </div>

                  {/* Back — cream underside + same lace (full triangle, no crop cut) */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      transform: "rotateX(180deg)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      background:
                        "linear-gradient(180deg, #f4ebe0 0%, #efe3d2 55%, #e8d6c2 100%)",
                      filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.35))",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/envelope-closed.png"
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-90"
                      style={{ transform: "scaleY(-1)" }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-5 -z-10 rounded-full bg-black/35 blur-2xl"
            animate={{
              opacity: hovered && phase === "idle" ? 0.55 : 0.28,
              scale: hovered && phase === "idle" ? 1.08 : 1,
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.button>
      </div>

      <div className="relative z-10 mt-5 flex min-h-[4.25rem] shrink-0 flex-col items-center gap-1.5 text-center sm:mt-7">
        <AnimatePresence mode="wait">
          {phase === "idle" ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1.5"
            >
              <p
                id={labelId}
                className="font-serif text-sm tracking-[0.24em] text-[#f3e8d5]"
              >
                {invitation.openLabel}
              </p>
              <p
                id={`${labelId}-hint`}
                className="text-[11px] tracking-[0.2em] text-[#d4b98a]/85"
              >
                {invitation.openLabelEn}
              </p>
            </motion.div>
          ) : finished ? (
            <motion.div
              key="scroll"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="font-serif text-[11px] tracking-[0.28em] text-[#d4b98a]/90">
                Cuộn xuống để xem chi tiết
              </p>
              <motion.span
                aria-hidden
                className="text-[#d4b98a]"
                animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ↓
              </motion.span>
            </motion.div>
          ) : (
            <motion.p
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-serif text-xs tracking-[0.28em] text-[#d4b98a]/8"
            >
              Đang mở thiệp…
            </motion.p>
          )}
        </AnimatePresence>

        {!finished ? (
          <button
            type="button"
            onClick={handleSkip}
            className="mt-2 text-xs tracking-[0.16em] text-[#f3e8d5]/70 underline-offset-4 transition hover:text-[#f3e8d5] hover:underline"
          >
            {invitation.skipLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
