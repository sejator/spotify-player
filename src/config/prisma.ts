import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "prisma/config";

const adapter = new PrismaBetterSqlite3({
  url: env("DATABASE_URL") || "file:./db/spotify.db",
});

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV === "development") global.prisma = prisma;
