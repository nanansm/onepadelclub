"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Row = {
  teamId: string;
  teamName: string;
  color: string;
  main: number;
  menang: number;
  kalah: number;
  wo: number;
  gameMenang: number;
  gameKalah: number;
  selisih: number;
  poin: number;
};
type Cat = {
  id: string;
  name: string;
  liga1: Row[];
  liga2: Row[];
};

export function KlasemenView({ categories }: { categories: Cat[] }) {
  const [catId, setCatId] = useState(categories[0]?.id ?? "");
  const [jenjang, setJenjang] = useState<1 | 2>(1);
  const cat = categories.find((c) => c.id === catId);
  const rows = jenjang === 1 ? cat?.liga1 ?? [] : cat?.liga2 ?? [];

  return (
    <div>
      {/* tab kategori */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatId(c.id)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
              c.id === catId
                ? "border-brand bg-brand text-brand-fg"
                : "bg-card hover:border-brand/50",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* toggle liga */}
      <div className="mt-4 inline-flex rounded-full border bg-card p-1">
        {[1, 2].map((j) => (
          <button
            key={j}
            onClick={() => setJenjang(j as 1 | 2)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              jenjang === j ? "bg-brand text-brand-fg" : "text-muted",
            )}
          >
            Liga {j}
          </button>
        ))}
      </div>

      {/* tabel */}
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-muted">
            Liga {jenjang} belum dimulai.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-3">#</th>
                <th className="py-3">Tim</th>
                <th className="px-2 py-3 text-center">Main</th>
                <th className="px-2 py-3 text-center">M</th>
                <th className="px-2 py-3 text-center">K</th>
                <th className="px-2 py-3 text-center">GM</th>
                <th className="px-2 py-3 text-center">GK</th>
                <th className="px-2 py-3 text-center">+/-</th>
                <th className="px-3 py-3 text-center font-bold text-brand">Poin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const rank = i + 1;
                // Zona promosi/degradasi hanya untuk liga ukuran penuh (>=4 tim).
                const fullLeague = rows.length >= 4;
                const promote = fullLeague && jenjang === 2 && rank <= 2;
                const relegate = fullLeague && jenjang === 1 && rank >= rows.length - 1;
                return (
                  <tr
                    key={r.teamId}
                    className={cn(
                      "border-b last:border-0",
                      promote && "bg-emerald-50",
                      relegate && "bg-red-50",
                    )}
                  >
                    <td className="px-3 py-3 text-muted">{rank}</td>
                    <td className="py-3">
                      <Link
                        href={`/liga/tim/${r.teamId}`}
                        className="flex items-center gap-2 font-medium hover:text-brand"
                      >
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{ background: r.color }}
                        />
                        {r.teamName}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-center">{r.main}</td>
                    <td className="px-2 py-3 text-center">{r.menang}</td>
                    <td className="px-2 py-3 text-center">{r.kalah}</td>
                    <td className="px-2 py-3 text-center">{r.gameMenang}</td>
                    <td className="px-2 py-3 text-center">{r.gameKalah}</td>
                    <td className="px-2 py-3 text-center">
                      {r.selisih > 0 ? `+${r.selisih}` : r.selisih}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-brand">
                      {r.poin}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-muted">
        Hijau = zona promosi (Liga 2) · Merah = zona degradasi (Liga 1). Tiebreaker:
        poin, selisih game, game menang, WO paling sedikit.
      </p>
    </div>
  );
}
