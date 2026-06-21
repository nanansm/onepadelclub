import Link from "next/link";
import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";
import {
  getActiveSeason,
  getKlasemenData,
  getLiveMatchesWithTeams,
} from "@/lib/liga";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.ligaName,
    description: `Klasemen real-time, jadwal, live score, dan profil tim ${s.ligaName}.`,
  };
}

export const dynamic = "force-dynamic";

const nav = [
  { label: "Klasemen", href: "/liga/klasemen", desc: "Peringkat tiap kategori" },
  { label: "Jadwal & Hasil", href: "/liga/jadwal", desc: "Match per minggu" },
  { label: "Live Score", href: "/liga/live", desc: "Match berlangsung" },
  { label: "Hall of Fame", href: "/liga/hall-of-fame", desc: "Arsip juara" },
  { label: "Regulasi", href: "/liga/regulasi", desc: "Aturan main" },
];

export default async function LigaHubPage() {
  const [season, data, live, settings] = await Promise.all([
    getActiveSeason(),
    getKlasemenData(),
    getLiveMatchesWithTeams(),
    getSettings(),
  ]);

  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-3xl px-5 py-6">
        <PageHeading
          plain={settings.ligaName}
          sub={season ? `${season.name} · ${season.year}` : undefined}
        />

        {live.length > 0 ? (
          <Link
            href="/liga/live"
            className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {live.length} match sedang berlangsung — tonton live
          </Link>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-2xl border bg-card p-4 transition hover:border-brand hover:shadow-sm"
            >
              <div className="font-semibold">{n.label}</div>
              <div className="mt-1 text-xs text-muted">{n.desc}</div>
            </Link>
          ))}
        </div>

        <h2 className="mt-8 text-sm font-semibold text-muted">Pemuncak Klasemen</h2>
        <div className="mt-3 space-y-4">
          {data.map((d) => (
            <div key={d.category.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{d.category.name}</span>
                <Link href="/liga/klasemen" className="text-xs text-accent">
                  Lihat semua
                </Link>
              </div>
              <ol className="mt-3 space-y-1.5">
                {d.liga1.slice(0, 3).map((r, i) => (
                  <li key={r.teamId} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-muted">{i + 1}</span>
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: r.team.colorHex ?? "#1a4d33" }}
                    />
                    <Link href={`/liga/tim/${r.teamId}`} className="flex-1 font-medium hover:text-brand">
                      {r.team.name}
                    </Link>
                    <span className="font-bold text-brand">{r.poin}</span>
                  </li>
                ))}
                {d.liga1.length === 0 ? (
                  <li className="text-sm text-muted">Belum ada data.</li>
                ) : null}
              </ol>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
