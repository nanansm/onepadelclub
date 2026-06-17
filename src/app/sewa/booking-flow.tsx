"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, rupiah } from "@/lib/utils";
import { dateLabelId, hourLabel, rangeLabel } from "@/lib/format";
import { MAX_DURATION, MIN_DURATION, type HourSlot } from "@/lib/booking-constants";
import { ymdOffset } from "@/lib/tz";
import {
  checkMembershipAction,
  createBookingAction,
  getAvailabilityAction,
} from "./actions";
import { AvailabilityGrid } from "./availability-grid";

// Harga setelah diskon member — HARUS sama persis dengan perhitungan server:
// bulatkan ke bawah ke kelipatan 100.
function memberPrice(base: number, pct: number): number {
  return Math.floor((base * (1 - pct / 100)) / 100) * 100;
}

// Normalisasi ringan WA di client (cuma untuk cek "≥10 digit", logika kanonik
// tetap di server lewat normalizeWa). 0/62/8 -> hitung jadi format 62.
function waDigits(input: string): number {
  let d = input.replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d.length;
}

type CourtOption = {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  surface: string | null;
  pricePerHour: number;
};

export function BookingFlow({
  courts,
  today,
  minDuration,
  maxDuration: configuredMax,
}: {
  courts: CourtOption[];
  today: string;
  minDuration: number;
  maxDuration: number;
}) {
  const router = useRouter();
  // Batas durasi efektif sesuai setting owner, di-clamp ke batas absolut (1..6).
  const minDur = Math.max(MIN_DURATION, Math.min(minDuration, MAX_DURATION));
  const maxDur = Math.max(minDur, Math.min(configuredMax, MAX_DURATION));
  const [courtId, setCourtId] = useState(courts[0].id);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<HourSlot[] | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(minDur);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingSlots, startLoading] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [memberPlan, setMemberPlan] = useState<{
    planName: string;
    discountPercent: number;
  } | null>(null);
  const [view, setView] = useState<"court" | "hour">("court");

  // Ref ke section durasi/form supaya bisa di-scroll ke view setelah pilih dari grid.
  const detailRef = useRef<HTMLDivElement | null>(null);

  // Ref ke startHour terpilih supaya polling (interval yang dibuat sekali per
  // court/date) bisa baca nilai terbaru tanpa harus re-create interval.
  const startHourRef = useRef<number | null>(null);
  startHourRef.current = startHour;

  // Jam yang dipilih lewat grid "Per Jam" — diterapkan setelah slot court baru
  // dimuat (karena ganti court me-reset startHour). null = tak ada pending.
  const pendingHourRef = useRef<number | null>(null);

  const court = courts.find((c) => c.id === courtId)!;
  const dateOptions = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ymdOffset(today, i)),
    [today],
  );

  // Muat ulang ketersediaan saat court/tanggal berubah. Kalau ada jam pending
  // dari grid "Per Jam", terapkan setelah slot dimuat (kalau masih available).
  useEffect(() => {
    setStartHour(null);
    setDuration(minDur);
    setSlots(null);
    startLoading(async () => {
      const next = await getAvailabilityAction(courtId, date);
      setSlots(next);
      const pending = pendingHourRef.current;
      pendingHourRef.current = null;
      if (pending !== null && next.find((s) => s.hour === pending)?.available) {
        setStartHour(pending);
      }
    });
  }, [courtId, date, minDur]);

  // Polling ketersediaan tiap 15s (konvensi proyek) supaya slot yang barusan
  // diambil orang lain / kasir langsung ke-grey-out tanpa refresh manual.
  // Interval dibuat sekali per court/date; selection user tak diganggu kecuali
  // jam pilihannya jadi tidak available -> di-clear + toast.
  useEffect(() => {
    const id = setInterval(async () => {
      const next = await getAvailabilityAction(courtId, date);
      setSlots(next);
      const chosen = startHourRef.current;
      if (chosen !== null) {
        const slot = next.find((s) => s.hour === chosen);
        if (slot && !slot.available) {
          setStartHour(null);
          toast.error("Slot barusan diambil, pilih lain");
        }
      }
    }, 15_000);
    return () => clearInterval(id);
  }, [courtId, date]);

  // Cek membership aktif: debounce 600ms setelah WA berhenti diketik.
  // Kalau < 10 digit -> reset badge tanpa hit server.
  useEffect(() => {
    if (waDigits(wa) < 10) {
      setMemberPlan(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await checkMembershipAction(wa);
      setMemberPlan(res);
    }, 600);
    return () => clearTimeout(t);
  }, [wa]);

  // Durasi maksimum = jumlah jam kosong berturut-turut dari startHour,
  // dibatasi maxDur (setting owner, sudah di-clamp ke batas absolut).
  const maxDuration = useMemo(() => {
    if (startHour === null || !slots) return minDur;
    const byHour = new Map(slots.map((s) => [s.hour, s]));
    let count = 0;
    for (let h = startHour; h < startHour + maxDur; h++) {
      const slot = byHour.get(h);
      if (slot?.available) count++;
      else break;
    }
    return Math.max(minDur, count);
  }, [startHour, slots, minDur, maxDur]);

  useEffect(() => {
    if (duration > maxDuration) setDuration(maxDuration);
    else if (duration < minDur) setDuration(minDur);
  }, [maxDuration, duration, minDur]);

  const total = court.pricePerHour * duration;
  // Diskon member (display-only; server recompute otoritatif).
  const discountPct = memberPlan?.discountPercent ?? 0;
  const hasDiscount = discountPct > 0;
  const payable = hasDiscount ? memberPrice(total, discountPct) : total;
  const saved = total - payable;
  const selectedRange = useMemo(() => {
    if (startHour === null) return new Set<number>();
    return new Set(
      Array.from({ length: duration }, (_, i) => startHour + i),
    );
  }, [startHour, duration]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (startHour === null) {
      toast.error("Pilih jam main dulu.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email wajib diisi buat terima konfirmasi.");
      return;
    }
    setSubmitting(true);
    const result = await createBookingAction({
      courtId,
      date,
      startHour,
      duration,
      customerName: name,
      customerWa: wa,
      customerEmail: email,
      notes,
    });
    if (!result.ok) {
      setSubmitting(false);
      toast.error(result.error);
      // Slot mungkin keburu diambil orang lain -> refresh ketersediaan.
      startLoading(async () => setSlots(await getAvailabilityAction(courtId, date)));
      setStartHour(null);
      return;
    }
    router.push(`/booking/${result.code}`);
  }

  // Dari grid "Per Jam": set lapangan + jam, balik ke view "Per Lapangan",
  // lalu scroll ke section durasi/form buat penyelesaian.
  function onPickFromGrid(pickedCourtId: string, pickedHour: number) {
    setView("court");
    if (pickedCourtId === courtId) {
      // Court sama: slot sudah dimuat, set jam langsung.
      setStartHour(pickedHour);
    } else {
      // Ganti court me-reset startHour via effect; titip jam ke pending ref
      // supaya diterapkan setelah slot court baru selesai dimuat.
      pendingHourRef.current = pickedHour;
      setCourtId(pickedCourtId);
    }
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Toggle view: Per Lapangan (default) vs Per Jam */}
      <div className="inline-flex rounded-full border bg-card p-1">
        <button
          type="button"
          onClick={() => setView("court")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            view === "court"
              ? "bg-brand text-brand-fg"
              : "text-muted hover:text-brand",
          )}
        >
          Per Lapangan
        </button>
        <button
          type="button"
          onClick={() => setView("hour")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            view === "hour"
              ? "bg-brand text-brand-fg"
              : "text-muted hover:text-brand",
          )}
        >
          Per Jam
        </button>
      </div>

      {/* Pilih tanggal — dipakai di kedua view */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Pilih Tanggal</h2>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {dateOptions.map((d) => {
            const [y, m, day] = d.split("-").map(Number);
            const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
            const labels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDate(d)}
                className={cn(
                  "flex min-w-14 flex-col items-center rounded-xl border px-3 py-2 transition",
                  d === date
                    ? "border-brand bg-brand text-brand-fg"
                    : "bg-card hover:border-brand/50",
                )}
              >
                <span className="text-xs">{labels[dow]}</span>
                <span className="text-lg font-semibold">{day}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* View "Per Jam": grid jam × lapangan */}
      {view === "hour" && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">
            Cari per Jam · {dateLabelId(date)}
          </h2>
          <p className="mb-3 text-xs text-muted">
            Ketuk sel kosong untuk pilih lapangan + jam, lalu lengkapi durasi
            &amp; data di bawah.
          </p>
          <AvailabilityGrid date={date} onPick={onPickFromGrid} />
        </section>
      )}

      {/* Pilih lapangan — hanya view "Per Lapangan" */}
      {view === "court" && (
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Pilih Lapangan</h2>
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
                Padel · {c.type === "INDOOR" ? "Indoor" : "Outdoor"}
              </span>
              {c.surface ? (
                <span className="block text-[11px] text-muted">{c.surface}</span>
              ) : null}
              <span className="mt-1 block text-sm font-semibold text-brand">
                {rupiah(c.pricePerHour)}
                <span className="text-xs font-normal text-muted">/jam</span>
              </span>
            </button>
          ))}
        </div>
      </section>
      )}

      {/* Pilih jam — hanya view "Per Lapangan" */}
      {view === "court" && (
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">
          Pilih Jam · {dateLabelId(date)}
        </h2>
        {loadingSlots || slots === null ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-border" />
            ))}
          </div>
        ) : slots.every((s) => !s.available) ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted">
            <p className="font-medium text-brand">
              Tidak ada slot kosong di tanggal ini.
            </p>
            <p className="mt-1">Coba tanggal lain di atas, atau lapangan lain.</p>
          </div>
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
      )}

      {/* Durasi + ringkasan + form (muncul setelah jam dipilih, view Per Lapangan) */}
      {view === "court" && startHour !== null && (
        <section
          ref={detailRef}
          className="space-y-5 rounded-2xl border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-semibold text-muted">
                Durasi
              </span>
              <span className="text-sm">{rangeLabel(startHour, duration)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDuration((d) => Math.max(minDur, d - 1))}
                disabled={duration <= minDur}
                className="h-9 w-9 rounded-lg border text-lg disabled:opacity-40"
                aria-label="Kurangi durasi"
              >
                -
              </button>
              <span className="w-16 text-center font-semibold">
                {duration} jam
              </span>
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

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              {hasDiscount ? (
                <span className="flex items-baseline gap-2">
                  <span className="text-sm text-muted line-through">
                    {rupiah(total)}
                  </span>
                  <span className="text-xl font-bold text-brand">
                    {rupiah(payable)}
                  </span>
                </span>
              ) : (
                <span className="text-xl font-bold text-brand">
                  {rupiah(total)}
                </span>
              )}
            </div>
            {hasDiscount && memberPlan ? (
              <p className="mt-1 text-right text-xs font-medium text-accent">
                Member {memberPlan.planName}: hemat {rupiah(saved)} (
                {discountPct}%)
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Nama
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label htmlFor="wa" className="mb-1 block text-sm font-medium">
                Nomor WhatsApp
              </label>
              <input
                id="wa"
                required
                inputMode="numeric"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="08xxxxxxxxxx"
              />
              {memberPlan ? (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                  {hasDiscount
                    ? `✓ Member ${memberPlan.planName} · diskon ${discountPct}%`
                    : `✓ Member aktif: ${memberPlan.planName}`}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="email@contoh.com"
              />
              <p className="mt-1 text-xs text-muted">
                konfirmasi booking dikirim ke email ini
              </p>
            </div>
            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                Catatan <span className="text-muted">(opsional)</span>
              </label>
              <input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Mis. butuh sewa raket"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-4 py-3.5 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting
              ? "Memproses..."
              : `Booking Sekarang · ${rupiah(payable)}`}
          </button>
          <p className="text-center text-xs text-muted">
            Pembayaran manual (transfer/QRIS). Slot dikunci setelah admin
            konfirmasi.
          </p>
        </section>
      )}
    </form>
  );
}
