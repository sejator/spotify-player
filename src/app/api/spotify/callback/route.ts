import { calculateExpiresAt, getSettingByKey, saveSpotifyAuth } from "@/lib/settings";
import { SPOTIFY_ACCOUNT_URL } from "@/types/spotify.type";
import { NextRequest, NextResponse } from "next/server";
import qs from "querystring";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) return NextResponse.redirect(new URL("/login?error=no_code", req.url));

  const spotifyClientId = await getSettingByKey("spotifyClientId");
  const spotifyClientSecret = await getSettingByKey("spotifyClientSecret");
  const spotifyRedirectUri = await getSettingByKey("spotifyRedirectUri");

  const clientId = spotifyClientId?.value || "";
  const clientSecret = spotifyClientSecret?.value || "";
  const redirectUri = spotifyRedirectUri?.value || "";

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = qs.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
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
    console.error("Spotify Token Error", data);
    return NextResponse.redirect(new URL("/login?error=token_failed", req.url));
  }

  const expiresAt = await calculateExpiresAt(data.expires_in);
  await saveSpotifyAuth({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: expiresAt,
  });

  return NextResponse.redirect(new URL("/", req.url));
}
