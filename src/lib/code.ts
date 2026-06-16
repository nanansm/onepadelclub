// Kode publik singkat tanpa karakter ambigu (0/O/1/I).
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function genCode(prefix = "OPC"): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${s}`;
}

export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}
