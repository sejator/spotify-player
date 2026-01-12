import { upsertSetting } from "@/lib/settings";
import { NextResponse } from "next/server";

export async function GET() {
  // hapus token dari database
  await upsertSetting("spotifyAuth", "");

  return NextResponse.json(null, { status: 200 });
}
