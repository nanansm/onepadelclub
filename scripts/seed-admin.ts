// Bootstrap akun admin pertama via better-auth. Idempotent (skip kalau sudah ada).
// Pakai: SEED_ADMIN_EMAIL/PASSWORD/NAME di .env. Email harus ada di ADMIN_EMAILS.
import { auth } from "../src/lib/auth";
import { db } from "../src/db";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const name = process.env.SEED_ADMIN_NAME ?? "Admin";

async function main() {
  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD belum di-set");
  }

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[seed] admin ${email} sudah ada, skip.`);
    return;
  }

  await auth.api.signUpEmail({ body: { email, password, name } });
  await db.update(user).set({ role: "super_admin" }).where(eq(user.email, email));
  console.log(`[seed] admin dibuat: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] gagal:", err);
    process.exit(1);
  });
