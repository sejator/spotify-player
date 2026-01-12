"use client";

import { useCallback } from "react";
import { getQueue } from "@/lib/spotify/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { logger } from "@/lib/logger";

export function useSpotifyQueue() {
  const source = usePlayerStore((s) => s.source);
  const spotifyQueue = usePlayerStore((s) => s.spotifyQueue);
  const setSpotifyQueue = usePlayerStore((s) => s.setSpotifyQueue);

  const fetchSpotifyQueue = useCallback(async () => {
    if (source !== "spotify") return;
    try {
      const data = await getQueue();
      const uniqueQueue = Array.from(new Map((data.queue || []).map((track) => [track.uri, track])).values());
      setSpotifyQueue(uniqueQueue);
    } catch (e) {
      logger("error", "SPOTIFY", "Spotify queue error", e);
    }
  }, [source, setSpotifyQueue]);

  return { spotifyQueue, fetchSpotifyQueue };
}
