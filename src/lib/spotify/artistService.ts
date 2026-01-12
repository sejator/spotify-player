import { spotifyFetch } from "./spotifyClient";
import type { SpotifyArtist, SpotifyTrack } from "@/types/spotify.type";

export const getArtistDetail = (id: string) => spotifyFetch<SpotifyArtist>(`/artists/${id}`);

export const getArtistTopTracks = async (id: string) => {
  const res = await spotifyFetch<{ tracks: SpotifyTrack[] }>(`/artists/${id}/top-tracks?market=ID`);
  return res.tracks;
};
