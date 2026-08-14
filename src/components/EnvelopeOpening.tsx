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
};

/**
 * Closed lace envelope → lid lifts (3D) → open envelope + letter rises from inside.
 * Keeps burgundy theme and original Canva assets.
 */
export function EnvelopeOpening({
  opened = false,
  onComplete,
  onSkip,
}: EnvelopeOpeningProps) {
  const reduceMotion = useReducedMotion();
  const labelId = useId();
  const [phase, setPhase] = useState<EnvelopePhase>("idle");
  const [hovered, setHovered] = useState(false);
  const phaseRef = useRef<EnvelopePhase>("idle");
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
      onCompleteRef.current();
      return;
    }

    clearTimers();
    setPhase("opening");

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

  const isOpen = phase !== "idle";
  const letterUp = phase === "risen" || phase === "done";
  const finished = phase === "done" || opened;
  /** Keep open look after skip / reduced-motion jump-to-done */
  const showOpenArt = isOpen || finished;

  return (
    <section className="relative flex min-h-[100svh] min-h-[100dvh] w-full flex-col items-center justify-center bg-[#3d1418] px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-5 sm:py-10">
      <motion.div
        className="relative z-10 mb-4 max-w-[22rem] text-center sm:mb-6 sm:max-w-none"
        initial={false}
        animate={
          letterUp
            ? { opacity: 0.35, scale: 0.72, y: -8 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={luxuryTransition(0.5)}
      >
        <p
          className={`${displayFont.className} text-[9px] uppercase tracking-[0.28em] text-[#f3e8d5] sm:text-[11px] sm:tracking-[0.42em]`}
        >
          {invitation.inviteFrom}
        </p>
        <h1
          className={`${scriptFont.className} mt-3 text-[clamp(2.75rem,14vw,5.5rem)] leading-[1.08] text-[#fff8ef]`}
        >
          Annie <span className="text-[0.9em]">&</span> Dũng
        </h1>
      </motion.div>

      <div
        className="relative z-20 w-full max-w-[440px]"
        style={{ perspective: "1600px" }}
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
          className="relative mx-auto block w-full max-w-[min(92vw,440px)] origin-center cursor-pointer touch-manipulation border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d4b98a]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#3d1418] disabled:cursor-default"
          style={{ transformStyle: "preserve-3d" }}
          whileTap={
            reduceMotion || phase !== "idle" ? undefined : { scale: 0.98 }
          }
          animate={
            reduceMotion
              ? undefined
              : phase === "idle"
                ? {
                    y: hovered ? [-3, -9, -3] : [-4, -10, -4],
                    scale: hovered ? 1.03 : 1.01,
                    rotateX: hovered ? 4 : 1,
                  }
                : { y: 0, scale: 1, rotateX: 2 }
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

          {/* Stage tall enough for open flap + rising letter */}
          <div className="relative mx-auto aspect-[635/920] w-full max-w-[min(92vw,400px)]">
            {/* Closed envelope */}
            <motion.div
              className="absolute inset-x-0 bottom-[14%] z-20 mx-auto aspect-[800/579] w-full"
              style={{ transformStyle: "preserve-3d" }}
              initial={false}
              animate={{ opacity: showOpenArt ? 0 : 1 }}
              transition={luxuryTransition(TIMING.flapMs / 1000)}
            >
              <Image
                src="/assets/envelope-closed.png"
                alt=""
                fill
                priority
                draggable={false}
                sizes="400px"
                className="object-contain object-bottom drop-shadow-[0_22px_55px_rgba(0,0,0,0.5)]"
              />

              {/* 3D lid lifts up */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-[1%] top-[1%] z-10 origin-top"
                style={{
                  height: "78%",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
                initial={false}
                animate={{
                  rotateX: showOpenArt ? -168 : 0,
                  opacity: showOpenArt ? 0 : 1,
                }}
                transition={luxuryTransition(TIMING.flapMs / 1000)}
              >
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.35))",
                  }}
                >
                  <Image
                    src="/assets/envelope-closed.png"
                    alt=""
                    fill
                    draggable={false}
                    sizes="400px"
                    className="object-cover object-top"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Open envelope back (full) */}
            <motion.div
              className="pointer-events-none absolute bottom-0 left-1/2 z-[11] w-[86%] -translate-x-1/2"
              style={{ aspectRatio: "635 / 799" }}
              initial={false}
              animate={{
                opacity: showOpenArt ? 1 : 0,
                filter: showOpenArt
                  ? "drop-shadow(0 28px 50px rgba(0,0,0,0.48))"
                  : "drop-shadow(0 22px 55px rgba(0,0,0,0.35))",
              }}
              transition={luxuryTransition(TIMING.flapMs / 1000)}
            >
              <Image
                src="/assets/envelope-open.png"
                alt=""
                fill
                draggable={false}
                sizes="400px"
                className="object-contain object-bottom"
                priority
              />
            </motion.div>

            {/* LETTER — sits in pocket, then slides up and out */}
            <motion.div
              className="absolute left-1/2 w-[48%] will-change-transform"
              style={{
                bottom: "30%",
                transformOrigin: "center bottom",
              }}
              initial={false}
              animate={
                letterUp
                  ? { x: "-50%", y: -190, opacity: 1, scale: 1.05, zIndex: 28 }
                  : showOpenArt
                    ? { x: "-50%", y: 20, opacity: 1, scale: 0.94, zIndex: 18 }
                    : { x: "-50%", y: 40, opacity: 0, scale: 0.9, zIndex: 18 }
              }
              transition={
                reduceMotion
                  ? { duration: 0.01 }
                  : {
                      ...luxuryTransition(TIMING.letterMs / 1000),
                      zIndex: { delay: letterUp ? 0.35 : 0, duration: 0 },
                    }
              }
            >
              <div className="relative aspect-[3/4] w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.42)]">
                <Image
                  src="/assets/lace-frame.png"
                  alt=""
                  fill
                  draggable={false}
                  sizes="220px"
                  className="object-contain"
                />
                <div className="absolute inset-[17%] flex flex-col items-center justify-center px-2 text-center">
                  <p className="font-serif text-[7px] tracking-[0.28em] text-[#6b4a32] sm:text-[8px]">
                    {invitation.saveTheDate}
                  </p>
                  <p className="mt-1 font-serif text-[9px] tracking-[0.16em] text-[#3d1418] sm:text-[10px]">
                    {invitation.title}
                  </p>
                  <p
                    className={`${scriptFont.className} mt-2 text-base leading-tight text-[#3d1418] sm:text-lg`}
                  >
                    {invitation.bride}
                  </p>
                  <p className="my-0.5 font-serif text-[10px] text-[#3d1418]">
                    &
                  </p>
                  <p
                    className={`${scriptFont.className} text-base leading-tight text-[#3d1418] sm:text-lg`}
                  >
                    {invitation.groom}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Front pocket flaps — letter slides out from under these */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 z-[22] w-[86%] -translate-x-1/2"
              style={{
                aspectRatio: "635 / 799",
                clipPath:
                  "polygon(0% 52%, 50% 72%, 100% 52%, 100% 100%, 0% 100%)",
              }}
              initial={false}
              animate={{ opacity: showOpenArt ? 1 : 0 }}
              transition={luxuryTransition(TIMING.flapMs / 1000)}
            >
              <Image
                src="/assets/envelope-open.png"
                alt=""
                fill
                draggable={false}
                sizes="400px"
                className="object-contain object-bottom"
              />
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

      <div className="relative z-10 mt-8 flex min-h-[4.5rem] flex-col items-center gap-2 text-center sm:mt-10">
        <AnimatePresence mode="wait">
          {phase === "idle" ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
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
            className="mt-3 text-xs tracking-[0.16em] text-[#f3e8d5]/70 underline-offset-4 transition hover:text-[#f3e8d5] hover:underline"
          >
            {invitation.skipLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
