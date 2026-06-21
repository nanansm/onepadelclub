"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { openPlayRegistration, openPlaySession, venue } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { findConflict } from "@/lib/availability";
import { fireWa, notifyCustomerPaidWa } from "@/lib/wa";
import { hourLabel } from "@/lib/format";

type Result = { ok: boolean; error?: string };

const sessionSchema = z.object({
  title: z.string().trim().min(2).max(80),
  level: z.string().trim().min(1).max(40),
  courtId: z.string().optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  startHour: z.coerce.number().int().min(0).max(23),
  duration: z.coerce.number().int().min(1).max(6),
  maxPlayers: z.coerce.number().int().min(2).max(32),
  pricePerPlayer: z.coerce.number().int().min(0),
});

export async function createSessionAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const parsed = sessionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const v = (await db.select().from(venue).limit(1))[0];
  if (!v) return { ok: false, error: "Venue belum dikonfigurasi" };
  const { courtId, ...data } = parsed.data;

  // Kalau assign court, cek tidak di luar jam operasional & tidak bentrok.
  if (courtId) {
    const conflict = await findConflict(v, courtId, data.date, data.startHour, data.duration);
    if (conflict) return { ok: false, error: conflict };
  }

  await db.insert(openPlaySession).values({
    ...data,
    venueId: v.id,
    courtId: courtId ? courtId : null,
  });
  revalidatePath("/admin/open-play");
  return { ok: true };
}

export async function cancelSessionAction(id: string): Promise<Result> {
  await requireAdmin();
  await db
    .update(openPlaySession)
    .set({ status: "CANCELLED" })
    .where(eq(openPlaySession.id, id));
  revalidatePath("/admin/open-play");
  return { ok: true };
}

export async function confirmRegAction(id: string): Promise<Result> {
  await requireAdmin();
  const updated = await db
    .update(openPlayRegistration)
    .set({ status: "PAID" })
    .where(
      and(eq(openPlayRegistration.id, id), eq(openPlayRegistration.status, "PENDING")),
    )
    .returning({
      code: openPlayRegistration.code,
      nama: openPlayRegistration.customerName,
      wa: openPlayRegistration.customerWa,
      sessionId: openPlayRegistration.sessionId,
    });
  if (updated.length === 0) return { ok: false, error: "Tidak bisa dikonfirmasi" };

  // WA "pembayaran terkonfirmasi" ke customer (fire-and-forget).
  const r = updated[0];
  const s = (
    await db
      .select({
        title: openPlaySession.title,
        date: openPlaySession.date,
        startHour: openPlaySession.startHour,
      })
      .from(openPlaySession)
      .where(eq(openPlaySession.id, r.sessionId))
      .limit(1)
  )[0];
  const detail = s
    ? `${s.title} · ${s.date} · ${hourLabel(s.startHour)}`
    : undefined;
  fireWa(() =>
    notifyCustomerPaidWa({
      jenis: "Open Play",
      kode: r.code,
      nama: r.nama,
      wa: r.wa,
      detail,
      invoicePath: `/open-play/${r.code}`,
    }),
  );

  revalidatePath("/admin/open-play");
  return { ok: true };
}

export async function cancelRegAction(id: string): Promise<Result> {
  await requireAdmin();
  const reg = (
    await db.select().from(openPlayRegistration).where(eq(openPlayRegistration.id, id)).limit(1)
  )[0];
  if (!reg) return { ok: false, error: "Pendaftaran tidak ditemukan" };

  await db
    .update(openPlayRegistration)
    .set({ status: "CANCELLED" })
    .where(eq(openPlayRegistration.id, id));

  // Buka kembali sesi yang tadinya FULL kalau sekarang ada slot kosong.
  const s = (
    await db.select().from(openPlaySession).where(eq(openPlaySession.id, reg.sessionId)).limit(1)
  )[0];
  if (s && s.status === "FULL") {
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
      await db.update(openPlaySession).set({ status: "OPEN" }).where(eq(openPlaySession.id, s.id));
    }
  }

  revalidatePath("/admin/open-play");
  return { ok: true };
}
