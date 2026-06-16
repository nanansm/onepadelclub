"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { hallOfFame, season, team } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { getCategories, getLeague, getStandingsByLeague } from "@/lib/liga";
import { logAudit } from "@/lib/audit";

type Result = { ok: boolean; error?: string };

export async function createSeasonAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = z
    .object({ name: z.string().trim().min(2).max(60), year: z.coerce.number().int().min(2024).max(2100) })
    .safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await db.insert(season).values({ name: p.data.name, year: p.data.year, status: "ACTIVE" });
  revalidatePath("/admin/liga/season");
  return { ok: true };
}

// Tutup season + arsipkan juara tiap kategori (Liga 1 rank 1) ke Hall of Fame.
export async function finalizeSeasonAction(seasonId: string): Promise<Result> {
  await requireAdmin();
  const cats = await getCategories();
  for (const c of cats) {
    const l1 = await getLeague(c.id, 1);
    if (!l1) continue;
    const st = await getStandingsByLeague(l1.id);
    if (st.length === 0) continue;
    const champ = st[0];
    await db.insert(hallOfFame).values({
      seasonId,
      categoryId: c.id,
      teamName: champ.team.name,
      award: "Champion",
      note: `Juara ${c.name} Liga 1`,
    });
  }
  await db.update(season).set({ status: "CLOSED" }).where(eq(season.id, seasonId));
  await logAudit("finalize_season", "season", seasonId);
  revalidatePath("/admin/liga/season");
  revalidatePath("/liga/hall-of-fame");
  return { ok: true };
}

// Promosi-degradasi 1 kategori: Liga1 rank 7-8 turun, Liga2 rank 1-2 naik.
export async function promoteRelegateAction(categoryId: string): Promise<Result> {
  await requireAdmin();
  const l1 = await getLeague(categoryId, 1);
  const l2 = await getLeague(categoryId, 2);
  if (!l1 || !l2) return { ok: false, error: "Liga 1/2 tidak lengkap" };

  const s1 = await getStandingsByLeague(l1.id);
  const s2 = await getStandingsByLeague(l2.id);
  // Hanya degradasi 2 terbawah kalau Liga 1 cukup besar (>=4), agar tak
  // mengosongkan liga kecil. Promosi 2 teratas kalau Liga 2 punya >=2 tim.
  const relegated = s1.length >= 4 ? s1.slice(-2).map((r) => r.teamId) : [];
  const promoted = s2.length >= 2 ? s2.slice(0, 2).map((r) => r.teamId) : [];
  if (relegated.length === 0 && promoted.length === 0) {
    return { ok: false, error: "Liga belum cukup tim untuk promosi-degradasi" };
  }

  await db.transaction(async (tx) => {
    if (relegated.length)
      await tx.update(team).set({ leagueId: l2.id }).where(inArray(team.id, relegated));
    if (promoted.length)
      await tx.update(team).set({ leagueId: l1.id }).where(inArray(team.id, promoted));
  });

  await logAudit("promote_relegate", "category", categoryId, { relegated, promoted });
  revalidatePath("/admin/liga/season");
  revalidatePath("/liga/klasemen");
  return { ok: true };
}
