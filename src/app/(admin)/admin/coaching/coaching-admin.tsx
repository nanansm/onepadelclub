"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rupiah } from "@/lib/utils";
import { dateLabelId, rangeLabel, statusLabel } from "@/lib/format";
import { ImageUpload } from "@/components/image-upload";
import {
  cancelCoachingAction,
  confirmCoachingAction,
  createCoachAction,
  toggleCoachAction,
  updateCoachAction,
} from "./actions";

type Coach = {
  id: string;
  name: string;
  ratePerHour: number;
  bio: string | null;
  photoUrl: string | null;
  active: boolean;
};
type Booking = {
  id: string;
  code: string;
  coachName: string;
  date: string;
  startHour: number;
  duration: number;
  totalPrice: number;
  customerName: string;
  customerWa: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
};

const inputClass =
  "rounded-lg border bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function CoachingAdmin({
  coaches,
  bookings,
}: {
  coaches: Coach[];
  bookings: Booking[];
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
      {/* Pelatih */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Pelatih</h2>
        <form
          action={async (fd) => {
            await run(
              () =>
                createCoachAction({
                  name: fd.get("name"),
                  ratePerHour: fd.get("ratePerHour"),
                  bio: fd.get("bio"),
                  photoUrl: fd.get("photoUrl"),
                }),
              "Pelatih ditambahkan",
            );
          }}
          className="rounded-2xl border bg-card p-4"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input name="name" required placeholder="Nama pelatih" className={inputClass} />
            <input name="ratePerHour" type="number" required min={1000} step={5000} placeholder="Tarif/jam" className={inputClass} />
            <div className="sm:col-span-2">
              <ImageUpload name="photoUrl" prefix="coach" label="Upload foto pelatih" />
            </div>
            <input name="bio" placeholder="Bio singkat (opsional)" className={`${inputClass} sm:col-span-2`} />
            <button type="submit" disabled={busy} className="rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg disabled:opacity-50 sm:col-span-2">Tambah Pelatih</button>
          </div>
        </form>

        <ul className="mt-3 space-y-2">
          {coaches.map((c) =>
            editingId === c.id ? (
              <li key={c.id} className="rounded-2xl border bg-card p-4">
                <form
                  action={async (fd) => {
                    await run(
                      () =>
                        updateCoachAction({
                          id: c.id,
                          name: fd.get("name"),
                          ratePerHour: fd.get("ratePerHour"),
                          bio: fd.get("bio"),
                          photoUrl: fd.get("photoUrl"),
                        }),
                      "Pelatih diperbarui",
                    );
                  }}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <input name="name" defaultValue={c.name} required className={inputClass} />
                  <input name="ratePerHour" type="number" defaultValue={c.ratePerHour} required className={inputClass} />
                  <div className="sm:col-span-2">
                    <ImageUpload name="photoUrl" prefix="coach" defaultUrl={c.photoUrl} label="Ganti foto pelatih" />
                  </div>
                  <input name="bio" defaultValue={c.bio ?? ""} placeholder="Bio" className={`${inputClass} sm:col-span-2`} />
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="submit" disabled={busy} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-fg disabled:opacity-50">Simpan</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border px-3 py-2 text-sm">Batal</button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={c.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{c.name}</span>
                    {!c.active ? <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">Nonaktif</span> : null}
                  </div>
                  <p className="text-sm text-muted">{rupiah(c.ratePerHour)}/jam</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(c.id)} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40">Edit</button>
                  <button disabled={busy} onClick={() => run(() => toggleCoachAction(c.id, !c.active), c.active ? "Dinonaktifkan" : "Diaktifkan")} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40 disabled:opacity-50">{c.active ? "Nonaktifkan" : "Aktifkan"}</button>
                </div>
              </li>
            ),
          )}
        </ul>
      </section>

      {/* Booking coaching */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Booking Coaching</h2>
        {bookings.length === 0 ? (
          <p className="rounded-2xl border bg-card p-6 text-center text-muted">Belum ada booking.</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <div className="font-semibold">{b.coachName} · {b.customerName}</div>
                  <div className="text-muted">
                    {dateLabelId(b.date)} · {rangeLabel(b.startHour, b.duration)} · {rupiah(b.totalPrice)} · {b.customerWa} · {b.code} ({statusLabel(b.status)})
                  </div>
                </div>
                {b.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button disabled={busy} onClick={() => run(() => confirmCoachingAction(b.id), "Dikonfirmasi")} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg disabled:opacity-50">Konfirmasi</button>
                    <button disabled={busy} onClick={() => run(() => cancelCoachingAction(b.id), "Dibatalkan")} className="rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50">Batal</button>
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
