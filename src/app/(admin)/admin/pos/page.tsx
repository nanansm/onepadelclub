import Link from "next/link";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Package, History } from "lucide-react";
import { db } from "@/db";
import { courtBooking, court } from "@/db/schema";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getProducts, getOpenShift, cashSalesSince } from "@/lib/pos";
import { getVenue } from "@/lib/venue";
import { todayJakarta } from "@/lib/tz";
import { rangeLabel } from "@/lib/format";
import { Cashier } from "./cashier";
import { ShiftPanel } from "./shift-panel";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [products, venue] = await Promise.all([
    getProducts({ activeOnly: true }),
    getVenue(),
  ]);
  const taxPercent = venue?.taxPercent ?? 0;

  const shift = venue ? await getOpenShift(venue.id) : null;
  const shiftCashSales =
    venue && shift ? await cashSalesSince(venue.id, shift.openedAt) : 0;

  // Booking lapangan aktif hari ini → bisa ditempeli penjualan (tab).
  const today = todayJakarta();
  const todayBookings = await db
    .select({
      id: courtBooking.id,
      code: courtBooking.code,
      customerName: courtBooking.customerName,
      startHour: courtBooking.startHour,
      duration: courtBooking.duration,
      courtName: court.name,
    })
    .from(courtBooking)
    .innerJoin(court, eq(court.id, courtBooking.courtId))
    .where(
      and(
        eq(courtBooking.date, today),
        inArray(courtBooking.status, ["PENDING", "PAID"]),
      ),
    )
    .orderBy(asc(courtBooking.startHour));

  return (
    <div>
      <AdminPageHeader
        title="POS"
        accent="Kasir"
        sub="Jual produk F&B, pro-shop, atau sewa alat. Pilih item, atur jumlah, lalu bayar."
        action={
          <div className="flex gap-2">
            <Link
              href="/admin/pos/riwayat"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
            >
              <History className="size-4" strokeWidth={2} />
              Riwayat
            </Link>
            <Link
              href="/admin/pos/produk"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
            >
              <Package className="size-4" strokeWidth={2} />
              Kelola Produk
            </Link>
          </div>
        }
      />

      <div className="mt-6">
        <ShiftPanel
          shift={
            shift
              ? {
                  openedAt: shift.openedAt.toISOString(),
                  openingCash: shift.openingCash,
                  cashSales: shiftCashSales,
                }
              : null
          }
        />
      </div>

      <div className="mt-6">
        {products.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="font-medium">Belum ada produk.</p>
            <p className="mt-1 text-sm text-muted">
              Tambah produk dulu supaya bisa mulai jualan di kasir.
            </p>
            <Link
              href="/admin/pos/produk"
              className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg"
            >
              Tambah Produk
            </Link>
          </div>
        ) : (
          <Cashier
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              price: p.price,
              barcode: p.barcode,
              trackStock: p.trackStock,
              stock: p.stock,
            }))}
            taxPercent={taxPercent}
            bookings={todayBookings.map((b) => ({
              id: b.id,
              label: `${b.code} · ${b.courtName} · ${rangeLabel(b.startHour, b.duration)}${
                b.customerName ? ` · ${b.customerName}` : ""
              }`,
            }))}
          />
        )}
      </div>
    </div>
  );
}
