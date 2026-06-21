import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function RegulasiPage() {
  const settings = await getSettings();
  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <PageHeading plain="Regulasi" accent="Liga" sub="Aturan main Liga Padel." />
        <div className="space-y-3">
          {settings.rules.map((r) => (
            <div key={r.title} className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold text-brand">{r.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
