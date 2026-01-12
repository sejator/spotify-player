import { usePlayerStore } from "@/store/playerStore";
import { logger } from "@/lib/logger";

let initialized = false;

export function initAdzanDebug() {
  if (initialized) return;
  initialized = true;

  usePlayerStore.subscribe((state, prev) => {
    if (state.status !== prev.status) {
      logger("state", "STATE", `${prev.status} -> ${state.status}`, {
        sholat: state.sholatName,
        startedAt: state.startedAt,
      });
    }
  });
}
