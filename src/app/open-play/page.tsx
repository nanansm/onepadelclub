import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/page-heading";
import { getUpcomingSessions } from "@/lib/openplay";
import { OpenPlayList } from "./open-play-list";

export const dynamic = "force-dynamic";

export default async function OpenPlayPage() {
  const rows = await getUpcomingSessions();
  const sessions = rows.map((r) => ({
    id: r.session.id,
    title: r.session.title,
    level: r.session.level,
    date: r.session.date,
    startHour: r.session.startHour,
    duration: r.session.duration,
    maxPlayers: r.session.maxPlayers,
    pricePerPlayer: r.session.pricePerPlayer,
    courtName: r.courtName,
    taken: r.taken,
  }));

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Open Play" />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <PageHeading
          plain="Open Play /"
          accent="Mabar"
          sub="Gabung sesi main bareng sesuai level. Daftar per kursi, bayar manual."
        />
        <OpenPlayList sessions={sessions} />
      </main>
    </div>
  );
}
