import Link from "next/link";
import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { courtBooking } from "@/db/schema";
import { todayJakarta } from "@/lib/tz";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

const tiles = [
  { label: "Booking Lapangan", href: "/admin/bookings", ready: true },
  { label: "Kelola Lapangan", href: "/admin/courts", ready: true },
  { label: "Open Play", href: "/admin/open-play", ready: true },
  { label: "Coaching", href: "/admin/coaching", ready: true },
  { label: "Membership", href: "/admin/membership", ready: true },
  { label: "Liga Kota Intan", href: "/admin/liga", ready: true },
];

export default async function AdminDashboard() {
  const [{ value: pending }] = await db
    .select({ value: count() })
    .from(courtBooking)
    .where(
      and(
        eq(courtBooking.status, "PENDING"),
        gte(courtBooking.date, todayJakarta()),
      ),
    );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </div>

      {pending > 0 ? (
        <Link
          href="/admin/bookings"
          className="mt-4 block rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {pending} booking menunggu konfirmasi pembayaran. Klik untuk tinjau.
        </Link>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) =>
          t.ready ? (
            <Link
              key={t.label}
              href={t.href}
              className="rounded-2xl border bg-card p-5 transition hover:border-brand hover:shadow-sm"
            >
              <span className="font-medium">{t.label}</span>
              <p className="mt-1 text-sm text-accent">Kelola</p>
            </Link>
          ) : (
            <div
              key={t.label}
              className="rounded-2xl border bg-card p-5 opacity-60"
            >
              <span className="font-medium">{t.label}</span>
              <p className="mt-1 text-sm text-muted">Segera hadir</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
