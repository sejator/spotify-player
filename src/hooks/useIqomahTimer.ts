"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingStore } from "@/store/settingStore";

export function useIqomahTimer() {
  const adzanStatus = usePlayerStore((s) => s.status);
  const startedAt = usePlayerStore((s) => s.startedAt);
  const delayIqomah = useSettingStore((s) => s.delayIqomah);

  const isIqomah = adzanStatus === "iqomah";
  const [iqomahTimeLeft, setIqomahTimeLeft] = useState(0);

  useEffect(() => {
    if (!isIqomah || !startedAt || delayIqomah <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIqomahTimeLeft(0);
      return;
    }
    const endAt = startedAt + delayIqomah * 60 * 1000;

    const tick = () => {
      const left = endAt - Date.now();
      setIqomahTimeLeft(Math.max(0, left));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isIqomah, startedAt, delayIqomah]);

  return iqomahTimeLeft;
}
