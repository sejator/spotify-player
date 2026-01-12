import { prisma } from "@/config/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const kotaId = searchParams.get("kotaId");
  const bulan = searchParams.get("bulan");
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? 10);

  if (!kotaId || !bulan) {
    return NextResponse.json({ data: [], totalPages: 0 });
  }

  const skip = (page - 1) * perPage;

  const [total, data] = await Promise.all([
    prisma.jadwalSholat.count({
      where: { kotaId, tanggal: { startsWith: bulan } },
    }),
    prisma.jadwalSholat.findMany({
      where: { kotaId, tanggal: { startsWith: bulan } },
      orderBy: { tanggal: "asc" },
      skip,
      take: perPage,
    }),
  ]);

  return NextResponse.json({
    data,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}
