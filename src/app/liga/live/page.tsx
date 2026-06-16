import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";
import { getLiveMatchesWithTeams } from "@/lib/liga";
import { LiveView } from "./live-view";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const initial = await getLiveMatchesWithTeams();
  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <PageHeading plain="Live" accent="Score" sub="Match yang sedang berlangsung." />
        <LiveView initial={initial} />
      </main>
    </div>
  );
}
