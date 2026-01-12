import { JadwalHarian, STORAGE_KEY } from "@/types/jadwalSholat.type";
import { getNextSholat } from "@/utils/checkAdzan";
import { logger } from "@/lib/logger";

interface DebugOptions {
  jadwal: JadwalHarian | null;
  setJadwal: (jadwal: JadwalHarian) => void;
  currentDate: string;
  setNextSholat: (next: { name: string; time: string } | null) => void;
}

declare global {
  interface Window {
    __jadwal?: (key: keyof JadwalHarian, value: string) => void;
  }
}

export function initDebugJadwal({ jadwal, setJadwal, currentDate, setNextSholat }: DebugOptions) {
  window.__jadwal = (key: keyof JadwalHarian, value: string) => {
    if (!jadwal) return console.warn("Jadwal belum dimuat");
    // hapus storage lama
    localStorage.removeItem(`adzan_played_${currentDate}`);
    const newJadwal: JadwalHarian = { ...jadwal, [key]: value };
    setJadwal(newJadwal);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tanggal: currentDate, data: newJadwal }));

    setNextSholat(getNextSholat(newJadwal));

    logger("info", "debugJadwal", `Jadwal "${key}" diubah menjadi ${value}`);
  };

  return () => {
    delete window.__jadwal;
  };
}
