"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { player, team } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { avatarUrl } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

type Result = { ok: boolean; error?: string };

const teamSchema = z.object({
  leagueId: z.string().min(1),
  name: z.string().trim().min(2).max(60),
  colorHex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Warna hex tidak valid").optional().or(z.literal("")),
});

export async function createTeamAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = teamSchema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await db.insert(team).values({
    leagueId: p.data.leagueId,
    name: p.data.name,
    colorHex: p.data.colorHex || "#1a4d33",
  });
  revalidatePath("/admin/liga/tim");
  return { ok: true };
}

export async function updateTeamAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const schema = teamSchema.extend({ id: z.string().min(1) }).omit({ leagueId: true });
  const p = schema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await db
    .update(team)
    .set({ name: p.data.name, colorHex: p.data.colorHex || "#1a4d33" })
    .where(eq(team.id, p.data.id));
  revalidatePath("/admin/liga/tim");
  return { ok: true };
}

export async function deleteTeamAction(id: string): Promise<Result> {
  await requireAdmin();
  await db.delete(team).where(eq(team.id, id));
  await logAudit("delete", "team", id);
  revalidatePath("/admin/liga/tim");
  return { ok: true };
}

const playerSchema = z.object({
  teamId: z.string().min(1),
  name: z.string().trim().min(2).max(60),
  position: z.enum(["INTI", "CADANGAN"]),
});

export async function createPlayerAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = playerSchema.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await db.insert(player).values({
    teamId: p.data.teamId,
    name: p.data.name,
    position: p.data.position,
    photoUrl: avatarUrl(p.data.name),
  });
  revalidatePath("/admin/liga/tim");
  return { ok: true };
}

export async function deletePlayerAction(id: string): Promise<Result> {
  await requireAdmin();
  await db.delete(player).where(eq(player.id, id));
  revalidatePath("/admin/liga/tim");
  return { ok: true };
}
