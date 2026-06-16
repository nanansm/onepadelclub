"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courtBooking } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { logAudit } from "@/lib/audit";

type ActionResult = { ok: boolean; error?: string };

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
