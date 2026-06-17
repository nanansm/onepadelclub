import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Singleton pool (anti-stuck). Hindari bikin koneksi baru tiap request.
// Di Next dev, modul bisa di-reload -> simpan di globalThis biar tidak bocor koneksi.
const globalForDb = globalThis as unknown as {
  __onepadelClient?: ReturnType<typeof postgres>;
};

const connectionString = process.env.DATABASE_URL;
// Saat `next build` (Next "collect page data"), DATABASE_URL belum tentu ada dan
// memang tak dibutuhkan: semua route yang sentuh DB = force-dynamic (tidak
// diprerender). Jangan throw di fase build — cukup throw saat runtime kalau env
// benar-benar hilang (runtime juga divalidasi fail-fast di src/lib/env.ts).
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (!connectionString && !isBuildPhase) {
  throw new Error("DATABASE_URL belum di-set");
}

const client =
  globalForDb.__onepadelClient ??
  postgres(
    connectionString ??
      "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder",
    {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    },
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.__onepadelClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
