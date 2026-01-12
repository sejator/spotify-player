import { pauseLocalAudio, resumeLocalAudio } from "@/lib/playerLocalService";
import { pause, resume } from "@/lib/spotify/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { getSettingByKey } from "./settings";

let adsAudio: HTMLAudioElement | null = null;

let prevPlaybackState: {
  spotifyPlaying: boolean;
  localPlaying: boolean;
  deviceId: string | null;
} | null = null;

export async function getPlaylistAds() {
  const res = await fetch("/api/local-ads");
  if (!res.ok) throw new Error("Failed to fetch ads");

  const json = await res.json();
  return json.data;
}

export async function resumePreviousPlayback() {
  const store = usePlayerStore.getState();

  if (!prevPlaybackState) return;

  const { spotifyPlaying, localPlaying, deviceId } = prevPlaybackState;

  if (spotifyPlaying && deviceId) {
    await resume(deviceId).catch(() => {});
    store.setSource("spotify");
    store.setSpotifyWasPlaying(true);
    store.setLocalWasPlaying(false);
    store.setIsPaused(false);
  } else if (localPlaying) {
    await resumeLocalAudio().catch(() => {});
    store.setSource("local");
    store.setLocalWasPlaying(true);
    store.setSpotifyWasPlaying(false);
    store.setIsPaused(false);
  }

  prevPlaybackState = null;
}

export async function playAds(adsUri: string) {
  const store = usePlayerStore.getState();

  prevPlaybackState = {
    spotifyPlaying: store.spotifyWasPlaying && store.source === "spotify",
    localPlaying: store.localWasPlaying && store.source === "local",
    deviceId: store.deviceId,
  };

  if (prevPlaybackState.spotifyPlaying && prevPlaybackState.deviceId) {
    await pause(prevPlaybackState.deviceId).catch(() => {});
  }
  if (prevPlaybackState.localPlaying) {
    pauseLocalAudio();
  }

  store.startAds(adsUri);

  const fileName = decodeURIComponent(adsUri.replace("local:ads:", ""));
  const setting = await getSettingByKey("adsPath");
  if (!setting?.value) throw new Error("adsPath belum diset");

  const encodedFile = encodeURIComponent(fileName);
  const src = `/${setting.value}/${encodedFile}`;

  adsAudio?.pause();
  adsAudio = new Audio(src);
  adsAudio.volume = 0.5;

  adsAudio.onended = async () => {
    adsAudio = null;
    store.endAds();
    await resumePreviousPlayback();
  };

  await adsAudio.play();
}

export async function stopAds() {
  const store = usePlayerStore.getState();

  if (adsAudio) {
    adsAudio.pause();
    adsAudio = null;
  }

  store.endAds();

  await resumePreviousPlayback();
}

export function setAdsVolume(volume: number) {
  if (adsAudio) adsAudio.volume = volume;
}

export function adsUriToSrc(uri: string) {
  const fileName = decodeURIComponent(uri.replace("local:ads:", ""));
  const localAds = uri.startsWith("local:ads:") ? uri : `local:ads:${fileName}`;

  return {
    id: localAds,
    uri: localAds,
    name: fileName.replace(/\.[^/.]+$/, ""),
  };
}
