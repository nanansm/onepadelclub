import { and, eq, gte, inArray, or, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  coachingBooking,
  courtBooking,
  openPlaySession,
  type Venue,
} from "@/db/schema";
import { getSettings } from "./settings";
import { jakartaParts, todayJakarta } from "./tz";
import { type HourSlot } from "./booking-constants";

export { BLOCKING_STATUSES, MIN_DURATION, MAX_DURATION } from "./booking-constants";
export type { HourSlot } from "./booking-constants";

type BookedRange = { startHour: number; duration: number };

// Executor: db pool atau transaksi (tx). Saat dipanggil di dalam transaksi
// dengan advisory lock, WAJIB pakai tx supaya read berada di koneksi yang sama.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Exec = typeof db | Tx;

export function overlaps(
  aStart: number,
  aDur: number,
  bStart: number,
  bDur: number,
): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

// Okupansi sebuah lapangan = gabungan sewa lapangan + sesi open play (aktif) +
// sesi coaching yang assign court itu. Semua skema saling memblok slot.
async function getBookedRanges(
  courtId: string,
  date: string,
  exec: Exec = db,
): Promise<BookedRange[]> {
  // Lazy-expiry (anti-stuck tanpa cron): booking PENDING yang lebih tua dari
  // holdMinutes dianggap kedaluwarsa dan TIDAK lagi memblok slot. PAID selalu
  // memblok. Slot otomatis kebuka begitu hold lewat, walau cron tak jalan.
  const { holdMinutes } = await getSettings();
  const cutoff = new Date(Date.now() - holdMinutes * 60 * 1000);

  // status='PAID' OR (status='PENDING' AND createdAt >= cutoff)
  const stillBlocks = (
    statusCol: AnyPgColumn,
    createdCol: AnyPgColumn,
  ): SQL | undefined =>
    or(
      eq(statusCol, "PAID"),
      and(eq(statusCol, "PENDING"), gte(createdCol, cutoff)),
    );

  const [rentals, sessions, coachings] = await Promise.all([
    exec
      .select({ startHour: courtBooking.startHour, duration: courtBooking.duration })
      .from(courtBooking)
      .where(
        and(
          eq(courtBooking.courtId, courtId),
          eq(courtBooking.date, date),
          stillBlocks(courtBooking.status, courtBooking.createdAt),
        ),
      ),
    exec
      .select({ startHour: openPlaySession.startHour, duration: openPlaySession.duration })
      .from(openPlaySession)
      .where(
        and(
          eq(openPlaySession.courtId, courtId),
          eq(openPlaySession.date, date),
          // Hanya sesi yang masih aktif memblok slot (bukan DONE/CANCELLED).
          inArray(openPlaySession.status, ["OPEN", "FULL"]),
        ),
      ),
    exec
      .select({ startHour: coachingBooking.startHour, duration: coachingBooking.duration })
      .from(coachingBooking)
      .where(
        and(
          eq(coachingBooking.courtId, courtId),
          eq(coachingBooking.date, date),
          stillBlocks(coachingBooking.status, coachingBooking.createdAt),
        ),
      ),
  ]);
  return [...rentals, ...sessions, ...coachings];
}

// Grid jam per court untuk satu tanggal. Jam lampau (hari ini, WIB) ditandai past.
export async function getDayAvailability(
  venue: Pick<Venue, "openHour" | "closeHour">,
  courtId: string,
  date: string,
): Promise<HourSlot[]> {
  const booked = await getBookedRanges(courtId, date);
  const isToday = date === todayJakarta();
  const nowHour = isToday ? jakartaParts().hour : -1;

  const slots: HourSlot[] = [];
  for (let hour = venue.openHour; hour < venue.closeHour; hour++) {
    if (hour <= nowHour) {
      slots.push({ hour, available: false, reason: "past" });
      continue;
    }
    const clash = booked.some((b) => overlaps(hour, 1, b.startHour, b.duration));
    slots.push(
      clash ? { hour, available: false, reason: "booked" } : { hour, available: true },
    );
  }
  return slots;
}

// Validasi rentang [startHour, startHour+duration) muat di jam operasional
// dan tidak bentrok. Dipakai di dalam transaksi pembuatan booking.
export async function findConflict(
  venue: Pick<Venue, "openHour" | "closeHour">,
  courtId: string,
  date: string,
  startHour: number,
  duration: number,
  exec: Exec = db,
): Promise<string | null> {
  if (startHour < venue.openHour || startHour + duration > venue.closeHour) {
    return "Slot di luar jam operasional.";
  }
  if (date === todayJakarta() && startHour <= jakartaParts().hour) {
    return "Slot sudah lewat.";
  }
  const booked = await getBookedRanges(courtId, date, exec);
  const clash = booked.some((b) =>
    overlaps(startHour, duration, b.startHour, b.duration),
  );
  return clash ? "Slot sudah dibooking orang lain." : null;
}
