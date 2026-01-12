import { spotifyFetch } from "./spotifyClient";
import { likedSongsPlaylist } from "./likedSongs";
import type { SpotifyArtist, SpotifyPlaylist, SpotifyTrack } from "@/types/spotify.type";

const withDevice = (path: string, deviceId?: string) => `${path}${deviceId ? `${path.includes("?") ? "&" : "?"}device_id=${deviceId}` : ""}`;

/* =====================================================
 * Player Control
 * ===================================================== */

export async function playUris(uris: string | string[], startIndex = 0, deviceId?: string) {
  const uriArray = Array.isArray(uris) ? uris : [uris];
  if (!uriArray.length || startIndex >= uriArray.length) return;

  const body: {
    uris?: string[];
    offset?: { position: number };
  } = { uris: uriArray };

  if (startIndex > 0) {
    body.offset = { position: startIndex };
  }

  return spotifyFetch<void>(withDevice("/me/player/play", deviceId), {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function playContext(contextUri: string, deviceId?: string, options?: { offset?: number }) {
  return spotifyFetch<void>(withDevice("/me/player/play", deviceId), {
    method: "PUT",
    body: JSON.stringify({
      context_uri: contextUri,
      offset: { position: options?.offset ?? 0 },
    }),
  });
}

export function pause(deviceId?: string) {
  return spotifyFetch<void>(withDevice("/me/player/pause", deviceId), {
    method: "PUT",
  });
}

export function resume(deviceId?: string) {
  return spotifyFetch<void>(withDevice("/me/player/play", deviceId), {
    method: "PUT",
  });
}

export function seek(positionMs: number, deviceId?: string) {
  return spotifyFetch<void>(withDevice(`/me/player/seek?position_ms=${positionMs}`, deviceId), { method: "PUT" });
}

export function setVolume(volumePercent: number, deviceId?: string) {
  return spotifyFetch<void>(withDevice(`/me/player/volume?volume_percent=${volumePercent}`, deviceId), { method: "PUT" });
}

/* =====================================================
 * Playback
 * ===================================================== */

export function nextTrack() {
  return spotifyFetch<void>("/me/player/next", { method: "POST" });
}

export function prevTrack() {
  return spotifyFetch<void>("/me/player/previous", { method: "POST" });
}

export function setShuffle(state: boolean, deviceId?: string) {
  return spotifyFetch<void>(withDevice(`/me/player/shuffle?state=${state}`, deviceId), { method: "PUT" });
}

export function setRepeat(mode: "off" | "context" | "track", deviceId?: string) {
  return spotifyFetch<void>(withDevice(`/me/player/repeat?state=${mode}`, deviceId), { method: "PUT" });
}

export async function getRecentlyPlayed(limit = 8): Promise<{ items: SpotifyTrack[]; cursors: { after: string; before: string }; limit: number }> {
  const data = await spotifyFetch<{
    items: { track: SpotifyTrack }[];
    cursors: { after: string; before: string };
    limit: number;
  }>(`/me/player/recently-played?limit=${limit}`);

  return {
    items: data.items.map((i) => i.track).filter(Boolean),
    cursors: data.cursors,
    limit: data.limit,
  };
}

/* =====================================================
 * Queue
 * ===================================================== */

export function addToQueue(uri: string, deviceId?: string) {
  return spotifyFetch<void>(withDevice(`/me/player/queue?uri=${encodeURIComponent(uri)}`, deviceId), { method: "POST" });
}

export async function getQueue(): Promise<{
  currently_playing: SpotifyTrack | null;
  queue: SpotifyTrack[];
}> {
  return spotifyFetch<{
    currently_playing: SpotifyTrack | null;
    queue: SpotifyTrack[];
  }>("/me/player/queue");
}

export async function playUrisWithQueue(uris: string[], startIndex: number, deviceId?: string) {
  await playUris(uris, startIndex, deviceId);

  for (let i = startIndex + 1; i < uris.length; i++) {
    await addToQueue(uris[i], deviceId);
  }
}

/* =====================================================
 * Library
 * ===================================================== */

export async function getLikedSongs(limit = 50): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{
    items: { track: SpotifyTrack }[];
  }>(`/me/tracks?limit=${limit}`);

  return data.items.map((i) => i.track).filter(Boolean);
}

export async function getMyPlaylists(): Promise<SpotifyPlaylist[]> {
  const data = await spotifyFetch<{ items: SpotifyPlaylist[] }>("/me/playlists?limit=50");

  const playlists = data.items.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    uri: p.uri,
    images: p.images || [],
  }));

  return [likedSongsPlaylist, ...playlists];
}

export async function getPlaylistDetail(id: string): Promise<SpotifyPlaylist> {
  const data = await spotifyFetch<SpotifyPlaylist>(`/playlists/${id}`);

  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    uri: data.uri,
    images: data.images || [],
  };
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{
    items: { track: SpotifyTrack }[];
  }>(`/playlists/${playlistId}/tracks`);

  return data.items.map((i) => i.track).filter(Boolean);
}

export function addTrackToPlaylist(playlistId: string, trackUri: string) {
  return spotifyFetch<void>(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify({ uris: [trackUri] }),
  });
}

export async function getTopArtists(limit = 6): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<{ items: SpotifyArtist[] }>(`/me/top/artists?limit=${limit}`);

  return data.items.map((a) => ({
    id: a.id,
    name: a.name,
    uri: a.uri,
    images: a.images || [],
    genres: a.genres,
  }));
}

export async function geRecommendations(artistIds: string[] = [], market = "ID"): Promise<SpotifyPlaylist[]> {
  if (!artistIds.length) {
    const topArtists = await getTopArtists(10);
    artistIds = topArtists.map((a) => a.id);
  }

  if (!artistIds.length) return [];

  const playlists: SpotifyPlaylist[] = [];

  await Promise.all(
    artistIds.map(async (artistId) => {
      try {
        const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks?market=${market}`);
        if (!data.tracks.length) return;

        const track = data.tracks[0];
        playlists.push({
          id: `artist-${artistId}`,
          name: track.artists[0].name,
          description: `${track.artists.map((a) => a.name).join(", ")}`,
          uri: track.artists[0].uri,
          images: track.album.images || [],
        });
      } catch {
        // skip jika error
      }
    })
  );

  return playlists;
}
