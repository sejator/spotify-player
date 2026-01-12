"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/app/context/PlayerContext";
import { setLocalVolume } from "@/lib/playerLocalService";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useVolume(initialVolume = 50, isAdzanBlocking: boolean) {
  const { player } = usePlayer();
  const [volume, setVolume] = useState(initialVolume);

  useEffect(() => {
    if (player) player.setVolume(volume / 100);
    setLocalVolume(volume / 100);
  }, [volume, player]);

  return [volume, setVolume] as const;
}
