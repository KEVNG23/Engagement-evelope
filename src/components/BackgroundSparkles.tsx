"use client";

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
    size: 2 + (id % 3),
    delay: (id % 12) * 0.4,
    duration: 2.8 + (id % 5) * 0.4,
  }));
}

/** Soft gold twinkles — CSS only so they don't fight the envelope on load. */
export function BackgroundSparkles({
  density = 14,
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
          className="invite-sparkle absolute rounded-full bg-[#f0d9a8]"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
