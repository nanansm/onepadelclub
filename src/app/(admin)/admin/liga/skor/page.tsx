import Link from "next/link";
import { getLeaguesWithLabels, getMatchesWithTeams } from "@/lib/liga";
import type { MatchView } from "@/components/match-card";
import { SkorEditor } from "./skor-editor";

export const dynamic = "force-dynamic";

export default async function AdminSkorPage() {
  const leagues = await getLeaguesWithLabels();
  const matchesByLeague: Record<string, MatchView[]> = {};
  await Promise.all(
    leagues.map(async (l) => {
      matchesByLeague[l.id] = await getMatchesWithTeams(l.id);
    }),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Input Skor</h1>
        <Link href="/admin/liga" className="text-sm text-accent">Liga</Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Pilih liga, isi skor, simpan. Klasemen update otomatis.
      </p>
      <div className="mt-6">
        {leagues.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">
            Belum ada liga.
          </p>
        ) : (
          <SkorEditor leagues={leagues} matchesByLeague={matchesByLeague} />
        )}
      </div>
    </div>
  );
}
