import { prisma } from "@/config/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? 10);
  const search = searchParams.get("search") ?? "";

  const skip = (page - 1) * perPage;

  const where = search ? { nama: { contains: search } } : {};

  const [total, data] = await Promise.all([
    prisma.kota.count({ where }),
    prisma.kota.findMany({
      where,
      orderBy: { nama: "asc" },
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
