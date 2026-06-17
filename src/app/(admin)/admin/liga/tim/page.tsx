import { asc } from "drizzle-orm";
import { db } from "@/db";
import { player, team } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLeaguesWithLabels } from "@/lib/liga";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TimManager } from "./tim-manager";

export const dynamic = "force-dynamic";

export default async function AdminTimPage() {
  const leaguesRaw = await getLeaguesWithLabels();
  const leagues = await Promise.all(
    leaguesRaw.map(async (l) => {
      const teams = await db
        .select()
        .from(team)
        .where(eq(team.leagueId, l.id))
        .orderBy(asc(team.sortOrder), asc(team.name));
      const teamsWithPlayers = await Promise.all(
        teams.map(async (t) => ({
          id: t.id,
          name: t.name,
          colorHex: t.colorHex ?? "#1a4d33",
          players: (
            await db
              .select()
              .from(player)
              .where(eq(player.teamId, t.id))
              .orderBy(asc(player.position), asc(player.name))
          ).map((p) => ({ id: p.id, name: p.name, position: p.position })),
        })),
      );
      return { id: l.id, label: l.label, teams: teamsWithPlayers };
    }),
  );

  return (
    <div>
      <AdminPageHeader
        title="Kelola Tim & Pemain"
        sub="Tambah tim, atur warna, kelola roster pemain."
        back={{ href: "/admin/liga", label: "Liga" }}
      />
      <div className="mt-6">
        {leagues.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">Belum ada liga.</p>
        ) : (
          <TimManager leagues={leagues} />
        )}
      </div>
    </div>
  );
}
