import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";
import { getJadwalData } from "@/lib/liga";
import { JadwalView } from "./jadwal-view";

export const dynamic = "force-dynamic";

export default async function JadwalPage() {
  const data = await getJadwalData();
  const categories = data.map((d) => ({
    id: d.category.id,
    name: d.category.name,
    matches: d.matches,
  }));

  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <PageHeading plain="Jadwal &" accent="Hasil" sub="Match per kategori, Liga 1." />
        {categories.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">
            Belum ada data liga.
          </p>
        ) : (
          <JadwalView categories={categories} />
        )}
      </main>
    </div>
  );
}
