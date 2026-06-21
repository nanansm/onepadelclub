import Link from "next/link";
import { Package } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getProducts } from "@/lib/pos";
import { getVenue } from "@/lib/venue";
import { Cashier } from "./cashier";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [products, venue] = await Promise.all([
    getProducts({ activeOnly: true }),
    getVenue(),
  ]);
  const taxPercent = venue?.taxPercent ?? 0;

  return (
    <div>
      <AdminPageHeader
        title="POS"
        accent="Kasir"
        sub="Jual produk F&B, pro-shop, atau sewa alat. Pilih item, atur jumlah, lalu bayar."
        action={
          <Link
            href="/admin/pos/produk"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
          >
            <Package className="size-4" strokeWidth={2} />
            Kelola Produk
          </Link>
        }
      />

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
          />
        )}
      </div>
    </div>
  );
}
