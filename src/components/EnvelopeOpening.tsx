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
 * Isolated 3D stage: parent float transforms must NOT wrap the lid,
 * or rotateX gets flattened and the flap never lifts.
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

      {/* Float wrapper — OUTSIDE the 3D stage so it cannot flatten rotateX */}
      <motion.div
        className="relative z-20 w-full max-w-[min(84vw,340px)] shrink-0"
        animate={
          reduceMotion || lidOpen
            ? { y: lidOpen ? 20 : 0 }
            : {
                y: hovered ? [-3, -9, -3] : [-4, -10, -4],
              }
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
          {/* 3D STAGE — perspective here, no animated transform on this node */}
          <div
            className="relative aspect-[800/579] w-full"
            style={{
              perspective: "1400px",
              perspectiveOrigin: "50% 0%",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Closed envelope body */}
              <div className="absolute inset-0" style={{ zIndex: 1 }}>
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

              {/* Cover painted-on flap when lid opens */}
              <div
                aria-hidden
                className="absolute inset-[3%]"
                style={{
                  zIndex: 2,
                  clipPath: "polygon(0 0, 100% 0, 50% 80%)",
                  background:
                    "linear-gradient(180deg, #f0e5d6 0%, #e8d7c3 100%)",
                  opacity: lidOpen ? 1 : 0,
                  transition: "opacity 220ms ease-out",
                }}
              />

              {/* Letter */}
              <motion.div
                className="absolute left-1/2 w-[44%]"
                style={{
                  top: "22%",
                  zIndex: letterUp ? 25 : 3,
                  transformOrigin: "center bottom",
                }}
                initial={false}
                animate={
                  letterUp
                    ? { x: "-50%", y: -120, opacity: 1, scale: 1.04 }
                    : { x: "-50%", y: 56, opacity: 0, scale: 0.9 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : luxuryTransition(TIMING.letterMs / 1000)
                }
              >
                <div className="relative aspect-[3/4] w-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)]">
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

              {/*
                LID — CSS transform (not flattened by a parent Framer transform).
                Hinged at top; lifts back so you see into the envelope.
              */}
              <div
                className="absolute inset-x-[1%] top-[1%]"
                style={{
                  zIndex: 8,
                  height: "76%",
                  transformOrigin: "50% 0%",
                  transformStyle: "preserve-3d",
                  transform: lidOpen
                    ? "perspective(1400px) rotateX(-155deg)"
                    : "perspective(1400px) rotateX(0deg)",
                  transition: reduceMotion
                    ? "none"
                    : `transform ${TIMING.flapMs}ms cubic-bezier(0.33, 1, 0.32, 1)`,
                  willChange: "transform",
                }}
              >
                {/* Front — lace flap */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    filter: "drop-shadow(0 16px 22px rgba(0,0,0,0.4))",
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

                {/* Back — open lace underside (visible when flipped up) */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    transform: "rotateX(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    overflow: "hidden",
                    background: "#efe4d4",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/envelope-open.png"
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute left-1/2 top-0 h-full w-[120%] max-w-none -translate-x-1/2 object-cover object-top"
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
