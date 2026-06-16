import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LigaHeader } from "@/components/liga-header";
import { getPlayerById } from "@/lib/liga";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPlayerById(id);
  if (!data) notFound();
  const { player, team } = data;

  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-md px-5 py-6">
        <div className="rounded-2xl border bg-card p-6 text-center">
          {player.photoUrl ? (
            <Image
              src={player.photoUrl}
              alt={player.name}
              width={96}
              height={96}
              unoptimized
              className="mx-auto h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto h-24 w-24 rounded-full bg-cream" />
          )}
          <h1 className="mt-4 text-2xl font-bold">{player.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {player.position === "INTI" ? "Pemain Inti" : "Cadangan"}
          </p>
          {team ? (
            <Link
              href={`/liga/tim/${team.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:border-brand/50"
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: team.colorHex ?? "#1a4d33" }}
              />
              {team.name}
            </Link>
          ) : null}
        </div>
      </main>
    </div>
  );
}
