import { StatusBadge } from "@/components/status-badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getUpcomingBookings } from "@/lib/booking";
import { expireStaleBookings } from "@/lib/expire";
import { getCourts } from "@/lib/venue";
import { dateLabelId, rangeLabel } from "@/lib/format";
import { rupiah } from "@/lib/utils";
import { todayJakarta } from "@/lib/tz";
import { BookingActions } from "./booking-actions";
import { WalkInForm } from "./walk-in-form";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  // Rapikan PENDING basi -> CANCELLED dulu supaya daftar di bawah jujur
  // (PENDING = beneran nunggu bayar). Tanpa cron.
  await expireStaleBookings();
  const [rows, courts] = await Promise.all([
    getUpcomingBookings(),
    getCourts(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Booking"
        accent="Lapangan"
        sub={`${rows.length} booking mendatang. Konfirmasi setelah pembayaran masuk.`}
      />

      <details className="mt-6 rounded-2xl border bg-card p-4 [&_summary]:cursor-pointer">
        <summary className="select-none font-semibold">
          Booking Kasir / Walk-in
          <span className="ml-2 text-sm font-normal text-muted">
            Input booking telepon / datang langsung
          </span>
        </summary>
        <div className="mt-4 border-t pt-4">
          <WalkInForm
            courts={courts.map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              pricePerHour: c.pricePerHour,
            }))}
            today={todayJakarta()}
          />
        </div>
      </details>

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
                  {booking.source === "kasir" && (
                    <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">
                      Kasir
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {dateLabelId(booking.date)} · {rangeLabel(booking.startHour, booking.duration)}
                </p>
                <p className="mt-1 text-sm">
                  {booking.customerName}
                  {booking.customerWa ? ` · ${booking.customerWa}` : ""} ·{" "}
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
