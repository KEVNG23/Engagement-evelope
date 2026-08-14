"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type MusicToggleProps = {
  src?: string;
};

export function MusicToggle({ src = "/assets/music.mp3" }: MusicToggleProps) {
  const reduceMotion = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Probe availability first so a missing file does not spam 404 / Next issue badge
    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (cancelled || !res.ok) return;
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0.35;
        audioRef.current = audio;
        setAvailable(true);
      })
      .catch(() => {
        /* music optional */
      });

    return () => {
      cancelled = true;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src]);

  if (!available) return null;

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4b98a]/50 bg-[#3d1418]/85 text-[#f3e8d5] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md touch-manipulation"
      whileHover={reduceMotion ? undefined : { scale: 1.05 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      animate={
        reduceMotion || playing
          ? undefined
          : {
              scale: [1, 1.06, 1],
              boxShadow: [
                "0 10px 30px rgba(0,0,0,0.35)",
                "0 10px 36px rgba(212,185,138,0.35)",
                "0 10px 30px rgba(0,0,0,0.35)",
              ],
            }
      }
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-lg" aria-hidden>
        {playing ? "♪" : "♬"}
      </span>
    </motion.button>
  );
}
