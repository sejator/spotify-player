"use client";

import { SpotifyPlaylist } from "@/types/spotify.type";
import { Play, Pause } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import CustomImage from "@/app/components/CustomImage";

interface Props {
  playlist: SpotifyPlaylist;
  playingId: string | null;
  onPlay: (uri: string, id: string) => void;
  disableLink?: boolean;
  variant?: "grid" | "row";
  width?: number;
  height?: number;
}

export default function PlaylistCard({ playlist, playingId, onPlay, disableLink = false, variant = "grid", width = 192, height = 192 }: Props) {
  const isPlaying = playingId === playlist.id;
  const imageUrl = playlist.images?.[0]?.url;
  const link = playlist.id.startsWith("artist-") ? `/artist/${playlist.id.replace("artist-", "")}` : `/playlist/${playlist.id}`;

  /* ROW */
  if (variant === "row") {
    return (
      <div
        className={clsx(
          "group flex items-center gap-4 bg-spotify-surface-2 rounded-md overflow-hidden hover:bg-spotify-surface transition relative",
          isPlaying && "ring-2 ring-spotify-accent/40"
        )}
      >
        <CustomImage src={imageUrl} alt={playlist.name} width={width} height={height} className="w-16 h-16 shrink-0 rounded-md shadow-lg object-cover" />

        {disableLink ? (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{playlist.name}</p>
          </div>
        ) : (
          <Link href={link} className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate hover:underline">{playlist.name}</p>
          </Link>
        )}

        <button
          onClick={() => onPlay(playlist.uri, playlist.id)}
          className="mr-3 w-10 h-10 bg-spotify-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
        >
          {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" />}
        </button>
      </div>
    );
  }

  /* GRID */
  return (
    <div className={clsx("spotify-card group relative", isPlaying && "ring-1 ring-spotify-accent/25 shadow-lg shadow-spotify-accent/40")}>
      <div className="relative mb-3 overflow-hidden rounded">
        <CustomImage src={imageUrl} alt={playlist.name} width={width} height={height} className="w-full aspect-square object-cover" />

        <button
          onClick={() => onPlay(playlist.uri, playlist.id)}
          className="absolute right-3 bottom-3 w-12 h-12 bg-spotify-accent rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition cursor-pointer"
        >
          {isPlaying ? <Pause className="text-white" /> : <Play className="text-white" />}
        </button>
      </div>

      {disableLink ? (
        <div>
          <p className="font-semibold text-white truncate">{playlist.name}</p>
          <p className="text-sm text-spotify-muted truncate">{playlist.description || "Playlist Spotify"}</p>
        </div>
      ) : (
        <Link href={link} className="block">
          <p className="font-semibold text-white truncate hover:underline">{playlist.name}</p>
          <p className="text-sm text-spotify-muted truncate">{playlist.description || "Playlist Spotify"}</p>
        </Link>
      )}
    </div>
  );
}
