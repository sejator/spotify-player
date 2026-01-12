"use server";

import { prisma } from "@/config/prisma";
import type { SpotifyAuth } from "@/types/spotify.type";

export async function getSettings() {
  return prisma.setting.findMany();
}

export async function getSettingByKey(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

export async function upsertSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function deleteSetting(id: number) {
  return prisma.setting.delete({ where: { id } });
}

const REFRESH_BUFFER = 5 * 60 * 1000; // 5 menit

export async function calculateExpiresAt(expiresIn: number) {
  if (process.env.NODE_ENV === "development") {
    // debugging: kurangi 55 menit (aktif selama 5 menit)
    return Date.now() + expiresIn * 1000 - 55 * 60 * 1000;
  }

  return Date.now() + expiresIn * 1000 - REFRESH_BUFFER;
}

export async function saveSpotifyAuth(auth: SpotifyAuth) {
  await upsertSetting("spotifyAuth", JSON.stringify(auth));
}
