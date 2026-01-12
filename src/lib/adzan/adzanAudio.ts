import { logger } from "../logger";
import { adzanEvents } from "./adzanEvents";

let audio: HTMLAudioElement | null = null;
let volume = 1;
let isPlaying = false;

function getAudio() {
  if (audio) return audio;

  audio = new Audio("/adzan.mp3");
  audio.volume = volume;

  audio.addEventListener("ended", () => {
    if (!isPlaying) return;

    logger("adzan", "ADZAN", "ENDED");
    isPlaying = false;

    adzanEvents.emit("adzan:end");
  });

  return audio;
}

// ================= EVENTS =================
adzanEvents.on("adzan:start", () => {
  const a = getAudio();

  if (isPlaying) {
    logger("adzan", "ADZAN", "SKIP (already playing)");
    return;
  }

  logger("adzan", "ADZAN", "PLAY");
  isPlaying = true;

  a.currentTime = 0;
  a.play().catch((err) => {
    logger("error", "ADZAN", "PLAY FAILED", err);
    isPlaying = false;
  });
});

adzanEvents.on("adzan:stop", () => {
  if (!audio || !isPlaying) return;

  logger("adzan", "ADZAN", "STOP");
  isPlaying = false;

  audio.pause();
  audio.currentTime = 0;
});

// ================= PUBLIC API =================
export function setAdzanVolume(v: number) {
  volume = v;
  if (audio) audio.volume = v;
}

export function isAdzanPlaying() {
  return isPlaying;
}

export function stopAdzanAudio() {
  if (!audio || !isPlaying) return;

  logger("adzan", "ADZAN", "STOP (public)");
  isPlaying = false;

  audio.pause();
  audio.currentTime = 0;
}

// ================= DEBUG API =================
interface AdzanDebugAPI {
  play(): void;
  stop(): void;
  seek(seconds: number): void;
  skipToEnd(): void;
  currentTime: number;
  duration: number;
}

declare global {
  interface Window {
    __adzanAudio?: AdzanDebugAPI;
  }
}

if (typeof window !== "undefined") {
  window.__adzanAudio = {
    play() {
      adzanEvents.emit("adzan:start");
    },
    stop() {
      adzanEvents.emit("adzan:stop");
    },
    seek(seconds: number) {
      const a = getAudio();
      a.currentTime = Math.max(0, Math.min(seconds, a.duration || seconds));
      logger("adzan", "DEBUG", `seek -> ${a.currentTime}s`);
    },
    skipToEnd() {
      const a = getAudio();
      if (!a.duration) return;
      a.currentTime = a.duration - 0.3;
      logger("adzan", "DEBUG", "skip to end");
    },
    get currentTime() {
      return audio?.currentTime ?? 0;
    },
    get duration() {
      return audio?.duration ?? 0;
    },
  };
}
