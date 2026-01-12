"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { Sun, Moon, Search } from "lucide-react";
import { AccountAvatar } from "./spotify/AccountAvatar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value)}`);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <header className="h-16 px-6 flex items-center justify-between">
      {/* SEARCH */}
      <div className="relative w-105 max-w-full">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-spotify-muted" />

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="Cari lagu, artis, atau album..."
          className="w-full h-10 pl-11 pr-4 rounded-full bg-white text-spotify-dark placeholder:text-spotify-muted focus:outline-none focus:ring-2 focus:ring-spotify-green"
        />
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full flex items-center justify-center text-spotify-white hover:bg-spotify-surface-2 transition"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <AccountAvatar />
      </div>
    </header>
  );
}
