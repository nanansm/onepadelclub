import Link from "next/link";
import { cn } from "@/lib/utils";
import { dateLabelId, hourLabel } from "@/lib/format";

export type MatchView = {
  id: string;
  date: string | null;
  startHour: number | null;
  court: string | null;
  status: string;
  scoreA: number;
  scoreB: number;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  catName?: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  SCHEDULED: { label: "Akan datang", cls: "bg-slate-100 text-slate-600" },
  LIVE: { label: "Berlangsung", cls: "bg-red-100 text-red-700" },
  DONE: { label: "Selesai", cls: "bg-emerald-100 text-emerald-800" },
  WO: { label: "WO", cls: "bg-amber-100 text-amber-800" },
};

export function MatchCard({ m }: { m: MatchView }) {
  const st = STATUS[m.status] ?? STATUS.SCHEDULED;
  const done = m.status === "DONE" || m.status === "WO" || m.status === "LIVE";
  const aWin = done && m.scoreA > m.scoreB;
  const bWin = done && m.scoreB > m.scoreA;

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {m.date ? dateLabelId(m.date) : "-"}
          {m.startHour != null ? ` · ${hourLabel(m.startHour)}` : ""}
          {m.court ? ` · ${m.court}` : ""}
        </span>
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", st.cls)}>
          {st.label}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <TeamSide id={m.teamAId} name={m.teamAName} win={aWin} />
        <div className="shrink-0 text-center">
          {done ? (
            <span className="text-lg font-bold tabular-nums">
              {m.scoreA} - {m.scoreB}
            </span>
          ) : (
            <span className="text-sm font-semibold text-muted">vs</span>
          )}
        </div>
        <TeamSide id={m.teamBId} name={m.teamBName} win={bWin} alignRight />
      </div>
    </div>
  );
}

function TeamSide({
  id,
  name,
  win,
  alignRight,
}: {
  id: string;
  name: string;
  win: boolean;
  alignRight?: boolean;
}) {
  return (
    <Link
      href={`/liga/tim/${id}`}
      className={cn(
        "flex-1 truncate text-sm font-semibold hover:text-brand",
        alignRight && "text-right",
        win ? "text-brand" : "text-foreground",
      )}
    >
      {name}
    </Link>
  );
}
