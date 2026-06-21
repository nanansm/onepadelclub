import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payment";

// Webhook payment gateway — SCAFFOLD (nonaktif). Saat integrasi penuh:
// 1) verifikasi signature, 2) cari booking by code, 3) set status PAID,
// 4) kirim WA terkonfirmasi. Sekarang cuma ACK supaya endpoint sudah ada.
export async function POST(req: Request) {
  const raw = await req.text().catch(() => "");
  const signature =
    req.headers.get("x-signature") || req.headers.get("x-callback-token") || "";

  if (!verifyWebhookSignature(raw, signature)) {
    // Belum aktif: balas 200 supaya provider tak retry beruntun saat testing.
    return NextResponse.json({ ok: true, note: "gateway scaffold (inactive)" });
  }

  // TODO(integrasi): parse payload → update booking → notify.
  return NextResponse.json({ ok: true });
}
