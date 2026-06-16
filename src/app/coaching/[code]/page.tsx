import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { PaymentInstructions } from "@/components/payment-instructions";
import { getCoachingByCode } from "@/lib/coaching";
import { getVenue } from "@/lib/venue";
import { dateLabelId, rangeLabel } from "@/lib/format";
import { rupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CoachingConfirmation({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [row, venue] = await Promise.all([getCoachingByCode(code), getVenue()]);
  if (!row) notFound();

  const { booking, coach } = row;

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Booking Coaching" />
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
            <Row label="Pelatih" value={coach.name} />
            <Row label="Tanggal" value={dateLabelId(booking.date)} />
            <Row label="Jam" value={rangeLabel(booking.startHour, booking.duration)} />
            <Row label="Durasi" value={`${booking.duration} jam`} />
            <Row label="Nama" value={booking.customerName} />
            <Row label="WhatsApp" value={booking.customerWa} />
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted">Total</dt>
              <dd className="text-xl font-bold text-brand">
                {rupiah(booking.totalPrice)}
              </dd>
            </div>
          </dl>
        </div>

        {booking.status === "PENDING" && venue ? (
          <div className="mt-4">
            <PaymentInstructions
              venue={venue}
              waText={`Halo admin, saya booking coaching dengan ${coach.name} (${booking.code}) tanggal ${dateLabelId(booking.date)}.`}
            />
          </div>
        ) : null}

        <Link href="/coaching" className="mt-6 block text-center text-sm text-accent">
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
