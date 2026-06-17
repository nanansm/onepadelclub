import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user, venue } from "@/db/schema";
import { auth } from "@/lib/auth";

// Bootstrap prod sekali jalan saat boot (dipanggil instrumentation.register).
// Idempotent & defensif: error apa pun di-log, TIDAK pernah crash-kan server.
// Tujuannya operator non-teknis cukup set env di Easypanel, tanpa run command.

// Pastikan ada baris venue tunggal. Tanpa ini, "Tambah Lapangan" di admin gagal
// ("Venue belum dikonfigurasi"). Field lain pakai default via mergeSettings.
async function ensureVenue() {
  const existing = await db.select({ id: venue.id }).from(venue).limit(1);
  if (existing.length > 0) return;
  await db.insert(venue).values({
    name: "One Padel Club",
    slug: "one-padel-club",
  });
  console.log("[bootstrap] baris venue dibuat.");
}

// Bikin akun super_admin pertama dari env SEED_ADMIN_EMAIL/PASSWORD/NAME.
// Skip kalau env kosong atau user sudah ada (idempotent).
async function ensureAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Admin";
  if (!email || !password) return; // belum di-set: lewati diam-diam

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing.length > 0) return;

  await auth.api.signUpEmail({ body: { email, password, name } });
  await db
    .update(user)
    .set({ role: "super_admin" })
    .where(eq(user.email, email));
  console.log(`[bootstrap] super_admin dibuat: ${email}`);
}

export async function bootstrap() {
  try {
    await ensureVenue();
    await ensureAdmin();
  } catch (err) {
    // Jangan crash server kalau bootstrap gagal (mis. DB belum siap di detik awal).
    console.error("[bootstrap] gagal (server tetap jalan):", err);
  }
}
