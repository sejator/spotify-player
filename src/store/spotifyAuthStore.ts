"use client";

import { create } from "zustand";

interface SpotifyAuthState {
  splashcreenShown: boolean;
  token: string | null;
  isTokenInvalid: boolean;
  isPremium: boolean;
  isReady: boolean;
  expiresAt: number | null;

  setSplashcreenShown: (shown: boolean) => void;
  setToken: (token: string, expiresAt: number) => void;
  clearToken: () => void;
  markTokenInvalid: () => void;
  setPremium: (isPremium: boolean) => void;
  setIsReady: (isReady: boolean) => void;
  refreshToken: () => Promise<void>;
}

export const useSpotifyAuthStore = create<SpotifyAuthState>((set, get) => ({
  splashcreenShown: true,
  token: null,
  isTokenInvalid: false,
  isPremium: false,
  isReady: false,
  expiresAt: null,

  setSplashcreenShown: (shown) => set({ splashcreenShown: shown }),

  setToken: (token, expiresAt) => {
    localStorage.setItem("spotifyToken", token);
    localStorage.setItem("spotifyTokenExpiresAt", expiresAt.toString());
    set({
      token,
      isTokenInvalid: false,
      expiresAt,
      splashcreenShown: false,
    });
  },

  setPremium: (isPremium) =>
    set({
      isPremium,
      splashcreenShown: false,
    }),
  setIsReady: (isReady) =>
    set({
      isReady,
      splashcreenShown: false,
    }),

  clearToken: () =>
    set({
      token: null,
      isTokenInvalid: false,
      isPremium: false,
      expiresAt: null,
      splashcreenShown: false,
    }),

  markTokenInvalid: () =>
    set({
      isTokenInvalid: true,
      isPremium: false,
      splashcreenShown: false,
    }),

  refreshToken: async () => {
    const { token, expiresAt, setToken, markTokenInvalid } = get();

    if (token && expiresAt && Date.now() < expiresAt) {
      // token masih valid
      localStorage.setItem("spotifyToken", token);
      localStorage.setItem("spotifyTokenExpiresAt", expiresAt.toString());
      return;
    }

    try {
      const res = await fetch("/api/spotify/get-token");
      if (!res.ok) throw new Error("Failed to fetch token");

      const data = await res.json();
      if (!data.accessToken || !data.expiresAt) {
        markTokenInvalid();
        return;
      }

      setToken(data.accessToken, data.expiresAt);
    } catch (err) {
      console.error("Error refreshing Spotify token:", err);
      markTokenInvalid();
    }
  },
}));
