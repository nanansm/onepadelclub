// Anti-stuck: global error logging + self-ping /api/health agar instance
// tidak idle-freeze. Hanya jalan di runtime Node (bukan edge).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
  });

  // Bootstrap prod: pastikan venue row + admin pertama ada (idempotent, non-fatal).
  const { bootstrap } = await import("./src/lib/bootstrap");
  await bootstrap();

  const url = (process.env.BETTER_AUTH_URL ?? "http://localhost:3007") + "/api/health";
  setInterval(() => {
    fetch(url).catch(() => {});
  }, 45_000);
}
