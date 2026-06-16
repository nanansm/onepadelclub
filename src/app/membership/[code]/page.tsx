import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { PaymentInstructions } from "@/components/payment-instructions";
import { getMembershipByCode } from "@/lib/membership";
import { getVenue } from "@/lib/venue";
import { rupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Menunggu Pembayaran", cls: "bg-amber-100 text-amber-800" },
  ACTIVE: { label: "Aktif", cls: "bg-emerald-100 text-emerald-800" },
  EXPIRED: { label: "Berakhir", cls: "bg-slate-200 text-slate-700" },
  CANCELLED: { label: "Dibatalkan", cls: "bg-red-100 text-red-700" },
};

export default async function MembershipConfirmation({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [row, venue] = await Promise.all([getMembershipByCode(code), getVenue()]);
  if (!row) notFound();

  const { membership: m, plan } = row;
  const st = STATUS[m.status] ?? STATUS.PENDING;

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Membership" />
      <main className="mx-auto max-w-md px-5 py-6">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="bg-brand px-5 py-5 text-brand-fg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cream">Kode Membership</span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  st.cls,
                )}
              >
                {st.label}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-wide">{m.code}</p>
          </div>
          <dl className="divide-y px-5">
            <Row label="Paket" value={plan.name} />
            <Row label="Durasi" value={`${plan.durationDays} hari`} />
            <Row label="Nama" value={m.customerName} />
            <Row label="WhatsApp" value={m.customerWa} />
            {m.startDate ? <Row label="Mulai" value={m.startDate} /> : null}
            {m.endDate ? <Row label="Berakhir" value={m.endDate} /> : null}
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted">Harga</dt>
              <dd className="text-xl font-bold text-brand">{rupiah(plan.price)}</dd>
            </div>
          </dl>
        </div>

        {m.status === "PENDING" && venue ? (
          <div className="mt-4">
            <PaymentInstructions
              venue={venue}
              waText={`Halo admin, saya daftar Membership ${plan.name} (${m.code}).`}
            />
          </div>
        ) : null}

        {m.status === "ACTIVE" ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
            Membership kamu aktif. Selamat menikmati benefitnya.
          </p>
        ) : null}

        <Link href="/membership" className="mt-6 block text-center text-sm text-accent">
          Lihat paket lain
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
