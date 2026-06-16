"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { match, team } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { roundRobin } from "@/lib/liga";
import { todayJakarta, ymdOffset } from "@/lib/tz";

type Result = { ok: boolean; error?: string };

export async function generateScheduleAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = z.object({ leagueId: z.string().min(1) }).safeParse(raw);
  if (!p.success) return { ok: false, error: "Liga tidak valid" };
  const { leagueId } = p.data;

  const existing = await db.select({ id: match.id }).from(match).where(eq(match.leagueId, leagueId)).limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "Jadwal sudah ada. Hapus dulu untuk generate ulang." };
  }

  const teams = await db.select().from(team).where(eq(team.leagueId, leagueId));
  if (teams.length < 2) return { ok: false, error: "Minimal 2 tim untuk generate jadwal" };
  if (teams.length % 2 !== 0) return { ok: false, error: "Jumlah tim harus genap" };

  const rounds = roundRobin(teams.map((t) => t.id));
  const today = todayJakarta();
  const rows: (typeof match.$inferInsert)[] = [];
  rounds.forEach((pairs, r) => {
    const date = ymdOffset(today, r * 7);
    pairs.forEach(([a, b], i) => {
      rows.push({
        leagueId,
        teamAId: a,
        teamBId: b,
        round: r + 1,
        date,
        startHour: 18 + (i % 4),
        court: `Court ${(i % 4) + 1}`,
        status: "SCHEDULED",
      });
    });
  });
  await db.insert(match).values(rows);

  revalidatePath("/admin/liga/jadwal");
  revalidatePath("/liga/jadwal");
  return { ok: true };
}

export async function clearScheduleAction(leagueId: string): Promise<Result> {
  await requireAdmin();
  await db.delete(match).where(eq(match.leagueId, leagueId));
  revalidatePath("/admin/liga/jadwal");
  revalidatePath("/liga/jadwal");
  revalidatePath("/liga/klasemen");
  return { ok: true };
}
