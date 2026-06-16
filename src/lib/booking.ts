import { z } from "zod";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { court, courtBooking, venue } from "@/db/schema";
import { findConflict } from "./availability";
import { MAX_DURATION, MIN_DURATION } from "./booking-constants";
import { genCode, isUniqueViolation } from "./code";
import { todayJakarta } from "./tz";

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

  const c = (
    await db
      .select()
      .from(court)
      .where(and(eq(court.id, input.courtId), eq(court.active, true)))
      .limit(1)
  )[0];
  if (!c) return { ok: false, error: "Lapangan tidak ditemukan." };

  const totalPrice = c.pricePerHour * input.duration;

  try {
    const code = await db.transaction(async (tx) => {
      // Serialize booking untuk court+tanggal yang sama (anti race double-booking).
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${input.courtId + "|" + input.date}))`,
      );

      // Cek bentrok lewat tx (koneksi sama dgn advisory lock) — bukan db pool.
      const conflict = await findConflict(
        v,
        input.courtId,
        input.date,
        input.startHour,
        input.duration,
        tx,
      );
      if (conflict) throw new BookingError(conflict);

      // Insert dengan retry kalau kode bentrok (sangat jarang).
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = genCode("OPC");
        try {
          await tx.insert(courtBooking).values({
            code,
            courtId: input.courtId,
            customerName: input.customerName,
            customerWa: input.customerWa,
            date: input.date,
            startHour: input.startHour,
            duration: input.duration,
            totalPrice,
            notes: input.notes ? input.notes : null,
          });
          return code;
        } catch (err) {
          if (isUniqueViolation(err) && attempt < 4) continue;
          throw err;
        }
      }
      throw new BookingError("Gagal membuat kode booking, coba lagi.");
    });

    return { ok: true, code };
  } catch (err) {
    if (err instanceof BookingError) return { ok: false, error: err.message };
    console.error("[createBooking]", err);
    return { ok: false, error: "Terjadi kesalahan, coba lagi." };
  }
}

class BookingError extends Error {}

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
