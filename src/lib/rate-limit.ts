import { headers } from "next/headers";

// Rate limit sederhana in-memory (single instance Easypanel). Reset saat restart;
// cukup untuk cegah spam booking guest. Untuk multi-instance pindah ke Redis/DB.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (b.count >= limit) return { ok: false, retryAfterMs: b.resetAt - now };
  b.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

// Identitas guest dari header proxy (Easypanel/Traefik set x-forwarded-for).
export async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

// Guard tindakan guest. Default: 8 aksi / 5 menit per IP+scope.
export async function guardGuest(
  scope: string,
  limit = 8,
  windowMs = 5 * 60_000,
): Promise<{ ok: boolean; error?: string }> {
  const ip = await clientIp();
  const r = rateLimit(`${scope}:${ip}`, limit, windowMs);
  if (!r.ok) {
    return {
      ok: false,
      error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(r.retryAfterMs / 60000)} menit.`,
    };
  }
  return { ok: true };
}

// Buang bucket kedaluwarsa biar map tak tumbuh (panggil sesekali).
export function sweepRateLimit() {
  const now = Date.now();
  for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
}
