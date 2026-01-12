import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { SPOTIFY_API_URL } from "@/types/spotify.type";

export async function spotifyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { token, markTokenInvalid } = useSpotifyAuthStore.getState();

  if (!token) throw new Error("Spotify token not available");

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const res = await fetch(`${SPOTIFY_API_URL}${normalizedEndpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    markTokenInvalid();
    throw new Error("Spotify token expired");
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let errMsg = "Spotify API error";

    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.error?.message || errMsg;
    } catch {}

    throw new Error(errMsg);
  }

  const text = (await res.text().catch(() => "")).trim();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
