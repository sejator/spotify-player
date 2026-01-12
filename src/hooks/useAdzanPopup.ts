"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";

export function useAdzanPopup() {
  const adzanStatus = usePlayerStore((s) => s.status);
  const isAdzan = adzanStatus === "adzan";
  const isIqomah = adzanStatus === "iqomah";
  const isAdzanBlocking = isAdzan || isIqomah;

  const [showAdzanPopup, setShowAdzanPopup] = useState(false);

  useEffect(() => {
    setShowAdzanPopup(isAdzanBlocking);
  }, [isAdzanBlocking]);

  return [showAdzanPopup, setShowAdzanPopup] as const;
}
