"use client";

import { useEffect, useState } from "react";
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX, Upload, X } from "lucide-react";
import { SpotifyTrack } from "@/types/spotify.type";
import { getPlaylistAds, playAds, setAdsVolume, stopAds } from "@/lib/adsPlaybackService";
import { usePlayerStore } from "@/store/playerStore";
import clsx from "clsx";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const PAGE_SIZE = 4;

export default function AdsPanel() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [page, setPage] = useState(0);
  const { status, adsSource } = usePlayerStore();
  const [volume, setVolume] = useState(0.5);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const totalPages = Math.ceil(tracks.length / PAGE_SIZE);
  const pagedTracks = tracks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const [showAdsPopup, setShowAdsPopup] = useState(false);

  useEffect(() => {
    getPlaylistAds()
      .then(setTracks)
      .catch(() => setTracks([]));
  }, []);

  useEffect(() => {
    if (status === "ads") {
      setShowAdsPopup(true);
    } else {
      setShowAdsPopup(false);
    }
  }, [status]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    setAdsVolume(vol);
  };

  const handlePlayAds = (uri: string) => {
    const store = usePlayerStore.getState();
    if (store.status === "ads") return;
    if (store.status === "adzan" || store.status === "iqomah") {
      toast.error("Tidak dapat memutar iklan saat adzan atau iqomah berlangsung");
      return;
    }
    playAds(uri).catch((err) => {
      console.error("Gagal memutar iklan:", err);
    });
  };

  const handleCloseAds = () => {
    stopAds();
    setShowAdsPopup(false);
  };

  return (
    <section className="rounded-xl bg-spotify-surface-3 p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-sm font-semibold text-spotify-white">Iklan</h3>

          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-spotify-green hover:bg-spotify-green/80 transition"
            title="Upload iklan"
            disabled={status === "ads"}
          >
            <Upload size={12} />
            Upload
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-45 relative">
          {volume > 0 ? <Volume2 size={18} className="text-spotify-green shrink-0" /> : <VolumeX size={18} className="text-spotify-muted shrink-0" />}
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-spotify-muted font-medium">Vol. Iklan</span>

          <input
            type="range"
            value={volume}
            min={0}
            max={1}
            step={0.05}
            onChange={handleVolumeChange}
            className="w-full h-1 rounded-full accent-spotify-accent hover:accent-spotify-accent-hover"
          />

          <span className="text-[10px] text-spotify-muted w-8 text-right font-medium">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* List iklan */}
      {tracks.length === 0 && <p className="text-xs text-spotify-muted">Tidak ada iklan</p>}

      <div className="space-y-2">
        {pagedTracks.map((t) => {
          const isPlaying = status === "ads" && adsSource === t.uri;

          return (
            <div key={t.uri} className="flex items-center justify-between text-xs text-spotify-muted hover:text-spotify-white transition">
              <span className={clsx("truncate max-w-52", isPlaying && "text-yellow-400")}>{t.name}</span>

              {isPlaying ? (
                <Volume2 size={16} className="text-yellow-400 animate-pulse" />
              ) : (
                <button
                  onClick={() => handlePlayAds(t.uri)}
                  className="h-6 w-6 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:scale-105 transition hover:text-white cursor-pointer"
                >
                  <Play size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-2 flex justify-center items-center gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-1 rounded-full bg-spotify-surface-2 disabled:opacity-40">
            <ChevronLeft size={12} />
          </button>

          <span className="text-xs text-spotify-muted">
            {page + 1}/{totalPages}
          </span>

          <button disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)} className="p-1 rounded-full bg-spotify-surface-2 disabled:opacity-40">
            <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="w-full max-w-sm rounded-xl bg-spotify-surface p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold">Upload Audio</h4>
              <button onClick={() => setShowUpload(false)}>
                <X size={16} />
              </button>
            </div>

            <input
              type="file"
              accept="audio/*"
              className="text-xs file:bg-spotify-white file:text-black file:border-0 file:px-3 file:py-1 file:rounded file:cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (!file.type.startsWith("audio/")) {
                  toast.error("File harus audio");
                  return;
                }

                setUploading(true);

                try {
                  const form = new FormData();
                  form.append("file", file);

                  await fetch("/api/local-ads/upload", {
                    method: "POST",
                    body: form,
                  });

                  toast.success("Iklan berhasil diupload");
                  setShowUpload(false);

                  const data = await getPlaylistAds();
                  setTracks(data);
                } catch (err) {
                  console.error("Gagal upload iklan:", err);
                  toast.error("Gagal upload iklan");
                } finally {
                  setUploading(false);
                }
              }}
            />

            <p className="text-[10px] text-spotify-muted">Format: mp3, wav, ogg</p>

            <button disabled={uploading} className="w-full py-2 text-xs rounded bg-spotify-accent text-spotify-surface font-semibold disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Popup Iklan */}
      <AnimatePresence>
        {showAdsPopup && adsSource && (
          <motion.div
            key="ads-popup"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-80 md:w-1/3 bg-spotify-surface rounded-xl shadow-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <VolumeX size={22} className="text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Iklan sedang diputar</p>
                <p className="text-xs text-spotify-muted truncate max-w-50">{adsSource.replace("local:ads:", "")}</p>
              </div>
            </div>

            <button onClick={handleCloseAds} className="px-3 py-1 rounded bg-spotify-green text-spotify-surface text-sm font-medium hover:opacity-90 transition">
              Lanjutkan Musik
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
