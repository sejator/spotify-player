import { getSettingByKey } from "@/lib/settings";
import { SPOTIFY_SCOPE_STRING } from "@/types/spotify.type";
import { NextResponse } from "next/server";

export async function GET() {
  const spotifyClientId = await getSettingByKey("spotifyClientId");
  const spotifyRedirectUri = await getSettingByKey("spotifyRedirectUri");
  const CLIENT_ID = spotifyClientId?.value || "";
  const REDIRECT_URI = spotifyRedirectUri?.value || "";
  const state = crypto.randomUUID();

  const payload = {
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SPOTIFY_SCOPE_STRING,
    state,
  };

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams(payload).toString()}`;
  return NextResponse.redirect(authUrl);
}
