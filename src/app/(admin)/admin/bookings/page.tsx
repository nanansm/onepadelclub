import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { getUpcomingBookings } from "@/lib/booking";
import { dateLabelId, rangeLabel } from "@/lib/format";
import { rupiah } from "@/lib/utils";
import { BookingActions } from "./booking-actions";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const rows = await getUpcomingBookings();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Booking Lapangan</h1>
        <Link href="/admin" className="text-sm text-accent">
          Dashboard
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        {rows.length} booking mendatang. Konfirmasi setelah pembayaran masuk.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card p-8 text-center text-muted">
          Belum ada booking.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map(({ booking, court }) => (
            <li
              key={booking.id}
              className="rounded-2xl border bg-card p-4 sm:flex sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{court.name}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {dateLabelId(booking.date)} · {rangeLabel(booking.startHour, booking.duration)}
                </p>
                <p className="mt-1 text-sm">
                  {booking.customerName} · {booking.customerWa} ·{" "}
                  <span className="font-medium text-brand">
                    {rupiah(booking.totalPrice)}
                  </span>{" "}
                  · <span className="text-muted">{booking.code}</span>
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <BookingActions id={booking.id} status={booking.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
