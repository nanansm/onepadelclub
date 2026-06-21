"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

type Csv = {
  rows: { label: string; count: number; revenue: number }[];
  total: number;
};

export function ReportControls({
  from,
  to,
  today,
  monthStart,
  csv,
}: {
  from: string;
  to: string;
  today: string;
  monthStart: string;
  csv: Csv;
}) {
  const router = useRouter();
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);

  function go(nf: string, nt: string) {
    router.push(`/admin/laporan?from=${nf}&to=${nt}`);
  }

  // Hitung rentang preset dari string today (YYYY-MM-DD), tanpa lib.
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  const todayDate = new Date(`${today}T00:00:00`);
  const days7Start = ymd(
    new Date(todayDate.getTime() - 6 * 24 * 60 * 60 * 1000),
  );
  const prevMonthEnd = new Date(`${monthStart}T00:00:00`);
  prevMonthEnd.setDate(0); // hari terakhir bulan lalu
  const prevMonthStart = new Date(prevMonthEnd);
  prevMonthStart.setDate(1);
  const lastMonthFrom = ymd(prevMonthStart);
  const lastMonthTo = ymd(prevMonthEnd);

  const isToday = from === today && to === today;
  const isMonth = from === monthStart && to === today;
  const is7 = from === days7Start && to === today;
  const isLastMonth = from === lastMonthFrom && to === lastMonthTo;

  function exportCsv() {
    const lines = [
      ["Sumber", "Transaksi", "Pemasukan"],
      ...csv.rows.map((r) => [r.label, String(r.count), String(r.revenue)]),
      ["Total", "", String(csv.total)],
    ];
    const content = lines
      .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${from}_sd_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const presetBtn =
    "rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-cream/40";
  const presetActive = "border-brand bg-brand/10 text-brand";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => go(today, today)}
          className={`${presetBtn} ${isToday ? presetActive : ""}`}
        >
          Hari Ini
        </button>
        <button
          type="button"
          onClick={() => go(days7Start, today)}
          className={`${presetBtn} ${is7 ? presetActive : ""}`}
        >
          7 Hari
        </button>
        <button
          type="button"
          onClick={() => go(monthStart, today)}
          className={`${presetBtn} ${isMonth ? presetActive : ""}`}
        >
          Bulan Ini
        </button>
        <button
          type="button"
          onClick={() => go(lastMonthFrom, lastMonthTo)}
          className={`${presetBtn} ${isLastMonth ? presetActive : ""}`}
        >
          Bulan Lalu
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="text-xs font-medium text-muted">Dari</span>
          <input
            type="date"
            value={f}
            max={t}
            onChange={(e) => setF(e.target.value)}
            className="block rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted">Sampai</span>
          <input
            type="date"
            value={t}
            min={f}
            max={today}
            onChange={(e) => setT(e.target.value)}
            className="block rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
        <button type="button" onClick={() => go(f, t)} className={presetBtn}>
          Terapkan
        </button>
      </div>

      <button
        type="button"
        onClick={exportCsv}
        className="ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
      >
        <Download className="size-4" /> Export CSV
      </button>
    </div>
  );
}
