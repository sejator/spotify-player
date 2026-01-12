import { JadwalHarian } from "@/types/jadwalSholat.type";

export const ADZAN_TOLERANCE = 60; // detik

export function checkAdzan(jadwal: JadwalHarian, played: Record<string, boolean>): { sholat: string; time: string } | null {
  const now = new Date();
  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const sholatTimes = [
    { name: "Subuh", time: jadwal.subuh },
    { name: "Dzuhur", time: jadwal.dzuhur },
    { name: "Ashar", time: jadwal.ashar },
    { name: "Maghrib", time: jadwal.maghrib },
    { name: "Isya", time: jadwal.isya },
  ];

  for (const s of sholatTimes) {
    const [h, m] = s.time.split(":").map(Number);
    const sholatSeconds = h * 3600 + m * 60;

    if (nowSeconds >= sholatSeconds && nowSeconds <= sholatSeconds + 60 && !played[s.name]) {
      return { sholat: s.name, time: s.time };
    }
  }

  return null;
}

/**
 * Mengembalikan jadwal sholat berikutnya berdasarkan waktu sekarang
 */
export function getNextSholat(jadwal: JadwalHarian): { name: string; time: string } | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const sholatTimes: { name: string; time: string }[] = [
    { name: "Imsak", time: jadwal.imsak },
    { name: "Subuh", time: jadwal.subuh },
    { name: "Dzuhur", time: jadwal.dzuhur },
    { name: "Ashar", time: jadwal.ashar },
    { name: "Maghrib", time: jadwal.maghrib },
    { name: "Isya", time: jadwal.isya },
  ];

  const next = sholatTimes.find((s) => {
    const [h, m] = s.time.split(":").map(Number);
    const sholatMinutes = h * 60 + m;
    return sholatMinutes > nowMinutes;
  });

  return next || null;
}
