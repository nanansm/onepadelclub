"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rupiah } from "@/lib/utils";
import { dateLabelId, rangeLabel, statusLabel } from "@/lib/format";
import {
  cancelRegAction,
  cancelSessionAction,
  confirmRegAction,
  createSessionAction,
} from "./actions";

type Reg = {
  id: string;
  customerName: string;
  customerWa: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
};
type Session = {
  id: string;
  title: string;
  level: string;
  date: string;
  startHour: number;
  duration: number;
  maxPlayers: number;
  pricePerPlayer: number;
  status: string;
  courtName: string | null;
  regs: Reg[];
};
type Court = { id: string; name: string };

const inputClass =
  "rounded-lg border bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function OpenPlayAdmin({
  sessions,
  courts,
  today,
}: {
  sessions: Session[];
  courts: Court[];
  today: string;
}) {
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
    <div className="space-y-6">
      <form
        action={async (fd) => {
          await run(
            () =>
              createSessionAction({
                title: fd.get("title"),
                level: fd.get("level"),
                courtId: fd.get("courtId"),
                date: fd.get("date"),
                startHour: fd.get("startHour"),
                duration: fd.get("duration"),
                maxPlayers: fd.get("maxPlayers"),
                pricePerPlayer: fd.get("pricePerPlayer"),
              }),
            "Sesi dibuat",
          );
        }}
        className="rounded-2xl border bg-card p-4"
      >
        <h2 className="mb-3 text-sm font-semibold text-muted">Buat Sesi Open Play</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input name="title" required placeholder="Judul" className={`${inputClass} col-span-2`} />
          <input name="level" required defaultValue="Mixed" placeholder="Level" className={inputClass} />
          <select name="courtId" className={inputClass} defaultValue="">
            <option value="">Tanpa court</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input name="date" type="date" required defaultValue={today} min={today} className={inputClass} />
          <input name="startHour" type="number" required min={0} max={23} placeholder="Jam mulai" className={inputClass} />
          <input name="duration" type="number" required min={1} max={6} defaultValue={2} placeholder="Durasi (jam)" className={inputClass} />
          <input name="maxPlayers" type="number" required min={2} max={32} defaultValue={8} placeholder="Maks pemain" className={inputClass} />
          <input name="pricePerPlayer" type="number" required min={0} step={5000} placeholder="Harga/orang" className={`${inputClass} col-span-2`} />
          <button type="submit" disabled={busy} className="col-span-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg disabled:opacity-50 sm:col-span-4">
            Buat Sesi
          </button>
        </div>
      </form>

      {sessions.length === 0 ? (
        <p className="rounded-2xl border bg-card p-8 text-center text-muted">Belum ada sesi mendatang.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const active = s.regs.filter((r) => r.status !== "CANCELLED").length;
            return (
              <li key={s.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.title}</span>
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{s.level}</span>
                      {s.status === "CANCELLED" ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Dibatalkan</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {dateLabelId(s.date)} · {rangeLabel(s.startHour, s.duration)}
                      {s.courtName ? ` · ${s.courtName}` : ""} · {rupiah(s.pricePerPlayer)}/orang
                    </p>
                    <p className="mt-1 text-sm font-medium">{active}/{s.maxPlayers} terdaftar</p>
                  </div>
                  {s.status !== "CANCELLED" ? (
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (confirm("Batalkan sesi ini?")) run(() => cancelSessionAction(s.id), "Sesi dibatalkan");
                      }}
                      className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      Batalkan
                    </button>
                  ) : null}
                </div>

                {s.regs.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-t pt-3">
                    {s.regs.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                        <span>
                          {r.customerName} · {r.customerWa}{" "}
                          <span className="text-muted">({statusLabel(r.status)})</span>
                        </span>
                        {r.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button disabled={busy} onClick={() => run(() => confirmRegAction(r.id), "Dikonfirmasi")} className="rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-brand-fg disabled:opacity-50">Konfirmasi</button>
                            <button disabled={busy} onClick={() => run(() => cancelRegAction(r.id), "Dibatalkan")} className="rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50">Batal</button>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
