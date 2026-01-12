import { logger } from "@/lib/logger";
import type { SpotifyTrack } from "@/types/spotify.type";
import { getSettingByKey } from "./settings";
import { usePlayerStore } from "@/store/playerStore";
import { sleep } from "@/utils/format";

let audio: HTMLAudioElement | null = null;
let progressInterval: number | null = null;
let onNext: (() => void) | null = null;

export async function getPlaylistLocal() {
  const response = await fetch("/api/local-tracks");
  if (!response.ok) {
    throw new Error("Failed to fetch local tracks");
  }
  const data = await response.json();
  return data.data as SpotifyTrack[];
}

/**
 * Inisialisasi audio sekali saja
 */
const initLocalAudio = () => {
  if (audio) return;

  audio = new Audio();
  audio.volume = 1;
  audio.preload = "auto";

  audio.onended = () => {
    const store = usePlayerStore.getState();
    logger("info", "LOCAL_AUDIO", "Track ended -> next");
    if (store.repeat === "one") {
      audio!.currentTime = 0;
      audio!.play();
      return;
    }

    onNext?.();
  };

  audio.onerror = (e) => {
    logger("error", "LOCAL_AUDIO", "Audio error", e);
  };
};

export const getLocalAudioElement = () => {
  return audio;
};

/**
 * Stop tanpa destroy audio element
 */
export const stopLocalAudio = async () => {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  stopProgressSync();
  await sleep(300);
};

/**
 * Pause local audio
 */
export const pauseLocalAudio = () => {
  if (!audio) return;
  audio.pause();
  stopProgressSync();
};

/**
 * Toggle play / pause
 */
export const toggleLocalAudio = async () => {
  if (!audio) return;

  if (audio.paused) {
    await audio.play();
  } else {
    audio.pause();
  }
};

/**
 * Status playing
 */
export const isLocalAudioPlaying = () => {
  return !!audio && !audio.paused;
};

/**
 * Callback ketika track selesai
 */
export const setLocalOnNext = (cb: () => void) => {
  onNext = cb;
};

/**
 * Play local track
 */
export const playLocalTrack = async (trackUri: string, onLoaded?: (durationMs: number) => void) => {
  try {
    initLocalAudio();

    const rawPath = decodeURIComponent(trackUri.replace("local:track:", ""));

    const setting = await getSettingByKey("localMusicPath");
    if (!setting?.value) {
      throw new Error("localMusicPath belum diset");
    }

    const safePath = rawPath.split("/").map(encodeURIComponent).join("/");

    audio!.src = `/${setting.value}/${safePath}`;
    audio!.load();

    audio!.onloadedmetadata = () => {
      onLoaded?.(Math.floor(audio!.duration * 1000));
    };

    await audio!.play();
    await startSyncWhenReady();
  } catch (err) {
    logger("error", "LOCAL_AUDIO", "Play error", err);
  }
};

/**
 * Seek local audio
 */
export const seekLocalAudio = (ms: number) => {
  if (!audio) return;

  audio.currentTime = ms / 1000;

  if (!audio.paused) {
    stopProgressSync();
    startProgressSync();
  }
};

const startSyncWhenReady = async () => {
  if (!audio) return;

  if (audio.readyState < 2) {
    await new Promise<void>((resolve) => {
      audio!.addEventListener("canplay", () => resolve(), { once: true });
    });
  }
  await sleep(300);

  startProgressSync();
};

/**
 * Resume local audio
 */
export const resumeLocalAudio = async () => {
  if (!audio) return;
  await audio.play();
  await startSyncWhenReady();
};

/**
 * Set volume
 */
export const setLocalVolume = (v: number) => {
  if (!audio) return;
  audio.volume = Math.min(1, Math.max(0, v));
};

/**
 * Progress sync
 */
const startProgressSync = () => {
  stopProgressSync();
  progressInterval = window.setInterval(() => {
    if (!audio || audio.paused) return;

    usePlayerStore.getState().setPosition(audio.currentTime * 1000);
    usePlayerStore.getState().setDuration(audio.duration * 1000);
  }, 500);
};

/**
 * Stop progress sync
 */
const stopProgressSync = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

/**
 * Convert local URI → SpotifyTrack shape
 */
export const localUriToSpotifyTrack = (uri: string, durationMs: number): SpotifyTrack => {
  const rawPath = decodeURIComponent(uri.replace("local:track:", ""));
  const lastSegment = rawPath.split("/").pop() ?? rawPath;
  const trackName = lastSegment.replace(/\.[^/.]+$/, "");
  const localTrack = uri.startsWith("local:track:") ? uri : `local:track:${rawPath}`;

  return {
    id: localTrack,
    uri: localTrack,
    name: trackName,
    duration_ms: durationMs,
    artists: [
      {
        id: localTrack,
        name: "Local Music",
        uri: localTrack,
      },
    ],
    album: {
      name: "Local Library",
      images: [
        {
          url: "/images/playlist-fallback.png",
          width: 300,
          height: 300,
        },
      ],
    },
  };
};

export function getNextShuffleIndex(queueLength: number, currentIndex: number, history: number[]): { nextIndex: number; nextHistory: number[] } {
  if (queueLength <= 1) {
    return { nextIndex: 0, nextHistory: [] };
  }

  const allIndexes = Array.from({ length: queueLength }, (_, i) => i);

  let available = allIndexes.filter((i) => !history.includes(i) && i !== currentIndex);

  if (available.length === 0) {
    available = allIndexes.filter((i) => i !== currentIndex);
    history = [];
  }

  const nextIndex = available[Math.floor(Math.random() * available.length)];

  return {
    nextIndex,
    nextHistory: [...history, nextIndex],
  };
}
