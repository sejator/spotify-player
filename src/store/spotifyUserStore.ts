"use client";
import { create } from "zustand";
import type { SpotifyUser } from "@/types/spotify.type";

interface SpotifyUserState {
  user: SpotifyUser | null;
  setUser: (user: SpotifyUser) => void;
  clearUser: () => void;
}

export const useSpotifyUserStore = create<SpotifyUserState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));
