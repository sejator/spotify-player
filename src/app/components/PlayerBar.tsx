"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/app/context/PlayerContext";
import { usePlayerStore } from "@/store/playerStore";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat1, Repeat, XCircleIcon, List } from "lucide-react";
import { formatDuration } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { endIqomah, stopAdzanAudio } from "@/lib/adzan";
import Image from "next/image";
import Link from "next/link";
import { useIqomahTimer } from "@/hooks/useIqomahTimer";
import { useAdzanPopup } from "@/hooks/useAdzanPopup";
import { useVolume } from "@/hooks/useVolume";
import { useSpotifyQueue } from "@/hooks/useSpotifyQueue";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

export default function PlayerBar() {
  const { togglePlay, play, next, prev, seek, toggleRepeat, toggleShuffle, currentTrack, isPaused, isReady } = usePlayer();

  const adzanStatus = usePlayerStore((s) => s.status);
  const isAdzan = adzanStatus === "adzan";
  const isIqomah = adzanStatus === "iqomah";
  const isAdzanBlocking = isAdzan || isIqomah;

  const position = usePlayerStore((s) => s.positionMs);
  const duration = usePlayerStore((s) => s.durationMs);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);

  const [queueOpen, setQueueOpen] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  const iqomahTimeLeft = useIqomahTimer();
  const [showAdzanPopup, setShowAdzanPopup] = useAdzanPopup();
  const [volume, setVolume] = useVolume(50, isAdzanBlocking);
  const { spotifyQueue, fetchSpotifyQueue } = useSpotifyQueue();

  const isLocalTrack = currentTrack?.uri?.startsWith("local:track:");
  const controlsDisabled = isAdzanBlocking || (!isLocalTrack && !isReady);
  const imageUrl = currentTrack?.album.images[0]?.url as StaticImport | string;

  const forceCloseAdzan = async () => {
    stopAdzanAudio();
    endIqomah("force");
    setShowAdzanPopup(false);
  };

  useEffect(() => {
    if (queueOpen) fetchSpotifyQueue();
  }, [queueOpen, fetchSpotifyQueue]);

  useEffect(() => {
    if (currentTrack) fetchSpotifyQueue();
  }, [currentTrack, fetchSpotifyQueue]);

  useEffect(() => {
    if (currentTrack) {
      const artistNames = currentTrack.artists?.map((a) => a.name).join(", ");
      document.title = `${currentTrack.name} - ${artistNames}`;
    } else {
      document.title = "Pemutar Musik Spotify & Audio Lokal";
    }
  }, [currentTrack]);

  const playQueue = async (index: number) => {
    if (!spotifyQueue.length) return;
    const uris = spotifyQueue.slice(index).map((t) => t.uri);
    if (!uris.length) return;

    const store = usePlayerStore.getState();
    store.setQueue(uris, "spotify", 0);

    await play({
      uris,
      startIndex: 0,
    });
  };

  return (
    <footer className="h-24 px-6 bg-spotify-surface border-t border-white/5 flex items-center relative">
      {/* TRACK INFO */}
      <div className="w-1/3 flex items-center gap-3 min-w-0">
        <div className="relative">
          <Image
            src={imageUrl || "/images/playlist-fallback.png"}
            alt={currentTrack?.name ?? "Tidak ada lagu"}
            width={45}
            height={45}
            className="rounded object-cover bg-white cursor-pointer hover:scale-105 transition"
            onClick={() => currentTrack && console.log("Go to album", currentTrack.album.images[0]?.url)}
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="relative overflow-hidden w-65">
            <p className={`text-sm font-medium text-spotify-white ${isPaused ? "truncate" : "whitespace-nowrap animate-marquee"}`}>{currentTrack?.name ?? "Tidak ada lagu"}</p>
          </div>
          <p className="text-xs text-spotify-muted truncate">
            {currentTrack?.artists?.map((artist, index) => (
              <span key={artist.uri}>
                {artist.uri.startsWith("local:track") ? (
                  <span className="text-spotify-white">{artist.name}</span>
                ) : (
                  <Link href={`/artist/${artist.uri.replace("spotify:artist:", "")}`} className="hover:underline text-spotify-white">
                    {artist.name}
                  </Link>
                )}
                {index < currentTrack.artists.length - 1 ? ", " : ""}
              </span>
            )) ?? "-"}
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="w-1/3 flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <ControlButton disabled={controlsDisabled} onClick={toggleShuffle}>
            <Shuffle size={16} className={`cursor-pointer ${shuffle ? "text-spotify-green" : ""}`} />
          </ControlButton>

          <ControlButton disabled={controlsDisabled} onClick={prev}>
            <SkipBack size={18} className="cursor-pointer" />
          </ControlButton>

          <button
            disabled={controlsDisabled}
            onClick={togglePlay}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition
                ${controlsDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-spotify-green cursor-pointer hover:scale-105"}`}
          >
            {isPaused ? <Play size={20} className="text-spotify-white ml-0.5" /> : <Pause size={20} className="text-spotify-white" />}
          </button>

          <ControlButton disabled={controlsDisabled} onClick={next}>
            <SkipForward size={18} className="cursor-pointer" />
          </ControlButton>

          <ControlButton disabled={controlsDisabled} onClick={toggleRepeat}>
            {repeat === "one" ? (
              <Repeat1 size={16} className="text-spotify-green cursor-pointer" />
            ) : (
              <Repeat size={16} className={repeat !== "off" ? "text-spotify-green cursor-pointer" : "cursor-pointer"} />
            )}
          </ControlButton>

          <ControlButton disabled={controlsDisabled} onClick={() => setQueueOpen(!queueOpen)}>
            <List size={16} className="cursor-pointer" />
          </ControlButton>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full max-w-130 text-xs text-spotify-muted relative">
          <span className="w-10 text-right">{formatDuration(position)}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={position}
              disabled={controlsDisabled}
              onChange={(e) => seek(Number(e.target.value))}
              onMouseMove={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = Math.min(Math.max(0, x), rect.width) / rect.width;
                setHoverTime(Math.floor(duration * percent));
                setHoverX(x);
              }}
              onMouseLeave={() => setHoverTime(null)}
              className="w-full accent-spotify-accent h-1"
            />
            {hoverTime !== null && (
              <div className="absolute -top-5 px-1 text-xs bg-black/70 rounded text-white pointer-events-none" style={{ left: hoverX, transform: "translateX(-50%)" }}>
                {formatDuration(hoverTime)}
              </div>
            )}
          </div>
          <span className="w-10">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* VOLUME */}
      <div className="w-1/3 flex items-center justify-end gap-3">
        {volume > 0 ? <Volume2 size={20} className="text-spotify-green" /> : <VolumeX size={20} className="text-spotify-muted" />}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          disabled={isAdzanBlocking}
          onChange={(e) => setVolume(Number(e.target.value))}
          className={`w-28 accent-spotify-accent h-1 ${isAdzanBlocking ? "opacity-40 cursor-not-allowed" : ""}`}
        />
        <span className="text-xs text-spotify-muted text-right font-medium">{Math.round(volume)}%</span>
      </div>

      {/* ADZAN / IQOMAH */}
      <AnimatePresence>
        {showAdzanPopup && (
          <motion.div
            key="adzan-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative bg-spotify-surface px-6 py-5 rounded-xl shadow-xl text-center w-75"
            >
              <button onClick={forceCloseAdzan} className="absolute -top-2 -right-2 text-spotify-muted hover:text-white transition cursor-pointer">
                <XCircleIcon size={28} />
              </button>
              <VolumeX size={22} className="mx-auto mb-3 text-yellow-400" />
              <p className="text-sm font-semibold text-yellow-400">{isAdzan ? "Adzan sedang berlangsung" : "Iqomah berlangsung"}</p>
              {isIqomah && <p className="text-xs text-spotify-muted mt-1">Sisa waktu {formatDuration(iqomahTimeLeft)}</p>}
              <button
                onClick={forceCloseAdzan}
                className="mt-4 w-full py-2 rounded-md bg-spotify-green text-spotify-surface text-sm font-medium hover:opacity-90 transition cursor-pointer"
              >
                Lanjutkan Musik
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUEUE POPUP */}
      <AnimatePresence>
        {queueOpen && (
          <motion.div
            key="queue-popup"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-72 bg-spotify-surface rounded-xl shadow-xl p-4 max-h-96 flex flex-col"
          >
            <button onClick={() => setQueueOpen(false)} className="absolute -top-1 -right-1 text-spotify-muted hover:text-white transition cursor-pointer" aria-label="Close queue">
              <XCircleIcon size={24} />
            </button>

            <div className="mb-4 shrink-0">
              <h3 className="text-sm font-semibold text-spotify-white mb-2">Queue</h3>

              {currentTrack && (
                <div>
                  <h4 className="text-xs font-semibold text-spotify-muted mb-2">Now playing</h4>
                  <div className="flex gap-2 items-center cursor-default rounded px-1 py-1 bg-white/10">
                    <div className="relative w-8 h-8 shrink-0">
                      <Image src={currentTrack.album.images[0]?.url || "/images/playlist-fallback.png"} alt={currentTrack.name} fill className="rounded object-cover" />
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="text-spotify-green truncate font-semibold">{currentTrack.name}</p>
                      <p className="text-xs text-spotify-muted truncate">
                        {currentTrack?.artists?.map((artist, index) => (
                          <span key={artist.uri}>
                            {artist.uri.startsWith("local:track") ? (
                              <span className="text-spotify-white">{artist.name}</span>
                            ) : (
                              <Link href={`/artist/${artist.uri.replace("spotify:artist:", "")}`} className="hover:underline text-spotify-white">
                                {artist.name}
                              </Link>
                            )}
                            {index < currentTrack.artists.length - 1 ? ", " : ""}
                          </span>
                        )) ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col overflow-y-auto">
              <h4 className="text-xs font-semibold text-spotify-muted mb-2">Next up</h4>
              <ul className="text-xs space-y-2">
                {spotifyQueue
                  .filter((track) => track.uri !== currentTrack?.uri)
                  .map((track, i) => (
                    <li key={`${track.uri}-${i}`} className="group flex gap-2 items-center cursor-pointer rounded px-1 py-1 hover:bg-white/5">
                      <div className="relative w-8 h-8 shrink-0" onClick={() => playQueue(i)}>
                        <Image
                          src={track.album.images[0]?.url || "/images/playlist-fallback.png"}
                          alt={track.name}
                          fill
                          className="rounded object-cover transition group-hover:brightness-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play size={16} className="text-white fill-white drop-shadow" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-spotify-white truncate">{track.name}</p>
                        <p className="text-xs text-spotify-muted truncate">
                          {track.artists?.map((artist, index) => (
                            <span key={artist.uri}>
                              {artist.uri.startsWith("local:track") ? (
                                <span className="text-spotify-white">{artist.name}</span>
                              ) : (
                                <Link href={`/artist/${artist.uri.replace("spotify:artist:", "")}`} className="hover:underline text-spotify-white">
                                  {artist.name}
                                </Link>
                              )}
                              {index < track.artists.length - 1 ? ", " : ""}
                            </span>
                          )) ?? "-"}
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}

function ControlButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick} className={`text-spotify-muted hover:text-spotify-white transition ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );
}
