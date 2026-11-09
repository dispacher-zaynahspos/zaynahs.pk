'use client';

/**
 * Order Notification Chime SSOT (RULE SSOT1)
 *
 * Reliable dual-layer order ring system:
 * 1. Plays `/mp3/ChingChang.mp3` with volume 1.0.
 * 2. If autoplay policy or network blocks the MP3, immediately falls back to
 *    Web Audio API synthesized dual-tone harmonic chime (D5 587.33Hz -> A5 880Hz).
 * 3. Pre-unlocks audio context on first user tap/click anywhere on document.
 */

let unlockedAudioCtx: AudioContext | null = null;
let listenerAttached = false;

function ensureAudioUnlocked() {
  if (typeof window === 'undefined' || listenerAttached) return;
  listenerAttached = true;

  const unlock = () => {
    try {
      const ACtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (ACtor && (!unlockedAudioCtx || unlockedAudioCtx.state === 'suspended')) {
        unlockedAudioCtx = new ACtor();
        if (unlockedAudioCtx.state === 'suspended') {
          unlockedAudioCtx.resume().catch(() => {});
        }
      }
    } catch {}
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('keydown', unlock);
  };

  document.addEventListener('click', unlock, { once: true, passive: true });
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('keydown', unlock, { once: true, passive: true });
}

function playSynthesizedChime() {
  try {
    const ACtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ACtor) return;
    const ctx = unlockedAudioCtx || new ACtor();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, t); // D5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, t + 0.12); // A5

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.12);
    osc2.start(t + 0.12);
    osc2.stop(t + 0.7);
  } catch (err) {
    console.warn('[orderChime] Web Audio synthesis failed:', err);
  }
}

export function playOrderChime() {
  if (typeof window === 'undefined') return;
  ensureAudioUnlocked();

  try {
    const audio = new Audio('/mp3/ChingChang.mp3');
    audio.volume = 1.0;
    audio.preload = 'auto';

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[orderChime] Audio file playback failed, falling back to Web Audio synth:', err);
        playSynthesizedChime();
      });
    }
  } catch (err) {
    console.warn('[orderChime] HTMLAudioElement instantiation failed, falling back to Web Audio synth:', err);
    playSynthesizedChime();
  }
}
