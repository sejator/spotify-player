"use server";

import { prisma } from "@/config/prisma";
import { KotaItem } from "@/types/jadwalSholat.type";

export async function downloadKota() {
  const res = await fetch("https://api.myquran.com/v3/sholat/kabkota/semua");
  const json = await res.json();

  if (!json.status) {
    throw new Error("Gagal download kota");
  }

  await prisma.kota.deleteMany();

  await prisma.kota.createMany({
    data: json.data.map((k: KotaItem) => ({
      kotaId: k.id,
      nama: k.lokasi,
    })),
  });
}
