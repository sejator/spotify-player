"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlayer } from "@/app/context/PlayerContext";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { SpotifyTrack, SpotifyPlaylist } from "@/types/spotify.type";
import toast from "react-hot-toast";
import { getPlaylistTracks, getPlaylistDetail, getLikedSongs } from "@/lib/spotify/playerService";
import { logger } from "@/lib/logger";
import { formatDuration } from "@/utils/format";
import { Play, Clock3, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import CenterBox from "@/app/components/CenterBox";
import CustomImage from "@/app/components/CustomImage";
import { usePlayerStore } from "@/store/playerStore";

const PAGE_SIZE = 10;

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isTokenInvalid } = useSpotifyAuthStore();
  const { play, currentTrack } = usePlayer();
  const playerStore = usePlayerStore();

  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const isLikedSongs = id === "liked-songs";

  useEffect(() => {
    if (!token || isTokenInvalid) return;

    const loadData = async () => {
      try {
        if (isLikedSongs) {
          const tracks = await getLikedSongs();
          setPlaylist({
            id: "liked-songs",
            name: "Liked Songs",
            description: "Lagu yang kamu sukai di Spotify",
            uri: "spotify:user:me:collection",
            images: [],
          });
          setTracks(tracks);
        } else {
          const [playlistDetail, playlistTracks] = await Promise.all([getPlaylistDetail(id), getPlaylistTracks(id)]);

          setPlaylist({
            id: playlistDetail.id,
            name: playlistDetail.name,
            description: playlistDetail.description,
            uri: playlistDetail.uri,
            images: playlistDetail.images,
          });

          setTracks(playlistTracks);
        }
      } catch (e) {
        toast.error("Gagal memuat playlist");
        logger("error", "SPOTIFY", "Error load playlist:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, token, isTokenInvalid, isLikedSongs]);

  const playTrack = (track: SpotifyTrack) => {
    const index = tracks.findIndex((x) => x.uri === track.uri);

    playerStore.setQueue(
      tracks.map((t) => t.uri),
      "spotify",
      index
    );

    if (isLikedSongs) {
      play({
        uris: tracks.map((t) => t.uri),
        startIndex: index,
      });
    } else {
      play(playlist!.uri, { offset: index });
    }
  };

  if (loading) {
    return (
      <CenterBox>
        <div className="w-12 h-12 border-4 border-spotify-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-white mt-4">Loading...</p>
      </CenterBox>
    );
  }

  if (!playlist) {
    return (
      <CenterBox>
        <p className="text-white">Playlist tidak ditemukan</p>
      </CenterBox>
    );
  }

  const totalPages = Math.ceil(tracks.length / PAGE_SIZE);
  const pagedTracks = tracks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="h-full overflow-y-auto pb-10">
      {/* HEADER */}
      <div className="bg-linear-to-b from-spotify-surface-2 to-spotify-surface px-8 pt-10 pb-6 flex items-end gap-6">
        <CustomImage src={playlist.images?.[0]?.url} alt={playlist.name} width={192} height={192} className="w-48 h-48 object-cover shadow-lg rounded-md" />

        <div className="flex flex-col justify-end">
          <p className="text-xs uppercase text-spotify-muted mb-2">{isLikedSongs ? "Koleksi" : "Playlist"}</p>
          <h1 className="text-4xl font-bold mb-2 text-spotify-white">{playlist.name}</h1>

          {playlist.description && <p className="text-sm text-spotify-muted mb-4 max-w-md line-clamp-2">{playlist.description}</p>}

          {tracks.length > 0 && (
            <button
              onClick={() => playTrack(tracks[0])}
              className="w-28 flex items-center justify-center gap-2 bg-spotify-green text-white font-semibold py-2 rounded-full hover:scale-105 transition cursor-pointer"
            >
              <Play size={20} fill="currentColor" />
              Play
            </button>
          )}
        </div>
      </div>

      {/* TRACK LIST */}
      <div className="px-8 mt-6">
        <div className="grid grid-cols-[40px_1fr_1fr_80px] text-xs text-spotify-muted border-b border-spotify-border pb-2 mb-2">
          <span className="text-center flex justify-center items-center">#</span>
          <span>Judul</span>
          <span>Album</span>
          <span className="flex justify-center items-center">
            <Clock3 size={14} />
          </span>
        </div>

        {pagedTracks.map((t, i) => {
          const isPlaying = currentTrack?.id === t.id;

          return (
            <div
              key={t.id}
              onClick={() => playTrack(t)}
              className="group grid grid-cols-[40px_1fr_1fr_80px] items-center px-2 py-2 rounded hover:bg-spotify-surface-2 cursor-pointer"
            >
              <div className="text-center flex justify-center items-center text-spotify-muted">
                {!isPlaying && (
                  <>
                    <span className="group-hover:hidden text-sm">{page * PAGE_SIZE + i + 1}</span>
                    <Play size={16} className="hidden group-hover:block text-spotify-green" fill="currentColor" />
                  </>
                )}

                {isPlaying && <Volume2 size={16} className="text-spotify-green animate-pulse" />}
              </div>

              <div className="overflow-hidden">
                <p className={`text-sm truncate max-w-52 block line-clamp-1 ${isPlaying ? "text-spotify-green" : "text-spotify-white"}`}>{t.name}</p>
                <p className="text-xs text-spotify-muted truncate">{t.artists.map((a) => a.name).join(", ")}</p>
              </div>

              <p className="text-sm text-spotify-muted truncate max-w-52 block line-clamp-1">{t.album?.name}</p>

              <p className="text-xs text-spotify-muted text-center">{formatDuration(t.duration_ms)}</p>
            </div>
          );
        })}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-1 rounded-full bg-spotify-surface-2 hover:bg-spotify-surface-3 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-spotify-muted">
              Halaman {page + 1} dari {totalPages}
            </span>
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-1 rounded-full bg-spotify-surface-2 hover:bg-spotify-surface-3 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
