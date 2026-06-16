"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MatchCard, type MatchView } from "@/components/match-card";

type Cat = { id: string; name: string; matches: MatchView[] };

export function JadwalView({ categories }: { categories: Cat[] }) {
  const [catId, setCatId] = useState(categories[0]?.id ?? "");
  const [tab, setTab] = useState<"upcoming" | "results">("upcoming");
  const cat = categories.find((c) => c.id === catId);

  const upcoming = (cat?.matches ?? []).filter(
    (m) => m.status === "SCHEDULED" || m.status === "LIVE",
  );
  const results = (cat?.matches ?? []).filter(
    (m) => m.status === "DONE" || m.status === "WO",
  );
  const list = tab === "upcoming" ? upcoming : results;

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatId(c.id)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
              c.id === catId ? "border-brand bg-brand text-brand-fg" : "bg-card hover:border-brand/50",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-4 inline-flex rounded-full border bg-card p-1">
        <button
          onClick={() => setTab("upcoming")}
          className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", tab === "upcoming" ? "bg-brand text-brand-fg" : "text-muted")}
        >
          Akan Datang ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("results")}
          className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", tab === "results" ? "bg-brand text-brand-fg" : "text-muted")}
        >
          Hasil ({results.length})
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-muted">
            Belum ada match.
          </p>
        ) : (
          list.map((m) => <MatchCard key={m.id} m={m} />)
        )}
      </div>
    </div>
  );
}
