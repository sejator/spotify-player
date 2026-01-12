"use client";

import { usePlayerStore } from "@/store/playerStore";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { useEffect } from "react";

export function useSyncPlayerPosition(player: Spotify.Player | null) {
  const isReady = useSpotifyAuthStore((s) => s.isReady);

  useEffect(() => {
    if (!player || !isReady) return;

    const interval = setInterval(() => {
      const store = usePlayerStore.getState();
      if (!store.spotifyWasPlaying) return;

      player.getCurrentState().then((state) => {
        if (!state) return;
        store.setPosition(state.position);
        store.setDuration(state.duration);
        store.setCurrentTrack(state.track_window.current_track);
        store.setIsPaused(state.paused);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [player, isReady]);
}
