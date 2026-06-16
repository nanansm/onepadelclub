// Helper waktu WIB (Asia/Jakarta). Server jalan UTC -> jangan pakai
// new Date().toISOString().slice(0,10) buat "hari ini" (geser 7 jam).

const TZ = "Asia/Jakarta";

export function jakartaParts(d: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

// "YYYY-MM-DD" hari ini menurut WIB.
export function todayJakarta(d: Date = new Date()): string {
  const p = jakartaParts(d);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

// Geser tanggal n hari dari "YYYY-MM-DD" (kalender, bebas DST karena WIB fixed +7).
export function ymdOffset(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
