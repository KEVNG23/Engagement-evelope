"use client";

import { useMemo } from "react";

type Petal = {
  id: number;
  left: string;
  size: number;
  delay: number;
  duration: number;
  sway: number;
  rotate: number;
  opacity: number;
  blush: boolean;
};

function createPetals(count: number): Petal[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: `${8 + ((id * 17) % 84)}%`,
    size: 14 + (id % 4) * 3,
    delay: id * 2.4,
    duration: 18 + (id % 5) * 3,
    sway: 28 + (id % 4) * 10,
    rotate: 40 + (id % 5) * 18,
    opacity: 0.12 + (id % 4) * 0.02, // ~12–18%
    blush: id % 3 === 1,
  }));
}

/** Slow cream / blush petals — CSS only, light enough not to fight the envelope. */
export function FloatingPetals({
  count = 6,
  active = true,
}: {
  count?: number;
  active?: boolean;
}) {
  const petals = useMemo(
    () => createPetals(Math.min(8, Math.max(3, count))),
    [count],
  );

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden motion-reduce:hidden"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="invite-petal absolute top-[-8%]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.35,
            opacity: p.opacity,
            ["--sway" as string]: `${p.sway}px`,
            ["--spin" as string]: `${p.rotate}deg`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            background: p.blush
              ? "radial-gradient(ellipse at 35% 30%, #f3d5c8 0%, #e8b8a8 55%, #d4a090 100%)"
              : "radial-gradient(ellipse at 35% 30%, #fff6e8 0%, #f0e0c4 55%, #e0c9a8 100%)",
            borderRadius: "60% 40% 60% 40%",
            boxShadow: "inset 0 -1px 2px rgba(90, 40, 40, 0.12)",
          }}
        />
      ))}
    </div>
  );
}
