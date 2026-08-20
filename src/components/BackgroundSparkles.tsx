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
    size: 1.5 + (id % 3) * 0.5, // 1.5–2.5px
    delay: (id % 10) * 0.7,
    duration: 3.8 + (id % 6) * 0.6,
    peak: 0.28 + (id % 5) * 0.06, // subtle but visible on burgundy
  }));
}

/**
 * Tiny golden dust — like invitation paper catching light.
 * Sits above the page fill but below the envelope (pointer-events none).
 */
export function BackgroundSparkles({
  density = 22,
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
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden motion-reduce:hidden"
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="invite-dust absolute rounded-full bg-[#f0d9a8]"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            ["--dust-peak" as string]: String(s.peak),
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            boxShadow: `0 0 ${s.size * 2}px rgba(240, 217, 168, 0.35)`,
          }}
        />
      ))}
    </div>
  );
}
