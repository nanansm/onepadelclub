import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  category,
  player,
  team,
  teamRegistration,
  type TeamRegistration,
} from "@/db/schema";
import { avatarUrl } from "@/lib/utils";

export type TeamRegRow = TeamRegistration & {
  // Label kategori live dari join (fallback ke snapshot saat daftar).
  categoryName: string | null;
};

// Daftar pendaftaran tim. PENDING didahulukan, lalu terbaru di atas.
export async function getTeamRegistrations(
  status?: "PENDING" | "APPROVED" | "REJECTED",
): Promise<TeamRegRow[]> {
  const base = db
    .select({
      id: teamRegistration.id,
      teamName: teamRegistration.teamName,
      categoryId: teamRegistration.categoryId,
      categoryLabel: teamRegistration.categoryLabel,
      player1Name: teamRegistration.player1Name,
      player2Name: teamRegistration.player2Name,
      captainWa: teamRegistration.captainWa,
      captainEmail: teamRegistration.captainEmail,
      note: teamRegistration.note,
      status: teamRegistration.status,
      createdAt: teamRegistration.createdAt,
      reviewedAt: teamRegistration.reviewedAt,
      categoryName: category.name,
    })
    .from(teamRegistration)
    .leftJoin(category, eq(teamRegistration.categoryId, category.id));

  const rows = status
    ? await base.where(eq(teamRegistration.status, status)).orderBy(desc(teamRegistration.createdAt))
    : await base.orderBy(desc(teamRegistration.createdAt));

  // PENDING dulu, sisanya tetap terbaru-dulu.
  const order = { PENDING: 0, APPROVED: 1, REJECTED: 2 } as const;
  return rows.sort((a, b) => order[a.status] - order[b.status]);
}

export async function getTeamRegistration(id: string) {
  const rows = await db
    .select()
    .from(teamRegistration)
    .where(eq(teamRegistration.id, id))
    .limit(1);
  return rows[0] ?? null;
}

type InsertRegistration = {
  teamName: string;
  categoryId: string | null;
  categoryLabel: string | null;
  player1Name: string;
  player2Name: string;
  captainWa: string;
  captainEmail: string | null;
  note: string | null;
};

export async function insertTeamRegistration(data: InsertRegistration) {
  await db.insert(teamRegistration).values({
    teamName: data.teamName,
    categoryId: data.categoryId,
    categoryLabel: data.categoryLabel,
    player1Name: data.player1Name,
    player2Name: data.player2Name,
    captainWa: data.captainWa,
    captainEmail: data.captainEmail,
    note: data.note,
    status: "PENDING",
  });
}

// Set status + reviewedAt. Dipakai approve/reject.
export async function setRegistrationStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  await db
    .update(teamRegistration)
    .set({ status, reviewedAt: new Date() })
    .where(eq(teamRegistration.id, id));
}

// Buat tim + 2 pemain INTI dari sebuah pendaftaran ke liga tertentu.
export async function createTeamFromRegistration(
  reg: TeamRegistration,
  leagueId: string,
) {
  const inserted = await db
    .insert(team)
    .values({ leagueId, name: reg.teamName })
    .returning({ id: team.id });
  const teamId = inserted[0].id;
  await db.insert(player).values([
    {
      teamId,
      name: reg.player1Name,
      position: "INTI",
      photoUrl: avatarUrl(reg.player1Name),
    },
    {
      teamId,
      name: reg.player2Name,
      position: "INTI",
      photoUrl: avatarUrl(reg.player2Name),
    },
  ]);
  return teamId;
}
