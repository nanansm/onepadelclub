"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createSeasonAction,
  finalizeSeasonAction,
  promoteRelegateAction,
} from "./actions";

type Season = { id: string; name: string; year: number; status: string };
type Cat = { id: string; name: string };

const inputClass =
  "rounded-lg border bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function SeasonAdmin({
  seasons,
  categories,
}: {
  seasons: Season[];
  categories: Cat[];
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
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Season</h2>
        <form
          action={async (fd) => {
            await run(() => createSeasonAction({ name: fd.get("name"), year: fd.get("year") }), "Season dibuat");
          }}
          className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4"
        >
          <input name="name" required placeholder="Nama (Season II)" className={`${inputClass} flex-1`} />
          <input name="year" type="number" required defaultValue={2025} min={2024} className={`${inputClass} w-28`} />
          <button disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50">Buat Season</button>
        </form>

        <ul className="mt-3 space-y-2">
          {seasons.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
              <div>
                <span className="font-semibold">{s.name}</span> · {s.year}{" "}
                <span className={cn("ml-1 rounded-full px-2 py-0.5 text-xs font-semibold", s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>
                  {s.status === "ACTIVE" ? "Aktif" : "Selesai"}
                </span>
              </div>
              {s.status === "ACTIVE" ? (
                <button
                  disabled={busy}
                  onClick={() => {
                    if (confirm("Finalisasi season? Juara tiap kategori masuk Hall of Fame dan season ditutup."))
                      run(() => finalizeSeasonAction(s.id), "Season difinalisasi");
                  }}
                  className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-cream/40 disabled:opacity-50"
                >
                  Finalisasi Season
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-muted">Promosi & Degradasi</h2>
        <p className="mb-3 text-xs text-muted">
          Liga 1 rank 7-8 turun ke Liga 2, Liga 2 rank 1-2 naik ke Liga 1. Klasemen direset setelahnya.
        </p>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
              <span className="font-medium">{c.name}</span>
              <button
                disabled={busy}
                onClick={() => {
                  if (confirm(`Eksekusi promosi-degradasi ${c.name}? Tim pindah liga & klasemen direset.`))
                    run(() => promoteRelegateAction(c.id), "Promosi-degradasi dieksekusi");
                }}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-fg disabled:opacity-50"
              >
                Eksekusi
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
