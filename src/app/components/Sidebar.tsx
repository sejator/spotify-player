"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSpotifyPlaylistStore } from "@/store/spotifyPlaylistStore";
import clsx from "clsx";
import { useSpotifyUserStore } from "@/store/spotifyUserStore";

export default function Sidebar() {
  const playlists = useSpotifyPlaylistStore((s) => s.playlists);
  const { user } = useSpotifyUserStore();

  const pathname = usePathname();

  return (
    <aside className="w-65 h-full bg-spotify-surface text-spotify-white flex flex-col border-r border-spotify-border">
      {/* LOGO / BRAND */}
      <div className="px-6 py-5 text-lg font-semibold tracking-tight shrink-0">Spotify</div>

      {/* MAIN NAV */}
      <nav className="flex flex-col gap-1 px-2 shrink-0">
        <SidebarLink href="/" active={pathname === "/"}>
          Home
        </SidebarLink>
        <SidebarLink href="/search" active={pathname === "/search"}>
          Search
        </SidebarLink>
        <SidebarLink href="/local-music" active={pathname === "/local-music"}>
          Musik Lokal
        </SidebarLink>
      </nav>

      {/* PLAYLIST SECTION */}
      <div className="mt-4 pt-4 border-t border-spotify-border flex-1 min-h-0 overflow-y-auto px-2">
        <p className="px-2 mb-3 text-[10px] font-semibold text-spotify-muted tracking-wider">PLAYLISTS</p>

        <div className="space-y-1">
          {user &&
            playlists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className={clsx(
                  "block truncate rounded px-2 py-1.5 text-sm text-spotify-muted hover:text-spotify-white hover:bg-spotify-surface-2 transition",
                  pathname === `/playlist/${pl.id}` && "bg-spotify-surface-2 text-spotify-white"
                )}
              >
                {pl.name}
              </Link>
            ))}
        </div>
      </div>

      {/* CONFIG SECTION */}
      <div className="border-t border-spotify-border px-2 py-4 shrink-0">
        <p className="px-2 mb-2 text-[10px] font-semibold text-spotify-muted tracking-wider">KONFIGURASI</p>

        <div className="space-y-1">
          <SidebarLink href="/kota" active={pathname === "/kota"}>
            Kota
          </SidebarLink>
          <SidebarLink href="/jadwal" active={pathname === "/jadwal"}>
            Jadwal Sholat
          </SidebarLink>
          <SidebarLink href="/setting" active={pathname === "/setting"}>
            Pengaturan
          </SidebarLink>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        "block rounded px-2 py-2 text-sm font-medium transition",
        active ? "bg-spotify-surface-2 text-spotify-white" : "text-spotify-muted hover:text-spotify-white hover:bg-spotify-surface-2"
      )}
    >
      {children}
    </Link>
  );
}
