"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rupiah } from "@/lib/utils";
import {
  createProductAction,
  updateProductAction,
  toggleProductAction,
  restockProductAction,
  deleteProductAction,
} from "../actions";

type Category = "FNB" | "RETAIL" | "RENTAL" | "SERVICE";

type ProductRow = {
  id: string;
  category: Category;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost: number;
  trackStock: boolean;
  stock: number;
  active: boolean;
};

const CATEGORY_LABEL: Record<Category, string> = {
  FNB: "F&B",
  RETAIL: "Pro-shop",
  RENTAL: "Sewa Alat",
  SERVICE: "Jasa",
};

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelClass = "block space-y-1";
const labelText = "text-xs font-medium text-muted";

// Ambang stok menipis (produk dilacak & aktif).
const LOW_STOCK = 5;
const isLow = (p: ProductRow) =>
  p.active && p.trackStock && p.stock <= LOW_STOCK;

export function ProductsManager({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [deleteRow, setDeleteRow] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(
    fn: () => Promise<{ ok: boolean; error?: string }>,
    okMsg: string,
  ) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Gagal");
      return false;
    }
    toast.success(okMsg);
    setEditingId(null);
    setRestockId(null);
    setDeleteRow(null);
    router.refresh();
    return true;
  }

  const lowStock = products.filter(isLow);

  return (
    <div className="space-y-6">
      {/* Alert stok menipis */}
      {lowStock.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Stok menipis ({lowStock.length}):</strong>{" "}
          {lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}. Segera
          restock biar tak kehabisan saat ramai.
        </div>
      ) : null}

      {/* Tambah produk */}
      <form
        action={async (fd) => {
          await handle(
            () =>
              createProductAction({
                category: fd.get("category"),
                name: fd.get("name"),
                price: fd.get("price"),
                cost: fd.get("cost"),
                barcode: fd.get("barcode"),
                trackStock: fd.get("trackStock"),
                stock: fd.get("stock"),
              }),
            "Produk ditambahkan",
          );
        }}
        className="rounded-2xl border bg-card p-4"
      >
        <h2 className="mb-3 text-sm font-semibold text-muted">Tambah Produk</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <label className={labelClass}>
            <span className={labelText}>Kategori</span>
            <select name="category" defaultValue="FNB" className={inputClass}>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <label className={`${labelClass} col-span-2`}>
            <span className={labelText}>Nama</span>
            <input name="name" required placeholder="Pocari 500ml" className={inputClass} />
          </label>
          <label className={labelClass}>
            <span className={labelText}>Harga jual</span>
            <input name="price" type="number" required min={0} step={500} placeholder="10000" className={inputClass} />
          </label>
          <label className={labelClass}>
            <span className={labelText}>Modal (opsional)</span>
            <input name="cost" type="number" min={0} step={500} placeholder="7000" className={inputClass} />
          </label>
          <label className={labelClass}>
            <span className={labelText}>Barcode (opsional)</span>
            <input name="barcode" placeholder="scan / ketik" className={inputClass} />
          </label>
          <label className={labelClass}>
            <span className={labelText}>Stok awal</span>
            <input name="stock" type="number" min={0} defaultValue={0} className={inputClass} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2">
            <input
              type="checkbox"
              name="trackStock"
              defaultChecked
              className="size-4 rounded border accent-brand"
            />
            <span className="text-sm">Lacak stok</span>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="self-end rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50"
          >
            Tambah
          </button>
        </div>
      </form>

      {/* Daftar produk */}
      {products.length === 0 ? (
        <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted">
          Belum ada produk.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) =>
            editingId === p.id ? (
              <li key={p.id} className="rounded-2xl border bg-card p-4">
                <form
                  action={async (fd) => {
                    await handle(
                      () =>
                        updateProductAction({
                          id: p.id,
                          category: fd.get("category"),
                          name: fd.get("name"),
                          price: fd.get("price"),
                          cost: fd.get("cost"),
                          barcode: fd.get("barcode"),
                          trackStock: fd.get("trackStock"),
                        }),
                      "Produk diperbarui",
                    );
                  }}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
                >
                  <label className={labelClass}>
                    <span className={labelText}>Kategori</span>
                    <select name="category" defaultValue={p.category} className={inputClass}>
                      {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABEL[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={`${labelClass} col-span-2`}>
                    <span className={labelText}>Nama</span>
                    <input name="name" defaultValue={p.name} required className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    <span className={labelText}>Harga jual</span>
                    <input name="price" type="number" defaultValue={p.price} min={0} step={500} required className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    <span className={labelText}>Modal</span>
                    <input name="cost" type="number" defaultValue={p.cost} min={0} step={500} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    <span className={labelText}>Barcode</span>
                    <input name="barcode" defaultValue={p.barcode ?? ""} className={inputClass} />
                  </label>
                  <label className="flex items-center gap-2 self-end pb-2">
                    <input type="checkbox" name="trackStock" defaultChecked={p.trackStock} className="size-4 rounded border accent-brand" />
                    <span className="text-sm">Lacak stok</span>
                  </label>
                  <div className="col-span-2 flex gap-2 self-end sm:col-span-3 lg:col-span-2">
                    <button type="submit" disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50">
                      Simpan
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border px-4 py-2 text-sm">
                      Batal
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={p.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{p.name}</span>
                      <span className="rounded-full bg-cream/60 px-2 py-0.5 text-xs text-brand">
                        {CATEGORY_LABEL[p.category]}
                      </span>
                      {!p.active && (
                        <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">
                      {rupiah(p.price)}
                      {p.cost > 0 ? ` · modal ${rupiah(p.cost)}` : ""}
                      {p.trackStock ? (
                        <span className={isLow(p) ? "font-semibold text-amber-700" : ""}>
                          {" · "}stok {p.stock}
                          {isLow(p) ? " ⚠️" : ""}
                        </span>
                      ) : (
                        " · stok tak dilacak"
                      )}
                      {p.barcode ? ` · ${p.barcode}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.trackStock ? (
                      <button
                        onClick={() => setRestockId(restockId === p.id ? null : p.id)}
                        className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40"
                      >
                        Stok
                      </button>
                    ) : null}
                    <button
                      onClick={() => setEditingId(p.id)}
                      className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40"
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        handle(
                          () => toggleProductAction(p.id, !p.active),
                          p.active ? "Produk dinonaktifkan" : "Produk diaktifkan",
                        )
                      }
                      className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40 disabled:opacity-50"
                    >
                      {p.active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      onClick={() => setDeleteRow(p)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Panel restock inline */}
                {restockId === p.id ? (
                  <form
                    action={async (fd) => {
                      await handle(
                        () =>
                          restockProductAction({
                            id: p.id,
                            delta: fd.get("delta"),
                            note: fd.get("note"),
                          }),
                        "Stok diperbarui",
                      );
                    }}
                    className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3"
                  >
                    <label className={labelClass}>
                      <span className={labelText}>Tambah/kurangi (+/-)</span>
                      <input name="delta" type="number" required placeholder="cth: 24 atau -2" className={`${inputClass} w-40`} />
                    </label>
                    <label className={`${labelClass} flex-1`}>
                      <span className={labelText}>Catatan (opsional)</span>
                      <input name="note" placeholder="Restock / opname / rusak" className={inputClass} />
                    </label>
                    <button type="submit" disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50">
                      Simpan stok
                    </button>
                  </form>
                ) : null}
              </li>
            ),
          )}
        </ul>
      )}

      {/* Dialog konfirmasi hapus */}
      {deleteRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl">
            <h3 className="font-semibold">Hapus produk?</h3>
            <p className="mt-1 text-sm text-muted">
              <strong>{deleteRow.name}</strong> akan dihapus permanen. Riwayat
              transaksi lama tetap tersimpan. Tindakan ini tak bisa dibatalkan.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteRow(null)} className="rounded-lg border px-4 py-2 text-sm font-medium">
                Batal
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  handle(() => deleteProductAction(deleteRow.id), "Produk dihapus")
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
