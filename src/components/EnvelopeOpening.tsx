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
  onOpenStart?: () => void;
};

const PAPER = "#efe4d4";
const PAPER_DEEP = "#e7d6c2";

/**
 * Same closed envelope the whole time.
 * Lid stays hinged at the TOP edge and lifts backward (rotateX) —
 * it must NOT float away as a separate upside-down triangle.
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
    onOpenStartRef.current?.();
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
    <section className="relative flex min-h-[100svh] min-h-[100dvh] w-full flex-col items-center justify-center overflow-visible bg-[#3d1418] px-4 py-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5">
      <motion.div
        className="relative z-40 mb-2 max-w-[22rem] shrink-0 text-center sm:mb-4 sm:max-w-none"
        initial={false}
        animate={
          lidOpen
            ? { opacity: 0, y: -8, scale: 0.82 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={luxuryTransition(0.4)}
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

      <div
        className="relative z-20 w-full max-w-[400px] shrink-0 overflow-visible"
        style={{ perspective: "1600px", perspectiveOrigin: "50% 35%" }}
      >
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
          className="relative mx-auto block w-full max-w-[min(84vw,340px)] cursor-pointer touch-manipulation border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d4b98a]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#3d1418] disabled:cursor-default"
          style={{ transformStyle: "flat" }}
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
                    /* Shift whole envelope down for open lid — do NOT pad inside
                       or the hinge separates from the body */
                    y: 28,
                    scale: 0.94,
                  }
          }
          transition={
            phase === "idle"
              ? { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
              : luxuryTransition(0.5)
          }
        >
          <AnimatePresence>
            {phase === "idle" && !reduceMotion ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
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

          {/* Envelope stage — no paddingTop (that caused the floating gap) */}
          <div
            className="relative mx-auto aspect-[800/579] w-full overflow-visible"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Base: always closed envelope */}
            <div className="absolute inset-0 z-[1]">
              <Image
                src="/assets/envelope-closed.png"
                alt=""
                fill
                priority
                draggable={false}
                sizes="340px"
                className="object-contain object-center drop-shadow-[0_22px_55px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Interior revealed under the lifting lid */}
            <motion.div
              aria-hidden
              className="absolute inset-[3.5%]"
              style={{
                zIndex: 2,
                clipPath: "polygon(1% 1%, 99% 1%, 50% 78%)",
                background: `linear-gradient(180deg, ${PAPER} 0%, ${PAPER_DEEP} 100%)`,
                boxShadow: "inset 0 10px 20px rgba(74,27,36,0.08)",
              }}
              initial={false}
              animate={{ opacity: lidOpen ? 1 : 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            />

            {/* Letter rises from the pocket after the lid lifts */}
            <motion.div
              className="absolute left-1/2 w-[44%]"
              style={{
                top: "24%",
                zIndex: letterUp ? 20 : 3,
                transformOrigin: "center bottom",
                transformStyle: "preserve-3d",
              }}
              initial={false}
              animate={
                letterUp
                  ? {
                      x: "-50%",
                      y: -108,
                      opacity: 1,
                      scale: 1.03,
                      rotateX: 0,
                    }
                  : {
                      x: "-50%",
                      y: 52,
                      opacity: 0,
                      scale: 0.92,
                      rotateX: 48,
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.01 }
                  : luxuryTransition(TIMING.letterMs / 1000)
              }
            >
              <div className="relative aspect-[3/4] w-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)]">
                <Image
                  src="/assets/lace-frame.png"
                  alt=""
                  fill
                  draggable={false}
                  sizes="170px"
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

            {/* Pocket lip */}
            <motion.div
              aria-hidden
              className="absolute inset-x-[12%] bottom-[11%] h-[34%]"
              style={{
                zIndex: 14,
                clipPath:
                  "polygon(0 42%, 50% 100%, 100% 42%, 100% 100%, 0 100%)",
                background: `linear-gradient(180deg, transparent, ${PAPER_DEEP})`,
              }}
              initial={false}
              animate={{ opacity: lidOpen ? 0.95 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/*
              LID — hinged on the TOP edge.
              Lifts backward ~75° so the lace flap stays visible (real lift),
              instead of flipping to a detached upside-down triangle.
            */}
            <motion.div
              className="absolute inset-x-[1%] top-[1%]"
              style={{
                zIndex: 10,
                height: "74%",
                transformOrigin: "50% 0%",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
              initial={false}
              animate={{
                rotateX: lidOpen ? -75 : 0,
                transformPerspective: 1600,
              }}
              transition={
                reduceMotion
                  ? { duration: 0.01 }
                  : {
                      duration: TIMING.flapMs / 1000,
                      ease: [0.4, 0.0, 0.2, 1],
                    }
              }
            >
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  filter: "drop-shadow(0 18px 26px rgba(0,0,0,0.42))",
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
            </motion.div>
          </div>

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
