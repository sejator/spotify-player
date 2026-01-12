"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { downloadJadwalSholat } from "@/lib/jadwalSholat";
import { getSettingByKey } from "@/lib/settings";
import { getBulan, normalizeSettingValue } from "@/utils/format";
import { RefreshCcw } from "lucide-react";

interface Jadwal {
  id: number;
  tanggalString: string;
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export default function JadwalPage() {
  const [kotaId, setKotaId] = useState<string | null>(null);
  const [data, setData] = useState<Jadwal[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const bulan = getBulan();

  useEffect(() => {
    getSettingByKey("kotaId").then((s) => {
      setKotaId(s ? String(normalizeSettingValue(s.value)) : null);
    });
  }, []);

  const fetchJadwal = useCallback(async () => {
    if (!kotaId) return;

    try {
      setLoading(true);
      const payload = new URLSearchParams({
        kotaId,
        bulan,
        page: String(page),
        perPage: String(perPage),
      }).toString();

      const res = await fetch(`/api/jadwal?${payload}`, { cache: "no-store" });
      const json = await res.json();

      setData(json.data);
      setTotalPages(json.totalPages);
    } catch {
      toast.error("Gagal mengambil jadwal sholat");
    } finally {
      setLoading(false);
    }
  }, [kotaId, page, perPage, bulan]);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  const handleSync = async () => {
    if (!kotaId) return;

    try {
      setSyncing(true);
      await downloadJadwalSholat(kotaId, bulan);
      toast.success("Jadwal sholat berhasil disinkronisasi");
      setPage(1);
      fetchJadwal();
    } catch {
      toast.error("Gagal sinkronisasi jadwal");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-28">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-spotify-white mb-1">Jadwal Sholat</h1>
        <p className="text-sm text-spotify-muted">Jadwal sholat bulanan berdasarkan kota yang dipilih</p>
      </div>

      {!kotaId && <div className="mb-4 px-4 py-3 rounded-md bg-spotify-surface-2 text-sm text-spotify-muted">Kota belum dipilih. Silakan atur di halaman Settings.</div>}

      {/* ACTIONS */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={handleSync}
          disabled={!kotaId || syncing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-spotify-surface-2 hover:bg-spotify-surface-3
          text-sm text-spotify-white transition disabled:opacity-40"
        >
          <RefreshCcw size={14} className={syncing ? "animate-spin" : ""} />
          Sinkronisasi
        </button>
      </div>

      {/* LIST */}
      <div className="bg-spotify-surface rounded-md overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-spotify-muted">Loading...</div>
        ) : data.length === 0 ? (
          <div className="py-10 text-center text-spotify-muted">Tidak ada jadwal tersedia</div>
        ) : (
          data.map((j) => (
            <div
              key={j.id}
              className="px-4 py-3 border-b border-spotify-border
              hover:bg-spotify-surface-2 transition"
            >
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold text-spotify-white">{j.tanggalString}</p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                <TimeItem label="Subuh" value={j.subuh} />
                <TimeItem label="Dzuhur" value={j.dzuhur} />
                <TimeItem label="Ashar" value={j.ashar} />
                <TimeItem label="Maghrib" value={j.maghrib} />
                <TimeItem label="Isya" value={j.isya} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-6 text-sm">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1 || loading} className="text-spotify-muted hover:text-spotify-white disabled:opacity-40">
            Prev
          </button>

          <span className="text-spotify-white">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="text-spotify-muted hover:text-spotify-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function TimeItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-spotify-surface-2 rounded px-2 py-2">
      <span className="text-spotify-muted">{label}</span>
      <span className="text-spotify-white font-semibold">{value}</span>
    </div>
  );
}
