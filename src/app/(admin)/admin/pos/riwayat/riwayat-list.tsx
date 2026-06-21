"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { rupiah } from "@/lib/utils";
import { voidSaleAction } from "../actions";

type Order = {
  id: string;
  code: string;
  createdAt: string;
  customerName: string | null;
  total: number;
  paymentMethod: string;
  status: string;
};

const PAY_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  GATEWAY: "Online",
};

export function RiwayatList({
  from,
  to,
  today,
  orders,
}: {
  from: string;
  to: string;
  today: string;
  orders: Order[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [voidRow, setVoidRow] = useState<Order | null>(null);

  function go(f: string, t: string) {
    router.push(`/admin/pos/riwayat?from=${f}&to=${t}`);
  }

  async function doVoid(id: string) {
    setBusy(true);
    const res = await voidSaleAction(id);
    setBusy(false);
    setVoidRow(null);
    if (!res.ok) {
      toast.error(res.error ?? "Gagal");
      return;
    }
    toast.success("Transaksi dibatalkan, stok dikembalikan");
    router.refresh();
  }

  const totalPaid = orders
    .filter((o) => o.status === "PAID")
    .reduce((s, o) => s + o.total, 0);

  const input =
    "rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand";
  const preset =
    "rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40";

  return (
    <div className="space-y-4">
      {/* Filter tanggal */}
      <div className="flex flex-wrap items-end gap-2 rounded-2xl border bg-card p-4">
        <button type="button" onClick={() => go(today, today)} className={preset}>
          Hari Ini
        </button>
        <label className="block">
          <span className="text-xs font-medium text-muted">Dari</span>
          <input
            type="date"
            defaultValue={from}
            max={to}
            onChange={(e) => go(e.target.value, to)}
            className={`block ${input}`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted">Sampai</span>
          <input
            type="date"
            defaultValue={to}
            min={from}
            max={today}
            onChange={(e) => go(from, e.target.value)}
            className={`block ${input}`}
          />
        </label>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted">Total lunas</p>
          <p className="font-bold text-brand">{rupiah(totalPaid)}</p>
        </div>
      </div>

      {/* Daftar */}
      {orders.length === 0 ? (
        <p className="rounded-2xl border bg-card p-8 text-center text-sm text-muted">
          Belum ada transaksi pada rentang ini.
        </p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{o.code}</span>
                  {o.status === "VOID" ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Dibatalkan
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Lunas
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {new Date(o.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                  })}{" "}
                  · {PAY_LABEL[o.paymentMethod] ?? o.paymentMethod}
                  {o.customerName ? ` · ${o.customerName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand">{rupiah(o.total)}</span>
                <Link
                  href={`/admin/pos/struk/${o.code}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40"
                >
                  <Printer className="size-4" /> Struk
                </Link>
                {o.status === "PAID" ? (
                  <button
                    onClick={() => setVoidRow(o)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Batalkan
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Konfirmasi void */}
      {voidRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl">
            <h3 className="font-semibold">Batalkan transaksi?</h3>
            <p className="mt-1 text-sm text-muted">
              <strong>{voidRow.code}</strong> ({rupiah(voidRow.total)}) akan
              dibatalkan dan stok produk dikembalikan. Tindakan ini tak bisa
              diurungkan.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setVoidRow(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Tidak
              </button>
              <button
                disabled={busy}
                onClick={() => doVoid(voidRow.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
