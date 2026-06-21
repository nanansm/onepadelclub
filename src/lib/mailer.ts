import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { venue } from "@/db/schema";

// ============================================================================
// Email notifikasi (SMTP). Config dari baris venue (diatur owner di Settings)
// dengan fallback ke ENV. Password TIDAK PERNAH dikirim ke client — modul ini
// server-only. Semua pengiriman fire-and-forget supaya tak memblok booking.
// ============================================================================

export type SmtpConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  notifyEmail: string;
};

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const v = (await db.select().from(venue).limit(1))[0];
  const user = v?.smtpUser || process.env.SMTP_USER || "";
  return {
    enabled: v?.notifEnabled ?? false,
    host: v?.smtpHost || process.env.SMTP_HOST || "",
    port: v?.smtpPort ?? (Number(process.env.SMTP_PORT) || 587),
    secure: v?.smtpSecure ?? process.env.SMTP_SECURE === "true",
    user,
    pass: v?.smtpPassword || process.env.SMTP_PASSWORD || "",
    fromName:
      v?.smtpFromName || v?.name || process.env.SMTP_FROM_NAME || "Padel Club",
    fromEmail: v?.smtpFromEmail || process.env.SMTP_FROM_EMAIL || user,
    notifyEmail: v?.notifyEmail || process.env.NOTIFY_EMAIL || user,
  };
}

function baseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3007"
  );
}

type SendResult = { ok: boolean; error?: string };

// Kirim 1 email. Dipakai langsung oleh tombol "Kirim email tes".
export async function sendMail(
  opts: { to: string; subject: string; html: string },
  cfgOverride?: SmtpConfig,
): Promise<SendResult> {
  const cfg = cfgOverride ?? (await getSmtpConfig());
  if (!cfg.host || !cfg.user || !cfg.pass) {
    return { ok: false, error: "SMTP belum lengkap (host/user/password)." };
  }
  if (!opts.to) return { ok: false, error: "Tujuan email kosong." };
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true };
  } catch (e) {
    console.error("[sendMail]", e);
    return { ok: false, error: e instanceof Error ? e.message : "Gagal kirim email." };
  }
}

function shell(title: string, bodyRows: string, brand: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#16241d">
    <div style="background:#1a4d33;color:#f4f7ef;padding:18px 20px;border-radius:14px 14px 0 0">
      <strong style="font-size:16px">${brand}</strong>
    </div>
    <div style="border:1px solid #e4e9e2;border-top:0;border-radius:0 0 14px 14px;padding:20px">
      <h2 style="margin:0 0 12px;font-size:18px">${title}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${bodyRows}</table>
    </div>
  </div>`;
}
function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;color:#5b6b60">${label}</td><td style="padding:6px 0;text-align:right;font-weight:600">${value}</td></tr>`;
}

export type BookingNotif = {
  jenis: string; // "Sewa Lapangan" / "Coaching" / dst
  kode?: string;
  nama?: string;
  wa?: string;
  detail?: string; // ringkasan jadwal/lapangan
  total?: string; // rupiah
  invoicePath?: string; // mis. /booking/CODE
};

// Alert ke admin saat ada booking/pendaftaran baru. Gated `notifEnabled`.
export async function notifyAdminNewBooking(p: BookingNotif): Promise<void> {
  const cfg = await getSmtpConfig();
  if (!cfg.enabled || !cfg.notifyEmail) return;
  const rows = [
    row("Jenis", p.jenis),
    p.kode ? row("Kode", p.kode) : "",
    row("Nama", p.nama ?? "-"),
    p.wa ? row("WhatsApp", p.wa) : "",
    p.detail ? row("Detail", p.detail) : "",
    p.total ? row("Total", p.total) : "",
  ].join("");
  const link = p.invoicePath
    ? `<p style="margin-top:14px"><a href="${baseUrl()}/admin/bookings" style="color:#d97721">Buka panel admin →</a></p>`
    : "";
  await sendMail({
    to: cfg.notifyEmail,
    subject: `[${cfg.fromName}] ${p.jenis} baru — ${p.nama}`,
    html: shell(`${p.jenis} baru masuk`, rows, cfg.fromName) + link,
  });
}

// Konfirmasi ke customer (kalau dia isi email). Gated `notifEnabled`.
export async function notifyCustomerBooking(
  to: string | null | undefined,
  p: BookingNotif,
): Promise<void> {
  if (!to) return;
  const cfg = await getSmtpConfig();
  if (!cfg.enabled) return;
  const rows = [
    row("Jenis", p.jenis),
    p.kode ? row("Kode Booking", p.kode) : "",
    p.detail ? row("Jadwal", p.detail) : "",
    p.total ? row("Total", p.total) : "",
  ].join("");
  const link = p.invoicePath
    ? `<p style="margin-top:14px"><a href="${baseUrl()}${p.invoicePath}" style="color:#d97721">Lihat detail & instruksi bayar →</a></p>`
    : "";
  await sendMail({
    to,
    subject: `Konfirmasi ${p.jenis}${p.kode ? ` — ${p.kode}` : ""}`,
    html:
      shell("Terima kasih, booking kamu kami terima 🎾", rows, cfg.fromName) +
      `<p style="margin-top:12px;font-size:13px;color:#5b6b60">Selesaikan pembayaran sesuai instruksi. Slot di-hold sementara sampai pembayaran dikonfirmasi.</p>` +
      link,
  });
}

// Helper fire-and-forget: panggil tanpa await dari jalur create booking.
export function fireNotify(fn: () => Promise<void>): void {
  void fn().catch((e) => console.error("[notify]", e));
}
