"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { invitation, TIMING } from "@/lib/invitation-data";
import { displayFont, scriptFont, serifFont } from "@/lib/fonts";
import { useLocale } from "@/lib/i18n";
import { luxuryTransition } from "@/lib/motion";

export type EnvelopePhase = "idle" | "opening" | "risen" | "done";

type EnvelopeOpeningProps = {
  opened?: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onOpenStart?: () => void;
};

/**
 * Matches the Canva open reference (ref-open-envelope):
 * 1) Closed lace envelope
 * 2) Flap folds back on the top hinge (scaleY + rotateX), revealing open art
 * 3) Letter rises from the pocket
 *
 * Fake “second triangle” overlays were removed after live-site verification.
 */
export function EnvelopeOpening({
  opened = false,
  onComplete,
  onSkip,
  onOpenStart,
}: EnvelopeOpeningProps) {
  const reduceMotion = useReducedMotion();
  const { t, locale } = useLocale();
  const [phase, setPhase] = useState<EnvelopePhase>("idle");
  const [closedReady, setClosedReady] = useState(false);
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

  // Handle cached closed envelope (onLoad may not re-fire)
  useEffect(() => {
    const img = new window.Image();
    img.src = "/assets/envelope-closed.webp";
    if (img.complete) {
      setClosedReady(true);
      return;
    }
    const markReady = () => setClosedReady(true);
    img.addEventListener("load", markReady);
    return () => img.removeEventListener("load", markReady);
  }, []);

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

  const isOpen = phase !== "idle";
  const letterUp = phase === "risen" || phase === "done";
  const finished = phase === "done" || opened;

  return (
    <section className="relative flex min-h-[100svh] min-h-[100dvh] w-full flex-col items-center justify-center bg-transparent px-4 py-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5">
      <motion.div
        className="relative z-40 mb-3 max-w-[22rem] shrink-0 text-center sm:mb-5"
        initial={false}
        animate={
          isOpen
            ? { opacity: 0, y: -10, scale: 0.8 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={luxuryTransition(0.4)}
      >
        <p
          className={`${
            locale === "vi" ? serifFont.className : displayFont.className
          } text-[9px] uppercase tracking-[0.28em] text-[#f3e8d5] sm:text-[11px] sm:tracking-[0.42em]`}
        >
          {t("inviteFrom")}
        </p>
        <h1
          className={`${scriptFont.className} mt-2 text-[clamp(2.4rem,11vw,4.75rem)] leading-[1.08] text-[#fff8ef]`}
        >
          Annie <span className="text-[0.9em]">&</span> Dũng
        </h1>
      </motion.div>

      <motion.div
        className={`relative z-20 w-full max-w-[min(84vw,340px)] shrink-0 ${
          !reduceMotion && !isOpen ? "invite-float" : ""
        }`}
        animate={isOpen ? { y: 12 } : { y: 0 }}
        transition={luxuryTransition(0.45)}
      >
        <button
          type="button"
          aria-label={t("openLabel")}
          onClick={openEnvelope}
          onKeyDown={onKeyDown}
          disabled={phase !== "idle" || !closedReady}
          className="relative block w-full cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d4b98a]/70 disabled:cursor-default"
        >
          <motion.div
            className="relative mx-auto w-full"
            initial={false}
            animate={{ paddingTop: isOpen ? 64 : 0 }}
            transition={luxuryTransition(TIMING.flapMs / 1000)}
          >
            <div className="relative mx-auto aspect-[800/579] w-full">
              {/* CLOSED — wait for full art so the triangular lid never flashes alone */}
              <motion.div
                className="absolute inset-0 z-20"
                initial={false}
                animate={{
                  opacity: !closedReady ? 0 : isOpen ? 0 : 1,
                }}
                transition={{
                  duration: !closedReady ? 0 : TIMING.flapMs / 1000,
                  ease: [0.33, 1, 0.32, 1],
                }}
              >
                <Image
                  src="/assets/envelope-closed.webp"
                  alt=""
                  fill
                  priority
                  unoptimized
                  draggable={false}
                  sizes="340px"
                  onLoad={() => setClosedReady(true)}
                  className="envelope-shadow object-contain object-center"
                />
                {/* DT monogram centered on the closed lid */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[22%] z-[21] w-[34%] -translate-x-1/2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/monogram-dt.webp"
                    alt=""
                    draggable={false}
                    className="h-auto w-full select-none opacity-90"
                  />
                </div>
              </motion.div>

              {/* Flap only while opening — idle already shows the complete closed envelope */}
              {phase !== "idle" ? (
                <motion.div
                  className="absolute inset-x-[1%] top-[1%] z-30 origin-top [transform-style:preserve-3d]"
                  style={{ height: "74%", perspective: 800 }}
                  initial={{ rotateX: 0, scaleY: 1, opacity: 1 }}
                  animate={{ rotateX: -78, scaleY: 0.15, opacity: 0 }}
                  transition={{
                    duration: TIMING.flapMs / 1000,
                    ease: [0.33, 1, 0.32, 1],
                  }}
                >
                  <div
                    className="relative h-full w-full overflow-hidden"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/envelope-closed.webp"
                      alt=""
                      draggable={false}
                      decoding="sync"
                      fetchPriority="high"
                      className="pointer-events-none h-full w-full object-cover object-top"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-[28%] w-[46%] -translate-x-1/2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/monogram-dt.webp"
                        alt=""
                        draggable={false}
                        className="h-auto w-full select-none opacity-90"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* OPEN — defer so it does not race the closed image on first paint */}
              <motion.div
                className="envelope-open-shadow pointer-events-none absolute bottom-0 left-1/2 z-10 w-[82%] -translate-x-1/2"
                style={{ aspectRatio: "635 / 799" }}
                initial={false}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: TIMING.flapMs / 1000, ease: [0.33, 1, 0.32, 1] }}
              >
                <Image
                  src="/assets/envelope-open.webp"
                  alt=""
                  fill
                  unoptimized
                  sizes="320px"
                  className="object-contain object-bottom"
                />
              </motion.div>

              {/* LETTER — rises from the open pocket */}
              <motion.div
                className="absolute left-1/2 w-[56%]"
                style={{ bottom: "30%", transformOrigin: "center bottom" }}
                initial={false}
                animate={
                  letterUp
                    ? { x: "-50%", y: -60, opacity: 1, scale: 1.04, zIndex: 30 }
                    : isOpen
                      ? { x: "-50%", y: 20, opacity: 1, scale: 0.95, zIndex: 15 }
                      : { x: "-50%", y: 36, opacity: 0, scale: 0.9, zIndex: 15 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : {
                        ...luxuryTransition(TIMING.letterMs / 1000),
                        zIndex: { delay: letterUp ? 0.25 : 0, duration: 0 },
                      }
                }
              >
                {/*
                  No CSS filter/drop-shadow here — filters rasterize to a rectangle
                  during Framer scale/y transforms and show as a card “box”.
                */}
                <div
                  className="relative aspect-[580/800] w-full overflow-hidden"
                  style={{
                    WebkitMaskImage: "url(/assets/lace-frame.webp)",
                    maskImage: "url(/assets/lace-frame.webp)",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    // Hard oval clip — survives Framer scale/y (filters do not)
                    borderRadius: "50%",
                    boxShadow: "0 16px 26px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-[16%] rounded-[50%] bg-[#faf1da]"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/lace-frame.webp"
                    alt=""
                    draggable={false}
                    decoding="async"
                    className="pointer-events-none absolute inset-0 h-full w-full object-fill"
                  />
                  <div className="absolute inset-[18%] flex flex-col items-center justify-center px-1.5 text-center">
                    <p className="font-serif text-[7px] tracking-[0.28em] text-[#6b4a32] sm:text-[8px]">
                      {t("saveTheDate")}
                    </p>
                    <p className="mt-0.5 font-serif text-[9px] tracking-[0.14em] text-[#3d1418] sm:text-[10px]">
                      {t("title")}
                    </p>
                    <p
                      className={`${scriptFont.className} mt-1 text-base leading-tight text-[#3d1418] sm:text-lg`}
                    >
                      {invitation.brideLetter}
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

              {/* Front pocket so the letter comes out from inside */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-1/2 z-20 w-[82%] -translate-x-1/2"
                style={{
                  aspectRatio: "635 / 799",
                  clipPath:
                    "polygon(0% 58%, 50% 78%, 100% 58%, 100% 100%, 0% 100%)",
                }}
                initial={false}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: TIMING.flapMs / 1000 }}
              >
                <Image
                  src="/assets/envelope-open.webp"
                  alt=""
                  fill
                  unoptimized
                  sizes="320px"
                  className="object-contain object-bottom"
                />
              </motion.div>
            </div>
          </motion.div>
        </button>
      </motion.div>

      {finished ? (
        <div className="relative z-10 mt-6 flex shrink-0 flex-col items-center gap-2 text-center">
          <p className="font-serif text-[11px] tracking-[0.28em] text-[#d4b98a]/90">
            {t("scrollDetails")}
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
        </div>
      ) : (
        <div className="mt-6 min-h-[1rem]" aria-hidden />
      )}
    </section>
  );
}
