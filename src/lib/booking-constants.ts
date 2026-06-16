// Konstanta + tipe yang aman dipakai di client (tanpa import db/server).

export const MIN_DURATION = 1;
export const MAX_DURATION = 6;

// Status yang menahan slot (tidak bisa dibooking ulang).
export const BLOCKING_STATUSES = ["PENDING", "PAID"] as const;

export type HourSlot = {
  hour: number;
  available: boolean;
  reason?: "booked" | "past";
};
