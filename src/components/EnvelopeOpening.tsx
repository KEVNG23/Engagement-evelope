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

/**
 * Closed art while idle. Lid lifts from the same closed PNG, then the real
 * open envelope art fades in so body + lid lace match (no blank cream sheet).
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
  const finished = phase === "done" || opened;

  return (
    <section className="relative flex min-h-[100svh] min-h-[100dvh] w-full flex-col items-center justify-center bg-[#3d1418] px-4 py-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5">
      <motion.div
        className="relative z-40 mb-3 max-w-[22rem] shrink-0 text-center sm:mb-5"
        initial={false}
        animate={
          lidOpen
            ? { opacity: 0, y: -10, scale: 0.8 }
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
          className={`${scriptFont.className} mt-2 text-[clamp(2.4rem,11vw,4.75rem)] leading-[1.08] text-[#fff8ef]`}
        >
          Annie <span className="text-[0.9em]">&</span> Dũng
        </h1>
      </motion.div>

      {/* Float with marginTop — never transform — so lid perspective() stays true 3D */}
      <motion.div
        className="relative z-20 w-full max-w-[min(84vw,340px)] shrink-0"
        animate={
          reduceMotion || lidOpen
            ? { marginTop: lidOpen ? 20 : 0 }
            : { marginTop: hovered ? [-3, -9, -3] : [-4, -10, -4] }
        }
        transition={
          lidOpen
            ? luxuryTransition(0.45)
            : { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <button
          type="button"
          aria-labelledby={labelId}
          aria-describedby={phase === "idle" ? `${labelId}-hint` : undefined}
          onClick={openEnvelope}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={phase !== "idle"}
          className="relative block w-full cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d4b98a]/70 disabled:cursor-default"
        >
          <div
            className="relative w-full transition-[aspect-ratio] duration-500"
            style={{
              aspectRatio: lidOpen ? "529 / 697" : "800 / 579",
              perspective: "1100px",
              perspectiveOrigin: "50% 0%",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Idle closed envelope */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 1,
                  opacity: lidOpen ? 0 : 1,
                  transition: reduceMotion
                    ? "none"
                    : `opacity ${Math.round(TIMING.flapMs * 0.35)}ms ease`,
                }}
              >
                <Image
                  src="/assets/envelope-closed.png"
                  alt=""
                  fill
                  priority
                  draggable={false}
                  sizes="340px"
                  className="object-contain object-center drop-shadow-[0_22px_50px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/*
                Designed open envelope (cropped) — DT body + lace lid/sides
                that match, not a blank cream rectangle.
              */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 2,
                  opacity: lidOpen ? 1 : 0,
                  transition: reduceMotion
                    ? "none"
                    : `opacity ${TIMING.flapMs}ms cubic-bezier(0.22, 0.82, 0.2, 1)`,
                }}
              >
                <Image
                  src="/assets/envelope-opened-clean.png"
                  alt=""
                  fill
                  priority
                  draggable={false}
                  sizes="340px"
                  className="object-contain object-center drop-shadow-[0_22px_50px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/*
                Lift lid from closed art during the open motion, then fade it
                so the designed open lid (matching body lace) remains.
              */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 16,
                  transformOrigin: "50% 18%",
                  transformStyle: "preserve-3d",
                  transform: lidOpen ? "rotateX(-125deg)" : "rotateX(0deg)",
                  opacity: phase === "opening" ? 1 : 0,
                  transition: reduceMotion
                    ? "none"
                    : phase === "opening"
                      ? `transform ${TIMING.flapMs}ms cubic-bezier(0.22, 0.82, 0.2, 1), opacity 40ms linear`
                      : `transform ${TIMING.flapMs}ms cubic-bezier(0.22, 0.82, 0.2, 1), opacity 240ms ease`,
                  willChange: "transform",
                  pointerEvents: "none",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(8% 12%, 92% 12%, 50% 58%)",
                    filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.35))",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/envelope-closed.png"
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      <div className="relative z-10 mt-6 flex min-h-[4.25rem] shrink-0 flex-col items-center gap-1.5 text-center">
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
            className="mt-2 text-xs tracking-[0.16em] text-[#f3e8d5]/70 underline-offset-4 hover:underline"
          >
            {invitation.skipLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
