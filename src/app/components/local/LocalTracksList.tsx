"use client";

import { useEffect, useState } from "react";
import { Play, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { usePlayer } from "@/app/context/PlayerContext";
import { usePlayerStore } from "@/store/playerStore";
import { useLocalTracksStore } from "@/store/localTracksStore";
import { SpotifyTrack } from "@/types/spotify.type";
import { getPlaylistLocal } from "@/lib/playerLocalService";
import { logger } from "@/lib/logger";

const PAGE_SIZE = 5;

export default function LocalTracksList() {
  const { play, currentTrack } = usePlayer();
  const playerStore = usePlayerStore();
  const { tracks, setTracks } = useLocalTracksStore();
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(tracks.length / PAGE_SIZE);
  const pagedTracks = tracks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const fetchTracks = async () => {
    try {
      const res = await getPlaylistLocal();
      setTracks(res);
    } catch (err) {
      setTracks([]);
      logger("error", "LOCAL_TRACKS_LIST", "Failed to fetch tracks", err);
    }
  };

  useEffect(() => {
    fetchTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTrack = (track: SpotifyTrack) => {
    const uris = tracks.map((t) => t.uri);
    const index = tracks.findIndex((x) => x.uri === track.uri);
    playerStore.setQueue(uris, "local", index);
    play(track.uri);
  };

  return (
    <section className="rounded-xl bg-spotify-surface-3 p-4">
      <h3 className="text-sm font-semibold mb-3 text-spotify-white">Musik Lokal</h3>

      {tracks.length === 0 && <p className="text-xs text-spotify-muted">Tidak ada file audio</p>}

      <div className="space-y-2">
        {pagedTracks.map((t) => {
          const isPlaying = currentTrack?.uri === t.uri;
          return (
            <div key={t.uri} className="flex items-center justify-between text-xs text-spotify-muted hover:text-spotify-white transition">
              <span className={`truncate max-w-52 block line-clamp-1 ${isPlaying ? "text-spotify-green" : ""}`}>{t.name}</span>

              {isPlaying ? (
                <Volume2 size={16} className="text-spotify-green animate-pulse" />
              ) : (
                <button
                  onClick={() => playTrack(t)}
                  className="h-6 w-6 rounded-full bg-spotify-accent text-black flex items-center justify-center hover:scale-105 transition hover:text-white cursor-pointer"
                >
                  <Play size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-2 flex justify-center items-center gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-1 rounded-full bg-spotify-surface-2 hover:bg-spotify-surface-3 disabled:opacity-40">
            <ChevronLeft size={12} />
          </button>
          <span className="text-xs text-spotify-muted">
            {page + 1}/{totalPages}
          </span>
          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="p-1 rounded-full bg-spotify-surface-2 hover:bg-spotify-surface-3 disabled:opacity-40"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </section>
  );
}
