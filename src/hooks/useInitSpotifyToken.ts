"use client";

import { useEffect, useRef } from "react";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { getMe } from "@/lib/spotify/userService";
import { logger } from "@/lib/logger";
import { useSpotifyUserStore } from "@/store/spotifyUserStore";

export function useInitSpotifyToken() {
  const { token, setToken, markTokenInvalid } = useSpotifyAuthStore();
  const { setUser } = useSpotifyUserStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (token || hasInitialized.current) return;

    hasInitialized.current = true;

    (async () => {
      try {
        const res = await fetch("/api/spotify/get-token");
        if (!res.ok) throw new Error("Gagal ambil token dari server");

        const data = await res.json();
        if (data.accessToken) {
          setToken(data.accessToken, data.expiresAt);
          logger("info", "SPOTIFY", "Token berhasil diinisialisasi");
        } else {
          markTokenInvalid();
          return;
        }

        const user = await getMe();
        setUser(user);
      } catch (err) {
        logger("error", "SPOTIFY", "Init token error:", err);
        markTokenInvalid();
      }
    })();
  }, [token, setToken, markTokenInvalid, setUser]);
}
