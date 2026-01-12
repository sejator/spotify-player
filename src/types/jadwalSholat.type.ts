export const STORAGE_KEY = "jadwal_sholat_today";

export type KotaListResponse = {
  status: boolean;
  message: string;
  data: KotaItem[];
};

export type KotaItem = {
  id: string;
  lokasi: string;
};

export type JadwalSholatResponse = {
  status: boolean;
  message: string;
  data: JadwalSholatData;
};

export type JadwalSholatData = {
  id: string;
  kabko: string;
  prov: string;
  jadwal: Record<string, JadwalHarian>;
};

export type JadwalHarian = {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  kota?: string;
  provinsi?: string;
  tanggalString?: string;
};

export interface JadwalTodayStorage {
  tanggal: string;
  data: JadwalHarian;
}
