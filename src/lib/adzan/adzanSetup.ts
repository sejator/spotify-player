import { logger } from "../logger";
import { adzanEvents } from "./adzanEvents";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingStore } from "@/store/settingStore";

let initialized = false;
let iqomahTimer: ReturnType<typeof setTimeout> | null = null;

export function initAdzanSetup() {
  if (initialized) return;
  initialized = true;

  /**
   * ADZAN END -> START IQOMAH
   */
  adzanEvents.on("adzan:end", (reason?: "force" | "timer") => {
    if (reason === "force") return;

    const store = usePlayerStore.getState();
    const delayIqomah = useSettingStore.getState().delayIqomah;

    store.endAdzan();
    store.startIqomah();

    logger("iqomah", "IQOMAH", "START", { delayIqomah });
    adzanEvents.emit("iqomah:start");
  });

  /**
   * IQOMAH START -> SET TIMER
   */
  adzanEvents.on("iqomah:start", () => {
    const delayIqomah = useSettingStore.getState().delayIqomah;

    if (delayIqomah <= 0) {
      endIqomah("timer");
      logger("iqomah", "IQOMAH", "SKIPPED");
      return;
    }

    startIqomahTimer(delayIqomah * 60 * 1000);
  });
}

/* ===========================
 * IQOMAH TIMER
 * =========================== */
export function startIqomahTimer(durationMs: number) {
  clearIqomahTimer();

  iqomahTimer = setTimeout(() => {
    endIqomah("timer");
  }, durationMs);
}

export function clearIqomahTimer() {
  if (iqomahTimer) {
    clearTimeout(iqomahTimer);
    iqomahTimer = null;
  }
}

export function endIqomah(reason: "timer" | "force") {
  const store = usePlayerStore.getState();

  if (store.status === "adzan") {
    clearIqomahTimer();
    store.endAdzan();
    store.endIqomah();

    if (reason !== "force") {
      adzanEvents.emit("adzan:end", reason);
    }

    adzanEvents.emit("iqomah:end");

    logger("adzan", "ADZAN", reason === "force" ? "FORCED" : "TIMER", "Adzan masih berjalan -> dihentikan paksa");

    return;
  }

  if (store.status === "iqomah") {
    clearIqomahTimer();
    store.endIqomah();
    adzanEvents.emit("iqomah:end");

    logger("iqomah", "IQOMAH", "END", { reason });
  }
}
