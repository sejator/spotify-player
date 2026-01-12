import { SpotifyDevice } from "@/types/spotify.type";
import { spotifyFetch } from "./spotifyClient";

export async function getDevices() {
  return spotifyFetch<{ devices: SpotifyDevice[] }>("/me/player/devices");
}

export async function transferPlayback(deviceId: string) {
  return spotifyFetch<void>("/me/player", {
    method: "PUT",
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  });
}
