import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { getCustomerActivity } from "@/lib/lookup";
import { guardGuest } from "@/lib/rate-limit";
import { dateLabelId, hourLabel, rangeLabel } from "@/lib/format";
import { rupiah } from "@/lib/utils";
import type { BookingStatus } from "@/db/schema";
import { CekForm } from "./cek-form";
import { PageHeading } from "@/components/page-heading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cek Booking",
  description: "Cek status booking, coaching, open play, dan membership kamu di One Padel Club.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CekPage({
  searchParams,
}: {
  searchParams: Promise<{ wa?: string }>;
}) {
  const { wa } = await searchParams;

  let limited = false;
  let activity: Awaited<ReturnType<typeof getCustomerActivity>> | null = null;
  if (wa) {
    const g = await guardGuest("cek-lookup", 15, 5 * 60_000);
    if (g.ok) {
      activity = await getCustomerActivity(wa);
    } else {
      limited = true;
    }
  }

  const isEmpty =
    activity !== null &&
    activity.rentals.length === 0 &&
    activity.coachings.length === 0 &&
    activity.openPlays.length === 0 &&
    activity.memberships.length === 0;

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Cek Booking" />
      <main className="mx-auto max-w-md px-5 py-6">
        <PageHeading
          plain="Cek"
          accent="Booking"
          sub="Lihat semua aktivitasmu pakai nomor WhatsApp saat booking."
        />
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted">
            Masukkan nomor WhatsApp yang kamu pakai saat booking untuk melihat
            semua aktivitasmu.
          </p>
          <div className="mt-4">
            <CekForm defaultWa={wa} />
          </div>
        </div>

        {limited ? (
          <p className="mt-6 rounded-2xl border bg-card p-5 text-center text-sm text-muted">
            Terlalu banyak pencarian. Coba lagi beberapa menit lagi.
          </p>
        ) : activity !== null ? (
          isEmpty ? (
            <p className="mt-6 rounded-2xl border bg-card p-5 text-center text-sm text-muted">
              Tidak ada booking untuk nomor itu. Pastikan nomor sama dengan saat
              booking.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {activity.rentals.length > 0 ? (
                <Section title="Sewa Lapangan">
                  {activity.rentals.map((r) => (
                    <ActivityCard
                      key={r.code}
                      href={`/booking/${r.code}`}
                      name={r.courtName}
                      sub={`${dateLabelId(r.date)} · ${rangeLabel(r.startHour, r.duration)}`}
                      price={r.totalPrice}
                      status={r.status as BookingStatus}
                    />
                  ))}
                </Section>
              ) : null}

              {activity.coachings.length > 0 ? (
                <Section title="Coaching">
                  {activity.coachings.map((c) => (
                    <ActivityCard
                      key={c.code}
                      href={`/coaching/${c.code}`}
                      name={c.coachName}
                      sub={`${dateLabelId(c.date)} · ${rangeLabel(c.startHour, c.duration)}`}
                      price={c.totalPrice}
                      status={c.status as BookingStatus}
                    />
                  ))}
                </Section>
              ) : null}

              {activity.openPlays.length > 0 ? (
                <Section title="Open Play">
                  {activity.openPlays.map((o) => (
                    <ActivityCard
                      key={o.code}
                      href={`/open-play/${o.code}`}
                      name={o.title}
                      sub={`${dateLabelId(o.date)} · ${hourLabel(o.startHour)}`}
                      status={o.status as BookingStatus}
                    />
                  ))}
                </Section>
              ) : null}

              {activity.memberships.length > 0 ? (
                <Section title="Membership">
                  {activity.memberships.map((m) => (
                    <ActivityCard
                      key={m.code}
                      href={`/membership/${m.code}`}
                      name={m.planName}
                      sub={
                        m.endDate ? `Berlaku s/d ${dateLabelId(m.endDate)}` : undefined
                      }
                      status={m.status as BookingStatus}
                    />
                  ))}
                </Section>
              ) : null}
            </div>
          )
        ) : null}
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-muted">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ActivityCard({
  href,
  name,
  sub,
  price,
  status,
}: {
  href: string;
  name: string;
  sub?: string;
  price?: number;
  status: BookingStatus;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border bg-card p-4 transition hover:border-brand/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold">{name}</p>
        <StatusBadge status={status} />
      </div>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
      {price !== undefined ? (
        <p className="mt-2 text-sm font-bold text-brand">{rupiah(price)}</p>
      ) : null}
    </Link>
  );
}
