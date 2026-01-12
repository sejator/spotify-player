import { create } from "zustand";
import type { SpotifyTrack } from "@/types/spotify.type";

interface LocalTracksState {
  tracks: SpotifyTrack[];
  setTracks: (tracks: SpotifyTrack[]) => void;
}

export const useLocalTracksStore = create<LocalTracksState>((set) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
}));
