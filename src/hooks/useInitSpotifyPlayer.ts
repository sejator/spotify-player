"use client";

import { useEffect } from "react";
import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import type { SpotifyTrack } from "@/types/spotify.type";
import { logger } from "@/lib/logger";
import { initAdzanPlaybackBridge, registerSpotifyPlayer } from "@/lib/spotify/spotifyBridge";
import { usePlayerStore } from "@/store/playerStore";
import { handlePlayerState } from "@/lib/spotify/playerStateHandler";
import { getQueue, getRecentlyPlayed } from "@/lib/spotify/playerService";

export function useInitSpotifyPlayer(
  playerRef: React.RefObject<Spotify.Player | null>,
  setPlayer: React.Dispatch<React.SetStateAction<Spotify.Player | null>>,
  setCurrentTrack: React.Dispatch<React.SetStateAction<SpotifyTrack | null>>,
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { token, setPremium, setIsReady, markTokenInvalid, setSplashcreenShown } = useSpotifyAuthStore();

  useEffect(() => {
    if (!token || playerRef.current) return;
    setSplashcreenShown(true);

    if (!window.spotifySDKLoaded) {
      window.spotifySDKLoaded = true;

      if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }

      window.onSpotifyWebPlaybackSDKReady = async () => {
        if (!window.Spotify) return;

        const spotifyPlayer = new window.Spotify.Player({
          name: "Pemutar Musik Spotify & Audio Lokal",
          volume: 0.5,
          getOAuthToken: (cb) => {
            const currentToken = useSpotifyAuthStore.getState().token;
            if (!currentToken) {
              logger("error", "SPOTIFY", "Token tidak valid saat getOAuthToken");
              return;
            }
            cb(currentToken);
          },
        });

        playerRef.current = spotifyPlayer;
        setPlayer(spotifyPlayer);

        registerSpotifyPlayer(spotifyPlayer);
        initAdzanPlaybackBridge();

        spotifyPlayer.addListener("ready", async ({ device_id }) => {
          const store = usePlayerStore.getState();
          store.setDeviceId(device_id);
          setIsReady(true);
          setPremium(true);
          setSplashcreenShown(false);

          try {
            const recentTracks = await getRecentlyPlayed(1);
            if (recentTracks.items.length > 0) {
              const lastTrack = recentTracks.items[0];
              store.setLastPlaybackTrack(lastTrack.uri);
              const data = await getQueue();
              store.setSpotifyQueue(data.queue || []);
              store.setSource("spotify");
              setCurrentTrack(lastTrack);
              setIsPaused(true);
            }
          } catch (err) {
            logger("error", "SPOTIFY", "Gagal ambil lagu terakhir", err);
          }
        });

        spotifyPlayer.addListener("authentication_error", ({ message }) => {
          logger("error", "SPOTIFY", `Auth error: ${message}`);
          markTokenInvalid();
          setSplashcreenShown(false);
        });

        spotifyPlayer.addListener("account_error", ({ message }) => {
          logger("error", "SPOTIFY", `Account error: ${message}`);
          setPremium(false);
          setSplashcreenShown(false);
        });

        spotifyPlayer.addListener("player_state_changed", async (state) => {
          if (!state) return;

          const store = usePlayerStore.getState();
          const currentUri = state.track_window.current_track?.uri;
          const lastUri = store.lastPlaybackTrackUri;

          setCurrentTrack(state.track_window.current_track);
          setIsPaused(state.paused);

          store.setSource("spotify");
          store.setSpotifyWasPlaying(!state.paused);
          store.setLocalWasPlaying(false);
          store.setPosition(state.position);
          store.setDuration(state.duration);

          if (state.context?.uri) store.setLastPlaybackContext(state.context.uri);
          if (currentUri) store.setLastPlaybackTrack(currentUri);

          if (currentUri && currentUri !== lastUri) {
            try {
              const data = await getQueue();
              store.setSpotifyQueue(data.queue || []);
            } catch (err) {
              logger("error", "SPOTIFY", "Gagal mengambil queue", err);
            }
          }

          handlePlayerState(state);
        });

        spotifyPlayer.connect().then((success) => {
          if (success) logger("info", "SPOTIFY", "Koneksi sukses!");
        });
      };
    }

    return () => {};
  }, [token, markTokenInvalid, setPremium, setIsReady, setSplashcreenShown, playerRef, setPlayer, setCurrentTrack, setIsPaused]);
}
