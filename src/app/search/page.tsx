"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { search } from "@/lib/spotify/searchService";
import type { SpotifyTrack, SpotifyArtist, SpotifyAlbum } from "@/types/spotify.type";
import CenterBox from "@/app/components/CenterBox";
import ArtistGrid from "@/app/components/spotify/ArtistGrid";
import AlbumGrid from "@/app/components/spotify/AlbumGrid";
import TrackList from "@/app/components/spotify/TrackList";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { token } = useSpotifyAuthStore();

  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || !token) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await search(query);
        setTracks(res.tracks);
        setArtists(res.artists);
        setAlbums(res.albums);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [query, token]);

  if (!query) {
    return (
      <CenterBox>
        <p className="text-spotify-muted font-semibold">Cari lagu, artis, atau album</p>
      </CenterBox>
    );
  }

  if (loading || !token) {
    return (
      <CenterBox>
        <div className="w-10 h-10 border-4 border-spotify-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-spotify-muted">Memuat data...</p>
      </CenterBox>
    );
  }

  if (!loading && tracks.length === 0 && artists.length === 0 && albums.length === 0) {
    return (
      <CenterBox>
        <p className="text-spotify-muted">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
      </CenterBox>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 text-spotify-white">Results for &ldquo;{query}&rdquo;</h1>

      <TrackList tracks={tracks} />
      <ArtistGrid artists={artists} />
      <AlbumGrid albums={albums} />
    </main>
  );
}
