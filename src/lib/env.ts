// Akses env terpusat + fail-fast saat yang wajib hilang.
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} belum di-set`);
  return v;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  authSecret: required("BETTER_AUTH_SECRET"),
  authUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3007",
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return env.adminEmails.includes(email.toLowerCase());
}
