"use client";

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
      duration: 14 + (id % 10),
      drift: ((id % 9) - 4) * 14,
      opacity: kind === "dust" ? 0.2 : 0.5,
    };
  });
}

/** CSS-driven particles (no Framer) — much cheaper on mobile GPUs. */
export function FloatingParticles({
  density = 12,
  active = true,
}: {
  density?: number;
  active?: boolean;
}) {
  const particles = useMemo(() => createParticles(density), [density]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden motion-reduce:hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={
            p.kind === "sparkle"
              ? "invite-particle absolute rounded-full bg-[#e8d5a8]"
              : "invite-particle absolute rounded-full bg-[#d4b98a]/35"
          }
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            top: "-10%",
            opacity: p.opacity,
            ["--drift" as string]: `${p.drift}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
