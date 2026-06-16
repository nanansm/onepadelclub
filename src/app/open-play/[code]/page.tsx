import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { PaymentInstructions } from "@/components/payment-instructions";
import { getRegistrationByCode } from "@/lib/openplay";
import { getVenue } from "@/lib/venue";
import { dateLabelId, rangeLabel } from "@/lib/format";
import { rupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OpenPlayConfirmation({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [row, venue] = await Promise.all([getRegistrationByCode(code), getVenue()]);
  if (!row) notFound();

  const { reg, session, courtName } = row;

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Pendaftaran Open Play" />
      <main className="mx-auto max-w-md px-5 py-6">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="bg-brand px-5 py-5 text-brand-fg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cream">Kode Pendaftaran</span>
              <StatusBadge status={reg.status} />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-wide">{reg.code}</p>
          </div>
          <dl className="divide-y px-5">
            <Row label="Sesi" value={`${session.title} · ${session.level}`} />
            <Row label="Tanggal" value={dateLabelId(session.date)} />
            <Row label="Jam" value={rangeLabel(session.startHour, session.duration)} />
            {courtName ? <Row label="Lapangan" value={courtName} /> : null}
            <Row label="Nama" value={reg.customerName} />
            <Row label="WhatsApp" value={reg.customerWa} />
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted">Biaya</dt>
              <dd className="text-xl font-bold text-brand">
                {rupiah(session.pricePerPlayer)}
              </dd>
            </div>
          </dl>
        </div>

        {reg.status === "PENDING" && venue ? (
          <div className="mt-4">
            <PaymentInstructions
              venue={venue}
              waText={`Halo admin, saya daftar Open Play "${session.title}" (${reg.code}) tanggal ${dateLabelId(session.date)}.`}
            />
          </div>
        ) : null}

        <Link href="/open-play" className="mt-6 block text-center text-sm text-accent">
          Lihat sesi lain
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
