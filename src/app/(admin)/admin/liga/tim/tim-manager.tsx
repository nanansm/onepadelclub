"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createPlayerAction,
  createTeamAction,
  deletePlayerAction,
  deleteTeamAction,
} from "./actions";

type Player = { id: string; name: string; position: "INTI" | "CADANGAN" };
type Team = { id: string; name: string; colorHex: string; players: Player[] };
type League = { id: string; label: string; teams: Team[] };

const inputClass =
  "rounded-lg border bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function TimManager({ leagues }: { leagues: League[] }) {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState(leagues[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const league = leagues.find((l) => l.id === leagueId);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Gagal");
    toast.success(ok);
    router.refresh();
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Liga</label>
      <select value={leagueId} onChange={(e) => setLeagueId(e.target.value)} className={`${inputClass} w-full`}>
        {leagues.map((l) => (
          <option key={l.id} value={l.id}>{l.label}</option>
        ))}
      </select>

      <form
        action={async (fd) => {
          await run(
            () => createTeamAction({ leagueId, name: fd.get("name"), colorHex: fd.get("colorHex") }),
            "Tim ditambahkan",
          );
        }}
        className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4"
      >
        <input name="name" required placeholder="Nama tim" className={`${inputClass} flex-1`} />
        <input name="colorHex" type="color" defaultValue="#1a4d33" className="h-10 w-12 rounded-lg border" />
        <button disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50">Tambah Tim</button>
      </form>

      <div className="mt-4 space-y-3">
        {(league?.teams ?? []).map((t) => (
          <div key={t.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full" style={{ background: t.colorHex }} />
                <span className="font-semibold">{t.name}</span>
              </div>
              <button
                disabled={busy}
                onClick={() => {
                  if (confirm(`Hapus ${t.name}? Pemain & match ikut terhapus.`))
                    run(() => deleteTeamAction(t.id), "Tim dihapus");
                }}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                Hapus
              </button>
            </div>

            <ul className="mt-3 space-y-1.5">
              {t.players.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span>
                    {p.name}{" "}
                    <span className={cn("text-xs", p.position === "INTI" ? "text-brand" : "text-muted")}>
                      ({p.position === "INTI" ? "Inti" : "Cadangan"})
                    </span>
                  </span>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (confirm(`Hapus pemain ${p.name}?`))
                        run(() => deletePlayerAction(p.id), "Pemain dihapus");
                    }}
                    className="text-xs text-muted hover:text-red-600 disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>

            <form
              action={async (fd) => {
                await run(
                  () => createPlayerAction({ teamId: t.id, name: fd.get("name"), position: fd.get("position") }),
                  "Pemain ditambahkan",
                );
              }}
              className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3"
            >
              <input name="name" required placeholder="Nama pemain" className={`${inputClass} flex-1 text-sm`} />
              <select name="position" defaultValue="INTI" className={`${inputClass} text-sm`}>
                <option value="INTI">Inti</option>
                <option value="CADANGAN">Cadangan</option>
              </select>
              <button disabled={busy} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50">+ Pemain</button>
            </form>
          </div>
        ))}
        {(league?.teams ?? []).length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">Belum ada tim di liga ini.</p>
        ) : null}
      </div>
    </div>
  );
}
