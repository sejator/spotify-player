"use client";

import CustomImage from "@/app/components/CustomImage";
import { Play, Volume2, Clock3 } from "lucide-react";
import type { SpotifyTrack } from "@/types/spotify.type";
import { usePlayer } from "@/app/context/PlayerContext";
import { formatDuration } from "@/utils/format";

interface TrackListProps {
  tracks: SpotifyTrack[];
}

export default function TrackList({ tracks }: TrackListProps) {
  const { play, currentTrack } = usePlayer();

  if (!tracks || tracks.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-spotify-white mb-3">Lagu</h2>

      <div className="grid grid-cols-[40px_56px_1fr_80px] gap-4 px-3 py-2 text-xs text-spotify-muted uppercase border-b border-spotify-border">
        <span className="text-center flex justify-center items-center">#</span>
        <span>Cover</span>
        <span>Judul & Artis</span>
        <span className="text-center flex justify-center items-center">
          <Clock3 size={12} />
        </span>
      </div>

      {/* LIST TRACK */}
      <div className="space-y-1">
        {tracks.map((t, i) => {
          const isPlaying = currentTrack?.id === t.id;

          return (
            <div
              key={t.id}
              onClick={() => play(t.uri)}
              className={`
                group grid grid-cols-[40px_56px_1fr_80px] gap-4
                items-center px-3 py-2 rounded cursor-pointer
                hover:bg-spotify-surface-2 transition
                ${isPlaying ? "bg-spotify-surface-2" : ""}
              `}
            >
              <div className="flex justify-center items-center text-spotify-muted">
                {!isPlaying && (
                  <>
                    <span className="group-hover:hidden text-sm">{i + 1}</span>
                    <Play size={16} className="hidden group-hover:block text-spotify-green" fill="currentColor" />
                  </>
                )}
                {isPlaying && <Volume2 size={16} className="text-spotify-green animate-pulse" />}
              </div>

              <CustomImage src={t.album.images?.[0]?.url ?? "/images/playlist-fallback.png"} alt={t.name} width={48} height={48} className="rounded object-cover" />

              <div className="overflow-hidden">
                <p className={`text-sm truncate ${isPlaying ? "text-spotify-green" : "text-spotify-white"}`}>{t.name}</p>
                <p className="text-xs text-spotify-muted truncate">{t.artists.map((a) => a.name).join(", ")}</p>
              </div>

              <p className="text-xs text-spotify-muted text-center flex justify-center items-center">{formatDuration(t.duration_ms)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
