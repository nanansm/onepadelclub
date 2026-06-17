"use client";

import { useEffect, useState } from "react";

// Countdown live untuk masa hold slot. Semua math waktu dilakukan setelah mount
// (di effect) supaya tidak ada hydration mismatch — server cuma kasih angka.
export function HoldCountdown({ expiresAtMs }: { expiresAtMs: number }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, expiresAtMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAtMs]);

  // Sebelum mount selesai (remaining null) jangan render angka — hindari mismatch.
  if (remaining === null) {
    return <span className="tabular-nums">--:--</span>;
  }

  if (remaining <= 0) {
    return (
      <span className="font-medium">
        Waktu hold habis — refresh untuk cek status
      </span>
    );
  }

  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  return (
    <span className="tabular-nums font-bold">
      {mm}:{ss}
    </span>
  );
}
