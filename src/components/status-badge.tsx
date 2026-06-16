import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";
import type { BookingStatus } from "@/db/schema";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        STYLES[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
