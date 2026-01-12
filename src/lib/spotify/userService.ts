import { SpotifyUser } from "@/types/spotify.type";
import { spotifyFetch } from "./spotifyClient";

export async function getMe(): Promise<SpotifyUser> {
  return await spotifyFetch<SpotifyUser>("/me");
}
