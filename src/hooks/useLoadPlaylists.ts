"use client";

import { logger } from "@/lib/logger";
import { getMyPlaylists } from "@/lib/spotify/playerService";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { useSpotifyPlaylistStore } from "@/store/spotifyPlaylistStore";
import { useEffect, useRef } from "react";

export function useLoadPlaylists() {
  const { token } = useSpotifyAuthStore();
  const { setPlaylists } = useSpotifyPlaylistStore();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!token || hasLoaded.current) return;

    hasLoaded.current = true;

    (async () => {
      try {
        const playlists = await getMyPlaylists();
        setPlaylists(playlists);
      } catch (err) {
        logger("error", "SPOTIFY", "Fetch playlists failed", err);
      }
    })();
  }, [token, setPlaylists]);
}
