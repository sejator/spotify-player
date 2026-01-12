type LogLevel = "state" | "event" | "scheduler" | "audio" | "info" | "warn" | "error" | "adzan" | "iqomah";

const LOG_STYLES: Record<LogLevel, string> = {
  state: "color:#22c55e;font-weight:bold", // hijau
  event: "color:#22c55e;font-weight:bold", // hijau
  scheduler: "color:#38bdf8;font-weight:bold", // biru
  audio: "color:#22c55e;font-weight:bold", // hijau
  info: "color:#3b82f6;font-weight:bold", // biru
  warn: "color:#f97316;font-weight:bold", // orange
  error: "color:#dc2626;font-weight:bold", // merah tua
  adzan: "color:#a855f7;font-weight:bold", // ungu
  iqomah: "color:#a855f7;font-weight:bold", // ungu
};

export function logger(level: LogLevel, label: string, message?: string, payload?: unknown) {
  // if (process.env.NODE_ENV === "production") return;

  const style = LOG_STYLES[level] || "";
  const prefix = `%c[${label.toUpperCase()}]`;

  if (payload !== undefined) {
    console.log(prefix, style, message ?? "", payload);
  } else if (message) {
    console.log(prefix, style, message);
  } else {
    console.log(prefix, style);
  }
}
