"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { approveRegistrationAction, rejectRegistrationAction } from "./actions";

type Registration = {
  id: string;
  teamName: string;
  category: string | null;
  player1Name: string;
  player2Name: string;
  captainWa: string;
  note: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAtLabel: string;
};

type LeagueOption = { id: string; label: string };

const statusStyle: Record<Registration["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabel: Record<Registration["status"], string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export function PendaftaranAdmin({
  registrations,
  leagues,
}: {
  registrations: Registration[];
  leagues: LeagueOption[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  // Pilihan liga per kartu (untuk auto-create tim saat approve).
  const [picked, setPicked] = useState<Record<string, string>>({});

  async function run(
    id: string,
    fn: () => Promise<{ ok: boolean; error?: string }>,
    ok: string,
  ) {
    setBusyId(id);
    const res = await fn();
    setBusyId(null);
    if (!res.ok) return toast.error(res.error ?? "Gagal");
    toast.success(ok);
    router.refresh();
  }

  function onApprove(r: Registration) {
    const leagueId = picked[r.id] || "";
    const league = leagues.find((l) => l.id === leagueId);
    const msg = league
      ? `Setujui "${r.teamName}" dan buat tim di ${league.label}?`
      : `Setujui "${r.teamName}" tanpa membuat tim? (tambah tim manual nanti)`;
    if (!confirm(msg)) return;
    run(
      r.id,
      () => approveRegistrationAction(r.id, leagueId || undefined),
      "Pendaftaran disetujui",
    );
  }

  function onReject(r: Registration) {
    if (!confirm(`Tolak pendaftaran "${r.teamName}"?`)) return;
    run(r.id, () => rejectRegistrationAction(r.id), "Pendaftaran ditolak");
  }

  if (registrations.length === 0) {
    return (
      <p className="rounded-2xl border bg-card p-8 text-center text-muted">
        Belum ada pendaftaran tim.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {registrations.map((r) => {
        const busy = busyId === r.id;
        return (
          <div key={r.id} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.teamName}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      statusStyle[r.status],
                    )}
                  >
                    {statusLabel[r.status]}
                  </span>
                </div>
                {r.category ? (
                  <span className="mt-0.5 block text-sm text-muted">{r.category}</span>
                ) : (
                  <span className="mt-0.5 block text-sm text-muted italic">
                    Kategori belum ditentukan
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">{r.createdAtLabel}</span>
            </div>

            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted" strokeWidth={2} />
                <span>
                  {r.player1Name} &amp; {r.player2Name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted" strokeWidth={2} />
                <a
                  href={`https://wa.me/${r.captainWa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline-offset-2 hover:underline"
                >
                  {r.captainWa}
                </a>
              </div>
              {r.note ? (
                <p className="text-muted">Catatan: {r.note}</p>
              ) : null}
            </div>

            {r.status === "PENDING" ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                <select
                  value={picked[r.id] ?? ""}
                  onChange={(e) =>
                    setPicked((p) => ({ ...p, [r.id]: e.target.value }))
                  }
                  className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">Tanpa buat tim</option>
                  {leagues.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <button
                  disabled={busy}
                  onClick={() => onApprove(r)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-fg disabled:opacity-50"
                >
                  <Check className="size-4" strokeWidth={2.5} />
                  Setujui
                </button>
                <button
                  disabled={busy}
                  onClick={() => onReject(r)}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                  <X className="size-4" strokeWidth={2.5} />
                  Tolak
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
