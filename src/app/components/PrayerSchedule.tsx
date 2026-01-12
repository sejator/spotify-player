"use client";

import { useEffect, useState } from "react";
import { PlayCircle, RefreshCcw, StopCircle, Volume2, VolumeX } from "lucide-react";

import { JadwalHarian, STORAGE_KEY } from "@/types/jadwalSholat.type";
import { getSettingByKey } from "@/lib/settings";
import { getNextSholat } from "@/utils/checkAdzan";

import { usePlayerStore } from "@/store/playerStore";
import { useSettingStore } from "@/store/settingStore";

import { adzanEvents, initAdzanDebug, initAdzanSetup, setAdzanVolume, startAdzanScheduler, stopAdzanScheduler } from "@/lib/adzan";
import toast from "react-hot-toast";
import { stopAds } from "@/lib/adsPlaybackService";
import JamDigital from "./JamDigital";
import { initDebugJadwal } from "@/lib/debugJadwal";

export default function PrayerSchedule() {
  const { status, startAdzan, endAdzan } = usePlayerStore();
  const { notifAdzan, loadNotifAdzan, setDelayIqomah } = useSettingStore();

  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));

  const [jadwal, setJadwal] = useState<JadwalHarian | null>(null);
  const [nextSholat, setNextSholat] = useState<{
    name: string;
    time: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    }, 60 * 1000); // cek setiap 1 menit

    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    const cleanup = initDebugJadwal({ jadwal, setJadwal, currentDate, setNextSholat });
    return cleanup;
  }, [jadwal, currentDate]);

  useEffect(() => {
    loadNotifAdzan();
  }, [loadNotifAdzan]);

  useEffect(() => {
    (async () => {
      const delay = await getSettingByKey("delayIqomah");
      setDelayIqomah(Number(delay?.value || 0));

      initAdzanDebug();
      initAdzanSetup();
    })();
  }, [setDelayIqomah]);

  const fetchJadwal = async () => {
    setLoading(true);

    const kota = await getSettingByKey("kotaId");
    const kotaId = kota ? String(kota.value) : null;

    if (!kotaId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/jadwal/today?kotaId=${kotaId}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.data) {
        setJadwal(json.data);

        // hapus jadwal lama di localStorage
        for (const key in localStorage) {
          if (key.startsWith("adzan_played_") && key !== `adzan_played_${currentDate}`) {
            localStorage.removeItem(key);
          }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tanggal: currentDate, data: json.data }));
        toast.success("Jadwal sholat berhasil diperbarui");
      } else {
        setJadwal(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil jadwal sholat");
      setJadwal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.tanggal === currentDate) {
        setJadwal(parsed.data);
        setLoading(false);
        return;
      }
    }

    fetchJadwal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  useEffect(() => {
    if (!jadwal) return;

    const update = () => setNextSholat(getNextSholat(jadwal));
    update();

    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [jadwal]);

  useEffect(() => {
    stopAdzanScheduler();

    if (!jadwal || !notifAdzan) return;

    startAdzanScheduler(jadwal, currentDate);

    return () => stopAdzanScheduler();
  }, [jadwal, currentDate, notifAdzan]);

  useEffect(() => {
    setAdzanVolume(volume);
  }, [volume]);

  const isAdzanPlaying = status === "adzan";

  return (
    <section className="rounded-xl bg-spotify-surface-3 p-4 space-y-2">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-spotify-white">Jadwal Sholat</h3>
        <span className="text-xs text-spotify-muted">{jadwal?.kota ?? "-"}</span>
      </div>

      {/* CLOCK */}
      <JamDigital jadwal={jadwal} onNextSholatUpdate={setNextSholat} />

      {/* LIST */}
      {loading ? (
        <p className="text-xs text-spotify-muted h-29 flex items-center justify-center">Loading...</p>
      ) : !jadwal ? (
        <p className="text-xs text-center text-spotify-muted">Jadwal belum tersedia</p>
      ) : (
        <ul className="space-y-1 text-xs text-spotify-muted">
          {[
            ["Imsak", jadwal.imsak],
            ["Subuh", jadwal.subuh],
            ["Dzuhur", jadwal.dzuhur],
            ["Ashar", jadwal.ashar],
            ["Maghrib", jadwal.maghrib],
            ["Isya", jadwal.isya],
          ].map(([l, v]) => (
            <li key={l} className="flex justify-between">
              <span>{l}</span>
              <span className="tabular-nums">{v}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CONTROLS */}
      <div className="pt-3 border-t border-spotify-surface-2 space-y-3">
        <div className="flex justify-between text-xs">
          <span>Status Adzan</span>
          <span className={`font-semibold ${notifAdzan ? "text-green-400" : "text-spotify-muted"}`}>{notifAdzan ? "Aktif" : "Nonaktif"}</span>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xs relative">
          {volume > 0 ? <Volume2 size={20} className="text-spotify-green" /> : <VolumeX size={20} className="text-spotify-muted" />}
          <input
            type="range"
            value={volume}
            min={0}
            max={1}
            step={0.05}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 rounded-full accent-spotify-accent hover:accent-spotify-accent-hover"
          />
          <span className="text-xs text-spotify-muted text-right font-medium">{Math.round(volume * 100)}%</span>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={() => {
              if (isAdzanPlaying) {
                endAdzan();
                adzanEvents.emit("adzan:stop");
              } else {
                stopAds();
                startAdzan(nextSholat ? nextSholat.name : "");
                adzanEvents.emit("adzan:start");
              }
            }}
            className={`w-full h-8 rounded-full text-xs font-semibold flex items-center justify-center gap-2 text-spotify-white hover:text-spotify-white transition hover:bg-spotify-green/80 cursor-pointer ${
              isAdzanPlaying ? "bg-red-700 hover:bg-red-800" : "bg-spotify-accent hover:opacity-90"
            }`}
          >
            {isAdzanPlaying ? (
              <>
                <StopCircle size={16} />
                Stop Adzan
              </>
            ) : (
              <>
                <PlayCircle size={16} />
                Test Adzan
              </>
            )}
          </button>

          <button
            onClick={fetchJadwal}
            className="w-full h-8 rounded-full text-xs font-semibold flex items-center justify-center gap-2 bg-spotify-green text-spotify-white hover:text-spotify-white transition hover:bg-spotify-green/80 cursor-pointer"
          >
            <RefreshCcw className={`${loading ? "animate-spin" : ""}`} size={16} />
            Syn Jadwal
          </button>
        </div>

        <div className="text-xs text-center text-spotify-muted flex flex-col">
          <span>Sumber Jadwal Sholat:</span>
          <a href="https://api.myquran.com" target="_blank" rel="noopener noreferrer" className="text-spotify-accent hover:underline">
            https://api.myquran.com
          </a>
        </div>
      </div>
    </section>
  );
}
