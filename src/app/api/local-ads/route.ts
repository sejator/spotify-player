import { NextResponse } from "next/server";
import { getSettingByKey } from "@/lib/settings";
import fs from "fs";
import path from "path";
import { adsUriToSrc } from "@/lib/adsPlaybackService";
export async function GET() {
  const setting = await getSettingByKey("adsPath");
  if (!setting) {
    return NextResponse.json({ data: [] });
  }

  const basePath = path.join(process.cwd(), `public/${setting.value}`);
  if (!fs.existsSync(basePath)) {
    return NextResponse.json({ data: [] });
  }

  const files = fs.readdirSync(basePath).filter((f) => f.endsWith(".mp3"));

  return NextResponse.json({
    data: files.map(adsUriToSrc),
  });
}
