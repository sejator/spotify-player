"use client";

import Link from "next/link";
import CenterBox from "@/app/components/CenterBox";

export default function NotFound() {
  return (
    <CenterBox>
      <h1 className="text-4xl font-bold text-white">404</h1>

      <p className="mt-2 text-sm text-spotify-muted max-w-md text-center">This page could not be found.</p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center
          bg-spotify-accent text-black
          px-6 py-2.5 rounded-full
          text-sm font-semibold
          hover:scale-105 transition"
      >
        Kembali ke Beranda
      </Link>
    </CenterBox>
  );
}
