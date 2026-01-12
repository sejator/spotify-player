"use client";

import Link from "next/link";
import { useMemo } from "react";
import PlaylistCard from "@/app/components/spotify/PlaylistCard";
import CenterBox from "@/app/components/CenterBox";

import { usePlayer } from "@/app/context/PlayerContext";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { useSpotifyPlaylistStore } from "@/store/spotifyPlaylistStore";

export default function HomePage() {
  const { token, isTokenInvalid, isPremium, splashcreenShown } = useSpotifyAuthStore();
  const { play, currentTrack } = usePlayer();
  const { playlists, recommendations, recentlyPlayed } = useSpotifyPlaylistStore();

  const playingId = currentTrack?.id ?? null;
  const handlePlay = (uri: string) => play(uri);

  const recommendationsWithKey = useMemo(
    () =>
      recommendations.map((p) => ({
        ...p,
        _key: crypto.randomUUID(),
      })),
    [recommendations]
  );

  const uniqueRecentlyPlayed = useMemo(() => {
    const seen = new Set<string>();

    return recentlyPlayed.filter((track) => {
      if (!track.id) return false;

      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    });
  }, [recentlyPlayed]);

  /* LOADING STATES */
  if (splashcreenShown) {
    return (
      <CenterBox>
        <div className="w-10 h-10 border-4 border-spotify-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-spotify-muted">Memuat data...</p>
      </CenterBox>
    );
  }

  if (!token || (isTokenInvalid && !splashcreenShown)) {
    return (
      <CenterBox>
        <h1 className="text-xl font-bold text-white">Login Spotify Diperlukan</h1>
        <p className="text-sm text-spotify-muted max-w-md text-center">Untuk memutar playlist, silakan login menggunakan akun Spotify Premium.</p>

        <Link
          href="/api/spotify/login"
          className="mt-4 inline-flex items-center justify-center
            bg-spotify-accent text-black
            px-6 py-2.5 rounded-full
            text-sm font-semibold
            hover:scale-105 transition"
        >
          Login Spotify
        </Link>
      </CenterBox>
    );
  }

  if (!isPremium && !splashcreenShown) {
    return (
      <CenterBox>
        <h1 className="text-xl font-bold text-white flex flex-col items-center gap-1">
          <span>Fitur ini hanya untuk akun</span>
          <span>Spotify Minimal Paket Premium Standard</span>
        </h1>
        <p className="text-sm text-spotify-muted max-w-md text-center py-2">Fitur pemutaran hanya tersedia untuk akun Spotify Premium.</p>

        <Link
          href="https://www.spotify.com/id-id/premium/#plans"
          target="_blank"
          className="mt-4 inline-flex items-center justify-center
            bg-spotify-accent text-black
            px-6 py-2.5 rounded-full
            text-sm font-semibold
            hover:scale-105 transition"
        >
          Upgrade Premium
        </Link>
      </CenterBox>
    );
  }

  return (
    <div className="space-y-12 px-5 pt-6 pb-10">
      {/* Playlist Disimpan */}
      <HomeSection title="Playlist Disimpan">
        <div className="grid grid-cols-2 gap-3">
          {playlists.slice(0, 6).map((p) => (
            <PlaylistCard key={p.id} playlist={p} variant="row" playingId={playingId} onPlay={handlePlay} width={48} height={48} />
          ))}
        </div>
      </HomeSection>

      {/* Terakhir Diputar */}
      <HomeSection title="Terakhir Diputar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {uniqueRecentlyPlayed.slice(0, 10).map((t) => (
            <PlaylistCard
              key={t.id}
              playlist={{
                id: t.id,
                name: t.name,
                uri: t.uri,
                images: t.album.images,
                description: t.artists.map((a) => a.name).join(", "),
              }}
              playingId={playingId}
              onPlay={handlePlay}
              disableLink
            />
          ))}
        </div>
      </HomeSection>

      {/* Populer / Rekomendasi */}
      <HomeSection title="Populer">
        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
          {recommendationsWithKey.map((p) => (
            <div key={p._key} className="min-w-40">
              <PlaylistCard playlist={p} playingId={playingId} onPlay={handlePlay} />
            </div>
          ))}
        </div>
      </HomeSection>
    </div>
  );
}

function HomeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 text-xl font-bold tracking-tight text-white">{title}</h2>
      {children}
    </section>
  );
}
