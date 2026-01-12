"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Clock3, Volume2, Upload, RefreshCcw, ChevronLeft, ChevronRight, Folder } from "lucide-react";
import { usePlayer } from "@/app/context/PlayerContext";
import { usePlayerStore } from "@/store/playerStore";
import { useLocalTracksStore } from "@/store/localTracksStore";
import { SpotifyTrack } from "@/types/spotify.type";
import CenterBox from "@/app/components/CenterBox";
import { logger } from "@/lib/logger";
import toast from "react-hot-toast";
import CustomImage from "@/app/components/CustomImage";
import { getPlaylistLocal } from "@/lib/playerLocalService";

const PAGE_SIZE = 10;

export default function LocalMusicPage() {
  const { play, currentTrack } = usePlayer();
  const playerStore = usePlayerStore();
  const { tracks, setTracks } = useLocalTracksStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await getPlaylistLocal();
      setTracks(res);
    } catch (err) {
      setTracks([]);
      logger("error", "LOCAL_MUSIC_PAGE", "Failed to fetch tracks", err);
    } finally {
      setLoading(false);
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

  const uploadFiles = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/local-tracks/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setFiles(null);
        fetchTracks();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      logger("error", "LOCAL_MUSIC_PAGE", "Upload failed", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const totalPages = Math.ceil(tracks.length / PAGE_SIZE);
  const pagedTracks = tracks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <CenterBox>
        <div className="w-12 h-12 border-4 border-spotify-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-white mt-4">Loading...</p>
      </CenterBox>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-10">
      {/* HEADER */}
      <div className="bg-linear-to-b from-spotify-surface-2 to-spotify-surface px-8 pt-10 pb-6 flex items-end gap-6">
        <CustomImage src="/images/playlist-fallback.png" alt="Musik Lokal" width={192} height={192} className="w-48 h-48 object-cover shadow-lg rounded-md" />

        <div className="flex flex-col justify-end">
          <p className="text-xs uppercase text-spotify-muted mb-2">Musik Lokal</p>
          <h1 className="text-4xl font-bold mb-2 text-spotify-white">Daftar Lagu</h1>
          <p className="text-sm text-spotify-muted mb-4">{tracks.length} lagu</p>

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

      {/* UPLOAD */}
      <div className="px-8 mt-6 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files;
              if (!selected || selected.length === 0) return;

              setFiles(selected);
              toast.success(`${selected.length} file siap di-upload`);
            }}
            onClick={() => {
              const el = inputRef.current;
              if (!el) return;

              el.setAttribute("webkitdirectory", "");
              el.setAttribute("directory", "");
            }}
          />

          <button
            type="button"
            onClick={() => {
              toast("Pilih folder yang berisi musik lokal", { icon: <Folder size={16} className="text-orange-400" /> });
              inputRef.current?.click();
            }}
            className="px-4 py-2 bg-spotify-accent text-spotify-white rounded flex items-center gap-2 hover:scale-105 transition"
          >
            <Upload size={16} />
            Pilih Folder Musik
          </button>

          <button
            type="button"
            disabled={!files || files.length === 0 || uploading}
            onClick={uploadFiles}
            className="px-4 py-2 bg-spotify-accent text-black rounded flex items-center gap-2 hover:scale-105 transition disabled:opacity-40"
          >
            {uploading ? (
              <>
                <RefreshCcw size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-spotify-muted">
          {files ? <span>{files.length} file dipilih</span> : <span>Pilih folder yang berisi file audio (MP3, WAV, M4A, OGG, dll)</span>}
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
          const isPlaying = currentTrack?.uri === t.uri;
          return (
            <div
              key={t.uri}
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
                <p className="text-xs text-spotify-muted truncate max-w-52 block line-clamp-1">{t.artists[0]?.name}</p>
              </div>

              <p className="text-xs text-spotify-muted truncate max-w-52 block line-clamp-1">{t.artists[0]?.name}</p>
              <p className="text-xs text-spotify-muted text-center">{t.album.name}</p>
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
