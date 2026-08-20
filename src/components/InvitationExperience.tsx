"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LocaleProvider } from "@/lib/i18n";
import { EnvelopeOpening } from "./EnvelopeOpening";
import { FloatingPetals } from "./FloatingPetals";
import { InvitationDetails } from "./InvitationDetails";
import { LanguageToggle } from "./LanguageToggle";

/**
 * Scroll lives on this container (not document), which is reliable on mobile /
 * Railway. Body/html scroll-lock was blocking touch scroll after open.
 *
 * Music is intentionally disabled for now — re-enable MusicToggle later.
 */
export function InvitationExperience() {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = useState(false);
  const [fxReady, setFxReady] = useState(false);
  const scrollerRef = useRef<HTMLElement>(null);

  const unlockScroll = useCallback(() => {
    setOpened(true);
  }, []);

  // Clear any leftover document lock from older deploys / cached HTML
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("data-scroll-lock");
    root.style.overflow = "";
    root.style.height = "";
    root.style.touchAction = "";
    document.body.style.overflow = "";
    document.body.style.height = "";
    document.body.style.touchAction = "";
  }, []);

  // Let the envelope + fonts paint first; then enable ambient FX
  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setFxReady(true);
    };

    const idle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback(enable, { timeout: 900 })
        : null;
    const timeout =
      idle === null ? window.setTimeout(enable, 450) : null;

    return () => {
      cancelled = true;
      if (idle !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idle);
      }
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [reduceMotion]);

  return (
    <LocaleProvider>
      <main
        ref={scrollerRef}
        className={
          opened
            ? "invite-scroller relative h-[100dvh] w-full overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#3d1418] text-[#f3e8d5] touch-pan-y"
            : "invite-scroller relative h-[100dvh] w-full overflow-hidden bg-[#3d1418] text-[#f3e8d5] touch-none"
        }
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <LanguageToggle />
        {fxReady ? <FloatingPetals count={6} active /> : null}

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[#3d1418]"
        />

        <div className="relative z-10">
          <EnvelopeOpening
            opened={opened}
            onComplete={unlockScroll}
            onSkip={unlockScroll}
          />

          <motion.div
            aria-hidden={!opened}
            initial={false}
            animate={{ opacity: opened ? 1 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
            }
            className={
              opened
                ? "pointer-events-auto"
                : "pointer-events-none h-0 overflow-hidden"
            }
          >
            {opened ? <InvitationDetails /> : null}
          </motion.div>
        </div>
      </main>
    </LocaleProvider>
  );
}
