"use server";

import { getVenue } from "@/lib/venue";
import { getDayAvailability, type HourSlot } from "@/lib/availability";
import {
  createBooking,
  createBookingSchema,
  type CreateBookingResult,
} from "@/lib/booking";
import { guardGuest } from "@/lib/rate-limit";

export async function getAvailabilityAction(
  courtId: string,
  date: string,
): Promise<HourSlot[]> {
  const venue = await getVenue();
  if (!venue || !courtId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  return getDayAvailability(venue, courtId, date);
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
