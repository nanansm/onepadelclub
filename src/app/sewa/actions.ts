"use server";

import { getVenue, getCourts } from "@/lib/venue";
import { getDayAvailability, type HourSlot } from "@/lib/availability";
import {
  createBooking,
  createBookingSchema,
  type CreateBookingResult,
} from "@/lib/booking";
import { guardGuest } from "@/lib/rate-limit";
import { getActiveMembershipByWa } from "@/lib/lookup";

export async function checkMembershipAction(
  wa: string,
): Promise<{ planName: string; discountPercent: number } | null> {
  const g = await guardGuest("member-check", 20, 5 * 60_000);
  if (!g.ok) return null;
  const member = await getActiveMembershipByWa(wa);
  if (!member) return null;
  return { planName: member.planName, discountPercent: member.discountPercent };
}

export async function getAvailabilityAction(
  courtId: string,
  date: string,
): Promise<HourSlot[]> {
  const venue = await getVenue();
  if (!venue || !courtId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  return getDayAvailability(venue, courtId, date);
}

export type CourtAvailability = {
  courtId: string;
  courtName: string;
  pricePerHour: number;
  slots: HourSlot[];
};

// Ketersediaan SEMUA lapangan aktif untuk satu tanggal — buat view "cari per jam"
// (grid jam × lapangan). Satu panggilan, bukan per-lapangan.
export async function getGridAvailabilityAction(
  date: string,
): Promise<CourtAvailability[]> {
  const venue = await getVenue();
  if (!venue || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const courts = await getCourts();
  return Promise.all(
    courts.map(async (c) => ({
      courtId: c.id,
      courtName: c.name,
      pricePerHour: c.pricePerHour,
      slots: await getDayAvailability(venue, c.id, date),
    })),
  );
}

export async function createBookingAction(
  raw: unknown,
): Promise<CreateBookingResult> {
  const guard = await guardGuest("booking");
  if (!guard.ok) return { ok: false, error: guard.error! };
  const parsed = createBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  return createBooking(parsed.data);
}
