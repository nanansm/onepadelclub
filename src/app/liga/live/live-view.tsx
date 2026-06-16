"use client";

import { useEffect, useState } from "react";
import { MatchCard, type MatchView } from "@/components/match-card";
import { getLiveAction } from "./actions";

export function LiveView({ initial }: { initial: MatchView[] }) {
  const [matches, setMatches] = useState(initial);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        setMatches(await getLiveAction());
        setTick((t) => t + 1);
      } catch {
        // diam — polling lanjut
      }
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
        Live · auto-refresh 15 detik
        <span className="sr-only" aria-live="polite">
          {tick}
        </span>
      </div>
      {matches.length === 0 ? (
        <p className="rounded-2xl border bg-card p-8 text-center text-muted">
          Tidak ada match yang sedang berlangsung.
        </p>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.id}>
              {m.catName ? (
                <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-accent">
                  {m.catName}
                </p>
              ) : null}
              <MatchCard m={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
