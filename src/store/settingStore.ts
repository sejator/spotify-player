"use client";

import { create } from "zustand";
import { getSettingByKey } from "@/lib/settings";

interface SettingState {
  notifAdzan: boolean;
  delayIqomah: number;

  setNotifAdzan: (v: boolean) => void;
  setDelayIqomah: (v: number) => void;

  loadNotifAdzan: () => Promise<void>;
  loadDelayIqomah: () => Promise<void>;
}

export const useSettingStore = create<SettingState>((set) => ({
  notifAdzan: false,
  delayIqomah: 0,

  setNotifAdzan: (notifAdzan) => set({ notifAdzan }),
  setDelayIqomah: (delayIqomah) => set({ delayIqomah }),

  loadNotifAdzan: async () => {
    const notif = await getSettingByKey("notifAdzan");
    set({ notifAdzan: notif?.value === "true" });
  },

  loadDelayIqomah: async () => {
    const delay = await getSettingByKey("delayIqomah");
    set({ delayIqomah: Number(delay?.value || 0) });
  },
}));
