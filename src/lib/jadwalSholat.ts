"use server";

import { prisma } from "@/config/prisma";
import { JadwalHarian, JadwalSholatResponse } from "@/types/jadwalSholat.type";

export async function downloadJadwalSholat(kotaId: string, bulan: string) {
  const kota = await prisma.kota.findUnique({
    where: { kotaId },
    select: { kotaId: true },
  });

  if (!kota) {
    throw new Error("Kota tidak ditemukan");
  }

  const res = await fetch(`https://api.myquran.com/v3/sholat/jadwal/${kotaId}/${bulan}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Gagal fetch ke API jadwal sholat");
  }

  const json: JadwalSholatResponse = await res.json();

  if (!json.status || !json.data?.jadwal) {
    throw new Error("Response jadwal sholat tidak valid");
  }

  /**
   * Hapus data berdasarkan kotaId terlebih dahulu
   */
  await prisma.jadwalSholat.deleteMany({
    where: { kotaId },
  });

  /**
   * KEY = YYYY-MM-DD → simpan apa adanya (STRING)
   */
  const jadwalList = Object.entries(json.data.jadwal).map(([tanggalKey, j]: [string, JadwalHarian]) => ({
    kotaId,
    kota: json.data.kabko,
    provinsi: json.data.prov,

    tanggal: tanggalKey,
    tanggalString: j.tanggal,

    imsak: j.imsak,
    subuh: j.subuh,
    terbit: j.terbit,
    dhuha: j.dhuha,
    dzuhur: j.dzuhur,
    ashar: j.ashar,
    maghrib: j.maghrib,
    isya: j.isya,
  }));

  await prisma.jadwalSholat.createMany({
    data: jadwalList,
  });

  return {
    kotaId,
    bulan,
    total: jadwalList.length,
  };
}
