import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  // Unit test tak butuh CSS; hindari load postcss/tailwind config.
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // DATABASE_URL dummy: modul db dibuat lazy (tak connect sampai query),
    // jadi unit test fungsi murni jalan tanpa DB nyata.
    env: {
      DATABASE_URL: "postgresql://test:test@127.0.0.1:5999/test",
      BETTER_AUTH_SECRET: "test-secret",
    },
  },
});
