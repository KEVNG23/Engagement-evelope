import type { Transition, Variants } from "framer-motion";
import { EASE_LUXURY, TIMING } from "./invitation-data";

export const luxuryTransition = (
  duration = 0.9,
  delay = 0,
): Transition => ({
  duration,
  delay,
  ease: EASE_LUXURY,
});

export const fadeUpOnce: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: luxuryTransition(0.9),
  },
};

export const fadeScaleOnce: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: luxuryTransition(TIMING.revealMs / 1000),
  },
};

export const softParallax: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: luxuryTransition(1.1),
  },
};

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: luxuryTransition(1.2),
  },
};
