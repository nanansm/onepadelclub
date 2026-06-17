"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CekForm({ defaultWa }: { defaultWa?: string }) {
  const router = useRouter();
  const [wa, setWa] = useState(defaultWa ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = wa.trim();
    if (!trimmed) return;
    router.push(`/cek?wa=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="tel"
        inputMode="numeric"
        value={wa}
        onChange={(e) => setWa(e.target.value)}
        placeholder="08xxxxxxxxxx"
        className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      <button
        type="submit"
        className="w-full rounded-full bg-accent px-4 py-3.5 text-center font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        Cari Booking
      </button>
    </form>
  );
}
