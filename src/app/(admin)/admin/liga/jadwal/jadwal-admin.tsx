"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearScheduleAction, generateScheduleAction } from "./actions";

type League = { id: string; label: string; teamCount: number; matchCount: number };

export function JadwalAdmin({ leagues }: { leagues: League[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Gagal");
    toast.success(ok);
    router.refresh();
  }

  return (
    <ul className="space-y-3">
      {leagues.map((l) => (
        <li key={l.id} className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold">{l.label}</div>
            <div className="text-sm text-muted">{l.teamCount} tim · {l.matchCount} match</div>
          </div>
          <div className="flex gap-2">
            {l.matchCount === 0 ? (
              <button
                disabled={busy}
                onClick={() => run(() => generateScheduleAction({ leagueId: l.id }), "Jadwal round-robin dibuat")}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-fg disabled:opacity-50"
              >
                Generate Round Robin
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() => {
                  if (confirm(`Hapus semua ${l.matchCount} match di ${l.label}? Klasemen direset.`))
                    run(() => clearScheduleAction(l.id), "Jadwal dihapus");
                }}
                className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                Hapus Jadwal
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
