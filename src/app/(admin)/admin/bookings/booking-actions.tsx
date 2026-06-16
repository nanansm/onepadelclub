"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmBookingAction, cancelBookingAction } from "./actions";

export function BookingActions({
  id,
  status,
}: {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Gagal");
      return;
    }
    toast.success(ok);
    router.refresh();
  }

  if (status === "CANCELLED" || status === "COMPLETED") return null;

  return (
    <div className="flex gap-2">
      {status === "PENDING" && (
        <button
          disabled={busy}
          onClick={() =>
            run(() => confirmBookingAction(id), "Pembayaran dikonfirmasi")
          }
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg transition hover:opacity-90 disabled:opacity-50"
        >
          Konfirmasi
        </button>
      )}
      <button
        disabled={busy}
        onClick={() => {
          if (confirm("Batalkan booking ini?")) {
            run(() => cancelBookingAction(id), "Booking dibatalkan");
          }
        }}
        className="rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        Batalkan
      </button>
    </div>
  );
}
