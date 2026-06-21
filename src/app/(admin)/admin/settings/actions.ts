"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { venue } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { getSmtpConfig, sendMail } from "@/lib/mailer";
import { getWaConfig, sendWa } from "@/lib/wa";
import { getSettings } from "@/lib/settings";

type ActionResult = { ok: boolean; error?: string };

// Terima "true"/"on"/true sebagai boolean true; sisanya false.
const coerceBool = z.preprocess(
  (v) => v === true || v === "true" || v === "on" || v === "1",
  z.boolean(),
);

// Baris {title, body} untuk schemes / rules.
const itemSchema = z.object({
  title: z.string().trim().default(""),
  body: z.string().trim().default(""),
});

const settingsSchema = z.object({
  // identitas & kontak
  name: z.string().trim().optional().default(""),
  tagline: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  whatsapp: z.string().trim().optional().default(""),
  instagram: z.string().trim().optional().default(""),
  tiktok: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  mapsUrl: z.string().trim().optional().default(""),
  // jam
  openHour: z.coerce.number().int().min(0).max(23),
  closeHour: z.coerce.number().int().min(0).max(23),
  // pembayaran
  bankName: z.string().trim().optional().default(""),
  bankNumber: z.string().trim().optional().default(""),
  bankHolder: z.string().trim().optional().default(""),
  qrisUrl: z.string().trim().optional().default(""),
  paymentNotes: z.string().trim().optional().default(""),
  // konten landing
  heroBadge: z.string().trim().optional().default(""),
  heroHeadline: z.string().trim().optional().default(""),
  heroSubcopy: z.string().trim().optional().default(""),
  ligaHeadline: z.string().trim().optional().default(""),
  ligaBody: z.string().trim().optional().default(""),
  schemes: z.array(itemSchema).default([]),
  rules: z.array(itemSchema).default([]),
  facilities: z
    .array(
      z.object({
        icon: z.string().trim().default("cafe"),
        label: z.string().trim().default(""),
      }),
    )
    .default([]),
  gallery: z
    .array(
      z.object({
        src: z.string().trim().default(""),
        tag: z.string().trim().default(""),
        caption: z.string().trim().default(""),
      }),
    )
    .default([]),
  // branding
  logoUrl: z.string().trim().optional().default(""),
  heroImageUrl: z.string().trim().optional().default(""),
  brandPrimary: z.string().trim().optional().default(""),
  brandAccent: z.string().trim().optional().default(""),
  brandCream: z.string().trim().optional().default(""),
  // SEO
  metaTitle: z.string().trim().optional().default(""),
  metaDescription: z.string().trim().optional().default(""),
  ogImageUrl: z.string().trim().optional().default(""),
  // booking
  minDuration: z.coerce.number().int().min(1).max(12),
  maxDuration: z.coerce.number().int().min(1).max(12),
  holdMinutes: z.coerce.number().int().min(5).max(240),
  // notifikasi email / SMTP
  notifEnabled: coerceBool.default(false),
  notifyEmail: z.string().trim().optional().default(""),
  smtpHost: z.string().trim().optional().default(""),
  smtpPort: z.coerce.number().int().min(1).max(65535).default(587),
  smtpSecure: coerceBool.default(false),
  smtpUser: z.string().trim().optional().default(""),
  smtpFromName: z.string().trim().optional().default(""),
  smtpFromEmail: z.string().trim().optional().default(""),
  // write-only: cuma di-set kalau diisi (kosong = pertahankan yang lama)
  smtpPassword: z.string().optional(),
  // --- Produk white-label (v2) ---
  ligaEnabled: coerceBool.default(false),
  posEnabled: coerceBool.default(false),
  taxPercent: z.coerce.number().int().min(0).max(100).default(0),
  paymentMode: z.enum(["MANUAL", "GATEWAY", "BOTH"]).default("MANUAL"),
  // WhatsApp Evolution API
  waEnabled: coerceBool.default(false),
  evoBaseUrl: z.string().trim().optional().default(""),
  evoInstance: z.string().trim().optional().default(""),
  evoApiKey: z.string().optional(), // write-only
  // Payment gateway (scaffold)
  gatewayProvider: z.string().trim().optional().default(""),
  gatewayClientKey: z.string().trim().optional().default(""),
  gatewayServerKey: z.string().optional(), // write-only
});

export async function updateSettingsAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  // Pisahkan secret write-only: hanya set kalau diisi (kosong = pertahankan lama).
  const { smtpPassword, evoApiKey, gatewayServerKey, ...rest } = parsed.data;
  const data = {
    ...rest,
    // Buang baris fasilitas tanpa label biar tak render chip kosong.
    facilities: rest.facilities.filter((f) => f.label.trim().length > 0),
    // Buang slide galeri tanpa gambar.
    gallery: rest.gallery.filter((g) => g.src.trim().length > 0),
    ...(smtpPassword && smtpPassword.length > 0 ? { smtpPassword } : {}),
    ...(evoApiKey && evoApiKey.length > 0 ? { evoApiKey } : {}),
    ...(gatewayServerKey && gatewayServerKey.length > 0 ? { gatewayServerKey } : {}),
  };

  // Upsert baris venue tunggal.
  const v = (await db.select({ id: venue.id }).from(venue).limit(1))[0];
  if (v) {
    await db.update(venue).set(data).where(eq(venue.id, v.id));
  } else {
    await db.insert(venue).values({
      ...data,
      name: data.name || "Padel Club",
      slug: "padel-club",
    });
  }

  // Refresh konten yang membaca settings.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/liga/regulasi");
  return { ok: true };
}

// Kirim email tes pakai config SMTP yang TERSIMPAN (simpan dulu sebelum tes).
export async function sendTestEmailAction(): Promise<ActionResult> {
  await requireAdmin();
  const cfg = await getSmtpConfig();
  const to = cfg.notifyEmail || cfg.user;
  if (!to) {
    return { ok: false, error: "Tujuan email kosong. Isi email tujuan / SMTP user." };
  }
  const brand = cfg.fromName || "Padel Club";
  const res = await sendMail(
    {
      to,
      subject: `Tes notifikasi ${brand}`,
      html: `<div style="font-family:system-ui,sans-serif;color:#16241d">
        <p>Halo,</p>
        <p>Ini email tes dari <strong>${brand}</strong>. Kalau kamu menerima email ini, konfigurasi SMTP sudah berfungsi.</p>
        <p style="color:#5b6b60;font-size:13px">Dikirim otomatis dari halaman Pengaturan admin.</p>
      </div>`,
    },
    cfg,
  );
  return res;
}

// Kirim WA tes ke nomor WhatsApp klub (venue.whatsapp) pakai config TERSIMPAN.
export async function sendTestWaAction(): Promise<ActionResult> {
  await requireAdmin();
  const cfg = await getWaConfig();
  const settings = await getSettings();
  const to = settings.whatsapp;
  if (!to) {
    return { ok: false, error: "Nomor WhatsApp klub kosong. Isi di Identitas & Kontak." };
  }
  return sendWa(
    {
      to,
      text: "✅ Tes notifikasi WhatsApp berhasil. Konfigurasi Evolution API sudah aktif.",
    },
    cfg,
  );
}
