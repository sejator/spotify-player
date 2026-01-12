import { spotifyFetch } from "./spotifyClient";
import type { SpotifyTrack, SpotifyArtist, SpotifyAlbum } from "@/types/spotify.type";

export interface SpotifySearchResult {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  albums: SpotifyAlbum[];
}

/**
 * Cari lagu, artis, atau album
 */
export async function search(query: string): Promise<SpotifySearchResult> {
  const data = await spotifyFetch<{
    tracks: { items: SpotifyTrack[] };
    artists: { items: SpotifyArtist[] };
    albums: { items: SpotifyAlbum[] };
  }>(`/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=20`);

  return {
    tracks: data.tracks.items,
    artists: data.artists.items,
    albums: data.albums.items,
  };
}
