import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { SpotifyTrack } from "@/types/spotify.type";

const MUSIC_DIR = path.join(process.cwd(), "public/music");

function scan(dir: string, base = ""): SpotifyTrack[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const tracks: SpotifyTrack[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      tracks.push(...scan(fullPath, relPath));
      continue;
    }

    if (!/\.(mp3|wav|ogg|m4a)$/i.test(entry.name)) continue;

    const parts = relPath.split(path.sep);
    const artist = parts.at(-3) ?? "Local Artist";
    const album = parts.at(-2) ?? "Local Library";
    const fileName = parts.at(-1)!;

    const uriPath = parts.join("/"); // ← penting
    const uri = `local:track:${uriPath}`;

    tracks.push({
      id: uri,
      uri,
      name: fileName.replace(/\.[^/.]+$/, ""),
      duration_ms: 0,
      artists: [{ id: artist, name: artist, uri: artist }],
      album: {
        name: album,
        images: [
          {
            url: "/images/playlist-fallback.png",
            width: 300,
            height: 300,
          },
        ],
      },
    });
  }

  return tracks;
}

export async function GET() {
  const data = scan(MUSIC_DIR);
  return NextResponse.json({ data });
}
