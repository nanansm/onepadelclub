import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { onepadel } from "./_base";

export const courtType = onepadel.enum("court_type", ["INDOOR", "OUTDOOR"]);

export const bookingStatus = onepadel.enum("booking_status", [
  "PENDING",
  "PAID",
  "CANCELLED",
  "COMPLETED",
]);

// Satu klub. Baris venue tunggal menyimpan jam operasional + info pembayaran.
export const venue = onepadel.table("venue", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  mapsUrl: text("maps_url"),
  openHour: integer("open_hour").notNull().default(7),
  closeHour: integer("close_hour").notNull().default(23),
  bankName: text("bank_name"),
  bankNumber: text("bank_number"),
  bankHolder: text("bank_holder"),
  qrisUrl: text("qris_url"),
  paymentNotes: text("payment_notes"),
  // --- Settings tambahan (Tier 1-8). Semua additive & nullable: null -> pakai
  // default di src/lib/settings.ts. Owner non-teknis edit lewat /admin/settings.
  // Kontak ekstra
  tiktok: text("tiktok"),
  email: text("email"),
  phone: text("phone"),
  // Fasilitas klub — array {icon, label}. null -> pakai DEFAULT_FACILITIES.
  facilities: jsonb("facilities").$type<{ icon: string; label: string }[]>(),
  // Galeri suasana/komunitas — array {src, tag, caption}. null -> DEFAULT_GALLERY.
  gallery: jsonb("gallery").$type<
    { src: string; tag: string; caption: string }[]
  >(),
  // Konten hero + landing
  tagline: text("tagline"),
  heroBadge: text("hero_badge"),
  heroHeadline: text("hero_headline"),
  heroSubcopy: text("hero_subcopy"),
  ligaHeadline: text("liga_headline"),
  ligaBody: text("liga_body"),
  // Kartu "Cara Main" (4) & aturan Liga (8) — array {title, body}
  schemes: jsonb("schemes").$type<{ title: string; body: string }[]>(),
  rules: jsonb("rules").$type<{ title: string; body: string }[]>(),
  // Branding
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  brandPrimary: text("brand_primary"),
  brandAccent: text("brand_accent"),
  brandCream: text("brand_cream"),
  // SEO / meta
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImageUrl: text("og_image_url"),
  // Konstanta booking
  minDuration: integer("min_duration").notNull().default(1),
  maxDuration: integer("max_duration").notNull().default(6),
  // Lama slot di-hold (menit) untuk booking PENDING sebelum auto-batal cron.
  holdMinutes: integer("hold_minutes").notNull().default(30),
  // --- Notifikasi email (SMTP). Password TIDAK pernah dikirim ke client. ---
  notifEnabled: boolean("notif_enabled").notNull().default(false),
  notifyEmail: text("notify_email"), // tujuan alert admin (booking masuk)
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpSecure: boolean("smtp_secure").notNull().default(false),
  smtpUser: text("smtp_user"),
  smtpPassword: text("smtp_password"),
  smtpFromName: text("smtp_from_name"),
  smtpFromEmail: text("smtp_from_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const court = onepadel.table(
  "court",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    venueId: text("venue_id")
      .notNull()
      .references(() => venue.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: courtType("type").notNull().default("INDOOR"),
    // Permukaan lapangan (mis. "Premium Synthetic Grass"). null -> tak ditampilkan.
    surface: text("surface"),
    pricePerHour: integer("price_per_hour").notNull(),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("court_venue_idx").on(t.venueId)],
);

export const courtBooking = onepadel.table(
  "court_booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Kode publik singkat untuk halaman invoice (mis. OPC-7F3K2A).
    code: text("code").notNull().unique(),
    courtId: text("court_id")
      .notNull()
      .references(() => court.id, { onDelete: "restrict" }),
    customerName: text("customer_name").notNull(),
    customerWa: text("customer_wa").notNull(),
    customerEmail: text("customer_email"),
    // Tanggal main, "YYYY-MM-DD" (WIB).
    date: date("date", { mode: "string" }).notNull(),
    startHour: integer("start_hour").notNull(),
    duration: integer("duration").notNull(),
    // Harga dihitung server (pricePerHour * duration), tidak dari klien.
    totalPrice: integer("total_price").notNull(),
    status: bookingStatus("status").notNull().default("PENDING"),
    notes: text("notes"),
    // Asal booking: "web" (online) atau "kasir" (input admin/walk-in).
    source: text("source").notNull().default("web"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
  (t) => [index("court_booking_court_date_idx").on(t.courtId, t.date)],
);

export type Venue = typeof venue.$inferSelect;
export type Court = typeof court.$inferSelect;
export type CourtBooking = typeof courtBooking.$inferSelect;
export type BookingStatus = (typeof bookingStatus.enumValues)[number];
