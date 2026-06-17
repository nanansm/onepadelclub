import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { match, team } from "@/db/schema";
import { getLeaguesWithLabels } from "@/lib/liga";
import { AdminPageHeader } from "@/components/admin/page-header";
import { JadwalAdmin } from "./jadwal-admin";

export const dynamic = "force-dynamic";

export default async function AdminJadwalPage() {
  const leaguesRaw = await getLeaguesWithLabels();
  const leagues = await Promise.all(
    leaguesRaw.map(async (l) => {
      const [{ tc }] = await db
        .select({ tc: count() })
        .from(team)
        .where(eq(team.leagueId, l.id));
      const [{ mc }] = await db
        .select({ mc: count() })
        .from(match)
        .where(eq(match.leagueId, l.id));
      return { id: l.id, label: l.label, teamCount: Number(tc), matchCount: Number(mc) };
    }),
  );

  return (
    <div>
      <AdminPageHeader
        title="Generator Jadwal"
        sub="Generate jadwal round-robin otomatis (tiap tim vs semua tim, 1x)."
        back={{ href: "/admin/liga", label: "Liga" }}
      />
      <div className="mt-6">
        {leagues.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">Belum ada liga.</p>
        ) : (
          <JadwalAdmin leagues={leagues} />
        )}
      </div>
    </div>
  );
}
