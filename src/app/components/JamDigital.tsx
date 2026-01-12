"use client";

import { useEffect, useState } from "react";
import { JadwalHarian } from "@/types/jadwalSholat.type";
import { getNextSholat } from "@/utils/checkAdzan";

interface JamDigitalProps {
  jadwal: JadwalHarian | null;
  onNextSholatUpdate?: (next: { name: string; time: string } | null) => void;
}

export default function JamDigital({ jadwal, onNextSholatUpdate }: JamDigitalProps) {
  const [time, setTime] = useState("00:00:00");
  const [nextSholat, setNextSholat] = useState<{ name: string; time: string } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!jadwal) return;

    const updateNext = () => {
      const next = getNextSholat(jadwal);
      setNextSholat(next);
      if (onNextSholatUpdate) onNextSholatUpdate(next);
    };

    updateNext();
    const interval = setInterval(updateNext, 1000);
    return () => clearInterval(interval);
  }, [jadwal, onNextSholatUpdate]);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold tracking-widest text-spotify-white">{time}</div>
      {nextSholat && (
        <p className="mt-1 text-xs text-spotify-accent font-semibold">
          {nextSholat.name} · {nextSholat.time}
        </p>
      )}
    </div>
  );
}
