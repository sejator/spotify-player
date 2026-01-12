"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlayer } from "@/app/context/PlayerContext";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { SpotifyTrack, SpotifyArtist } from "@/types/spotify.type";
import { formatDuration } from "@/utils/format";
import { Play, Clock3, Volume2 } from "lucide-react";
import CenterBox from "@/app/components/CenterBox";
import CustomImage from "@/app/components/CustomImage";
import { usePlayerStore } from "@/store/playerStore";
import toast from "react-hot-toast";
import { getAlbumDetail, getAlbumTracks } from "@/lib/spotify/albumService";

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isTokenInvalid } = useSpotifyAuthStore();
  const { play, currentTrack } = usePlayer();
  const playerStore = usePlayerStore();

  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || isTokenInvalid) return;

    const load = async () => {
      try {
        const [albumData, albumTracks] = await Promise.all([getAlbumDetail(id), getAlbumTracks(id)]);

        setArtist(albumData);
        setTracks(albumTracks);
      } catch {
        toast.error("Gagal memuat artis");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, token, isTokenInvalid]);

  const playTrack = (track: SpotifyTrack) => {
    const index = tracks.findIndex((t) => t.uri === track.uri);
    const uris = tracks.map((t) => t.uri);

    playerStore.setQueue(uris, "spotify", index);
    play(uris[index]);
  };

  if (loading) {
    return (
      <CenterBox>
        <div className="w-12 h-12 border-4 border-spotify-accent border-t-transparent rounded-full animate-spin" />
      </CenterBox>
    );
  }

  if (!artist) {
    return (
      <CenterBox>
        <p className="text-white">Artis tidak ditemukan</p>
      </CenterBox>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-10">
      <div className="bg-linear-to-b from-spotify-surface-2 to-spotify-surface px-8 pt-10 pb-6 flex items-end gap-6">
        <CustomImage
          src={artist.images?.[0]?.url ? artist.images?.[0]?.url : "/images/playlist-fallback.png"}
          alt={artist.name}
          width={192}
          height={192}
          className="w-48 h-48 rounded-full object-cover shadow-lg"
        />

        <div>
          <p className="text-xs uppercase text-spotify-muted mb-2">Artis</p>
          <h1 className="text-4xl font-bold text-spotify-white mb-4">{artist.name}</h1>

          {tracks.length > 0 && (
            <button
              onClick={() => playTrack(tracks[0])}
              className="w-28 flex items-center justify-center gap-2 bg-spotify-green text-white font-semibold py-2 rounded-full hover:scale-105 transition"
            >
              <Play size={20} fill="currentColor" />
              Play
            </button>
          )}
        </div>
      </div>

      {/* TRACK LIST */}
      <div className="px-8 mt-6">
        <div className="grid grid-cols-[40px_1fr_80px] text-xs text-spotify-muted border-b border-spotify-border pb-2 mb-2">
          <span>#</span>
          <span>Judul</span>
          <span className="flex justify-center">
            <Clock3 size={14} />
          </span>
        </div>

        {tracks.map((t, i) => {
          const isPlaying = currentTrack?.id === t.id;

          return (
            <div key={t.id} onClick={() => playTrack(t)} className="group grid grid-cols-[40px_1fr_80px] items-center px-2 py-2 rounded hover:bg-spotify-surface-2 cursor-pointer">
              <div className="flex justify-center text-spotify-muted">
                {!isPlaying ? <span className="group-hover:hidden">{i + 1}</span> : <Volume2 size={16} className="text-spotify-green animate-pulse" />}
                <Play size={16} className="hidden group-hover:block text-spotify-green" fill="currentColor" />
              </div>

              <p className={`truncate ${isPlaying ? "text-spotify-green" : "text-white"}`}>{t.name}</p>

              <p className="text-xs text-spotify-muted text-center">{formatDuration(t.duration_ms)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
