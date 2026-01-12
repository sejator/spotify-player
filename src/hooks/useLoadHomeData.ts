"use client";

import { logger } from "@/lib/logger";
import { geRecommendations, getRecentlyPlayed } from "@/lib/spotify/playerService";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { useSpotifyPlaylistStore } from "@/store/spotifyPlaylistStore";
import { useEffect, useRef } from "react";

export function useLoadHomeData() {
  const { token } = useSpotifyAuthStore();
  const { setRecommendations, setRecentlyPlayed } = useSpotifyPlaylistStore();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!token || hasLoaded.current) return;

    hasLoaded.current = true;

    (async () => {
      try {
        const [recommendations, recent] = await Promise.all([geRecommendations(), getRecentlyPlayed(10)]);
        setRecommendations(recommendations);
        setRecentlyPlayed(recent.items);
      } catch (err) {
        logger("error", "SPOTIFY", "Home fetch failed", err);
      }
    })();
  }, [token, setRecommendations, setRecentlyPlayed]);
}
