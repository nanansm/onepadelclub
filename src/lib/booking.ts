import { z } from "zod";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { court, courtBooking, venue, type Venue, type BookingStatus } from "@/db/schema";
import { findConflict } from "./availability";
import { MAX_DURATION, MIN_DURATION } from "./booking-constants";
import { genCode, isUniqueViolation } from "./code";
import { getActiveMembershipByWa, applyMemberDiscount } from "./lookup";
import { fireNotify, notifyAdminNewBooking, notifyCustomerBooking } from "./mailer";
import { getSettings } from "./settings";
import { todayJakarta } from "./tz";
import { rupiah } from "./utils";
import { rangeLabel } from "./format";

// Normalisasi nomor WA Indonesia: 0812.. / +62812.. / 62812.. -> 62812..
export function normalizeWa(input: string): string {
  let d = input.replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("62")) d = d;
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

export const createBookingSchema = z.object({
  courtId: z.string().min(1, "Lapangan wajib dipilih"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .refine((d) => d >= todayJakarta(), "Tanggal sudah lewat"),
  startHour: z.coerce.number().int().min(0).max(23),
  duration: z.coerce.number().int().min(MIN_DURATION).max(MAX_DURATION),
  customerName: z.string().trim().min(2, "Nama minimal 2 huruf").max(80),
  customerWa: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp tidak valid")
    .transform(normalizeWa)
    .refine((d) => d.length >= 10 && d.length <= 15, "Nomor WhatsApp tidak valid"),
  customerEmail: z
    .string()
    .trim()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(280).optional().or(z.literal("")),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export type CreateBookingResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const v = (await db.select().from(venue).limit(1))[0];
  if (!v) return { ok: false, error: "Venue belum dikonfigurasi." };

  // Batas durasi yang dikonfigurasi owner (di-clamp ke batas absolut 1..6).
  const settings = await getSettings();
  const minDur = Math.max(MIN_DURATION, Math.min(settings.minDuration, MAX_DURATION));
  const maxDur = Math.max(minDur, Math.min(settings.maxDuration, MAX_DURATION));
  if (input.duration < minDur || input.duration > maxDur) {
    return {
      ok: false,
      error: `Durasi booking harus antara ${minDur}-${maxDur} jam.`,
    };
  }

  const c = (
    await db
      .select()
      .from(court)
      .where(and(eq(court.id, input.courtId), eq(court.active, true)))
      .limit(1)
  )[0];
  if (!c) return { ok: false, error: "Lapangan tidak ditemukan." };

  // Harga = pricePerHour * durasi, lalu diskon otomatis kalau WA = member aktif.
  const basePrice = c.pricePerHour * input.duration;
  const member = await getActiveMembershipByWa(input.customerWa);
  const totalPrice = member
    ? applyMemberDiscount(basePrice, member.discountPercent)
    : basePrice;

  try {
    const code = await insertBookingLocked(v, {
      courtId: input.courtId,
      date: input.date,
      startHour: input.startHour,
      duration: input.duration,
      customerName: input.customerName,
      customerWa: input.customerWa,
      customerEmail: input.customerEmail ? input.customerEmail : null,
      notes: input.notes ? input.notes : null,
      totalPrice,
      status: "PENDING",
      source: "web",
    });

    const detail = `${c.name} · ${input.date} · ${rangeLabel(input.startHour, input.duration)}`;
    fireNotify(() =>
      notifyAdminNewBooking({
        jenis: "Sewa Lapangan",
        kode: code,
        nama: input.customerName,
        wa: input.customerWa,
        detail,
        total: rupiah(totalPrice),
        invoicePath: `/booking/${code}`,
      }),
    );
    fireNotify(() =>
      notifyCustomerBooking(input.customerEmail, {
        jenis: "Sewa Lapangan",
        kode: code,
        detail,
        total: rupiah(totalPrice),
        invoicePath: `/booking/${code}`,
      }),
    );
    return { ok: true, code };
  } catch (err) {
    if (err instanceof BookingError) return { ok: false, error: err.message };
    console.error("[createBooking]", err);
    return { ok: false, error: "Terjadi kesalahan, coba lagi." };
  }
}

class BookingError extends Error {}

type LockedBookingFields = {
  courtId: string;
  date: string;
  startHour: number;
  duration: number;
  customerName: string;
  customerWa: string;
  customerEmail?: string | null;
  notes?: string | null;
  totalPrice: number;
  status: BookingStatus;
  source: string;
};

// Insert booking dengan advisory lock per court+tanggal (anti race double-booking)
// + cek bentrok dalam transaksi. Dipakai createBooking (web) & createWalkInBooking (kasir).
async function insertBookingLocked(
  v: Venue,
  f: LockedBookingFields,
): Promise<string> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${f.courtId + "|" + f.date}))`,
    );

    const conflict = await findConflict(
      v,
      f.courtId,
      f.date,
      f.startHour,
      f.duration,
      tx,
    );
    if (conflict) throw new BookingError(conflict);

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = genCode("OPC");
      try {
        await tx.insert(courtBooking).values({
          code,
          courtId: f.courtId,
          customerName: f.customerName,
          customerWa: f.customerWa,
          customerEmail: f.customerEmail ? f.customerEmail : null,
          date: f.date,
          startHour: f.startHour,
          duration: f.duration,
          totalPrice: f.totalPrice,
          notes: f.notes ? f.notes : null,
          status: f.status,
          source: f.source,
        });
        return code;
      } catch (err) {
        if (isUniqueViolation(err) && attempt < 4) continue;
        throw err;
      }
    }
    throw new BookingError("Gagal membuat kode booking, coba lagi.");
  });
}

// Booking kasir / walk-in (input admin). WA opsional. Status pilihan kasir:
// "PAID" (cash diterima, lock permanen) atau "PENDING" (hold, bayar nyusul).
export const walkInBookingSchema = z.object({
  courtId: z.string().min(1, "Lapangan wajib dipilih"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .refine((d) => d >= todayJakarta(), "Tanggal sudah lewat"),
  startHour: z.coerce.number().int().min(0).max(23),
  duration: z.coerce.number().int().min(MIN_DURATION).max(MAX_DURATION),
  customerName: z.string().trim().min(2, "Nama minimal 2 huruf").max(80),
  customerWa: z
    .string()
    .trim()
    .transform((d) => (d ? normalizeWa(d) : ""))
    .optional()
    .or(z.literal("")),
  status: z.enum(["PAID", "PENDING"]).default("PAID"),
  notes: z.string().trim().max(280).optional().or(z.literal("")),
});

export type WalkInBookingInput = z.infer<typeof walkInBookingSchema>;

export async function createWalkInBooking(
  input: WalkInBookingInput,
): Promise<CreateBookingResult> {
  const v = (await db.select().from(venue).limit(1))[0];
  if (!v) return { ok: false, error: "Venue belum dikonfigurasi." };

  const c = (
    await db
      .select()
      .from(court)
      .where(and(eq(court.id, input.courtId), eq(court.active, true)))
      .limit(1)
  )[0];
  if (!c) return { ok: false, error: "Lapangan tidak ditemukan." };

  const wa = input.customerWa ?? "";
  const basePrice = c.pricePerHour * input.duration;
  const member = wa ? await getActiveMembershipByWa(wa) : null;
  const totalPrice = member
    ? applyMemberDiscount(basePrice, member.discountPercent)
    : basePrice;

  try {
    const code = await insertBookingLocked(v, {
      courtId: input.courtId,
      date: input.date,
      startHour: input.startHour,
      duration: input.duration,
      customerName: input.customerName,
      customerWa: wa,
      notes: input.notes ? input.notes : null,
      totalPrice,
      status: input.status,
      source: "kasir",
    });
    return { ok: true, code };
  } catch (err) {
    if (err instanceof BookingError) return { ok: false, error: err.message };
    console.error("[createWalkInBooking]", err);
    return { ok: false, error: "Terjadi kesalahan, coba lagi." };
  }
}

export async function getBookingByCode(code: string) {
  const rows = await db
    .select({ booking: courtBooking, court })
    .from(courtBooking)
    .innerJoin(court, eq(courtBooking.courtId, court.id))
    .where(eq(courtBooking.code, code))
    .limit(1);
  return rows[0] ?? null;
}

// Daftar booking aktif (mendatang) untuk admin / dashboard.
export async function getUpcomingBookings(limit = 100) {
  return db
    .select({
      booking: courtBooking,
      court: court,
    })
    .from(courtBooking)
    .innerJoin(court, eq(courtBooking.courtId, court.id))
    .where(gte(courtBooking.date, todayJakarta()))
    .orderBy(courtBooking.date, courtBooking.startHour)
    .limit(limit);
}
