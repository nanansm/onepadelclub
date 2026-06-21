import "server-only";
import { db } from "@/db";
import { venue } from "@/db/schema";
import type { BookingNotif } from "@/lib/mailer";

// ============================================================================
// Notifikasi WhatsApp via Evolution API (self-hosted). Config dari baris venue
// (diatur owner di /admin/settings). Server-only — apiKey tak pernah ke client.
// Semua kirim fire-and-forget + timeout, supaya tak pernah memblok booking.
// ============================================================================

export type WaConfig = {
  enabled: boolean;
  baseUrl: string;
  instance: string;
  apiKey: string;
  templateBooking: string;
  templatePaid: string;
};

// Template bawaan (dipakai kalau owner tak isi). Placeholder di-replace.
export const DEFAULT_WA_BOOKING =
  "Halo {nama} 👋\n\nBooking *{jenis}* kamu sudah kami terima. Detail:\n• Kode: *{kode}*\n• Jadwal: {detail}\n• Total: {total}\n\nSlot di-hold sementara. Selesaikan pembayaran lalu kirim bukti ke chat ini ya 🙏\n{link}";
export const DEFAULT_WA_PAID =
  "Halo {nama} ✅\n\nPembayaran *{jenis}* (kode *{kode}*) sudah kami terima dan *terkonfirmasi*.\n• Detail: {detail}\n\nSampai ketemu di lapangan, ya! 🎾\n{link}";

export async function getWaConfig(): Promise<WaConfig> {
  const v = (await db.select().from(venue).limit(1))[0];
  return {
    enabled: v?.waEnabled ?? false,
    baseUrl: (v?.evoBaseUrl || process.env.EVO_BASE_URL || "").replace(/\/+$/, ""),
    instance: v?.evoInstance || process.env.EVO_INSTANCE || "",
    apiKey: v?.evoApiKey || process.env.EVO_API_KEY || "",
    templateBooking: v?.waTemplateBooking?.trim() || DEFAULT_WA_BOOKING,
    templatePaid: v?.waTemplatePaid?.trim() || DEFAULT_WA_PAID,
  };
}

// Isi placeholder + rapikan baris kosong sisa placeholder yang tak terpakai.
function renderTemplate(tpl: string, vars: Record<string, string>): string {
  let out = tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  // Buang baris yang jadi kosong (mis. total/detail tak ada) & rapikan.
  out = out
    .split("\n")
    .filter((line, i, arr) => {
      const t = line.trim();
      // buang baris bullet kosong "• X:" tanpa nilai
      if (/^•\s*[^:]+:\s*$/.test(t)) return false;
      // jangan biarkan >1 baris kosong beruntun
      if (t === "" && arr[i - 1]?.trim() === "") return false;
      return true;
    })
    .join("\n")
    .trim();
  return out;
}

function baseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3007"
  );
}

// 08xx / +62 / 62 / spasi-strip → 628xxxxxxxxxx (format Evolution: JID lokal).
export function normalizeWa(raw: string | null | undefined): string {
  if (!raw) return "";
  let n = raw.replace(/[^\d+]/g, "");
  n = n.replace(/^\+/, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  else if (n.startsWith("8")) n = "62" + n;
  return n;
}

type SendResult = { ok: boolean; error?: string };

// Kirim 1 pesan teks. Dipakai langsung oleh tombol "Kirim WA tes" nanti.
export async function sendWa(
  opts: { to: string; text: string },
  cfgOverride?: WaConfig,
): Promise<SendResult> {
  const cfg = cfgOverride ?? (await getWaConfig());
  if (!cfg.baseUrl || !cfg.instance || !cfg.apiKey) {
    return { ok: false, error: "Evolution belum lengkap (base URL/instance/API key)." };
  }
  const to = normalizeWa(opts.to);
  if (!to) return { ok: false, error: "Nomor WhatsApp tujuan kosong." };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${cfg.baseUrl}/message/sendText/${cfg.instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: cfg.apiKey },
      body: JSON.stringify({ number: to, text: opts.text }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Evolution ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal kirim WA" };
  } finally {
    clearTimeout(timer);
  }
}

// Fire-and-forget: panggil tanpa await dari jalur create/confirm booking.
export function fireWa(fn: () => Promise<unknown>): void {
  void Promise.resolve()
    .then(fn)
    .catch((e) => console.error("[wa]", e));
}

// --- Template pesan (copy ramah + jelas, Bahasa Indonesia) ---

function invoiceUrl(p: BookingNotif): string {
  return p.invoicePath ? `${baseUrl()}${p.invoicePath}` : "";
}

function templateVars(p: BookingNotif): Record<string, string> {
  return {
    nama: p.nama ?? "kak",
    jenis: p.jenis,
    kode: p.kode ?? "",
    detail: p.detail ?? "",
    total: p.total ?? "",
    link: invoiceUrl(p),
  };
}

// Pesan ke customer saat booking dibuat (instruksi bayar).
export async function notifyCustomerBookingWa(p: BookingNotif): Promise<void> {
  const cfg = await getWaConfig();
  if (!cfg.enabled || !p.wa) return;
  await sendWa(
    { to: p.wa, text: renderTemplate(cfg.templateBooking, templateVars(p)) },
    cfg,
  );
}

// Pesan ke customer saat pembayaran dikonfirmasi admin.
export async function notifyCustomerPaidWa(p: BookingNotif): Promise<void> {
  const cfg = await getWaConfig();
  if (!cfg.enabled || !p.wa) return;
  await sendWa(
    { to: p.wa, text: renderTemplate(cfg.templatePaid, templateVars(p)) },
    cfg,
  );
}
