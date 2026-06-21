// Jalan saat boot prod (package.json "start"). Apply migration drizzle.
// Aman kalau tidak ada migration baru (idempotent).
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Seed minimal supaya fresh DB langsung berguna (venue + 4 lapangan).
// Idempotent. Dipakai dari boot prod (hook yang pasti jalan, beda dari
// instrumentation Next yang tak selalu jalan di build standalone).
// Admin pertama dibuat via better-auth saat runtime (instrumentation/manual).
async function seedBaseData(sql) {
  let venue = (await sql`SELECT id FROM onepadel.venue LIMIT 1`)[0];
  if (!venue) {
    // White-label: nama/slug klien dari env (Easypanel). Default netral.
    const name = (process.env.VENUE_NAME || "Padel Club").trim();
    const slug = (
      process.env.VENUE_SLUG ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
      "padel-club"
    ).trim();
    venue = (
      await sql`INSERT INTO onepadel.venue (id, name, slug)
        VALUES (${randomUUID()}, ${name}, ${slug}) RETURNING id`
    )[0];
    console.log(`[migrate] venue dibuat: ${name} (${slug}).`);
  }
  const courts = await sql`SELECT id FROM onepadel.court LIMIT 1`;
  if (courts.length === 0) {
    const grass = "Premium Synthetic Grass";
    const rows = [
      ["Court 1 Hijau", 175000, 1],
      ["Court 2 Teracotta", 175000, 2],
      ["Court 3 Hijau", 200000, 3],
      ["Court 4 Teracotta", 275000, 4],
    ];
    for (const [name, price, ord] of rows) {
      await sql`INSERT INTO onepadel.court
        (id, venue_id, name, type, surface, price_per_hour, sort_order)
        VALUES (${randomUUID()}, ${venue.id}, ${name}, 'INDOOR', ${grass}, ${price}, ${ord})`;
    }
    console.log("[migrate] 4 lapangan awal dibuat.");
  }
}

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
  await seedBaseData(sql);
} catch (err) {
  console.error("[migrate] gagal:", err);
  process.exit(1);
} finally {
  await sql.end();
}
