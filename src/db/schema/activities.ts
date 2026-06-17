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
import { bookingStatus, court, venue } from "./booking";

// ---- Open Play / Mabar ----
export const openPlayStatus = onepadel.enum("open_play_status", [
  "OPEN",
  "FULL",
  "CANCELLED",
  "DONE",
]);

export const openPlaySession = onepadel.table(
  "open_play_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    venueId: text("venue_id")
      .notNull()
      .references(() => venue.id, { onDelete: "cascade" }),
    courtId: text("court_id").references(() => court.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    level: text("level").notNull().default("Mixed"),
    date: date("date", { mode: "string" }).notNull(),
    startHour: integer("start_hour").notNull(),
    duration: integer("duration").notNull(),
    maxPlayers: integer("max_players").notNull(),
    pricePerPlayer: integer("price_per_player").notNull(),
    status: openPlayStatus("status").notNull().default("OPEN"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("open_play_court_date_idx").on(t.courtId, t.date)],
);

export const openPlayRegistration = onepadel.table(
  "open_play_registration",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    sessionId: text("session_id")
      .notNull()
      .references(() => openPlaySession.id, { onDelete: "cascade" }),
    customerName: text("customer_name").notNull(),
    customerWa: text("customer_wa").notNull(),
    customerEmail: text("customer_email"),
    status: bookingStatus("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("open_play_reg_session_idx").on(t.sessionId)],
);

// ---- Coaching ----
export const coach = onepadel.table("coach", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  ratePerHour: integer("rate_per_hour").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const coachingBooking = onepadel.table(
  "coaching_booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    coachId: text("coach_id")
      .notNull()
      .references(() => coach.id, { onDelete: "restrict" }),
    courtId: text("court_id").references(() => court.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    customerWa: text("customer_wa").notNull(),
    customerEmail: text("customer_email"),
    date: date("date", { mode: "string" }).notNull(),
    startHour: integer("start_hour").notNull(),
    duration: integer("duration").notNull(),
    totalPrice: integer("total_price").notNull(),
    status: bookingStatus("status").notNull().default("PENDING"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
  (t) => [index("coaching_coach_date_idx").on(t.coachId, t.date)],
);

// ---- Membership ----
export const membershipStatus = onepadel.enum("membership_status", [
  "PENDING",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
]);

export const membershipPlan = onepadel.table("membership_plan", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  durationDays: integer("duration_days").notNull().default(30),
  benefits: text("benefits"),
  // Diskon (%) otomatis untuk booking lapangan/coaching milik member aktif.
  discountPercent: integer("discount_percent").notNull().default(0),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const membership = onepadel.table(
  "membership",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    planId: text("plan_id")
      .notNull()
      .references(() => membershipPlan.id, { onDelete: "restrict" }),
    customerName: text("customer_name").notNull(),
    customerWa: text("customer_wa").notNull(),
    customerEmail: text("customer_email"),
    startDate: date("start_date", { mode: "string" }),
    endDate: date("end_date", { mode: "string" }),
    status: membershipStatus("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("membership_plan_idx").on(t.planId)],
);

export type OpenPlaySession = typeof openPlaySession.$inferSelect;
export type OpenPlayRegistration = typeof openPlayRegistration.$inferSelect;
export type Coach = typeof coach.$inferSelect;
export type CoachingBooking = typeof coachingBooking.$inferSelect;
export type MembershipPlan = typeof membershipPlan.$inferSelect;
export type Membership = typeof membership.$inferSelect;
