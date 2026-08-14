"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EnvelopeOpening } from "./EnvelopeOpening";
import { FloatingParticles } from "./FloatingParticles";
import { BackgroundSparkles } from "./BackgroundSparkles";
import { InvitationDetails } from "./InvitationDetails";

/**
 * Scroll lives on this container (not document), which is reliable on mobile /
 * Railway. Body/html scroll-lock was blocking touch scroll after open.
 *
 * Music is intentionally disabled for now — re-enable MusicToggle later.
 */
export function InvitationExperience() {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = useState(false);
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

  return (
    <main
      ref={scrollerRef}
      className={
        opened
          ? "invite-scroller relative h-[100dvh] w-full overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#3d1418] text-[#f3e8d5] touch-pan-y"
          : "invite-scroller relative h-[100dvh] w-full overflow-hidden bg-[#3d1418] text-[#f3e8d5] touch-none"
      }
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <BackgroundSparkles density={36} active />
      <FloatingParticles density={24} active />

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
  );
}
