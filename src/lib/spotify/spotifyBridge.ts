import { adzanEvents } from "@/lib/adzan";
import { usePlayerStore } from "@/store/playerStore";
import { pauseLocalAudio, resumeLocalAudio, isLocalAudioPlaying } from "@/lib/playerLocalService";
import { logger } from "@/lib/logger";

let spotifyPlayer: Spotify.Player | null = null;
let initialized = false;

export function registerSpotifyPlayer(player: Spotify.Player) {
  spotifyPlayer = player;
}

export function initAdzanPlaybackBridge() {
  if (initialized) return;
  initialized = true;

  /**
   * ADZAN START
   */
  adzanEvents.on("adzan:start", async () => {
    const store = usePlayerStore.getState();

    /** LOCAL */
    const localPlaying = isLocalAudioPlaying();
    store.setLocalWasPlaying(localPlaying);

    if (localPlaying) {
      pauseLocalAudio();
    }

    /** SPOTIFY */
    if (spotifyPlayer) {
      store.setSpotifyWasPlaying(store.source === "spotify" && !store.isPaused);

      await spotifyPlayer.pause();
    }
  });

  /**
   * IQOMAH END
   */
  adzanEvents.on("iqomah:end", async () => {
    const store = usePlayerStore.getState();

    /** LOCAL */
    if (store.localWasPlaying) {
      await resumeLocalAudio();
      store.setLocalWasPlaying(false);
      logger("info", "LOCAL", "Resumed after iqomah");
      return;
    }

    /** SPOTIFY */
    if (spotifyPlayer) {
      store.setSpotifyWasPlaying(false);
      await spotifyPlayer.resume();
      logger("info", "SPOTIFY", "Resumed after iqomah");
    }
  });
}
