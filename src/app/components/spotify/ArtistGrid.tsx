"use client";

import Link from "next/link";
import CustomImage from "@/app/components/CustomImage";
import type { SpotifyArtist } from "@/types/spotify.type";

interface ArtistGridProps {
  artists: SpotifyArtist[];
}

export default function ArtistGrid({ artists }: ArtistGridProps) {
  if (!artists || artists.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-spotify-white mb-3">Artis</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {artists.map((a) => (
          <Link key={a.id} href={`/artist/${a.id}`} className="flex flex-col items-center cursor-pointer hover:scale-105 transition">
            <div className="w-28 h-28 rounded-full overflow-hidden shrink-0">
              <CustomImage src={a.images?.[0]?.url ?? "/images/artist-fallback.png"} alt={a.name} width={112} height={112} className="object-cover w-full h-full" />
            </div>

            <p className="text-xs text-center mt-2 text-spotify-white truncate w-full hover:underline">{a.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
