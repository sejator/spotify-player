import { getSettingByKey, saveSpotifyAuth, calculateExpiresAt } from "@/lib/settings";
import { SPOTIFY_ACCOUNT_URL, type SpotifyAuth } from "@/types/spotify.type";
import { NextResponse } from "next/server";

async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyAuth> {
  const spotifyClientId = await getSettingByKey("spotifyClientId");
  const spotifyClientSecret = await getSettingByKey("spotifyClientSecret");

  const clientId = spotifyClientId?.value || "";
  const clientSecret = spotifyClientSecret?.value || "";

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(SPOTIFY_ACCOUNT_URL + "/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();

  if (data.error) {
    throw new Error("Failed to refresh Spotify token");
  }

  const expiresAt = await calculateExpiresAt(data.expires_in);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: expiresAt,
  };
}

export async function GET() {
  const spotifyAuthSetting = await getSettingByKey("spotifyAuth");

  if (!spotifyAuthSetting?.value) {
    return NextResponse.json({ error: "Token not found" }, { status: 401 });
  }

  let spotifyAuth: SpotifyAuth;

  try {
    spotifyAuth = JSON.parse(spotifyAuthSetting.value);
  } catch (err) {
    console.error("Failed to parse spotifyAuth", err);
    return NextResponse.json({ error: "Invalid token data" }, { status: 500 });
  }

  let { accessToken, refreshToken, expiresAt } = spotifyAuth;

  if (Date.now() >= expiresAt) {
    try {
      const newToken = await refreshSpotifyToken(refreshToken);

      accessToken = newToken.accessToken;
      refreshToken = newToken.refreshToken;
      expiresAt = newToken.expiresAt;

      await saveSpotifyAuth({
        accessToken,
        refreshToken,
        expiresAt,
      });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
    }
  }

  return NextResponse.json({ accessToken, expiresAt });
}
