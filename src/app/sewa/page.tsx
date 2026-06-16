import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getCourts, getVenue } from "@/lib/venue";
import { todayJakarta } from "@/lib/tz";
import { BookingFlow } from "./booking-flow";

export const dynamic = "force-dynamic";

export default async function SewaPage() {
  const [venue, courts] = await Promise.all([getVenue(), getCourts()]);

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Sewa Lapangan" />
      <main className="mx-auto max-w-3xl px-5 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Booking{" "}
            <span
              className="text-accent"
              style={{
                fontFamily: "var(--font-instrument), serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              Lapangan
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Pilih lapangan, tanggal, dan jam. Bayar manual, langsung main.
          </p>
        </div>
        {!venue || courts.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-muted">
              Belum ada lapangan tersedia. Silakan hubungi admin.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm text-accent">
              Kembali ke beranda
            </Link>
          </div>
        ) : (
          <BookingFlow
            courts={courts.map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              pricePerHour: c.pricePerHour,
            }))}
            today={todayJakarta()}
          />
        )}
      </main>
    </div>
  );
}
