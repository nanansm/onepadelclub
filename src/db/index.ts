import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Singleton pool (anti-stuck). Hindari bikin koneksi baru tiap request.
// Di Next dev, modul bisa di-reload -> simpan di globalThis biar tidak bocor koneksi.
const globalForDb = globalThis as unknown as {
  __onepadelClient?: ReturnType<typeof postgres>;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL belum di-set");
}

const client =
  globalForDb.__onepadelClient ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__onepadelClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
