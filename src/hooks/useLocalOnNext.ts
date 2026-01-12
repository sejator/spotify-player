"use client";

import { localUriToSpotifyTrack, playLocalTrack, setLocalOnNext } from "@/lib/playerLocalService";
import { usePlayerStore } from "@/store/playerStore";
import { useEffect } from "react";

interface SetCurrentTrackFn {
  (track: ReturnType<typeof localUriToSpotifyTrack>): void;
}

interface SetIsPausedFn {
  (isPaused: boolean): void;
}

export function useLocalOnNext(setCurrentTrack: SetCurrentTrackFn, setIsPaused: SetIsPausedFn): void {
  useEffect(() => {
    setLocalOnNext(async () => {
      const store = usePlayerStore.getState();
      const next = store.next();
      if (!next) return;

      await playLocalTrack(next, (durationMs: number) => {
        setCurrentTrack(localUriToSpotifyTrack(next, durationMs));
      });

      store.setSource("local");
      store.setLocalWasPlaying(true);
      setIsPaused(false);
    });
  }, [setCurrentTrack, setIsPaused]);
}
