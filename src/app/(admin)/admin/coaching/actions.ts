"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coach, coachingBooking } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

type Result = { ok: boolean; error?: string };

const coachSchema = z.object({
  name: z.string().trim().min(2).max(80),
  ratePerHour: z.coerce.number().int().min(1000, "Tarif tidak valid"),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  photoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((u) => u === "" || u.startsWith("/") || /^https?:\/\//.test(u), "URL foto tidak valid")
    .optional()
    .or(z.literal("")),
});

export async function createCoachAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = coachSchema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await db.insert(coach).values({
    name: p.data.name,
    ratePerHour: p.data.ratePerHour,
    bio: p.data.bio || null,
    photoUrl: p.data.photoUrl || null,
  });
  revalidatePath("/admin/coaching");
  return { ok: true };
}

export async function updateCoachAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const schema = coachSchema.extend({ id: z.string().min(1) });
  const p = schema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  const { id, name, ratePerHour, bio, photoUrl } = p.data;
  await db
    .update(coach)
    .set({ name, ratePerHour, bio: bio || null, photoUrl: photoUrl || null })
    .where(eq(coach.id, id));
  revalidatePath("/admin/coaching");
  return { ok: true };
}

export async function toggleCoachAction(id: string, active: boolean): Promise<Result> {
  await requireAdmin();
  await db.update(coach).set({ active }).where(eq(coach.id, id));
  revalidatePath("/admin/coaching");
  return { ok: true };
}

export async function confirmCoachingAction(id: string): Promise<Result> {
  await requireAdmin();
  const u = await db
    .update(coachingBooking)
    .set({ status: "PAID" })
    .where(and(eq(coachingBooking.id, id), eq(coachingBooking.status, "PENDING")))
    .returning({ id: coachingBooking.id });
  if (u.length === 0) return { ok: false, error: "Tidak bisa dikonfirmasi" };
  revalidatePath("/admin/coaching");
  return { ok: true };
}

export async function cancelCoachingAction(id: string): Promise<Result> {
  await requireAdmin();
  await db.update(coachingBooking).set({ status: "CANCELLED" }).where(eq(coachingBooking.id, id));
  revalidatePath("/admin/coaching");
  return { ok: true };
}
