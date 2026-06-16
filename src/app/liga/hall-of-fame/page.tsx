import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";
import { getHallOfFame } from "@/lib/liga";

export const dynamic = "force-dynamic";

export default async function HallOfFamePage() {
  const rows = await getHallOfFame();

  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <PageHeading plain="Hall of" accent="Fame" sub="Arsip juara dan penghargaan tiap season." />
        {rows.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">
            Belum ada penghargaan.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-5">
                <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
                  {r.award}
                </span>
                <p className="mt-3 text-lg font-bold">{r.teamName}</p>
                {r.note ? <p className="mt-1 text-sm text-muted">{r.note}</p> : null}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
