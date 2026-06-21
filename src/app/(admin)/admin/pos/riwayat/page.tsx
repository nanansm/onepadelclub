import { AdminPageHeader } from "@/components/admin/page-header";
import { getPosOrders } from "@/lib/pos";
import { todayJakarta } from "@/lib/tz";
import { RiwayatList } from "./riwayat-list";

export const dynamic = "force-dynamic";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export default async function PosRiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const today = todayJakarta();
  const from = sp.from && YMD.test(sp.from) ? sp.from : today;
  const to = sp.to && YMD.test(sp.to) ? sp.to : today;

  const orders = await getPosOrders(from, to);

  return (
    <div>
      <AdminPageHeader
        title="Riwayat"
        accent="Transaksi"
        sub="Daftar penjualan POS. Cetak ulang struk atau batalkan transaksi."
        back={{ href: "/admin/pos", label: "Kembali ke Kasir" }}
      />

      <div className="mt-6">
        <RiwayatList
          from={from}
          to={to}
          today={today}
          orders={orders.map((o) => ({
            id: o.id,
            code: o.code,
            createdAt: o.createdAt.toISOString(),
            customerName: o.customerName,
            total: o.total,
            paymentMethod: o.paymentMethod,
            status: o.status,
          }))}
        />
      </div>
    </div>
  );
}
