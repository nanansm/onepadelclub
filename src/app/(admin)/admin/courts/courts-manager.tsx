"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rupiah } from "@/lib/utils";
import {
  createCourtAction,
  toggleCourtAction,
  updateCourtAction,
} from "./actions";

type CourtRow = {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  pricePerHour: number;
  active: boolean;
};

const inputClass =
  "rounded-lg border bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function CourtsManager({ courts }: { courts: CourtRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(
    fn: () => Promise<{ ok: boolean; error?: string }>,
    okMsg: string,
  ) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Gagal");
      return false;
    }
    toast.success(okMsg);
    setEditingId(null);
    router.refresh();
    return true;
  }

  return (
    <div className="space-y-6">
      {/* Tambah lapangan */}
      <form
        action={async (formData) => {
          await handle(
            () =>
              createCourtAction({
                name: formData.get("name"),
                type: formData.get("type"),
                pricePerHour: formData.get("pricePerHour"),
              }),
            "Lapangan ditambahkan",
          );
        }}
        className="rounded-2xl border bg-card p-4"
      >
        <h2 className="mb-3 text-sm font-semibold text-muted">Tambah Lapangan</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <input name="name" required placeholder="Nama (Court D)" className={inputClass} />
          <select name="type" className={inputClass} defaultValue="INDOOR">
            <option value="INDOOR">Indoor</option>
            <option value="OUTDOOR">Outdoor</option>
          </select>
          <input
            name="pricePerHour"
            type="number"
            required
            min={1000}
            step={1000}
            placeholder="Harga/jam"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg disabled:opacity-50"
          >
            Tambah
          </button>
        </div>
      </form>

      {/* Daftar lapangan */}
      <ul className="space-y-3">
        {courts.map((c) =>
          editingId === c.id ? (
            <li key={c.id} className="rounded-2xl border bg-card p-4">
              <form
                action={async (formData) => {
                  await handle(
                    () =>
                      updateCourtAction({
                        id: c.id,
                        name: formData.get("name"),
                        type: formData.get("type"),
                        pricePerHour: formData.get("pricePerHour"),
                      }),
                    "Lapangan diperbarui",
                  );
                }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]"
              >
                <input name="name" defaultValue={c.name} required className={inputClass} />
                <select name="type" defaultValue={c.type} className={inputClass}>
                  <option value="INDOOR">Indoor</option>
                  <option value="OUTDOOR">Outdoor</option>
                </select>
                <input
                  name="pricePerHour"
                  type="number"
                  defaultValue={c.pricePerHour}
                  min={1000}
                  step={1000}
                  required
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-fg disabled:opacity-50"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  Batal
                </button>
              </form>
            </li>
          ) : (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-2xl border bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {!c.active && (
                    <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">
                  {c.type === "INDOOR" ? "Indoor" : "Outdoor"} ·{" "}
                  {rupiah(c.pricePerHour)}/jam
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(c.id)}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40"
                >
                  Edit
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    handle(
                      () => toggleCourtAction(c.id, !c.active),
                      c.active ? "Lapangan dinonaktifkan" : "Lapangan diaktifkan",
                    )
                  }
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40 disabled:opacity-50"
                >
                  {c.active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
