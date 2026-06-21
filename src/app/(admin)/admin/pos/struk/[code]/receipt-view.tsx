"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { rupiah } from "@/lib/utils";

type Props = {
  venue: { name: string; address: string; whatsapp: string };
  order: {
    code: string;
    createdAt: string;
    customerName: string | null;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
  };
  items: { name: string; price: number; qty: number; lineTotal: number }[];
};

const PAY_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  GATEWAY: "Online",
};

export function ReceiptView({ venue, order, items }: Props) {
  const dt = new Date(order.createdAt);
  const tgl = dt.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="mx-auto max-w-sm">
      {/* CSS struk: 80mm, sembunyikan chrome admin saat cetak */}
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 4mm; }
          body { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt {
            position: absolute; left: 0; top: 0; width: 72mm;
            font-family: ui-monospace, "Courier New", monospace;
            color: #000;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Aksi (tak ikut tercetak) */}
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          href="/admin/pos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand"
        >
          <ArrowLeft className="size-4" /> Kasir
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg"
        >
          <Printer className="size-4" /> Cetak Struk
        </button>
      </div>

      {/* Struk */}
      <div
        id="receipt"
        className="rounded-xl border bg-white p-5 font-mono text-[13px] leading-relaxed text-foreground"
      >
        <div className="text-center">
          <p className="text-base font-bold uppercase">{venue.name}</p>
          {venue.address ? (
            <p className="text-[11px] text-muted">{venue.address}</p>
          ) : null}
          {venue.whatsapp ? (
            <p className="text-[11px] text-muted">WA {venue.whatsapp}</p>
          ) : null}
        </div>

        <Sep />
        <div className="flex justify-between text-[11px]">
          <span>{order.code}</span>
          <span>{tgl}</span>
        </div>
        {order.customerName ? (
          <p className="text-[11px]">Pelanggan: {order.customerName}</p>
        ) : null}
        <Sep />

        {items.map((it, i) => (
          <div key={i} className="mb-1">
            <p>{it.name}</p>
            <div className="flex justify-between">
              <span>
                {it.qty} × {rupiah(it.price)}
              </span>
              <span>{rupiah(it.lineTotal)}</span>
            </div>
          </div>
        ))}

        <Sep />
        <Line label="Subtotal" value={rupiah(order.subtotal)} />
        {order.discount > 0 ? (
          <Line label="Diskon" value={`- ${rupiah(order.discount)}`} />
        ) : null}
        {order.tax > 0 ? <Line label="Pajak" value={rupiah(order.tax)} /> : null}
        <div className="mt-1 flex justify-between text-sm font-bold">
          <span>TOTAL</span>
          <span>{rupiah(order.total)}</span>
        </div>
        <Line
          label="Bayar"
          value={PAY_LABEL[order.paymentMethod] ?? order.paymentMethod}
        />

        <Sep />
        <p className="text-center text-[11px]">
          Terima kasih 🎾<br />
          Sampai ketemu lagi!
        </p>
      </div>
    </div>
  );
}

function Sep() {
  return <div className="my-2 border-t border-dashed border-foreground/30" />;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
