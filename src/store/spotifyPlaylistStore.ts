import { SpotifyPlaylist, SpotifyTrack } from "@/types/spotify.type";
import { create } from "zustand";

interface SpotifyPlaylistState {
  playlists: SpotifyPlaylist[];
  tracks: Record<string, SpotifyTrack[]>;
  recommendations: SpotifyPlaylist[];
  recentlyPlayed: SpotifyTrack[];

  setPlaylists: (playlists: SpotifyPlaylist[]) => void;
  setTracks: (playlistId: string, tracks: SpotifyTrack[]) => void;
  setRecommendations: (v: SpotifyPlaylist[]) => void;
  setRecentlyPlayed: (v: SpotifyTrack[]) => void;
}

export const useSpotifyPlaylistStore = create<SpotifyPlaylistState>((set) => ({
  playlists: [],
  tracks: {},

  recommendations: [],
  recentlyPlayed: [],

  setPlaylists: (playlists) => set({ playlists }),
  setTracks: (playlistId, tracks) => set((state) => ({ tracks: { ...state.tracks, [playlistId]: tracks } })),

  setRecommendations: (v) => set({ recommendations: v }),
  setRecentlyPlayed: (v) => set({ recentlyPlayed: v }),
}));
