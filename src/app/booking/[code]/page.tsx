import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { getBookingByCode } from "@/lib/booking";
import { getVenue } from "@/lib/venue";
import { getSettings } from "@/lib/settings";
import { dateLabelId, rangeLabel } from "@/lib/format";
import { rupiah } from "@/lib/utils";
import { HoldCountdown } from "./hold-countdown";

function timeLabelWib(ms: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export const dynamic = "force-dynamic";

export default async function BookingInvoicePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [row, venue, settings] = await Promise.all([
    getBookingByCode(code),
    getVenue(),
    getSettings(),
  ]);
  if (!row) notFound();

  const { booking, court } = row;
  const showPayment = booking.status === "PENDING";
  // Hold = createdAt + holdMinutes. Dikirim ke client sebagai angka epoch ms,
  // semua math waktu (countdown) dilakukan client-side -> tanpa hydration mismatch.
  const expiresAtMs =
    booking.createdAt.getTime() + settings.holdMinutes * 60_000;
  const expiresLabel = timeLabelWib(expiresAtMs);
  const waText = encodeURIComponent(
    `Halo admin, saya sudah booking ${court.name} (${code}) tanggal ${dateLabelId(booking.date)} jam ${rangeLabel(booking.startHour, booking.duration)}.`,
  );
  const waLink = venue?.whatsapp
    ? `https://wa.me/${venue.whatsapp}?text=${waText}`
    : null;

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Detail Booking" />
      <main className="mx-auto max-w-md px-5 py-6">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="bg-brand px-5 py-5 text-brand-fg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cream">Kode Booking</span>
              <StatusBadge status={booking.status} />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-wide">{booking.code}</p>
          </div>

          <dl className="divide-y px-5">
            <Row label="Lapangan" value={`${court.name} · ${court.type === "INDOOR" ? "Indoor" : "Outdoor"}`} />
            <Row label="Tanggal" value={dateLabelId(booking.date)} />
            <Row label="Jam" value={rangeLabel(booking.startHour, booking.duration)} />
            <Row label="Durasi" value={`${booking.duration} jam`} />
            <Row label="Nama" value={booking.customerName} />
            <Row label="WhatsApp" value={booking.customerWa} />
            {booking.notes ? <Row label="Catatan" value={booking.notes} /> : null}
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted">Total</dt>
              <dd className="text-xl font-bold text-brand">
                {rupiah(booking.totalPrice)}
              </dd>
            </div>
          </dl>
        </div>

        {showPayment ? (
          <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/10 p-5">
            <p className="text-sm font-semibold text-accent">
              ⏳ Slot kamu di-hold.
            </p>
            <p className="mt-1 text-sm text-brand">
              Konfirmasi &amp; transfer via WhatsApp sebelum{" "}
              <span className="font-semibold">{expiresLabel} WIB</span>, atau slot
              otomatis terbuka lagi.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-3 text-center">
              <span className="text-sm text-muted">Sisa waktu</span>
              <span className="text-2xl text-accent">
                <HoldCountdown expiresAtMs={expiresAtMs} />
              </span>
            </div>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full rounded-full bg-accent px-4 py-4 text-center text-base font-bold text-white shadow-sm transition hover:opacity-90"
              >
                Konfirmasi &amp; Kirim Bukti via WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}

        {showPayment && venue ? (
          <div className="mt-4 rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Instruksi Pembayaran</h2>
            <p className="mt-1 text-sm text-muted">
              Chat admin DULU untuk konfirmasi, lalu transfer.
            </p>
            {venue.bankNumber ? (
              <div className="mt-3 rounded-xl bg-cream/40 p-4 text-sm">
                <p className="text-muted">Transfer Bank</p>
                <p className="mt-1 text-lg font-bold">
                  {venue.bankName} {venue.bankNumber}
                </p>
                <p className="text-muted">a.n. {venue.bankHolder}</p>
              </div>
            ) : null}
            {venue.qrisUrl ? (
              <div className="mt-3 rounded-xl bg-cream/40 p-4 text-sm">
                <p className="text-muted">QRIS</p>
                <p className="mt-1 font-medium">
                  Scan QRIS yang dikirim admin via WhatsApp.
                </p>
              </div>
            ) : null}
            {venue.paymentNotes ? (
              <p className="mt-3 text-sm text-muted">{venue.paymentNotes}</p>
            ) : null}
          </div>
        ) : null}

        {booking.status === "PAID" ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
            Pembayaran terkonfirmasi. Slot kamu sudah aman. Sampai jumpa di
            lapangan.
          </p>
        ) : null}

        <Link
          href="/sewa"
          className="mt-6 block text-center text-sm text-accent"
        >
          Booking lagi
        </Link>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
