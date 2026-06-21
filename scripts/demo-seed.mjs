// Demo seed prod — muat data demo (katalog + liga) dari scripts/demo-seed.sql.
// Dipanggil di boot ("start" chain) SETELAH migrate-prod, SEBELUM next start.
//
// JALAN HANYA kalau env DEMO_SEED truthy (1/true/yes). Default: skip diam-diam.
// TRUNCATE + reinsert (idempotent) — re-run = reset data demo ke kondisi local.
// Setelah dipakai, HAPUS env DEMO_SEED biar redeploy berikutnya tak menimpa data.
//
// Tidak pernah meng-crash boot: error apa pun di-log, exit 0.
import fs from "node:fs";
import postgres from "postgres";

const flag = (process.env.DEMO_SEED || "").trim().toLowerCase();
if (!["1", "true", "yes", "on"].includes(flag)) {
  console.log("[demo-seed] DEMO_SEED tidak aktif, skip.");
  process.exit(0);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[demo-seed] DATABASE_URL kosong, skip.");
  process.exit(0);
}

const sqlText = fs.readFileSync(new URL("./demo-seed.sql", import.meta.url), "utf8");
const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.unsafe(sqlText);
  console.log("[demo-seed] selesai — data demo dimuat (katalog + liga).");
} catch (err) {
  console.error("[demo-seed] GAGAL (boot tetap lanjut):", err);
} finally {
  await sql.end();
}
process.exit(0);
