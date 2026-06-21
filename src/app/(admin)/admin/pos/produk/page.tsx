import { AdminPageHeader } from "@/components/admin/page-header";
import { getProducts } from "@/lib/pos";
import { ProductsManager } from "./products-manager";

export const dynamic = "force-dynamic";

export default async function PosProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <AdminPageHeader
        title="Kelola"
        accent="Produk"
        sub="Atur produk F&B, pro-shop, sewa alat, dan stok. Produk aktif tampil di kasir."
        back={{ href: "/admin/pos", label: "Kembali ke Kasir" }}
      />

      <div className="mt-6">
        <ProductsManager
          products={products.map((p) => ({
            id: p.id,
            category: p.category,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            price: p.price,
            cost: p.cost,
            trackStock: p.trackStock,
            stock: p.stock,
            active: p.active,
          }))}
        />
      </div>
    </div>
  );
}
