"use client";

import { logger } from "@/lib/logger";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { useEffect } from "react";

export function useRefreshToken() {
  const { token, expiresAt, refreshToken } = useSpotifyAuthStore();

  useEffect(() => {
    if (!token || !expiresAt) return;

    const delay = Math.max(expiresAt - Date.now(), 0);
    const timer = setTimeout(async () => {
      logger("info", "SPOTIFY", "Refreshing token...");
      try {
        await refreshToken();
      } catch (err) {
        logger("error", "SPOTIFY", "Refresh token failed", err);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [token, expiresAt, refreshToken]);
}
