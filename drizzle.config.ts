import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["onepadel"],
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://onepadel:onepadel@127.0.0.1:5435/onepadel",
  },
  verbose: true,
  strict: true,
});
