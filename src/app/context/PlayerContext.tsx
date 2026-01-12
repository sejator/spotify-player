"use client";

import { useContext, createContext, useRef, useState } from "react";
import type { PlayerContextType, PlaySource, SpotifyTrack } from "@/types/spotify.type";
import { logger } from "@/lib/logger";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { usePlayerStore } from "@/store/playerStore";
import { pause, playContext, playUris, resume, setRepeat, setShuffle } from "@/lib/spotify/playerService";
import { getLocalAudioElement, localUriToSpotifyTrack, pauseLocalAudio, playLocalTrack, resumeLocalAudio, stopLocalAudio } from "@/lib/playerLocalService";
import toast from "react-hot-toast";
import { useInitSpotifyToken } from "@/hooks/useInitSpotifyToken";
import { useInitSpotifyPlayer } from "@/hooks/useInitSpotifyPlayer";
import { useLoadPlaylists } from "@/hooks/useLoadPlaylists";
import { useLoadHomeData } from "@/hooks/useLoadHomeData";
import { useLocalOnNext } from "@/hooks/useLocalOnNext";
import { useRefreshToken } from "@/hooks/useRefreshToken";
import { useSyncPlayerPosition } from "@/hooks/useSyncPlayerPosition";

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<Spotify.Player | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const { isReady, isPremium } = useSpotifyAuthStore();

  useInitSpotifyToken();
  useInitSpotifyPlayer(playerRef, setPlayer, setCurrentTrack, setIsPaused);
  useLoadPlaylists();
  useLoadHomeData();
  useLocalOnNext(setCurrentTrack, setIsPaused);
  useRefreshToken();
  useSyncPlayerPosition(player);

  // =========================
  // HELPER FUNCTIONS
  // =========================

  const ensureCanPlay = () => {
    const store = usePlayerStore.getState();
    if (store.status === "adzan" || store.status === "iqomah") {
      toast.error("Sedang berlangsung adzan / iqomah");
      return false;
    }
    if (store.status === "ads") {
      toast.error("Sedang berlangsung iklan");
      return false;
    }
    return true;
  };

  const handleLocalPlay = async (uri: string) => {
    const store = usePlayerStore.getState();
    await player?.pause().catch(() => {});
    await playLocalTrack(uri, (durationMs) => {
      setCurrentTrack(localUriToSpotifyTrack(uri, durationMs));
    });
    store.setSource("local");
    store.setLocalWasPlaying(true);
    store.setSpotifyWasPlaying(false);
    store.setLastPlaybackTrack(uri);
    setIsPaused(false);
  };

  const handleSpotifyPlay = async (source: PlaySource, options?: { offset?: number }) => {
    const store = usePlayerStore.getState();
    if (!isPremium) {
      toast.error(
        <div className="flex flex-col">
          Fitur ini hanya untuk akun Spotify <b>Minimal Paket Premium Standard</b>
        </div>
      );
      return;
    }
    if (!store.deviceId || !isReady) {
      toast.error("Pemutar Spotify belum siap");
      return;
    }

    await stopLocalAudio();

    try {
      if (typeof source === "object" && Array.isArray(source.uris)) {
        // MULTI URIS
        const uris = source.uris;
        const startIndex = source.startIndex ?? 0;
        const firstUri = uris[startIndex];
        if (!firstUri) return;

        await playUris(uris, startIndex, store.deviceId);
        store.setLastPlaybackTrack(firstUri);
        store.setQueue(uris, "spotify", startIndex);
      } else if (typeof source === "string") {
        if (source.startsWith("spotify:track")) {
          await playUris(source, 0, store.deviceId);
          store.setLastPlaybackTrack(source);
        } else {
          await setShuffle(store.shuffle, store.deviceId).catch(() => {});
          await setRepeat(store.repeat === "one" ? "track" : store.repeat === "all" ? "context" : "off", store.deviceId).catch(() => {});
          await playContext(source, store.deviceId, { offset: options?.offset });
          store.setLastPlaybackContext(source);
        }
      }
      store.setSource("spotify");
      store.setSpotifyWasPlaying(true);
      store.setLocalWasPlaying(false);
      setIsPaused(false);
    } catch (err) {
      logger("error", "SPOTIFY", "Play error", err);
      toast.error("Gagal memutar Spotify, silakan refresh halaman dan coba lagi");
    }
  };

  // =========================
  // PLAYER FUNCTIONS
  // =========================

  const play = async (source?: PlaySource, options?: { offset?: number }) => {
    if (!ensureCanPlay()) return;

    const store = usePlayerStore.getState();
    const finalSource = source ?? store.lastPlaybackTrackUri ?? store.lastPlaybackContextUri;
    if (!finalSource) return;

    logger("info", "PLAYER", "Play request for source: ", finalSource);

    if (typeof finalSource === "string" && finalSource.startsWith("local:track:")) {
      await handleLocalPlay(finalSource);
    } else {
      await handleSpotifyPlay(finalSource, options);
    }
  };

  const next = async () => {
    if (!ensureCanPlay()) return;

    const store = usePlayerStore.getState();

    if (store.source === "spotify" && player) {
      try {
        await player.nextTrack();
      } catch (err) {
        logger("error", "SPOTIFY", "Next error", err);
      }
      return;
    }

    const nextUri = store.next();
    if (nextUri) await play(nextUri);
  };

  const prev = async () => {
    if (!ensureCanPlay()) return;

    const store = usePlayerStore.getState();

    if (store.source === "spotify" && player) {
      try {
        await player.previousTrack();
      } catch (err) {
        logger("error", "SPOTIFY", "Prev error", err);
      }
      return;
    }

    const prevUri = store.prev();
    if (prevUri) await play(prevUri);
  };

  const togglePlay = async () => {
    if (!ensureCanPlay()) return;

    const store = usePlayerStore.getState();
    const source = store.source;
    if (!source) return;

    if (source === "local") {
      if (isPaused) {
        await resumeLocalAudio();
        store.setLocalWasPlaying(true);
        setIsPaused(false);
      } else {
        pauseLocalAudio();
        store.setLocalWasPlaying(false);
        setIsPaused(true);
      }
      return;
    }

    if (!player) return;

    try {
      if (isPaused) {
        await resume(store.deviceId!);
        store.setSpotifyWasPlaying(true);
        setIsPaused(false);
      } else {
        await pause(store.deviceId!);
        store.setSpotifyWasPlaying(false);
        setIsPaused(true);
      }
    } catch (err) {
      logger("error", "SPOTIFY", "Toggle error", err);
    }
  };

  const seek = async (positionMs: number) => {
    const store = usePlayerStore.getState();
    if (store.status === "adzan" || store.status === "iqomah") return;

    store.setPosition(positionMs);

    if (store.source === "local") {
      const audio = getLocalAudioElement();
      if (audio) audio.currentTime = positionMs / 1000;
      return;
    }

    if (store.source === "spotify" && player && store.deviceId) {
      try {
        await player.seek(positionMs);
      } catch (err) {
        logger("error", "SPOTIFY", "Seek error", err);
      }
    }
  };

  const toggleShuffle = async () => {
    const store = usePlayerStore.getState();
    if (store.source === "spotify" && (!store.deviceId || !isReady)) {
      toast.error("Spotify belum siap");
      return;
    }

    const nextState = !store.shuffle;
    store.toggleShuffle();

    if (store.source === "spotify" && store.deviceId) {
      try {
        await setShuffle(nextState, store.deviceId);
      } catch (err) {
        logger("error", "SPOTIFY", "Set shuffle error", err);
      }
    }
  };

  const toggleRepeat = async () => {
    const store = usePlayerStore.getState();
    if (store.source === "spotify" && (!store.deviceId || !isReady)) {
      toast.error("Spotify belum siap");
      return;
    }

    let nextRepeat: "off" | "all" | "one";
    if (store.repeat === "off") nextRepeat = "all";
    else if (store.repeat === "all") nextRepeat = "one";
    else nextRepeat = "off";

    store.toggleRepeat();

    if (store.source === "spotify" && store.deviceId) {
      const spotifyMode = nextRepeat === "one" ? "track" : nextRepeat === "all" ? "context" : "off";
      try {
        await setRepeat(spotifyMode, store.deviceId);
      } catch (err) {
        logger("error", "SPOTIFY", "Set repeat error", err);
      }
    }
  };

  const currentStore = usePlayerStore();
  return (
    <PlayerContext.Provider
      value={{
        player,
        play,
        togglePlay,
        next,
        prev,
        seek,
        toggleShuffle,
        toggleRepeat,
        currentTrack,
        isPaused,
        deviceId: currentStore.deviceId,
        isReady,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
};
