// Jalan saat boot prod (package.json "start"). Apply migration drizzle.
// Aman kalau tidak ada migration baru (idempotent).
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[migrate] DATABASE_URL belum di-set, skip.");
  process.exit(0);
}

const sql = postgres(url, { max: 1 });
try {
  // Pastikan schema ada sebelum migrate (drizzle journal pakai default).
  await sql.unsafe('CREATE SCHEMA IF NOT EXISTS "onepadel"');
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] selesai.");
} catch (err) {
  console.error("[migrate] gagal:", err);
  process.exit(1);
} finally {
  await sql.end();
}
