import { prisma } from "@/config/prisma";
import { getTanggal } from "@/utils/format";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kotaId = searchParams.get("kotaId");

  if (!kotaId) {
    return NextResponse.json({ data: null }, { status: 400 });
  }

  const today = getTanggal();

  const jadwal = await prisma.jadwalSholat.findFirst({
    where: {
      kotaId,
      tanggal: today,
    },
  });

  return NextResponse.json({ data: jadwal });
}
