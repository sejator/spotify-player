import { spotifyFetch } from "./spotifyClient";
import type { SpotifyAlbum, SpotifyTrack } from "@/types/spotify.type";

export const getAlbumDetail = (id: string) => spotifyFetch<SpotifyAlbum>(`/albums/${id}`);

export const getAlbumTracks = async (id: string) => {
  const res = await spotifyFetch<{ items: SpotifyTrack[] }>(`/albums/${id}/tracks`);
  return res.items;
};
