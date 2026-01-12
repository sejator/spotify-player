export {};

declare global {
  namespace Spotify {
    interface PlayerInit {
      name: string;
      getOAuthToken(cb: (token: string) => void): void;
      volume?: number;
    }

    interface Player {
      connect(): Promise<boolean>;
      disconnect(): void;

      pause(): Promise<void>;
      resume(): Promise<void>;
      togglePlay(): Promise<void>;
      seek(positionMs: number): Promise<void>;
      nextTrack(): Promise<void>;
      previousTrack(): Promise<void>;
      setVolume(volume: number): Promise<void>;
      getCurrentState(): Promise<PlaybackState | null>;

      addListener(event: "ready", cb: (data: { device_id: string }) => void): boolean;
      addListener(event: "not_ready", cb: (data: { device_id: string }) => void): boolean;
      addListener(event: "player_state_changed", cb: (state: PlaybackState | null) => void): boolean;
      addListener(
        event: "initialization_error" | "authentication_error" | "account_error" | "playback_error" | "autoplay_failed",
        cb: (error: { message: string }) => void
      ): boolean;

      removeListener(event: string): boolean;
    }
  }

  interface Window {
    spotifySDKLoaded?: boolean;
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: Spotify.PlayerInit) => Spotify.Player;
    };
  }
}
