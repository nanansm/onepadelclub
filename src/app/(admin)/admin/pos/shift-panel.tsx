"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Unlock } from "lucide-react";
import { rupiah } from "@/lib/utils";
import { openShiftAction, closeShiftAction } from "./actions";

type ShiftLite = {
  openedAt: string;
  openingCash: number;
  cashSales: number;
} | null;

export function ShiftPanel({ shift }: { shift: ShiftLite }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);

  async function run(
    fn: () => Promise<{ ok: boolean; error?: string }>,
    okMsg: string,
  ) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Gagal");
      return;
    }
    toast.success(okMsg);
    setClosing(false);
    router.refresh();
  }

  if (!shift) {
    return (
      <form
        action={async (fd) => {
          await run(
            () => openShiftAction({ openingCash: fd.get("openingCash") }),
            "Shift dibuka",
          );
        }}
        className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4"
      >
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Unlock className="size-4 text-brand" /> Buka Shift Kasir
          </p>
          <p className="text-xs text-muted">
            Catat modal awal laci untuk rekonsiliasi saat tutup.
          </p>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-muted">Modal awal (Rp)</span>
          <input
            name="openingCash"
            type="number"
            min={0}
            defaultValue={0}
            className="block w-40 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50"
        >
          Buka Shift
        </button>
      </form>
    );
  }

  const expected = shift.openingCash + shift.cashSales;
  const opened = new Date(shift.openedAt).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Lock className="size-4 text-green-600" /> Shift Terbuka
          </p>
          <p className="text-xs text-muted">Dibuka {opened}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Stat label="Modal awal" value={rupiah(shift.openingCash)} />
          <Stat label="Penjualan tunai" value={rupiah(shift.cashSales)} />
          <Stat label="Ekspektasi laci" value={rupiah(expected)} strong />
        </div>
        {!closing ? (
          <button
            type="button"
            onClick={() => setClosing(true)}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-cream/40"
          >
            Tutup Shift
          </button>
        ) : null}
      </div>

      {closing ? (
        <form
          action={async (fd) => {
            await run(
              () => closeShiftAction({ closingCash: fd.get("closingCash") }),
              "Shift ditutup",
            );
          }}
          className="mt-3 flex flex-wrap items-end gap-3 border-t pt-3"
        >
          <label className="block">
            <span className="text-xs font-medium text-muted">
              Uang fisik di laci (Rp)
            </span>
            <input
              name="closingCash"
              type="number"
              min={0}
              required
              autoFocus
              className="block w-40 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50"
          >
            Tutup & Hitung Selisih
          </button>
          <button
            type="button"
            onClick={() => setClosing(false)}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Batal
          </button>
          <p className="w-full text-xs text-muted">
            Selisih = uang fisik − ekspektasi laci ({rupiah(expected)}).
          </p>
        </form>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={strong ? "font-bold text-brand" : "font-medium"}>{value}</p>
    </div>
  );
}
