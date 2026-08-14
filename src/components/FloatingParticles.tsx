"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type ParticleKind = "sparkle" | "dust";

type Particle = {
  id: number;
  kind: ParticleKind;
  left: string;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
};

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => {
    const kind: ParticleKind = id % 4 === 0 ? "sparkle" : "dust";
    return {
      id,
      kind,
      left: `${(id * 13 + 7) % 100}%`,
      size: kind === "sparkle" ? 2 + (id % 3) : 1.5 + (id % 2),
      delay: (id % 14) * 0.4,
      duration: 11 + (id % 10),
      drift: ((id % 9) - 4) * 14,
      opacity: kind === "dust" ? 0.2 : 0.55,
    };
  });
}

export function FloatingParticles({
  density = 22,
  active = true,
}: {
  density?: number;
  active?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const particles = useMemo(() => createParticles(density), [density]);

  if (reduceMotion || !active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={
            p.kind === "sparkle"
              ? "absolute rounded-full bg-[#e8d5a8] shadow-[0_0_8px_rgba(232,213,168,0.7)]"
              : "absolute rounded-full bg-[#d4b98a]/35"
          }
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            top: "-10%",
            opacity: p.opacity,
          }}
          animate={{
            y: ["0vh", "115vh"],
            x: [0, p.drift, -p.drift * 0.5, p.drift * 0.25],
            opacity: [0, p.opacity, p.opacity * 0.75, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
