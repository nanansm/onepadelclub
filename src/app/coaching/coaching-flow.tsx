"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { cn, rupiah } from "@/lib/utils";
import { dateLabelId, hourLabel, rangeLabel } from "@/lib/format";
import { MAX_DURATION, MIN_DURATION, type HourSlot } from "@/lib/booking-constants";
import { ymdOffset } from "@/lib/tz";
import {
  checkCoachMembershipAction,
  createCoachingAction,
  getCoachAvailabilityAction,
} from "./actions";

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

type CoachOption = {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  ratePerHour: number;
};

export function CoachingFlow({
  coaches,
  today,
  minDuration,
  maxDuration: configuredMax,
}: {
  coaches: CoachOption[];
  today: string;
  minDuration: number;
  maxDuration: number;
}) {
  const router = useRouter();
  // Batas durasi efektif sesuai setting owner, di-clamp ke batas absolut (1..6).
  const minDur = Math.max(MIN_DURATION, Math.min(minDuration, MAX_DURATION));
  const maxDur = Math.max(minDur, Math.min(configuredMax, MAX_DURATION));
  const [coachId, setCoachId] = useState(coaches[0].id);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<HourSlot[] | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(minDur);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [loading, startLoading] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [memberPlan, setMemberPlan] = useState<{
    planName: string;
    discountPercent: number;
  } | null>(null);

  const coach = coaches.find((c) => c.id === coachId)!;
  const dateOptions = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ymdOffset(today, i)),
    [today],
  );

  useEffect(() => {
    setStartHour(null);
    setDuration(minDur);
    setSlots(null);
    startLoading(async () => setSlots(await getCoachAvailabilityAction(coachId, date)));
  }, [coachId, date, minDur]);

  // Durasi maksimum = jam kosong berturut-turut, dibatasi maxDur (setting owner).
  const maxDuration = useMemo(() => {
    if (startHour === null || !slots) return minDur;
    const byHour = new Map(slots.map((s) => [s.hour, s]));
    let count = 0;
    for (let h = startHour; h < startHour + maxDur; h++) {
      if (byHour.get(h)?.available) count++;
      else break;
    }
    return Math.max(minDur, count);
  }, [startHour, slots, minDur, maxDur]);

  useEffect(() => {
    if (duration > maxDuration) setDuration(maxDuration);
    else if (duration < minDur) setDuration(minDur);
  }, [maxDuration, duration, minDur]);

  // Cek membership aktif: debounce 600ms setelah WA berhenti diketik.
  // Kalau < 10 digit -> reset badge tanpa hit server.
  useEffect(() => {
    if (waDigits(wa) < 10) {
      setMemberPlan(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await checkCoachMembershipAction(wa);
      setMemberPlan(res);
    }, 600);
    return () => clearTimeout(t);
  }, [wa]);

  const total = coach.ratePerHour * duration;
  // Diskon member (display-only; server recompute otoritatif).
  const discountPct = memberPlan?.discountPercent ?? 0;
  const hasDiscount = discountPct > 0;
  const payable = hasDiscount ? memberPrice(total, discountPct) : total;
  const saved = total - payable;
  const selectedRange = useMemo(() => {
    if (startHour === null) return new Set<number>();
    return new Set(Array.from({ length: duration }, (_, i) => startHour + i));
  }, [startHour, duration]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (startHour === null) {
      toast.error("Pilih jam latihan dulu.");
      return;
    }
    setSubmitting(true);
    const res = await createCoachingAction({
      coachId,
      date,
      startHour,
      duration,
      customerName: name,
      customerWa: wa,
      customerEmail: email,
      notes: "",
    });
    if (!res.ok) {
      setSubmitting(false);
      toast.error(res.error);
      startLoading(async () => setSlots(await getCoachAvailabilityAction(coachId, date)));
      setStartHour(null);
      return;
    }
    router.push(`/coaching/${res.code}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Pilih Pelatih</h2>
        <div className="space-y-2">
          {coaches.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCoachId(c.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                c.id === coachId
                  ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                  : "bg-card hover:border-brand/50",
              )}
            >
              {c.photoUrl ? (
                <Image
                  src={c.photoUrl}
                  alt={c.name}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-cream" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{c.name}</div>
                {c.bio ? (
                  <div className="truncate text-xs text-muted">{c.bio}</div>
                ) : null}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-brand">
                  {rupiah(c.ratePerHour)}
                </div>
                <div className="text-xs text-muted">/ jam</div>
              </div>
            </button>
          ))}
        </div>
      </section>

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
                  d === date ? "border-brand bg-brand text-brand-fg" : "bg-card hover:border-brand/50",
                )}
              >
                <span className="text-xs">{labels[dow]}</span>
                <span className="text-lg font-semibold">{day}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">
          Pilih Jam · {dateLabelId(date)}
        </h2>
        {loading || slots === null ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-border" />
            ))}
          </div>
        ) : slots.every((s) => !s.available) ? (
          <p className="rounded-xl border bg-card p-4 text-sm text-muted">
            Pelatih tidak tersedia di tanggal ini.
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
                onClick={() => setDuration((d) => Math.max(minDur, d - 1))}
                disabled={duration <= minDur}
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
            <input
              required
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <div>
              <input
                required
                inputMode="numeric"
                placeholder="08xxxxxxxxxx"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
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
              <input
                type="email"
                required
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <p className="mt-1 text-xs text-muted">
                Email · konfirmasi dikirim ke sini
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-4 py-3.5 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Memproses..." : `Booking Coaching · ${rupiah(payable)}`}
          </button>
        </section>
      )}
    </form>
  );
}
