"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, rupiah } from "@/lib/utils";
import { dateLabelId, rangeLabel } from "@/lib/format";
import { registerOpenPlayAction } from "./actions";

type Session = {
  id: string;
  title: string;
  level: string;
  date: string;
  startHour: number;
  duration: number;
  maxPlayers: number;
  pricePerPlayer: number;
  courtName: string | null;
  taken: number;
};

export function OpenPlayList({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(sessionId: string) {
    setSubmitting(true);
    const res = await registerOpenPlayAction({
      sessionId,
      customerName: name,
      customerWa: wa,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      router.refresh();
      return;
    }
    router.push(`/open-play/${res.code}`);
  }

  if (sessions.length === 0) {
    return (
      <p className="rounded-2xl border bg-card p-8 text-center text-muted">
        Belum ada sesi open play. Pantau terus, jadwal baru segera dibuka.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {sessions.map((s) => {
        const full = s.taken >= s.maxPlayers;
        const sisa = Math.max(0, s.maxPlayers - s.taken);
        return (
          <li key={s.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{s.title}</h3>
                  <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                    {s.level}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {dateLabelId(s.date)} · {rangeLabel(s.startHour, s.duration)}
                  {s.courtName ? ` · ${s.courtName}` : ""}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-brand">
                  {rupiah(s.pricePerPlayer)}
                </div>
                <div className="text-xs text-muted">/ orang</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span
                className={cn(
                  "text-sm font-medium",
                  full ? "text-red-600" : "text-muted",
                )}
              >
                {full ? "Penuh" : `${sisa} slot tersisa`} · {s.taken}/{s.maxPlayers}
              </span>
              {!full &&
                (openId === s.id ? null : (
                  <button
                    onClick={() => {
                      setOpenId(s.id);
                      setName("");
                      setWa("");
                    }}
                    className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Daftar
                  </button>
                ))}
            </div>

            {openId === s.id && !full ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(s.id);
                }}
                className="mt-4 space-y-3 border-t pt-4"
              >
                <input
                  required
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <input
                  required
                  inputMode="numeric"
                  placeholder="08xxxxxxxxxx"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-full bg-accent px-4 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "Memproses..." : `Daftar · ${rupiah(s.pricePerPlayer)}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="rounded-full border px-4 py-3 text-sm font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
