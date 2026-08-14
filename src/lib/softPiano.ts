/**
 * Soft piano-like arpeggio via Web Audio (no external sample required).
 * Plays a gentle C-major sparkle when the envelope opens.
 */
export function playSoftPianoIntro(volume = 0.18): void {
  if (typeof window === "undefined") return;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  // Soft C major arpeggio + resolution (Hz)
  const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 659.25];
  const starts = [0, 0.22, 0.44, 0.66, 1.05, 1.35];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Triangle + lowpass ≈ soft piano-ish pad
    osc.type = "triangle";
    osc.frequency.value = freq;

    filter.type = "lowpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.7;

    const t0 = now + starts[i];
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 1.5);
  });

  window.setTimeout(() => {
    void ctx.close();
  }, 3500);
}
