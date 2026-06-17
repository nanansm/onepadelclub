import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { uploadImage } from "@/lib/r2";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_PREFIX = new Set([
  "coach",
  "team",
  "player",
  "qris",
  "proof",
  "logo",
  "hero",
  "og",
]);

export async function POST(req: Request) {
  await requireAdmin();

  const form = await req.formData();
  const file = form.get("file");
  const prefix = String(form.get("prefix") ?? "misc");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File wajib" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Harus berupa gambar" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Maksimal 5MB" }, { status: 400 });
  }
  const safePrefix = ALLOWED_PREFIX.has(prefix) ? prefix : "misc";

  const buf = Buffer.from(await file.arrayBuffer());
  const { url } = await uploadImage(buf, safePrefix);
  return NextResponse.json({ ok: true, url });
}
