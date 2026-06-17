"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, rupiah } from "@/lib/utils";
import { dateLabelId, hourLabel, rangeLabel } from "@/lib/format";
import { MAX_DURATION, MIN_DURATION, type HourSlot } from "@/lib/booking-constants";
import { ymdOffset } from "@/lib/tz";
import {
  createWalkInBookingAction,
  getAdminAvailabilityAction,
} from "./actions";

type CourtOption = {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  pricePerHour: number;
};

type Status = "PAID" | "PENDING";

const inputClass =
  "w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function WalkInForm({
  courts,
  today,
}: {
  courts: CourtOption[];
  today: string;
}) {
  const router = useRouter();
  const [courtId, setCourtId] = useState(courts[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<HourSlot[] | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(MIN_DURATION);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("PAID");
  const [loadingSlots, startLoading] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const court = courts.find((c) => c.id === courtId) ?? courts[0];
  const maxDate = useMemo(() => ymdOffset(today, 13), [today]);

  function loadSlots(cid: string, d: string) {
    setSlots(null);
    startLoading(async () => {
      setSlots(await getAdminAvailabilityAction(cid, d));
    });
  }

  // Muat ulang ketersediaan saat court/tanggal berubah.
  useEffect(() => {
    setStartHour(null);
    setDuration(MIN_DURATION);
    setSlots(null);
    startLoading(async () => {
      setSlots(await getAdminAvailabilityAction(courtId, date));
    });
  }, [courtId, date]);

  // Durasi maksimum = jumlah jam kosong berturut-turut dari startHour (maks 6).
  const maxDuration = useMemo(() => {
    if (startHour === null || !slots) return MIN_DURATION;
    const byHour = new Map(slots.map((s) => [s.hour, s]));
    let count = 0;
    for (let h = startHour; h < startHour + MAX_DURATION; h++) {
      const slot = byHour.get(h);
      if (slot?.available) count++;
      else break;
    }
    return Math.max(MIN_DURATION, count);
  }, [startHour, slots]);

  useEffect(() => {
    if (duration > maxDuration) setDuration(maxDuration);
  }, [maxDuration, duration]);

  const total = (court?.pricePerHour ?? 0) * duration;
  const selectedRange = useMemo(() => {
    if (startHour === null) return new Set<number>();
    return new Set(Array.from({ length: duration }, (_, i) => startHour + i));
  }, [startHour, duration]);

  function resetForm() {
    setStartHour(null);
    setDuration(MIN_DURATION);
    setName("");
    setWa("");
    setNotes("");
    setStatus("PAID");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (startHour === null) {
      toast.error("Pilih jam main dulu.");
      return;
    }
    setSubmitting(true);
    const res = await createWalkInBookingAction({
      courtId,
      date,
      startHour,
      duration,
      customerName: name,
      customerWa: wa,
      notes,
      status,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      // Slot mungkin keburu diambil booking lain -> refresh ketersediaan.
      setStartHour(null);
      loadSlots(courtId, date);
      return;
    }
    toast.success("Booking kasir dibuat");
    resetForm();
    loadSlots(courtId, date);
    router.refresh();
  }

  if (courts.length === 0) {
    return (
      <p className="rounded-xl border bg-card p-4 text-sm text-muted">
        Belum ada lapangan aktif. Tambah lapangan dulu di menu Lapangan.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Pilih lapangan */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-muted">Lapangan</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {courts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCourtId(c.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                c.id === courtId
                  ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                  : "bg-card hover:border-brand/50",
              )}
            >
              <span className="block font-medium">{c.name}</span>
              <span className="block text-xs text-muted">
                {c.type === "INDOOR" ? "Indoor" : "Outdoor"}
              </span>
              <span className="mt-1 block text-sm font-semibold text-brand">
                {rupiah(c.pricePerHour)}
                <span className="text-xs font-normal text-muted">/jam</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Pilih tanggal */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-muted">Tanggal</h3>
        <input
          type="date"
          value={date}
          min={today}
          max={maxDate}
          onChange={(e) => setDate(e.target.value || today)}
          className={cn(inputClass, "max-w-xs")}
        />
      </section>

      {/* Pilih jam */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-muted">
          Jam · {dateLabelId(date)}
        </h3>
        {loadingSlots || slots === null ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-border" />
            ))}
          </div>
        ) : slots.every((s) => !s.available) ? (
          <p className="rounded-xl border bg-card p-4 text-sm text-muted">
            Tidak ada slot kosong di tanggal ini.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => {
              const selected = selectedRange.has(s.hour);
              return (
                <button
                  key={s.hour}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setStartHour(s.hour)}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-medium transition",
                    selected && "border-brand bg-brand text-brand-fg",
                    !selected && s.available && "bg-card hover:border-brand",
                    !s.available &&
                      "cursor-not-allowed border-transparent bg-border/60 text-muted line-through",
                  )}
                >
                  {hourLabel(s.hour)}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Durasi + data customer + status (muncul setelah jam dipilih) */}
      {startHour !== null && (
        <section className="space-y-5 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-semibold text-muted">Durasi</span>
              <span className="text-sm">{rangeLabel(startHour, duration)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDuration((d) => Math.max(MIN_DURATION, d - 1))}
                disabled={duration <= MIN_DURATION}
                className="h-9 w-9 rounded-lg border text-lg disabled:opacity-40"
                aria-label="Kurangi durasi"
              >
                -
              </button>
              <span className="w-16 text-center font-semibold">{duration} jam</span>
              <button
                type="button"
                onClick={() => setDuration((d) => Math.min(maxDuration, d + 1))}
                disabled={duration >= maxDuration}
                className="h-9 w-9 rounded-lg border text-lg disabled:opacity-40"
                aria-label="Tambah durasi"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-bold text-brand">{rupiah(total)}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="wi-name" className="mb-1 block text-sm font-medium">
                Nama
              </label>
              <input
                id="wi-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Nama customer"
              />
            </div>
            <div>
              <label htmlFor="wi-wa" className="mb-1 block text-sm font-medium">
                Nomor WhatsApp <span className="text-muted">(opsional)</span>
              </label>
              <input
                id="wi-wa"
                inputMode="numeric"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                className={inputClass}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label htmlFor="wi-notes" className="mb-1 block text-sm font-medium">
                Catatan <span className="text-muted">(opsional)</span>
              </label>
              <input
                id="wi-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
                placeholder="Mis. bayar cash, sewa raket"
              />
            </div>
          </div>

          {/* Status pembayaran */}
          <div>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStatus("PAID")}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  status === "PAID"
                    ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                    : "bg-card hover:border-brand/50",
                )}
              >
                <span className="block text-sm font-semibold">
                  Langsung LUNAS
                </span>
                <span className="block text-xs text-muted">Cash diterima</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus("PENDING")}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  status === "PENDING"
                    ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                    : "bg-card hover:border-accent/50",
                )}
              >
                <span className="block text-sm font-semibold">Hold dulu</span>
                <span className="block text-xs text-muted">Bayar nyusul</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-4 py-3.5 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting
              ? "Memproses..."
              : `Buat Booking · ${rupiah(total)}`}
          </button>
        </section>
      )}
    </form>
  );
}
