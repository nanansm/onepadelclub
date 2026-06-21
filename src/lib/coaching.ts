import { z } from "zod";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { coach, coachingBooking } from "@/db/schema";
import { getVenue } from "./venue";
import { todayJakarta, jakartaParts } from "./tz";
import { normalizeWa } from "./booking";
import { MAX_DURATION, MIN_DURATION, type HourSlot } from "./booking-constants";
import { overlaps } from "./availability";
import { genCode, isUniqueViolation } from "./code";
import { getSettings } from "./settings";
import { getActiveMembershipByWa, applyMemberDiscount } from "./lookup";
import { fireNotify, notifyAdminNewBooking, notifyCustomerBooking } from "./mailer";
import { fireWa, notifyCustomerBookingWa } from "./wa";
import { rupiah } from "./utils";
import { rangeLabel } from "./format";

const BLOCKING = ["PENDING", "PAID"] as const;

// Ketersediaan jam seorang pelatih pada satu tanggal.
export async function getCoachAvailability(
  coachId: string,
  date: string,
): Promise<HourSlot[]> {
  const venue = await getVenue();
  if (!venue || !coachId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  const busy = await db
    .select({ startHour: coachingBooking.startHour, duration: coachingBooking.duration })
    .from(coachingBooking)
    .where(
      and(
        eq(coachingBooking.coachId, coachId),
        eq(coachingBooking.date, date),
        inArray(coachingBooking.status, [...BLOCKING]),
      ),
    );

  const isToday = date === todayJakarta();
  const nowHour = isToday ? jakartaParts().hour : -1;
  const slots: HourSlot[] = [];
  for (let hour = venue.openHour; hour < venue.closeHour; hour++) {
    if (hour <= nowHour) {
      slots.push({ hour, available: false, reason: "past" });
      continue;
    }
    const clash = busy.some((b) => overlaps(hour, 1, b.startHour, b.duration));
    slots.push(clash ? { hour, available: false, reason: "booked" } : { hour, available: true });
  }
  return slots;
}

export async function getActiveCoaches() {
  return db
    .select()
    .from(coach)
    .where(eq(coach.active, true))
    .orderBy(asc(coach.sortOrder), asc(coach.name));
}

export async function getCoachById(id: string) {
  const rows = await db.select().from(coach).where(eq(coach.id, id)).limit(1);
  return rows[0] ?? null;
}

export const createCoachingSchema = z.object({
  coachId: z.string().min(1, "Pelatih wajib dipilih"),
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

export type CreateCoachingResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function createCoachingBooking(
  input: z.infer<typeof createCoachingSchema>,
): Promise<CreateCoachingResult> {
  const venue = await getVenue();
  if (!venue) return { ok: false, error: "Venue belum dikonfigurasi." };

  const c = await getCoachById(input.coachId);
  if (!c || !c.active) return { ok: false, error: "Pelatih tidak ditemukan." };

  // Batas durasi yang dikonfigurasi owner (di-clamp ke batas absolut 1..6).
  const settings = await getSettings();
  const minDur = Math.max(MIN_DURATION, Math.min(settings.minDuration, MAX_DURATION));
  const maxDur = Math.max(minDur, Math.min(settings.maxDuration, MAX_DURATION));
  if (input.duration < minDur || input.duration > maxDur) {
    return {
      ok: false,
      error: `Durasi coaching harus antara ${minDur}-${maxDur} jam.`,
    };
  }

  if (
    input.startHour < venue.openHour ||
    input.startHour + input.duration > venue.closeHour
  ) {
    return { ok: false, error: "Slot di luar jam operasional." };
  }
  if (input.date === todayJakarta() && input.startHour <= jakartaParts().hour) {
    return { ok: false, error: "Slot sudah lewat." };
  }

  // Harga = rate * durasi, diskon otomatis kalau WA = member aktif.
  const basePrice = c.ratePerHour * input.duration;
  const member = await getActiveMembershipByWa(input.customerWa);
  const totalPrice = member
    ? applyMemberDiscount(basePrice, member.discountPercent)
    : basePrice;

  try {
    const code = await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${"coach:" + input.coachId + "|" + input.date}))`,
      );

      const busy = await tx
        .select({ startHour: coachingBooking.startHour, duration: coachingBooking.duration })
        .from(coachingBooking)
        .where(
          and(
            eq(coachingBooking.coachId, input.coachId),
            eq(coachingBooking.date, input.date),
            inArray(coachingBooking.status, [...BLOCKING]),
          ),
        );
      if (busy.some((b) => overlaps(input.startHour, input.duration, b.startHour, b.duration))) {
        throw new CoachError("Pelatih sudah ada jadwal di jam itu.");
      }

      let code = "";
      for (let i = 0; i < 5; i++) {
        code = genCode("OPG");
        try {
          await tx.insert(coachingBooking).values({
            code,
            coachId: input.coachId,
            customerName: input.customerName,
            customerWa: input.customerWa,
            customerEmail: input.customerEmail ? input.customerEmail : null,
            date: input.date,
            startHour: input.startHour,
            duration: input.duration,
            totalPrice,
            notes: input.notes ? input.notes : null,
          });
          break;
        } catch (err) {
          if (isUniqueViolation(err) && i < 4) continue;
          throw err;
        }
      }
      return code;
    });

    // Notifikasi (fire-and-forget, tak memblok response).
    const detail = `${c.name} · ${input.date} · ${rangeLabel(input.startHour, input.duration)}`;
    fireNotify(() =>
      notifyAdminNewBooking({
        jenis: "Coaching",
        kode: code,
        nama: input.customerName,
        wa: input.customerWa,
        detail,
        total: rupiah(totalPrice),
        invoicePath: `/coaching/${code}`,
      }),
    );
    fireNotify(() =>
      notifyCustomerBooking(input.customerEmail, {
        jenis: "Coaching",
        kode: code,
        detail,
        total: rupiah(totalPrice),
        invoicePath: `/coaching/${code}`,
      }),
    );
    fireWa(() =>
      notifyCustomerBookingWa({
        jenis: "Coaching",
        kode: code,
        nama: input.customerName,
        wa: input.customerWa,
        detail,
        total: rupiah(totalPrice),
        invoicePath: `/coaching/${code}`,
      }),
    );
    return { ok: true, code };
  } catch (err) {
    if (err instanceof CoachError) return { ok: false, error: err.message };
    console.error("[createCoachingBooking]", err);
    return { ok: false, error: "Terjadi kesalahan, coba lagi." };
  }
}

class CoachError extends Error {}

export async function getCoachingByCode(code: string) {
  const rows = await db
    .select({ booking: coachingBooking, coach })
    .from(coachingBooking)
    .innerJoin(coach, eq(coachingBooking.coachId, coach.id))
    .where(eq(coachingBooking.code, code))
    .limit(1);
  return rows[0] ?? null;
}
