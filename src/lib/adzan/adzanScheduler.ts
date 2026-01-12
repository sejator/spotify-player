import { JadwalHarian } from "@/types/jadwalSholat.type";
import { checkAdzan } from "@/utils/checkAdzan";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingStore } from "@/store/settingStore";
import { adzanEvents } from "./adzanEvents";

let interval: number | null = null;

const playedKey = (date: string) => `adzan_played_${date}`;

export function startAdzanScheduler(jadwal: JadwalHarian, currentDate: string) {
  if (interval) return;

  interval = window.setInterval(() => {
    const store = usePlayerStore.getState();
    const settings = useSettingStore.getState();
    if (store.status !== "idle" || !settings.notifAdzan) return;

    const raw = localStorage.getItem(playedKey(currentDate));
    const played = raw ? JSON.parse(raw) : {};

    const result = checkAdzan(jadwal, played);
    if (!result) return;

    store.startAdzan(result.sholat);
    adzanEvents.emit("adzan:start");

    played[result.sholat] = true;
    localStorage.setItem(playedKey(currentDate), JSON.stringify(played));
  }, 1000);
}

export function stopAdzanScheduler() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
