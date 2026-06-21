import "server-only";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  product,
  posOrder,
  posOrderItem,
  stockMovement,
  cashShift,
  type Product,
} from "@/db/schema";
import { genCode, isUniqueViolation } from "@/lib/code";

export type { Product };

// Ambil 1 order + itemnya untuk struk. null kalau tak ada.
export async function getOrderWithItems(code: string) {
  const order = (
    await db.select().from(posOrder).where(eq(posOrder.code, code)).limit(1)
  )[0];
  if (!order) return null;
  const items = await db
    .select()
    .from(posOrderItem)
    .where(eq(posOrderItem.orderId, order.id));
  return { order, items };
}

export type CartLine = { productId: string; qty: number };

export type SaleInput = {
  venueId: string;
  cashierId: string | null;
  items: CartLine[];
  discount: number;
  paymentMethod: "CASH" | "QRIS" | "TRANSFER" | "GATEWAY";
  customerName?: string;
  note?: string;
  bookingId?: string;
  bookingType?: string;
  cashReceived?: number;
  taxPercent: number;
};

export type SaleResult =
  | { ok: true; code: string; total: number }
  | { ok: false; error: string };

// --- Query ---

export async function getProducts(opts?: {
  activeOnly?: boolean;
}): Promise<Product[]> {
  const where = opts?.activeOnly ? eq(product.active, true) : undefined;
  return db
    .select()
    .from(product)
    .where(where)
    .orderBy(asc(product.sortOrder), asc(product.name));
}

export async function getProductByBarcode(
  barcode: string,
): Promise<Product | null> {
  const rows = await db
    .select()
    .from(product)
    .where(and(eq(product.barcode, barcode), eq(product.active, true)))
    .limit(1);
  return rows[0] ?? null;
}

// Hitung subtotal/diskon/pajak/total konsisten (server-authoritative).
export function computeTotals(
  lines: { price: number; qty: number }[],
  discount: number,
  taxPercent: number,
) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const disc = Math.min(Math.max(discount, 0), subtotal);
  const taxable = subtotal - disc;
  const tax = Math.round((taxable * taxPercent) / 100);
  const total = taxable + tax;
  return { subtotal, discount: disc, tax, total };
}

// --- Checkout (transaksi: order + item + stok) ---
export async function createSale(input: SaleInput): Promise<SaleResult> {
  if (!input.items.length) return { ok: false, error: "Keranjang kosong." };

  try {
    return await db.transaction(async (tx) => {
      const ids = input.items.map((i) => i.productId);
      const rows = await tx
        .select()
        .from(product)
        .where(inArray(product.id, ids));
      const byId = new Map(rows.map((r) => [r.id, r]));

      // Validasi + rakit baris.
      const lines: {
        p: Product;
        qty: number;
      }[] = [];
      for (const it of input.items) {
        const p = byId.get(it.productId);
        if (!p) return { ok: false as const, error: "Produk tidak ditemukan." };
        if (!p.active)
          return { ok: false as const, error: `${p.name} tidak aktif.` };
        const qty = Math.max(1, Math.floor(it.qty));
        if (p.trackStock && p.stock < qty)
          return {
            ok: false as const,
            error: `Stok ${p.name} kurang (sisa ${p.stock}).`,
          };
        lines.push({ p, qty });
      }

      const totals = computeTotals(
        lines.map((l) => ({ price: l.p.price, qty: l.qty })),
        input.discount,
        input.taxPercent,
      );

      // Insert order (retry kode unik).
      let code = "";
      let orderId = "";
      for (let i = 0; i < 5; i++) {
        code = genCode("POS");
        try {
          const [o] = await tx
            .insert(posOrder)
            .values({
              venueId: input.venueId,
              code,
              cashierId: input.cashierId,
              bookingId: input.bookingId ?? null,
              bookingType: input.bookingType ?? null,
              customerName: input.customerName ?? null,
              subtotal: totals.subtotal,
              discount: totals.discount,
              tax: totals.tax,
              total: totals.total,
              paymentMethod: input.paymentMethod,
              status: "PAID",
              cashReceived:
                input.paymentMethod === "CASH" && input.cashReceived != null
                  ? input.cashReceived
                  : null,
              note: input.note ?? null,
              paidAt: new Date(),
            })
            .returning({ id: posOrder.id });
          orderId = o.id;
          break;
        } catch (err) {
          if (isUniqueViolation(err) && i < 4) continue;
          throw err;
        }
      }

      // Item + stok.
      for (const l of lines) {
        await tx.insert(posOrderItem).values({
          orderId,
          productId: l.p.id,
          nameSnapshot: l.p.name,
          priceSnapshot: l.p.price,
          costSnapshot: l.p.cost,
          qty: l.qty,
          lineTotal: l.p.price * l.qty,
        });
        if (l.p.trackStock) {
          await tx
            .update(product)
            .set({ stock: sql`${product.stock} - ${l.qty}` })
            .where(eq(product.id, l.p.id));
          await tx.insert(stockMovement).values({
            productId: l.p.id,
            type: "SALE",
            qty: -l.qty,
            ref: code,
          });
        }
      }

      return { ok: true as const, code, total: totals.total };
    });
  } catch (err) {
    console.error("[createSale]", err);
    return { ok: false, error: "Gagal memproses penjualan, coba lagi." };
  }
}

// Total penjualan POS (status PAID) per bookingId. Untuk "tab" lapangan.
export async function posTotalsByBooking(
  bookingIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (bookingIds.length === 0) return map;
  const rows = await db
    .select({
      bookingId: posOrder.bookingId,
      sum: sql<number>`coalesce(sum(${posOrder.total}), 0)`,
    })
    .from(posOrder)
    .where(
      and(eq(posOrder.status, "PAID"), inArray(posOrder.bookingId, bookingIds)),
    )
    .groupBy(posOrder.bookingId);
  for (const r of rows) {
    if (r.bookingId) map.set(r.bookingId, Number(r.sum));
  }
  return map;
}

// --- Shift kasir ---
export async function getOpenShift(venueId: string) {
  const rows = await db
    .select()
    .from(cashShift)
    .where(and(eq(cashShift.venueId, venueId), sql`${cashShift.closedAt} is null`))
    .orderBy(desc(cashShift.openedAt))
    .limit(1);
  return rows[0] ?? null;
}

// Total penjualan cash sejak waktu tertentu (untuk expected cash saat tutup).
export async function cashSalesSince(
  venueId: string,
  since: Date,
): Promise<number> {
  const [r] = await db
    .select({
      sum: sql<number>`coalesce(sum(${posOrder.total}), 0)`,
    })
    .from(posOrder)
    .where(
      and(
        eq(posOrder.venueId, venueId),
        eq(posOrder.status, "PAID"),
        eq(posOrder.paymentMethod, "CASH"),
        gte(posOrder.createdAt, since),
      ),
    );
  return Number(r?.sum ?? 0);
}
