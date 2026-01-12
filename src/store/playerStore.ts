import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpotifyTrack } from "@/types/spotify.type";
import { getNextShuffleIndex } from "@/lib/playerLocalService";

export type PlayerStatus = "idle" | "waiting" | "adzan" | "iqomah" | "ads";

export type PlayerSource = "spotify" | "local" | null;
export type QueueSource = PlayerSource;

interface PlayerStore {
  /** =========================
   * STATUS
   * ========================= */
  status: PlayerStatus;

  /** =========================
   * ADZAN
   * ========================= */
  sholatName: string | null;
  startedAt: number | null;

  /** =========================
   * SOURCE
   * ========================= */
  source: PlayerSource;

  /** =========================
   * FLAGS
   * ========================= */
  spotifyWasPlaying: boolean;
  localWasPlaying: boolean;
  isPaused: boolean;

  /** =========================
   * TRACK
   * ========================= */
  currentTrack: SpotifyTrack | null;

  /** =========================
   * PLAYBACK MEMORY
   * ========================= */
  lastPlaybackContextUri: string | null;
  lastPlaybackTrackUri: string | null;

  /** =========================
   * QUEUE
   * ========================= */
  queue: string[];
  spotifyQueue: SpotifyTrack[];
  queueIndex: number;
  queueSource: QueueSource | null;
  shuffleHistory: number[];

  /** =========================
   * PLAYBACK STATE
   * ========================= */
  deviceId: string | null;
  positionMs: number;
  durationMs: number;
  shuffle: boolean;
  repeat: "off" | "one" | "all";

  /** =========================
   * ADS
   * ========================= */
  adsSource: string | null;

  /** =========================
   * ACTIONS
   * ========================= */

  /** ADZAN */
  startAdzan: (sholat: string) => void;
  endAdzan: () => void;
  startIqomah: () => void;
  endIqomah: () => void;
  forceStopAdzan: () => void;

  /** ADS */
  startAds: (src: string) => void;
  endAds: () => void;

  /** BASIC */
  setSource: (s: PlayerSource) => void;
  setSpotifyWasPlaying: (v: boolean) => void;
  setLocalWasPlaying: (v: boolean) => void;
  setIsPaused: (v: boolean) => void;

  setCurrentTrack: (t: SpotifyTrack | null) => void;

  setLastPlaybackContext: (uri: string | null) => void;
  setLastPlaybackTrack: (uri: string | null) => void;

  setQueue: (tracks: string[], source: QueueSource, startIndex?: number) => void;
  setSpotifyQueue: (tracks: SpotifyTrack[]) => void;
  next: () => string | null;
  prev: () => string | null;
  clearQueue: () => void;

  setDeviceId: (id: string) => void;
  setPosition: (ms: number) => void;
  setDuration: (ms: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      status: "idle",
      sholatName: null,
      startedAt: null,

      source: null,

      spotifyWasPlaying: false,
      localWasPlaying: false,
      isPaused: true,

      currentTrack: null,

      lastPlaybackContextUri: null,
      lastPlaybackTrackUri: null,

      queue: [],
      spotifyQueue: [],
      queueIndex: 0,
      queueSource: null,
      shuffleHistory: [],

      deviceId: null,
      positionMs: 0,
      durationMs: 0,
      shuffle: false,
      repeat: "off",

      /** =========================
       * ADS
       * ========================= */
      adsSource: null,

      /** =========================
       * ADZAN
       * ========================= */
      startAdzan: (sholat) =>
        set({
          status: "adzan",
          sholatName: sholat,
          startedAt: Date.now(),
        }),
      endAdzan: () => set({ status: "waiting", startedAt: null }),
      startIqomah: () => set({ status: "iqomah", startedAt: Date.now() }),
      endIqomah: () => set({ status: "idle", sholatName: null, startedAt: null }),
      forceStopAdzan: () => set({ status: "idle", sholatName: null, startedAt: null }),

      /** =========================
       * ADS ACTIONS
       * ========================= */
      startAds: (adsUri: string) =>
        set((s) => ({
          status: "ads",
          adsSource: adsUri,
          spotifyWasPlaying: s.source === "spotify",
          localWasPlaying: s.source === "local",
        })),

      endAds: () =>
        set({
          status: "idle",
          adsSource: null,
        }),

      /** =========================
       * BASIC
       * ========================= */
      setSource: (s) => set({ source: s }),
      setSpotifyWasPlaying: (v) => set({ spotifyWasPlaying: v }),
      setLocalWasPlaying: (v) => set({ localWasPlaying: v }),
      setIsPaused: (v) => set({ isPaused: v }),
      setCurrentTrack: (t) => set({ currentTrack: t }),
      setLastPlaybackContext: (uri) => set({ lastPlaybackContextUri: uri }),
      setLastPlaybackTrack: (uri) => set({ lastPlaybackTrackUri: uri }),

      /** =========================
       * QUEUE
       * ========================= */
      setQueue: (tracks, source, startIndex = 0) =>
        set({
          queue: tracks,
          queueSource: source,
          queueIndex: startIndex,
          source,
          shuffleHistory: [],
        }),

      setSpotifyQueue: (tracks) => set({ spotifyQueue: tracks }),

      next: () => {
        let nextUri: string | null = null;

        set((s) => {
          const { queue, queueIndex, shuffle, repeat, shuffleHistory } = s;

          if (queue.length === 0) return s;

          // repeat one
          if (repeat === "one") {
            nextUri = queue[queueIndex];
            return s;
          }

          let nextIndex = queueIndex;
          let nextHistory = shuffleHistory;

          if (shuffle) {
            const result = getNextShuffleIndex(queue.length, queueIndex, shuffleHistory);
            nextIndex = result.nextIndex;
            nextHistory = result.nextHistory;
          } else {
            nextIndex = queueIndex + 1;
          }

          // end of queue
          if (nextIndex >= queue.length) {
            if (repeat === "all") {
              nextIndex = 0;
              nextHistory = [];
            } else {
              return s;
            }
          }

          nextUri = queue[nextIndex];

          return {
            queueIndex: nextIndex,
            shuffleHistory: nextHistory,
          };
        });

        return nextUri;
      },

      prev: () => {
        let prevUri: string | null = null;

        set((s) => {
          const { queue, queueIndex, repeat } = s;

          if (queue.length === 0) return s;

          let prevIndex = queueIndex - 1;

          if (prevIndex < 0) {
            if (repeat === "all") prevIndex = queue.length - 1;
            else return s;
          }

          prevUri = queue[prevIndex];
          return { queueIndex: prevIndex };
        });

        return prevUri;
      },

      clearQueue: () => set({ queue: [], queueIndex: 0 }),

      /** =========================
       * PLAYBACK
       * ========================= */
      setDeviceId: (id) => set({ deviceId: id }),
      setPosition: (ms) => set({ positionMs: ms }),
      setDuration: (ms) => set({ durationMs: ms }),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      toggleRepeat: () =>
        set((s) => ({
          repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
        })),

      reset: () => set({ status: "idle", source: null }),
    }),
    {
      name: "player-store",
      partialize: (state) => ({
        lastPlaybackTrackUri: state.lastPlaybackTrackUri,
        lastPlaybackContextUri: state.lastPlaybackContextUri,
        shuffle: state.shuffle,
        repeat: state.repeat,
        positionMs: state.positionMs,
        durationMs: state.durationMs,
      }),
    }
  )
);
