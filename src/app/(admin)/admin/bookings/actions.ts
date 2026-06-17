"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courtBooking } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { getVenue } from "@/lib/venue";
import { getDayAvailability, type HourSlot } from "@/lib/availability";
import {
  createWalkInBooking,
  walkInBookingSchema,
  type CreateBookingResult,
} from "@/lib/booking";

type ActionResult = { ok: boolean; error?: string };

// Ketersediaan grid jam untuk form Booking Kasir (admin).
export async function getAdminAvailabilityAction(
  courtId: string,
  date: string,
): Promise<HourSlot[]> {
  await requireAdmin();
  const venue = await getVenue();
  if (!venue || !courtId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  return getDayAvailability(venue, courtId, date);
}

// Buat booking walk-in / kasir. Server cek bentrok atomik (advisory lock).
export async function createWalkInBookingAction(
  raw: unknown,
): Promise<CreateBookingResult> {
  await requireAdmin();
  const parsed = walkInBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const res = await createWalkInBooking(parsed.data);
  if (res.ok) revalidatePath("/admin/bookings");
  return res;
}

// Konfirmasi pembayaran: PENDING -> PAID (idempotent, hanya dari PENDING).
export async function confirmBookingAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const updated = await db
    .update(courtBooking)
    .set({ status: "PAID" })
    .where(and(eq(courtBooking.id, id), eq(courtBooking.status, "PENDING")))
    .returning({ id: courtBooking.id });
  if (updated.length === 0) {
    return { ok: false, error: "Booking tidak bisa dikonfirmasi." };
  }
  await logAudit("confirm_payment", "court_booking", id);
  revalidatePath("/admin/bookings");
  return { ok: true };
}

export async function cancelBookingAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const updated = await db
    .update(courtBooking)
    .set({ status: "CANCELLED" })
    .where(eq(courtBooking.id, id))
    .returning({ id: courtBooking.id });
  if (updated.length === 0) return { ok: false, error: "Booking tidak ditemukan." };
  await logAudit("cancel", "court_booking", id);
  revalidatePath("/admin/bookings");
  return { ok: true };
}
