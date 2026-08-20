"use client";

import { useMemo } from "react";

type Sparkle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  peak: number;
};

function createSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: `${(id * 19 + 7) % 94}%`,
    top: `${(id * 29 + 11) % 90}%`,
    size: 1 + (id % 2), // 1–2px dust
    delay: (id % 10) * 0.85,
    duration: 4.5 + (id % 6) * 0.7,
    peak: 0.12 + (id % 4) * 0.02, // ~12–18% peak opacity
  }));
}

/**
 * Tiny golden dust — like invitation paper catching light.
 * Intentionally almost imperceptible.
 */
export function BackgroundSparkles({
  density = 16,
  active = true,
}: {
  density?: number;
  active?: boolean;
}) {
  const sparkles = useMemo(() => createSparkles(density), [density]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden motion-reduce:hidden"
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="invite-dust absolute rounded-full bg-[#e8d5a8]"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            ["--dust-peak" as string]: String(s.peak),
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
