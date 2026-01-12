-- CreateTable
CREATE TABLE "kota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kotaId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "jadwal_sholat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kotaId" TEXT NOT NULL,
    "kota" TEXT,
    "provinsi" TEXT,
    "tanggalString" TEXT,
    "tanggal" TEXT NOT NULL,
    "subuh" TEXT NOT NULL,
    "dhuha" TEXT NOT NULL,
    "dzuhur" TEXT NOT NULL,
    "ashar" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "isya" TEXT NOT NULL,
    "imsak" TEXT NOT NULL,
    "terbit" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "kota_kotaId_key" ON "kota"("kotaId");

-- CreateIndex
CREATE UNIQUE INDEX "jadwal_sholat_kotaId_tanggal_key" ON "jadwal_sholat"("kotaId", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
