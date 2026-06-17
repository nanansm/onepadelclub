"use server";

import {
  createCoachingBooking,
  createCoachingSchema,
  getCoachAvailability,
  type CreateCoachingResult,
} from "@/lib/coaching";
import type { HourSlot } from "@/lib/booking-constants";
import { guardGuest } from "@/lib/rate-limit";
import { getActiveMembershipByWa } from "@/lib/lookup";

export async function getCoachAvailabilityAction(
  coachId: string,
  date: string,
): Promise<HourSlot[]> {
  return getCoachAvailability(coachId, date);
}

// Cek membership aktif berdasarkan WA (dipakai badge member + diskon di coaching flow).
export async function checkCoachMembershipAction(
  wa: string,
): Promise<{ planName: string; discountPercent: number } | null> {
  const m = await getActiveMembershipByWa(wa);
  if (!m) return null;
  return { planName: m.planName, discountPercent: m.discountPercent };
}

export async function createCoachingAction(
  raw: unknown,
): Promise<CreateCoachingResult> {
  const guard = await guardGuest("coaching");
  if (!guard.ok) return { ok: false, error: guard.error! };
  const parsed = createCoachingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  return createCoachingBooking(parsed.data);
}
