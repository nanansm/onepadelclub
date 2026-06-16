"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { game, match } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { logAudit } from "@/lib/audit";

type Result = { ok: boolean; error?: string };

const scoreSchema = z.object({
  matchId: z.string().min(1),
  scoreA: z.coerce.number().int().min(0).max(10),
  scoreB: z.coerce.number().int().min(0).max(10),
  status: z.enum(["SCHEDULED", "LIVE", "DONE", "WO"]),
  woTeamId: z.string().optional().or(z.literal("")),
});

export async function submitScoreAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = scoreSchema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  const { matchId, scoreA, scoreB, status, woTeamId } = p.data;

  const m = (await db.select().from(match).where(eq(match.id, matchId)).limit(1))[0];
  if (!m) return { ok: false, error: "Match tidak ditemukan" };

  if (status === "WO") {
    if (!woTeamId || (woTeamId !== m.teamAId && woTeamId !== m.teamBId)) {
      return { ok: false, error: "Pilih tim yang WO" };
    }
  }
  if (status === "DONE" && scoreA === scoreB) {
    return { ok: false, error: "Skor tidak boleh seri untuk match selesai" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(match)
      .set({
        scoreA,
        scoreB,
        status,
        woTeamId: status === "WO" ? (woTeamId as string) : null,
      })
      .where(eq(match.id, matchId));

    await tx.delete(game).where(eq(game.matchId, matchId));
    const games: { matchId: string; urutan: number; winner: string }[] = [];
    let ord = 1;
    for (let i = 0; i < scoreA; i++) games.push({ matchId, urutan: ord++, winner: "A" });
    for (let i = 0; i < scoreB; i++) games.push({ matchId, urutan: ord++, winner: "B" });
    if (games.length) await tx.insert(game).values(games);
  });

  await logAudit("submit_score", "match", matchId, { scoreA, scoreB, status, woTeamId });
  // Klasemen dihitung on-read (computeStandings) -> tak perlu recompute.
  revalidatePath("/admin/liga/skor");
  revalidatePath("/liga/klasemen");
  revalidatePath("/liga/jadwal");
  revalidatePath("/liga/live");
  return { ok: true };
}
