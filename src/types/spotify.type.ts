export const SPOTIFY_ACCOUNT_URL = "https://accounts.spotify.com";
export const SPOTIFY_API_URL = "https://api.spotify.com/v1";

/* SCOPES */
export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-position",
  "user-top-read",
  "user-library-read",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "streaming",
] as const;

export const SPOTIFY_SCOPE_STRING = SPOTIFY_SCOPES.join(" ");

export type SpotifyAuth = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

/* ARTIST */
export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  images?: { url: string; height: number; width: number }[];
  genres?: string[];
  topTracks?: SpotifyTrack[];
}

/* TRACK */
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: SpotifyArtist[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
}

/* PLAYLIST */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  uri: string;
  images: { url: string; height: number; width: number }[];
}

/* ALBUM */
export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  images: { url: string; height: number; width: number }[];
  artists: SpotifyArtist[];
  release_date: string;
  total_tracks: number;
}

/* PLAYER STATE */
export interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  duration: number;
  repeat_mode: number;
  disallows: {
    pausing: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
    seeking: boolean;
    interrupting: boolean;
  };
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

/* DEVICE */
export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
  supports_volume: boolean;
}

/* USER */
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  product: "premium" | "free" | "open";
  country: string;
  images: { url: string; height: number; width: number }[];
  uri: string;
}

export type PlaySource =
  | string
  | {
      uris: string[];
      startIndex?: number;
    };

export type PlayerContextType = {
  play: (source?: PlaySource, options?: { offset?: number }) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (positionMs: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  player: Spotify.Player | null;
  currentTrack: SpotifyTrack | null;
  isPaused: boolean;
  deviceId: string | null;
  isReady: boolean;
};
