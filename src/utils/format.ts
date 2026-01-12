export function prepareSettingValue(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return String(value);
}

export function parseSettingValue(raw: string | number | boolean | object): string | number | boolean | object {
  const trimmed = String(raw).trim();

  // boolean
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // number
  if (trimmed !== "" && !isNaN(Number(trimmed))) {
    return Number(trimmed);
  }

  // JSON object / array
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function normalizeSettingValue(value: unknown): string {
  if (typeof value !== "string") return String(value);

  const trimmed = value.trim();

  try {
    const parsed = JSON.parse(trimmed);

    if (typeof parsed === "string") return parsed;

    return trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Mengembalikan bulan dan tahun saat ini di zona waktu Jakarta dalam format "yyyy-MM"
 */
export function getBulan(): string {
  const now = new Date();
  // format "MM/yyyy"
  const jakartaTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).format(now);

  const [month, year] = jakartaTime.split("/");
  return `${year}-${month}`;
}

/** Mengembalikan tanggal hari ini di zona waktu Jakarta dalam format "yyyy-MM-dd"
 */
export function getTanggal(): string {
  const now = new Date();
  // format "dd/MM/yyyy"
  const jakartaTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const [month, day, year] = jakartaTime.split("/");
  return `${year}-${month}-${day}`;
}

export function formatDuration(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

export function partialMask(value: string, visible = 8): string {
  if (!value) return "";
  if (value.length <= visible * 2) return "***";

  const start = value.slice(0, visible);
  const end = value.slice(-visible);

  return `${start}***${end}`;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
