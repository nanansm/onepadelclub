import "server-only";
import { db } from "@/db";
import { venue } from "@/db/schema";

// ============================================================================
// Payment gateway — SCAFFOLD. Default produk = transfer manual + bukti WA.
// Modul ini menyiapkan jalur gateway (Midtrans/Xendit) supaya nanti tinggal
// isi API key di /admin/settings tanpa refactor. BELUM memproses transaksi.
// ============================================================================

export type GatewayConfig = {
  provider: string; // "" = nonaktif | "midtrans" | "xendit"
  serverKey: string;
  clientKey: string;
  active: boolean;
};

export async function getGatewayConfig(): Promise<GatewayConfig> {
  const v = (await db.select().from(venue).limit(1))[0];
  const provider = v?.gatewayProvider || "";
  const serverKey = v?.gatewayServerKey || "";
  const clientKey = v?.gatewayClientKey || "";
  return {
    provider,
    serverKey,
    clientKey,
    // Aktif hanya kalau provider + server key terisi.
    active: Boolean(provider && serverKey),
  };
}

export type PaymentSession = {
  ok: boolean;
  redirectUrl?: string;
  token?: string;
  error?: string;
};

// Placeholder. Saat integrasi penuh, di sini bikin transaksi ke provider
// (Snap/Invoice) dan kembalikan redirectUrl/token. Sekarang selalu "belum aktif".
export async function createPaymentSession(input: {
  code: string;
  amount: number;
  customerName: string;
  customerWa?: string;
}): Promise<PaymentSession> {
  void input; // dipakai saat integrasi penuh
  const cfg = await getGatewayConfig();
  if (!cfg.active) {
    return { ok: false, error: "Pembayaran online belum aktif. Pakai transfer manual." };
  }
  // TODO(integrasi): panggil API provider sesuai cfg.provider.
  return { ok: false, error: "Integrasi gateway belum diimplementasikan." };
}

// Verifikasi signature webhook. Placeholder — diisi sesuai spesifikasi provider.
export function verifyWebhookSignature(raw: string, signature: string): boolean {
  void raw;
  void signature;
  return false;
}
