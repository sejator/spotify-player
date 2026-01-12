"use client";

import Link from "next/link";
import CustomImage from "@/app/components/CustomImage";
import type { SpotifyAlbum } from "@/types/spotify.type";

interface AlbumGridProps {
  albums: SpotifyAlbum[];
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
  if (!albums || albums.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-spotify-white mb-3">Album</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albums.map((al) => (
          <Link key={al.id} href={`/album/${al.id}`} className="flex flex-col items-center cursor-pointer hover:scale-105 transition">
            <div className="w-28 h-28 overflow-hidden shrink-0 rounded-md">
              <CustomImage src={al.images?.[0]?.url ?? "/images/playlist-fallback.png"} alt={al.name} width={112} height={112} className="object-cover w-full h-full" />
            </div>

            <p className="text-xs text-center mt-2 text-spotify-white truncate w-full hover:underline">{al.name}</p>

            <p className="text-[10px] text-spotify-muted truncate w-full text-center">{al.artists.map((a) => a.name).join(", ")}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
