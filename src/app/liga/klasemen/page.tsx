import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";
import { getKlasemenData } from "@/lib/liga";
import { KlasemenView } from "./klasemen-view";

export const dynamic = "force-dynamic";

export default async function KlasemenPage() {
  const data = await getKlasemenData();
  const categories = data.map((d) => ({
    id: d.category.id,
    name: d.category.name,
    liga1: d.liga1.map(mapRow),
    liga2: d.liga2.map(mapRow),
  }));

  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-3xl px-5 py-6">
        <PageHeading plain="Klasemen" accent="Liga" sub="Update otomatis tiap skor masuk." />
        {categories.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">
            Belum ada data liga.
          </p>
        ) : (
          <KlasemenView categories={categories} />
        )}
      </main>
    </div>
  );
}

function mapRow(r: {
  teamId: string;
  team: { name: string; colorHex: string | null };
  main: number;
  menang: number;
  kalah: number;
  wo: number;
  gameMenang: number;
  gameKalah: number;
  selisih: number;
  poin: number;
}) {
  return {
    teamId: r.teamId,
    teamName: r.team.name,
    color: r.team.colorHex ?? "#1a4d33",
    main: r.main,
    menang: r.menang,
    kalah: r.kalah,
    wo: r.wo,
    gameMenang: r.gameMenang,
    gameKalah: r.gameKalah,
    selisih: r.selisih,
    poin: r.poin,
  };
}
