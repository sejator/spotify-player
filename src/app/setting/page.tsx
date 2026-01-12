"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getSettings, upsertSetting } from "@/lib/settings";
import { Setting } from "@/types/setting.type";
import { partialMask, parseSettingValue, prepareSettingValue } from "@/utils/format";
import clsx from "clsx";
import { useSettingStore } from "@/store/settingStore";

const DISABLED_SETTING_KEYS = new Set(["spotifyAuth", "kotaId", "localMusicPath", "spotifyRedirectUri", "adsPath"]);

const NUMBER_ONLY_KEYS = new Set(["delayIqomah", "delayIklan"]);
const SENSITIVE_KEYS = new Set(["spotifyClientId", "spotifyClientSecret", "spotifyAuth"]);

export default function SettingPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { setNotifAdzan, setDelayIqomah } = useSettingStore();

  const fetchSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  useEffect(() => {
    fetchSettings().catch(console.error);
  }, []);

  const syncSettingToStore = (key: string, value: string | number | boolean | object) => {
    if (key === "notifAdzan") {
      setNotifAdzan(Boolean(value));
    }

    if (key === "delayIqomah") {
      setDelayIqomah(Number(value));
    }
  };

  const handleAddSetting = async () => {
    if (!newKey.trim()) return toast.error("Key tidak boleh kosong");
    if (!newValue.trim()) return toast.error("Value tidak boleh kosong");

    try {
      setLoading(true);

      const validatedValue = ensureNumberOnly(newKey.trim(), newValue);
      const parsed = parseSettingValue(validatedValue);
      const finalValue = prepareSettingValue(parsed);

      await upsertSetting(newKey.trim(), finalValue);
      syncSettingToStore(newKey.trim(), parsed);

      toast.success("Setting berhasil ditambahkan");
      setNewKey("");
      setNewValue("");
      fetchSettings();
    } catch (err) {
      if ((err as Error).message === "VALUE_NOT_NUMBER") {
        toast.error("Value harus berupa angka");
      } else {
        toast.error("Gagal menambahkan setting");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, rawValue: string) => {
    try {
      const validatedValue = ensureNumberOnly(key, rawValue);
      const parsed = parseSettingValue(validatedValue);
      const finalValue = prepareSettingValue(parsed);

      await upsertSetting(key, finalValue);
      syncSettingToStore(key, parsed);

      toast.success("Setting diperbarui");
    } catch (err) {
      if ((err as Error).message === "VALUE_NOT_NUMBER") {
        toast.error("Value harus berupa angka");
      } else {
        toast.error("Value tidak valid");
      }
    }
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-spotify-white">Settings</h1>
        <p className="text-sm text-spotify-muted mt-1">Konfigurasi sistem & integrasi. Perubahan disimpan otomatis.</p>
      </div>

      {/* Add Setting */}
      <section className="bg-spotify-surface rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-spotify-white mb-3">Add New Setting</h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className="px-3 py-2 rounded bg-spotify-surface-2 text-spotify-white border border-spotify-border outline-none"
            placeholder="Key (contoh: adzanDelay)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />

          <input
            className="px-3 py-2 rounded bg-spotify-surface-2 text-spotify-white border border-spotify-border outline-none"
            placeholder="Value (number / boolean / json)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />

          <button
            disabled={loading}
            onClick={handleAddSetting}
            className="bg-spotify-green hover:bg-spotify-green/90 disabled:opacity-60 px-4 py-2 rounded text-black font-semibold"
          >
            Tambah
          </button>
        </div>

        <p className="text-xs text-spotify-muted mt-2">
          Catatan: Delay menggunakan satuan <b>menit</b>
        </p>
      </section>

      {/* Existing */}
      <section className="bg-spotify-surface rounded-lg p-4">
        <h2 className="text-sm font-semibold text-spotify-white mb-3">Existing Settings</h2>

        {settings.length === 0 && <p className="text-sm text-spotify-muted text-center py-6">Belum ada setting</p>}

        <div className="space-y-2 pr-1">
          {settings.map((s) => {
            const disabled = DISABLED_SETTING_KEYS.has(s.key);
            const isNumberOnly = NUMBER_ONLY_KEYS.has(s.key);
            const isSensitive = SENSITIVE_KEYS.has(s.key);

            return (
              <div key={s.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 items-center bg-spotify-surface-2 rounded p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-spotify-white truncate">{s.key}</span>

                  {disabled && <span className="text-[10px] px-2 py-0.5 rounded bg-spotify-border text-spotify-muted">READ ONLY</span>}
                </div>

                {s.key === "notifAdzan" ? (
                  <select
                    defaultValue={String(s.value)}
                    disabled={disabled}
                    onChange={(e) => !disabled && handleUpdateSetting(s.key, e.target.value)}
                    className={clsx(
                      "px-3 py-2 text-sm rounded border outline-none",
                      "bg-spotify-surface-3 text-spotify-white border-spotify-border",
                      disabled && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                ) : (
                  <input
                    type={isNumberOnly ? "number" : "text"}
                    inputMode={isNumberOnly ? "numeric" : undefined}
                    defaultValue={isSensitive ? partialMask(String(s.value)) : String(s.value)}
                    disabled={disabled}
                    title={disabled ? "Setting ini bersifat read-only" : isSensitive ? "Kosongkan jika tidak ingin mengubah" : isNumberOnly ? "Harus berupa angka (menit)" : ""}
                    onFocus={(e) => {
                      if (isSensitive) {
                        e.target.value = "";
                      }
                    }}
                    onBlur={(e) => {
                      if (disabled) return;
                      if (isSensitive && !e.target.value) return;
                      handleUpdateSetting(s.key, e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className={clsx(
                      "px-3 py-2 text-sm rounded border outline-none",
                      "bg-spotify-surface-3 text-spotify-white border-spotify-border",
                      disabled && "opacity-60 cursor-not-allowed"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ensureNumberOnly(key: string, rawValue: string) {
  if (!NUMBER_ONLY_KEYS.has(key)) return rawValue;

  const num = Number(rawValue);
  if (Number.isNaN(num)) {
    throw new Error("VALUE_NOT_NUMBER");
  }

  return num;
}
