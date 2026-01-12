"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { downloadKota } from "@/lib/listKota";
import { motion, AnimatePresence } from "framer-motion";
import { upsertSetting } from "@/lib/settings";
import { downloadJadwalSholat } from "@/lib/jadwalSholat";
import { CheckCircle, Search, RefreshCcw } from "lucide-react";
import { parseSettingValue, prepareSettingValue } from "@/utils/format";

interface Kota {
  id: number;
  kotaId: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
}

export default function KotaPage() {
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [kotaList, setKotaList] = useState<Kota[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const bulan = new Date().toISOString().slice(0, 7);

  const fetchKota = useCallback(async () => {
    try {
      setLoading(true);
      const payload = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        search: searchTerm,
      }).toString();

      const res = await fetch(`/api/kota?${payload}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch gagal");

      const json = await res.json();
      setKotaList(json.data);
      setTotalPages(json.totalPages);
    } catch {
      toast.error("Gagal mengambil data kota");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchTerm]);

  const handleSyncKota = async () => {
    try {
      setSyncing(true);
      await downloadKota();
      toast.success("Data kota berhasil disinkronisasi");
      setPage(1);
      fetchKota();
    } catch {
      toast.error("Gagal sinkronisasi kota");
    } finally {
      setSyncing(false);
    }
  };

  const updateKota = async (kota: Kota) => {
    try {
      const parsed = parseSettingValue(kota.kotaId);
      const finalValue = prepareSettingValue(parsed);

      await upsertSetting("kotaId", finalValue);
      await downloadJadwalSholat(kota.kotaId, bulan);

      toast.success(`Kota "${kota.nama}" dipilih`);
    } catch {
      toast.error("Gagal menyimpan kota");
    }
  };

  useEffect(() => {
    fetchKota();
  }, [fetchKota]);

  return (
    <div className="max-w-4xl mx-auto px-6 pb-28">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-spotify-white mb-1">Lokasi Jadwal Sholat</h1>
        <p className="text-sm text-spotify-muted">Pilih kota atau kabupaten untuk sinkronisasi jadwal sholat</p>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={handleSyncKota}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-spotify-surface-2 hover:bg-spotify-surface-3
          text-spotify-white text-sm transition disabled:opacity-50"
        >
          <RefreshCcw size={14} className={syncing ? "animate-spin" : ""} />
          Sinkronisasi
        </button>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-muted" />
          <input
            type="text"
            placeholder="Cari kota..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-3 py-2 w-64 rounded-full
            bg-spotify-surface-2 text-sm text-spotify-white
            placeholder-spotify-muted outline-none"
          />
        </div>
      </div>

      {/* LIST */}
      <div className="bg-spotify-surface rounded-md overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-spotify-muted">Loading...</div>
        ) : kotaList.length === 0 ? (
          <div className="py-10 text-center text-spotify-muted">Data kota tidak ditemukan</div>
        ) : (
          <AnimatePresence>
            {kotaList.map((k) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between px-4 py-3
                border-b border-spotify-border
                hover:bg-spotify-surface-2"
              >
                <div>
                  <p className="text-sm text-spotify-white font-medium">{k.nama}</p>
                  <p className="text-xs text-spotify-muted">ID: {k.kotaId}</p>
                </div>

                <button
                  onClick={() => updateKota(k)}
                  className="inline-flex items-center gap-1
                  text-spotify-green text-sm font-semibold
                  hover:underline"
                >
                  <CheckCircle size={14} />
                  Pilih
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
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
