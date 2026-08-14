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
 * Same closed envelope the whole time:
 * 1) Lid flips open
 * 2) Letter slides up from inside
 * No swap to a different open-envelope image.
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

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!opened) return;
    completedRef.current = true;
    if (phaseRef.current === "idle") setPhase("done");
  }, [opened]);

  function openEnvelope() {
    if (phaseRef.current !== "idle" || completedRef.current) return;

    if (reduceMotion) {
      completedRef.current = true;
      setPhase("done");
      onCompleteRef.current();
      return;
    }

    setPhase("opening");

    const letterDelay = TIMING.flapMs + TIMING.delayMs;

    window.setTimeout(() => {
      if (phaseRef.current === "opening") setPhase("risen");
    }, letterDelay);

    window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setPhase("done");
      onCompleteRef.current();
    }, letterDelay + TIMING.letterMs + TIMING.holdMs);
  }

  function handleSkip() {
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
        style={{ perspective: "1500px" }}
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

          <motion.div
            className="relative w-full"
            initial={false}
            animate={{ paddingTop: letterUp ? 132 : 0 }}
            transition={luxuryTransition(TIMING.letterMs / 1000)}
          >
            <div
              className="relative aspect-[800/579] w-full overflow-visible"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Same closed envelope — always */}
              <div className="absolute inset-0 z-[1]">
                <Image
                  src="/assets/envelope-closed.png"
                  alt=""
                  fill
                  priority
                  draggable={false}
                  sizes="440px"
                  className="object-contain object-center drop-shadow-[0_22px_55px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Soft paper fill under the flipping lid (hides the flap drawn on the PNG) */}
              <motion.div
                aria-hidden
                className="absolute inset-[4%] z-[2] rounded-sm"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 78%)",
                  backgroundImage: "url(/assets/envelope-closed.png)",
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center top",
                  filter: "brightness(1.04)",
                }}
                initial={false}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{
                  duration: Math.max(0.15, TIMING.flapMs / 1000 * 0.25),
                  ease: "easeOut",
                }}
              />

              {/* Letter — hidden until lid is open, then slides up from inside */}
              <motion.div
                className="absolute left-1/2 z-[3] w-[45%] -translate-x-1/2"
                style={{
                  top: "22%",
                  transformStyle: "preserve-3d",
                }}
                initial={false}
                animate={
                  letterUp
                    ? { y: -150, opacity: 1, scale: 1.05 }
                    : { y: 70, opacity: 0, scale: 0.9 }
                }
                transition={luxuryTransition(TIMING.letterMs / 1000)}
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

              {/* Lid — flips open on the top edge */}
              <motion.div
                className="absolute inset-x-[1%] top-[1%] z-[5] origin-top will-change-transform"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
                initial={false}
                animate={{ rotateX: isOpen ? -175 : 0 }}
                transition={luxuryTransition(TIMING.flapMs / 1000)}
              >
                <div
                  className="relative mx-auto aspect-[2/1] w-full overflow-hidden"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.28))",
                  }}
                >
                  <Image
                    src="/assets/envelope-closed.png"
                    alt=""
                    fill
                    draggable={false}
                    sizes="440px"
                    className="object-cover object-top"
                  />
                </div>
              </motion.div>
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
