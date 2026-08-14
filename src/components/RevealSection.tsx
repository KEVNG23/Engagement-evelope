"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUpOnce, imageReveal, softParallax } from "@/lib/motion";

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "parallax" | "image";
  delay?: number;
};

export function RevealSection({
  children,
  className,
  variant = "fade",
  delay = 0,
}: RevealSectionProps) {
  const reduceMotion = useReducedMotion();
  const variants =
    variant === "image"
      ? imageReveal
      : variant === "parallax"
        ? softParallax
        : fadeUpOnce;

  if (reduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.28 }}
      transition={{ delay }}
    >
      {children}
    </motion.section>
  );
}
