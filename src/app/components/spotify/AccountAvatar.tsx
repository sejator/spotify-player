"use client";

import { useSpotifyAuthStore } from "@/store/spotifyAuthStore";
import { useSpotifyUserStore } from "@/store/spotifyUserStore";
import { UserLock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function AccountAvatar() {
  const router = useRouter();
  const { markTokenInvalid, isTokenInvalid } = useSpotifyAuthStore();
  const user = useSpotifyUserStore((state) => state.user);
  const clearUser = useSpotifyUserStore((state) => state.clearUser);

  const initial = user?.display_name?.charAt(0).toUpperCase() ?? <UserLock />;

  const handleLogout = async () => {
    clearUser();
    markTokenInvalid();
    localStorage.removeItem("spotifyToken");
    toast.success("Berhasil keluar dari Spotify");

    await fetch("/api/spotify/logout");

    router.replace("/");
    router.refresh();
  };

  return (
    <div className="relative inline-block group">
      {/* AVATAR */}
      <div className="relative z-10 w-9 h-9 rounded-full bg-spotify-accent flex items-center justify-center text-lg font-bold text-white cursor-pointer overflow-hidden">
        {user?.images?.[0]?.url ? <Image src={user.images[0].url} alt={user.display_name} fill className="object-cover" /> : initial}
      </div>

      {/* DROPDOWN */}
      <div
        className="absolute right-0 mt-2 w-48 rounded-md bg-black text-white
        opacity-0 invisible scale-95
        group-hover:opacity-100 group-hover:visible group-hover:scale-100
        transition-all duration-150 z-50"
      >
        {user && (
          <div className="px-3 py-2 border-b border-white/10">
            <p className="font-medium">{user.display_name}</p>
            {user.email && <p className="text-xs text-white/60">{user.email}</p>}
          </div>
        )}

        {!isTokenInvalid && (
          <button onClick={handleLogout} className="w-full rounded-b-md text-left px-3 py-2 text-sm hover:bg-spotify-surface-2 transition text-red-400 cursor-pointer">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
