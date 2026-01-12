import type { SpotifyPlayerState } from "@/types/spotify.type";

let lastTrackId: string | null = null;

/**
 * Handle Spotify Web Playback SDK state changes
 */
export function handlePlayerState(state: SpotifyPlayerState) {
  const currentTrack = state.track_window.current_track;
  if (!currentTrack) return;

  // cegah trigger berulang untuk track yang sama
  if (currentTrack.id === lastTrackId) return;
  lastTrackId = currentTrack.id;

  /**
   * Playlist dianggap "habis" jika:
   * - playback berhenti
   * - posisi di awal (track ended)
   * - repeat OFF
   * - tidak ada next track
   * - bukan user manual pause
   */
  const isTrackEnded = state.position === 0 && state.paused;
  const isRepeatOff = state.repeat_mode === 0;
  const noNextTrack = state.track_window.next_tracks.length === 0;
  const userDidNotPause = !state.disallows?.pausing;

  if (isTrackEnded && isRepeatOff && noNextTrack && userDidNotPause) {
    // TODO: rekomendasi playlist selanjutnya
  }
}
