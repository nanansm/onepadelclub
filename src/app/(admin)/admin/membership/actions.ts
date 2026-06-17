"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { membership, membershipPlan } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { todayJakarta, ymdOffset } from "@/lib/tz";

type Result = { ok: boolean; error?: string };

const planSchema = z.object({
  name: z.string().trim().min(2).max(60),
  price: z.coerce.number().int().min(0),
  durationDays: z.coerce.number().int().min(1).max(3650),
  discountPercent: z.coerce.number().int().min(0).max(100).default(0),
  benefits: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function createPlanAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = planSchema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await db.insert(membershipPlan).values({
    name: p.data.name,
    price: p.data.price,
    durationDays: p.data.durationDays,
    discountPercent: p.data.discountPercent,
    benefits: p.data.benefits || null,
  });
  revalidatePath("/admin/membership");
  return { ok: true };
}

export async function updatePlanAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const schema = planSchema.extend({ id: z.string().min(1) });
  const p = schema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  const { id, name, price, durationDays, discountPercent, benefits } = p.data;
  await db
    .update(membershipPlan)
    .set({ name, price, durationDays, discountPercent, benefits: benefits || null })
    .where(eq(membershipPlan.id, id));
  revalidatePath("/admin/membership");
  return { ok: true };
}

export async function togglePlanAction(id: string, active: boolean): Promise<Result> {
  await requireAdmin();
  await db.update(membershipPlan).set({ active }).where(eq(membershipPlan.id, id));
  revalidatePath("/admin/membership");
  return { ok: true };
}

// Aktivasi: set ACTIVE + tanggal mulai/berakhir dari durasi paket.
export async function activateMembershipAction(id: string): Promise<Result> {
  await requireAdmin();
  const row = (
    await db
      .select({ m: membership, days: membershipPlan.durationDays })
      .from(membership)
      .innerJoin(membershipPlan, eq(membership.planId, membershipPlan.id))
      .where(eq(membership.id, id))
      .limit(1)
  )[0];
  if (!row) return { ok: false, error: "Membership tidak ditemukan" };
  if (row.m.status !== "PENDING") {
    return { ok: false, error: "Hanya membership PENDING yang bisa diaktifkan" };
  }
  const start = todayJakarta();
  const updated = await db
    .update(membership)
    .set({ status: "ACTIVE", startDate: start, endDate: ymdOffset(start, row.days) })
    .where(and(eq(membership.id, id), eq(membership.status, "PENDING")))
    .returning({ id: membership.id });
  if (updated.length === 0) return { ok: false, error: "Gagal mengaktifkan" };
  await logAudit("activate", "membership", id);
  revalidatePath("/admin/membership");
  return { ok: true };
}

export async function cancelMembershipAction(id: string): Promise<Result> {
  await requireAdmin();
  await db.update(membership).set({ status: "CANCELLED" }).where(eq(membership.id, id));
  revalidatePath("/admin/membership");
  return { ok: true };
}
