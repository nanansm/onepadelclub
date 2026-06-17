"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { court, venue } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

type ActionResult = { ok: boolean; error?: string };

const courtSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib").max(60),
  type: z.enum(["INDOOR", "OUTDOOR"]),
  surface: z.string().trim().max(60).optional().default(""),
  pricePerHour: z.coerce.number().int().min(1000, "Harga tidak valid"),
});

export async function createCourtAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = courtSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const v = (await db.select({ id: venue.id }).from(venue).limit(1))[0];
  if (!v) return { ok: false, error: "Venue belum dikonfigurasi" };

  await db.insert(court).values({
    ...parsed.data,
    surface: parsed.data.surface || null,
    venueId: v.id,
  });
  revalidatePath("/admin/courts");
  return { ok: true };
}

const updateSchema = courtSchema.extend({ id: z.string().min(1) });

export async function updateCourtAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { id, ...data } = parsed.data;
  await db
    .update(court)
    .set({ ...data, surface: data.surface || null })
    .where(eq(court.id, id));
  revalidatePath("/admin/courts");
  return { ok: true };
}

export async function toggleCourtAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  await db.update(court).set({ active }).where(eq(court.id, id));
  revalidatePath("/admin/courts");
  return { ok: true };
}
