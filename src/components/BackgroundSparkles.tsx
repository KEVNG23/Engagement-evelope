"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type Sparkle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
};

function createSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: `${(id * 17 + 5) % 96}%`,
    top: `${(id * 23 + 8) % 92}%`,
    size: 2 + (id % 4),
    delay: (id % 12) * 0.35,
    duration: 2.2 + (id % 6) * 0.35,
  }));
}

/** Soft gold twinkles fixed in the burgundy background */
export function BackgroundSparkles({
  density = 28,
  active = true,
}: {
  density?: number;
  active?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const sparkles = useMemo(() => createSparkles(density), [density]);

  if (reduceMotion || !active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-[#f0d9a8]"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 3}px rgba(240,217,168,0.85)`,
          }}
          animate={{
            opacity: [0, 0.95, 0.35, 1, 0],
            scale: [0.4, 1.35, 0.8, 1.2, 0.3],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
