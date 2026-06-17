"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rupiah } from "@/lib/utils";
import {
  activateMembershipAction,
  cancelMembershipAction,
  createPlanAction,
  togglePlanAction,
  updatePlanAction,
} from "./actions";

type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  benefits: string | null;
  discountPercent: number;
  active: boolean;
};
type Member = {
  id: string;
  code: string;
  planName: string;
  customerName: string;
  customerWa: string;
  status: string;
  endDate: string | null;
};

const inputClass =
  "rounded-lg border bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

const MSTATUS: Record<string, string> = {
  PENDING: "Menunggu",
  ACTIVE: "Aktif",
  EXPIRED: "Berakhir",
  CANCELLED: "Dibatalkan",
};

export function MembershipAdmin({
  plans,
  members,
}: {
  plans: Plan[];
  members: Member[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Gagal");
    toast.success(ok);
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Paket</h2>
        <form
          action={async (fd) => {
            await run(
              () =>
                createPlanAction({
                  name: fd.get("name"),
                  price: fd.get("price"),
                  durationDays: fd.get("durationDays"),
                  discountPercent: fd.get("discountPercent"),
                  benefits: fd.get("benefits"),
                }),
              "Paket ditambahkan",
            );
          }}
          className="rounded-2xl border bg-card p-4"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input name="name" required placeholder="Nama paket" className={inputClass} />
            <input name="price" type="number" required min={0} step={10000} placeholder="Harga" className={inputClass} />
            <input name="durationDays" type="number" required min={1} defaultValue={30} placeholder="Durasi (hari)" className={inputClass} />
            <input name="discountPercent" type="number" min={0} max={100} defaultValue={0} placeholder="Diskon booking (%)" className={inputClass} />
            <textarea name="benefits" placeholder="Benefit (satu per baris)" rows={3} className={`${inputClass} sm:col-span-3`} />
            <button type="submit" disabled={busy} className="rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg disabled:opacity-50 sm:col-span-3">Tambah Paket</button>
          </div>
        </form>

        <ul className="mt-3 space-y-2">
          {plans.map((p) =>
            editingId === p.id ? (
              <li key={p.id} className="rounded-2xl border bg-card p-4">
                <form
                  action={async (fd) => {
                    await run(
                      () =>
                        updatePlanAction({
                          id: p.id,
                          name: fd.get("name"),
                          price: fd.get("price"),
                          durationDays: fd.get("durationDays"),
                          discountPercent: fd.get("discountPercent"),
                          benefits: fd.get("benefits"),
                        }),
                      "Paket diperbarui",
                    );
                  }}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                >
                  <input name="name" defaultValue={p.name} required className={inputClass} />
                  <input name="price" type="number" defaultValue={p.price} required className={inputClass} />
                  <input name="durationDays" type="number" defaultValue={p.durationDays} required className={inputClass} />
                  <input name="discountPercent" type="number" min={0} max={100} defaultValue={p.discountPercent} placeholder="Diskon (%)" className={inputClass} />
                  <textarea name="benefits" defaultValue={p.benefits ?? ""} rows={3} className={`${inputClass} sm:col-span-3`} />
                  <div className="flex gap-2 sm:col-span-3">
                    <button type="submit" disabled={busy} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-fg disabled:opacity-50">Simpan</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border px-3 py-2 text-sm">Batal</button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={p.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.name}</span>
                    {!p.active ? <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">Nonaktif</span> : null}
                  </div>
                  <p className="text-sm text-muted">
                    {rupiah(p.price)} / {p.durationDays} hari
                    {p.discountPercent > 0 ? (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        diskon {p.discountPercent}% booking
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(p.id)} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40">Edit</button>
                  <button disabled={busy} onClick={() => run(() => togglePlanAction(p.id, !p.active), p.active ? "Dinonaktifkan" : "Diaktifkan")} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40 disabled:opacity-50">{p.active ? "Nonaktifkan" : "Aktifkan"}</button>
                </div>
              </li>
            ),
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Member</h2>
        {members.length === 0 ? (
          <p className="rounded-2xl border bg-card p-6 text-center text-muted">Belum ada pendaftar.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id} className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <div className="font-semibold">{m.customerName} · {m.planName}</div>
                  <div className="text-muted">
                    {m.customerWa} · {m.code} · {MSTATUS[m.status] ?? m.status}
                    {m.endDate ? ` · s/d ${m.endDate}` : ""}
                  </div>
                </div>
                {m.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button disabled={busy} onClick={() => run(() => activateMembershipAction(m.id), "Diaktifkan")} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg disabled:opacity-50">Aktifkan</button>
                    <button disabled={busy} onClick={() => run(() => cancelMembershipAction(m.id), "Dibatalkan")} className="rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50">Batal</button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
