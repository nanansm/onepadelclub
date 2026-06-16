"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { dateLabelId, hourLabel } from "@/lib/format";
import type { MatchView } from "@/components/match-card";
import { submitScoreAction } from "./actions";

type League = { id: string; label: string };

export function SkorEditor({
  leagues,
  matchesByLeague,
}: {
  leagues: League[];
  matchesByLeague: Record<string, MatchView[]>;
}) {
  const [leagueId, setLeagueId] = useState(leagues[0]?.id ?? "");
  const matches = matchesByLeague[leagueId] ?? [];

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Liga</label>
      <select
        value={leagueId}
        onChange={(e) => setLeagueId(e.target.value)}
        className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        {leagues.map((l) => (
          <option key={l.id} value={l.id}>{l.label}</option>
        ))}
      </select>

      <div className="mt-5 space-y-3">
        {matches.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">
            Belum ada match. Buat jadwal dulu di menu Jadwal.
          </p>
        ) : (
          matches.map((m) => <MatchEditor key={m.id} m={m} />)
        )}
      </div>
    </div>
  );
}

function MatchEditor({ m }: { m: MatchView }) {
  const router = useRouter();
  const [scoreA, setScoreA] = useState(m.scoreA);
  const [scoreB, setScoreB] = useState(m.scoreB);
  const [status, setStatus] = useState(m.status);
  const [woTeamId, setWoTeamId] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await submitScoreAction({ matchId: m.id, scoreA, scoreB, status, woTeamId });
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Gagal");
    toast.success("Skor tersimpan, klasemen diperbarui");
    router.refresh();
  }

  const statusColor: Record<string, string> = {
    SCHEDULED: "text-slate-500",
    LIVE: "text-red-600",
    DONE: "text-emerald-700",
    WO: "text-amber-700",
  };

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {m.date ? dateLabelId(m.date) : "-"}
          {m.startHour != null ? ` · ${hourLabel(m.startHour)}` : ""}
          {m.court ? ` · ${m.court}` : ""}
        </span>
        <span className={cn("font-semibold", statusColor[status])}>{status}</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="truncate text-right text-sm font-semibold">{m.teamAName}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={10}
            value={scoreA}
            onChange={(e) => setScoreA(Number(e.target.value) || 0)}
            className="h-10 w-12 rounded-lg border bg-white text-center outline-none focus:border-brand"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            min={0}
            max={10}
            value={scoreB}
            onChange={(e) => setScoreB(Number(e.target.value) || 0)}
            className="h-10 w-12 rounded-lg border bg-white text-center outline-none focus:border-brand"
          />
        </div>
        <span className="truncate text-sm font-semibold">{m.teamBName}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border bg-white px-2.5 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="SCHEDULED">Akan datang</option>
          <option value="LIVE">Berlangsung</option>
          <option value="DONE">Selesai</option>
          <option value="WO">WO</option>
        </select>
        {status === "WO" ? (
          <select
            value={woTeamId}
            onChange={(e) => setWoTeamId(e.target.value)}
            className="rounded-lg border bg-white px-2.5 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Tim WO...</option>
            <option value={m.teamAId}>{m.teamAName} WO</option>
            <option value={m.teamBId}>{m.teamBName} WO</option>
          </select>
        ) : null}
        <button
          onClick={save}
          disabled={busy}
          className="ml-auto rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-fg disabled:opacity-50"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
