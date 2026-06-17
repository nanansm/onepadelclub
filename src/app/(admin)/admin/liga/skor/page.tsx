import { getLeaguesWithLabels, getMatchesWithTeams } from "@/lib/liga";
import type { MatchView } from "@/components/match-card";
import { AdminPageHeader } from "@/components/admin/page-header";
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
      <AdminPageHeader
        title="Input Skor"
        sub="Pilih liga, isi skor, simpan. Klasemen update otomatis."
        back={{ href: "/admin/liga", label: "Liga" }}
      />
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
