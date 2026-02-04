import "./globals.css";
import { ReactNode } from "react";

import Sidebar from "@/app/components/Sidebar";
import PrayerSchedule from "@/app/components/PrayerSchedule";
import PlayerBar from "@/app/components/PlayerBar";
import { Header } from "@/app/components/Header";

import { PlayerProvider } from "@/app/context/PlayerContext";
import ThemeProvider from "@/app/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import LocalTracksList from "@/app/components/local/LocalTracksList";
import type { Metadata } from "next";
import AdsPanel from "@/app/components/AdsPanel";
import Template from "@/app/components/Template";

export const metadata: Metadata = {
  title: "Pemutar Musik Spotify & Audio Lokal",
  description: "Pemutar musik Spotify dengan dukungan audio lokal dan jadwal sholat.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-spotify-black text-spotify-white">
        <ThemeProvider>
          <PlayerProvider>
            <Template>
              <div className="h-screen w-screen flex flex-col">
                {/* MAIN AREA */}
                <div className="grid flex-1 grid-cols-[260px_1fr_320px] overflow-hidden">
                  {/* LEFT */}
                  <aside className="bg-spotify-surface border-r border-spotify-border h-full overflow-hidden">
                    <Sidebar />
                  </aside>

                  {/* CENTER */}
                  <div className="flex flex-col overflow-hidden bg-linear-to-b from-spotify-surface-2 to-spotify-black">
                    <div className="sticky top-0 z-30 backdrop-blur-md border-b border-spotify-border">
                      <Header />
                    </div>

                    <main className="flex-1 overflow-y-auto">{children}</main>
                  </div>

                  {/* RIGHT */}
                  <aside className="bg-spotify-surface border-l border-spotify-border overflow-y-auto">
                    <div className="p-4 space-y-4">
                      <PrayerSchedule />
                      <AdsPanel />
                      <LocalTracksList />
                    </div>
                  </aside>
                </div>

                {/* PLAYER BAR */}
                <PlayerBar />
              </div>

              <Toaster position="top-center" />
            </Template>
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
