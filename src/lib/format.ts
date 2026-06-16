const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// Jam 7 -> "07.00"
export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}.00`;
}

// "07.00 - 09.00"
export function rangeLabel(startHour: number, duration: number): string {
  return `${hourLabel(startHour)} - ${hourLabel(startHour + duration)}`;
}

// "2025-06-16" -> "Senin, 16 Jun 2025". Parse manual (hindari pergeseran TZ).
export function dateLabelId(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS_ID[dow]}, ${d} ${MONTHS_ID[m - 1]} ${y}`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Lunas / Terkonfirmasi",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}
