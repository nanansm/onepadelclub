import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LigaHeader } from "@/components/liga-header";
import { MatchCard } from "@/components/match-card";
import { getTeamRecentMatches, getTeamWithPlayers } from "@/lib/liga";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTeamWithPlayers(id);
  if (!data) notFound();
  const { team, players, standing } = data;
  const recent = await getTeamRecentMatches(team.id, team.leagueId);

  const stats = [
    { label: "Main", value: standing?.main ?? 0 },
    { label: "Menang", value: standing?.menang ?? 0 },
    { label: "Kalah", value: standing?.kalah ?? 0 },
    { label: "Poin", value: standing?.poin ?? 0 },
  ];

  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-12 w-12 rounded-2xl"
            style={{ background: team.colorHex ?? "#1a4d33" }}
          />
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <Link href="/liga/klasemen" className="text-sm text-accent">
              Lihat klasemen
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-3 text-center">
              <div className="text-xl font-bold text-brand">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-7 text-sm font-semibold text-muted">Pemain</h2>
        <ul className="mt-2 space-y-2">
          {players.map((p) => (
            <li key={p.id}>
              <Link
                href={`/liga/pemain/${p.id}`}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition hover:border-brand/50"
              >
                {p.photoUrl ? (
                  <Image
                    src={p.photoUrl}
                    alt={p.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-cream" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted">
                    {p.position === "INTI" ? "Pemain Inti" : "Cadangan"}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-7 text-sm font-semibold text-muted">5 Match Terakhir</h2>
        <div className="mt-2 space-y-3">
          {recent.length === 0 ? (
            <p className="rounded-2xl border bg-card p-6 text-center text-muted">
              Belum ada hasil match.
            </p>
          ) : (
            recent.map((m) => <MatchCard key={m.id} m={m} />)
          )}
        </div>
      </main>
    </div>
  );
}
