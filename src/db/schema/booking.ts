import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
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
    // Tanggal main, "YYYY-MM-DD" (WIB).
    date: date("date", { mode: "string" }).notNull(),
    startHour: integer("start_hour").notNull(),
    duration: integer("duration").notNull(),
    // Harga dihitung server (pricePerHour * duration), tidak dari klien.
    totalPrice: integer("total_price").notNull(),
    status: bookingStatus("status").notNull().default("PENDING"),
    notes: text("notes"),
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
