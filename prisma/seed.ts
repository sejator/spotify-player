import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "prisma/config";

const adapter = new PrismaBetterSqlite3({
  url: env("DATABASE_URL") || "file:./db/spotify.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const settings = [
    {
      key: "notifAdzan",
      value: "true", // Notif adzan diaktifkan
    },
    {
      key: "delayIqomah",
      value: "5", // Delay notifikasi iqomah dalam menit
    },
    {
      key: "spotifyClientId",
      value: "",
    },
    {
      key: "spotifyClientSecret",
      value: "",
    },
    {
      key: "kotaId",
      value: "", // ID kota untuk jadwal sholat
    },
    {
      key: "localMusicPath",
      value: "music", // Path default untuk audio lokal
    },
    {
      key: "adsPath",
      value: "ads", // Path default untuk audio iklan
    },
    {
      key: "spotifyAuth",
      value: "",
    },
    {
      key: "spotifyRedirectUri",
      value: "http://127.0.0.1:54321/api/spotify/callback",
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
      },
      create: setting,
    });
  }

  console.log("Seeder Setting berhasil dijalankan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
