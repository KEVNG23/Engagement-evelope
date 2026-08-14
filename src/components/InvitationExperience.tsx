"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EnvelopeOpening } from "./EnvelopeOpening";
import { FloatingParticles } from "./FloatingParticles";
import { InvitationDetails } from "./InvitationDetails";
import { MusicToggle } from "./MusicToggle";

/**
 * One continuous page — envelope stays mounted; details sit below from the start
 * so unlocking scroll never remounts / “refreshes” the layout.
 */
export function InvitationExperience() {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = useState(false);

  const unlockScroll = useCallback(() => {
    setOpened(true);
  }, []);

  // Lock scroll until open. Keep scrollbar hidden so unlocking does not shift layout.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scrollLock = opened ? "false" : "true";
    return () => {
      delete root.dataset.scrollLock;
    };
  }, [opened]);

  return (
    <main className="relative min-h-[100svh] min-h-[100dvh] overflow-x-hidden bg-[#3d1418] text-[#f3e8d5]">
      <FloatingParticles density={16} />

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

        {/* Always in the tree (below the fold) — fade in gently when unlocked */}
        <motion.div
          aria-hidden={!opened}
          initial={false}
          animate={{
            opacity: opened ? 1 : 0.001,
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
          className={opened ? "pointer-events-auto" : "pointer-events-none"}
        >
          <InvitationDetails />
        </motion.div>
      </div>

      <MusicToggle />
    </main>
  );
}
