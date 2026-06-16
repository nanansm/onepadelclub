import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { match, team } from "@/db/schema";
import { getLeaguesWithLabels } from "@/lib/liga";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Generator Jadwal</h1>
        <Link href="/admin/liga" className="text-sm text-accent">Liga</Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Generate jadwal round-robin otomatis (tiap tim vs semua tim, 1x).
      </p>
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
