import { pgSchema } from "drizzle-orm/pg-core";

// Semua tabel app hidup di schema `onepadel` (isolasi dari public).
export const onepadel = pgSchema("onepadel");
