"use client";

import { useEffect, useState, useTransition } from "react";
import { hourLabel } from "@/lib/format";
import { getGridAvailabilityAction, type CourtAvailability } from "./actions";

// Grid ketersediaan jam × lapangan untuk view "Per Jam".
// Self-fetch by date; klik sel kosong -> onPick(courtId, hour) ke flow utama.
export function AvailabilityGrid({
  date,
  onPick,
}: {
  date: string;
  onPick: (courtId: string, hour: number) => void;
}) {
  const [grid, setGrid] = useState<CourtAvailability[] | null>(null);
  const [loading, startLoading] = useTransition();

  // Muat ulang saat tanggal berubah (+ initial).
  useEffect(() => {
    setGrid(null);
    startLoading(async () => {
      setGrid(await getGridAvailabilityAction(date));
    });
  }, [date]);

  if (loading || grid === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-border" />
        ))}
        <p className="pt-1 text-center text-xs text-muted">Memuat…</p>
      </div>
    );
  }

  if (grid.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 text-sm text-muted">
        Tidak ada lapangan aktif.
      </div>
    );
  }

  // Union semua jam (tiap lapangan punya rentang jam yang sama secara umum,
  // tapi kita pakai union supaya aman).
  const hours = Array.from(
    new Set(grid.flatMap((c) => c.slots.map((s) => s.hour))),
  ).sort((a, b) => a - b);

  // Lookup cepat: courtId -> (hour -> slot).
  const byCourt = new Map(
    grid.map((c) => [c.courtId, new Map(c.slots.map((s) => [s.hour, s]))]),
  );

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background px-2 py-1 text-left text-xs font-semibold text-muted">
              Jam
            </th>
            {grid.map((c) => (
              <th
                key={c.courtId}
                className="min-w-20 px-2 py-1 text-center text-xs font-semibold text-muted"
              >
                {c.courtName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="sticky left-0 z-10 bg-background px-2 py-1 text-xs font-medium text-muted whitespace-nowrap">
                {hourLabel(hour)}
              </td>
              {grid.map((c) => {
                const slot = byCourt.get(c.courtId)?.get(hour);
                const available = slot?.available ?? false;
                return (
                  <td key={c.courtId} className="p-0">
                    {available ? (
                      <button
                        type="button"
                        onClick={() => onPick(c.courtId, hour)}
                        className="flex h-10 w-full min-w-20 items-center justify-center rounded-lg border bg-card text-brand transition hover:border-brand hover:bg-brand/5"
                        aria-label={`Pilih ${c.courtName} jam ${hourLabel(hour)}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-brand/60" />
                      </button>
                    ) : (
                      <div className="flex h-10 w-full min-w-20 items-center justify-center rounded-lg border border-transparent bg-border/60 text-muted">
                        —
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
