import { cache } from "react";
import type { CSSProperties } from "react";
import { db } from "@/db";
import { venue, type Venue } from "@/db/schema";

// ============================================================================
// Settings terpusat — sumber konten yang bisa diedit owner via /admin/settings.
// Semua field disimpan di baris `venue` tunggal. Field null -> pakai DEFAULTS,
// jadi landing/SEO selalu punya isi walau owner belum pernah edit.
// ============================================================================

export type SchemeItem = { title: string; body: string };
export type RuleItem = { title: string; body: string };
export type FacilityItem = { icon: string; label: string };
export type GalleryItem = { src: string; tag: string; caption: string };

export type Settings = {
  // identitas & kontak
  name: string;
  tagline: string;
  address: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  email: string;
  phone: string;
  mapsUrl: string;
  // jam
  openHour: number;
  closeHour: number;
  // pembayaran
  bankName: string;
  bankNumber: string;
  bankHolder: string;
  qrisUrl: string;
  paymentNotes: string;
  // konten landing
  heroBadge: string;
  heroHeadline: string;
  heroSubcopy: string;
  ligaHeadline: string;
  ligaBody: string;
  schemes: SchemeItem[];
  rules: RuleItem[];
  facilities: FacilityItem[];
  gallery: GalleryItem[];
  // branding
  logoUrl: string;
  heroImageUrl: string;
  brandPrimary: string;
  brandAccent: string;
  brandCream: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  // booking
  minDuration: number;
  maxDuration: number;
  holdMinutes: number;
  // notifikasi email (SMTP) — TANPA password (password server-only di mailer.ts)
  notifEnabled: boolean;
  notifyEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpFromName: string;
  smtpFromEmail: string;
  smtpPasswordSet: boolean; // cuma penanda "sudah ada password", bukan nilainya
  // --- Produk white-label (v2) ---
  // modul toggle
  ligaEnabled: boolean;
  ligaName: string;
  posEnabled: boolean;
  taxPercent: number;
  paymentMode: "MANUAL" | "GATEWAY" | "BOTH";
  // WhatsApp Evolution API — apiKey server-only (cuma flag yang keluar)
  waEnabled: boolean;
  evoBaseUrl: string;
  evoInstance: string;
  evoApiKeySet: boolean;
  waTemplateBooking: string; // kosong = pakai bawaan
  waTemplatePaid: string;
  waTemplateReminder: string;
  // Payment gateway (scaffold) — serverKey server-only
  gatewayProvider: string;
  gatewayClientKey: string;
  gatewayServerKeySet: boolean;
};

export const DEFAULT_SCHEMES: SchemeItem[] = [
  { title: "Sewa Lapangan", body: "Pilih tanggal dan jam kosong, bayar, langsung main. Tanpa akun." },
  { title: "Open Play / Mabar", body: "Gabung sesi main bareng sesuai level. Daftar per kursi, kuota terbatas." },
  { title: "Coaching / Klinik", body: "Latihan bareng pelatih berpengalaman. Pilih pelatih dan jam yang cocok." },
  { title: "Membership", body: "Paket member dengan harga khusus dan benefit rutin main tiap bulan." },
];

export const DEFAULT_RULES: RuleItem[] = [
  { title: "Penghitungan Poin", body: "Menang = +3 poin, Kalah = 0 poin, WO = -1 poin. Klasemen update otomatis setiap skor disubmit admin." },
  { title: "Tiebreaker Klasemen", body: "Urutan penentu: (1) head-to-head, (2) selisih game, (3) game menang, (4) WO paling sedikit, (5) sudden death playoff 10 menit." },
  { title: "WO & Keterlambatan", body: "Telat 1-5 menit: lawan +1 game. Telat >5 menit: lawan +2 game. Telat >10 menit: WO. WO ke-2 dalam satu season: diskualifikasi." },
  { title: "Promosi & Degradasi", body: "Akhir season: rank 7-8 Liga 1 turun ke Liga 2, rank 1-2 Liga 2 naik ke Liga 1. Dieksekusi panitia via finalisasi season." },
  { title: "Hall of Fame Lock", body: "Tim/pemain yang juara 3x berturut-turut di kategori sama masuk Hall of Fame dan diblokir 1 season dari kategori tersebut." },
  { title: "Roster Lock", body: "Setelah jadwal season dirilis, perubahan roster hanya oleh admin, maksimal 1 orang per bulan." },
  { title: "Lock Edit Skor", body: "Skor hanya bisa diubah admin dalam 24 jam setelah match selesai. Lebih dari itu perlu approval super admin." },
  { title: "Deposit WO", body: "Deposit Rp100.000 per tim, dikembalikan penuh di akhir season jika tim tidak pernah WO sekalipun." },
];

// icon = key di FACILITY_ICONS (src/lib/facility-icons.ts). label = teks tampil.
export const DEFAULT_FACILITIES: FacilityItem[] = [
  { icon: "cafe", label: "Cafe & Resto" },
  { icon: "hotShower", label: "Hot Shower" },
  { icon: "snacks", label: "Jual Makanan Ringan" },
  { icon: "drinks", label: "Jual Minuman" },
  { icon: "musholla", label: "Musholla" },
  { icon: "parkirMobil", label: "Parkir Mobil" },
  { icon: "parkirMotor", label: "Parkir Motor" },
  { icon: "ruangGanti", label: "Ruang Ganti" },
  { icon: "shower", label: "Shower" },
  { icon: "toilet", label: "Toilet" },
  { icon: "tribun", label: "Tribun Penonton" },
  { icon: "wifi", label: "Wi-fi" },
];

// Galeri default = foto bawaan di /public. Owner ganti via /admin/settings.
export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    src: "/newimg4.webp",
    tag: "Venue",
    caption: "Lapangan indoor yang nyaman buat main maupun nongkrong.",
  },
  {
    src: "/newimg2.webp",
    tag: "Turnamen",
    caption: "Event & turnamen rutin — dari mabar santai sampai liga resmi.",
  },
  {
    src: "/newimg3.webp",
    tag: "Komunitas",
    caption: "Pemain dari berbagai level main bareng tiap minggu.",
  },
];

export const DEFAULTS: Settings = {
  name: "Padel Club",
  tagline: "Main padel, gabung komunitas.",
  address: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
  email: "",
  phone: "",
  mapsUrl: "",
  openHour: 7,
  closeHour: 23,
  bankName: "",
  bankNumber: "",
  bankHolder: "",
  qrisUrl: "",
  paymentNotes: "",
  heroBadge: "Sudah Buka",
  heroHeadline: "Lapangan padel indoor untuk semua level.",
  heroSubcopy:
    "Lapangan nyaman, komunitas aktif, dan turnamen rutin. Booking lapangan, open play, coaching, sampai membership — semua dari satu tempat, tanpa ribet.",
  ligaHeadline: "Kompetisi. Komunitas. Kemenangan.",
  ligaBody:
    "Liga komunitas: kompetisi berjenjang dengan klasemen real-time, jadwal, live score, dan profil tim. Buktikan timmu dan naik kasta tiap season.",
  schemes: DEFAULT_SCHEMES,
  rules: DEFAULT_RULES,
  facilities: DEFAULT_FACILITIES,
  gallery: DEFAULT_GALLERY,
  logoUrl: "",
  heroImageUrl: "",
  brandPrimary: "#1a4d33",
  brandAccent: "#d97721",
  brandCream: "#dfe8d0",
  metaTitle: "Padel Club — Booking Lapangan Padel",
  metaDescription:
    "Booking lapangan padel, open play, coaching, dan membership. Cepat, tanpa akun.",
  ogImageUrl: "",
  minDuration: 1,
  maxDuration: 6,
  holdMinutes: 30,
  notifEnabled: false,
  notifyEmail: "",
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpFromName: "Padel Club",
  smtpFromEmail: "",
  smtpPasswordSet: false,
  ligaEnabled: false,
  ligaName: "Liga Komunitas",
  posEnabled: false,
  taxPercent: 0,
  paymentMode: "MANUAL",
  waEnabled: false,
  evoBaseUrl: "",
  evoInstance: "",
  evoApiKeySet: false,
  waTemplateBooking: "",
  waTemplatePaid: "",
  waTemplateReminder: "",
  gatewayProvider: "",
  gatewayClientKey: "",
  gatewayServerKeySet: false,
};

// Gabung baris venue (boleh null) dengan DEFAULTS. String kosong/null -> default.
export function mergeSettings(v: Venue | null): Settings {
  if (!v) return DEFAULTS;
  const str = (val: string | null | undefined, def: string) =>
    val && val.trim() ? val : def;
  const arr = <T,>(val: T[] | null | undefined, def: T[]) =>
    val && Array.isArray(val) && val.length > 0 ? val : def;
  return {
    name: str(v.name, DEFAULTS.name),
    tagline: str(v.tagline, DEFAULTS.tagline),
    address: str(v.address, DEFAULTS.address),
    whatsapp: str(v.whatsapp, DEFAULTS.whatsapp),
    instagram: str(v.instagram, DEFAULTS.instagram),
    tiktok: str(v.tiktok, DEFAULTS.tiktok),
    email: str(v.email, DEFAULTS.email),
    phone: str(v.phone, DEFAULTS.phone),
    mapsUrl: str(v.mapsUrl, DEFAULTS.mapsUrl),
    openHour: v.openHour ?? DEFAULTS.openHour,
    closeHour: v.closeHour ?? DEFAULTS.closeHour,
    bankName: str(v.bankName, DEFAULTS.bankName),
    bankNumber: str(v.bankNumber, DEFAULTS.bankNumber),
    bankHolder: str(v.bankHolder, DEFAULTS.bankHolder),
    qrisUrl: str(v.qrisUrl, DEFAULTS.qrisUrl),
    paymentNotes: str(v.paymentNotes, DEFAULTS.paymentNotes),
    heroBadge: str(v.heroBadge, DEFAULTS.heroBadge),
    heroHeadline: str(v.heroHeadline, DEFAULTS.heroHeadline),
    heroSubcopy: str(v.heroSubcopy, DEFAULTS.heroSubcopy),
    ligaHeadline: str(v.ligaHeadline, DEFAULTS.ligaHeadline),
    ligaBody: str(v.ligaBody, DEFAULTS.ligaBody),
    schemes: arr(v.schemes, DEFAULTS.schemes),
    rules: arr(v.rules, DEFAULTS.rules),
    facilities: arr(v.facilities, DEFAULTS.facilities),
    gallery: arr(v.gallery, DEFAULTS.gallery),
    logoUrl: str(v.logoUrl, DEFAULTS.logoUrl),
    heroImageUrl: str(v.heroImageUrl, DEFAULTS.heroImageUrl),
    brandPrimary: str(v.brandPrimary, DEFAULTS.brandPrimary),
    brandAccent: str(v.brandAccent, DEFAULTS.brandAccent),
    brandCream: str(v.brandCream, DEFAULTS.brandCream),
    metaTitle: str(v.metaTitle, DEFAULTS.metaTitle),
    metaDescription: str(v.metaDescription, DEFAULTS.metaDescription),
    ogImageUrl: str(v.ogImageUrl, DEFAULTS.ogImageUrl),
    minDuration: v.minDuration ?? DEFAULTS.minDuration,
    maxDuration: v.maxDuration ?? DEFAULTS.maxDuration,
    holdMinutes: v.holdMinutes ?? DEFAULTS.holdMinutes,
    notifEnabled: v.notifEnabled ?? DEFAULTS.notifEnabled,
    notifyEmail: str(v.notifyEmail, DEFAULTS.notifyEmail),
    smtpHost: str(v.smtpHost, DEFAULTS.smtpHost),
    smtpPort: v.smtpPort ?? DEFAULTS.smtpPort,
    smtpSecure: v.smtpSecure ?? DEFAULTS.smtpSecure,
    smtpUser: str(v.smtpUser, DEFAULTS.smtpUser),
    smtpFromName: str(v.smtpFromName, DEFAULTS.smtpFromName),
    smtpFromEmail: str(v.smtpFromEmail, DEFAULTS.smtpFromEmail),
    // Hanya penanda boolean — nilai password tak pernah keluar dari server.
    smtpPasswordSet: Boolean(v.smtpPassword && v.smtpPassword.length > 0),
    ligaEnabled: v.ligaEnabled ?? DEFAULTS.ligaEnabled,
    ligaName: str(v.ligaName, DEFAULTS.ligaName),
    posEnabled: v.posEnabled ?? DEFAULTS.posEnabled,
    taxPercent: v.taxPercent ?? DEFAULTS.taxPercent,
    paymentMode: (v.paymentMode as Settings["paymentMode"]) || DEFAULTS.paymentMode,
    waEnabled: v.waEnabled ?? DEFAULTS.waEnabled,
    evoBaseUrl: str(v.evoBaseUrl, DEFAULTS.evoBaseUrl),
    evoInstance: str(v.evoInstance, DEFAULTS.evoInstance),
    evoApiKeySet: Boolean(v.evoApiKey && v.evoApiKey.length > 0),
    waTemplateBooking: v.waTemplateBooking ?? "",
    waTemplatePaid: v.waTemplatePaid ?? "",
    waTemplateReminder: v.waTemplateReminder ?? "",
    gatewayProvider: str(v.gatewayProvider, DEFAULTS.gatewayProvider),
    gatewayClientKey: str(v.gatewayClientKey, DEFAULTS.gatewayClientKey),
    gatewayServerKeySet: Boolean(v.gatewayServerKey && v.gatewayServerKey.length > 0),
  };
}

// Ambil settings (per-request cache). Selalu return objek lengkap (pakai default).
// DB unreachable (mis. saat `next build` prerender, atau DB blip di runtime) ->
// fallback DEFAULTS, bukan throw. Ini bikin build tak crash & 1 DB down tak
// bikin layar putih (sejalan filosofi anti-stuck). Route yang butuh data DB
// nyata harus tetap `export const dynamic = "force-dynamic"`.
export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const rows = await db.select().from(venue).limit(1);
    return mergeSettings(rows[0] ?? null);
  } catch (err) {
    console.warn("[settings] getSettings gagal, pakai DEFAULTS:", err);
    return DEFAULTS;
  }
});

// --- Helper presentasi ---

// 7 -> "07.00". closeHour 23 -> "23.00".
export function fmtHour(h: number): string {
  return `${String(h).padStart(2, "0")}.00`;
}

// "Setiap hari, 07.00 - 23.00 WIB"
export function hoursLabel(s: Settings): string {
  return `Setiap hari, ${fmtHour(s.openHour)} - ${fmtHour(s.closeHour)} WIB`;
}

// Hero stat: "07–23"
export function hoursShort(s: Settings): string {
  return `${String(s.openHour).padStart(2, "0")}–${String(s.closeHour).padStart(2, "0")}`;
}

export function instagramUrl(s: Settings): string | null {
  return s.instagram ? `https://instagram.com/${s.instagram.replace(/^@/, "")}` : null;
}

export function tiktokUrl(s: Settings): string | null {
  return s.tiktok ? `https://tiktok.com/@${s.tiktok.replace(/^@/, "")}` : null;
}

// CSS vars buat override warna brand di wrapper (.opc / admin shell).
// Override --color-brand/accent/cream (Tailwind v4 utilities baca var ini).
export function brandVars(s: Settings): CSSProperties {
  return {
    "--color-brand": s.brandPrimary,
    "--color-accent": s.brandAccent,
    "--color-cream": s.brandCream,
    "--brand": s.brandPrimary,
    "--accent": s.brandAccent,
  } as CSSProperties;
}
