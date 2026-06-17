import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  coachingBooking,
  courtBooking,
  openPlayRegistration,
  openPlaySession,
} from "@/db/schema";
import { getSettings } from "./settings";

// Set status CANCELLED untuk semua booking PENDING yang sudah lewat hold window
// (holdMinutes, diatur owner di /admin/settings). Idempotent & murah. Dipanggil:
// - saat admin buka /admin/bookings & dashboard (biar data jujur, tanpa cron),
// - endpoint /api/cron/expire-bookings (opsional, kalau mau dijadwalkan).
// Slot ketersediaan sudah bebas otomatis via lazy-expiry di availability.ts;
// fungsi ini menyelaraskan STATUS di DB supaya admin tak lihat PENDING basi.
export async function expireStaleBookings(): Promise<{
  rentals: number;
  coachings: number;
  openPlayRegs: number;
  sessionsReopened: number;
}> {
  const { holdMinutes } = await getSettings();
  const cutoff = new Date(Date.now() - holdMinutes * 60 * 1000);

  const [rentals, coachings, regs] = await Promise.all([
    db
      .update(courtBooking)
      .set({ status: "CANCELLED" })
      .where(and(eq(courtBooking.status, "PENDING"), lt(courtBooking.createdAt, cutoff)))
      .returning({ id: courtBooking.id }),
    db
      .update(coachingBooking)
      .set({ status: "CANCELLED" })
      .where(and(eq(coachingBooking.status, "PENDING"), lt(coachingBooking.createdAt, cutoff)))
      .returning({ id: coachingBooking.id }),
    db
      .update(openPlayRegistration)
      .set({ status: "CANCELLED" })
      .where(
        and(
          eq(openPlayRegistration.status, "PENDING"),
          lt(openPlayRegistration.createdAt, cutoff),
        ),
      )
      .returning({ id: openPlayRegistration.id }),
  ]);

  // Buka kembali sesi FULL yang kini punya slot kosong.
  let sessionsReopened = 0;
  const full = await db
    .select()
    .from(openPlaySession)
    .where(eq(openPlaySession.status, "FULL"));
  for (const s of full) {
    const [{ taken }] = await db
      .select({ taken: sql<number>`count(*)` })
      .from(openPlayRegistration)
      .where(
        and(
          eq(openPlayRegistration.sessionId, s.id),
          inArray(openPlayRegistration.status, ["PENDING", "PAID"]),
        ),
      );
    if (Number(taken) < s.maxPlayers) {
      await db
        .update(openPlaySession)
        .set({ status: "OPEN" })
        .where(eq(openPlaySession.id, s.id));
      sessionsReopened++;
    }
  }

  return {
    rentals: rentals.length,
    coachings: coachings.length,
    openPlayRegs: regs.length,
    sessionsReopened,
  };
}
