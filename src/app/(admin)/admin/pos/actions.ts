"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { product, stockMovement, cashShift } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { getVenue } from "@/lib/venue";
import { logAudit } from "@/lib/audit";
import {
  createSale,
  getOpenShift,
  cashSalesSince,
  type CartLine,
} from "@/lib/pos";

type ActionResult = { ok: boolean; error?: string };

const intFrom = (def = 0) =>
  z.coerce.number().int().min(0).optional().default(def);

// --- Checkout ---
const saleSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), qty: z.coerce.number().int().min(1) }))
    .min(1, "Keranjang kosong."),
  discount: intFrom(0),
  paymentMethod: z.enum(["CASH", "QRIS", "TRANSFER", "GATEWAY"]).default("CASH"),
  customerName: z.string().trim().optional().default(""),
  note: z.string().trim().optional().default(""),
  bookingId: z.string().trim().optional(),
  bookingType: z.string().trim().optional(),
});

export async function createSaleAction(
  raw: unknown,
): Promise<{ ok: boolean; error?: string; code?: string; total?: number }> {
  const session = await requireAdmin();
  const parsed = saleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const venue = await getVenue();
  if (!venue) return { ok: false, error: "Venue belum dikonfigurasi." };

  const res = await createSale({
    venueId: venue.id,
    cashierId: session.user.id,
    items: parsed.data.items as CartLine[],
    discount: parsed.data.discount,
    paymentMethod: parsed.data.paymentMethod,
    customerName: parsed.data.customerName || undefined,
    note: parsed.data.note || undefined,
    bookingId: parsed.data.bookingId || undefined,
    bookingType: parsed.data.bookingType || undefined,
    taxPercent: venue.taxPercent ?? 0,
  });
  if (res.ok) {
    await logAudit("pos_sale", "pos_order", res.code);
    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/produk");
  }
  return res;
}

// --- Produk CRUD ---
const productSchema = z.object({
  category: z.enum(["FNB", "RETAIL", "RENTAL", "SERVICE"]).default("FNB"),
  name: z.string().trim().min(1, "Nama wajib diisi."),
  sku: z.string().trim().optional().default(""),
  barcode: z.string().trim().optional().default(""),
  price: z.coerce.number().int().min(0),
  cost: intFrom(0),
  trackStock: z.preprocess(
    (v) => v === true || v === "true" || v === "on" || v === "1",
    z.boolean(),
  ).default(true),
  stock: intFrom(0),
});

export async function createProductAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const venue = await getVenue();
  if (!venue) return { ok: false, error: "Venue belum dikonfigurasi." };
  const d = parsed.data;
  await db.insert(product).values({
    venueId: venue.id,
    category: d.category,
    name: d.name,
    sku: d.sku || null,
    barcode: d.barcode || null,
    price: d.price,
    cost: d.cost,
    trackStock: d.trackStock,
    stock: d.trackStock ? d.stock : 0,
  });
  await logAudit("create", "product", d.name);
  revalidatePath("/admin/pos/produk");
  revalidatePath("/admin/pos");
  return { ok: true };
}

export async function updateProductAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const id = z.string().min(1).safeParse((raw as { id?: string })?.id);
  if (!id.success) return { ok: false, error: "ID tidak valid." };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;
  await db
    .update(product)
    .set({
      category: d.category,
      name: d.name,
      sku: d.sku || null,
      barcode: d.barcode || null,
      price: d.price,
      cost: d.cost,
      trackStock: d.trackStock,
    })
    .where(eq(product.id, id.data));
  await logAudit("update", "product", id.data);
  revalidatePath("/admin/pos/produk");
  revalidatePath("/admin/pos");
  return { ok: true };
}

export async function toggleProductAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  await db.update(product).set({ active }).where(eq(product.id, id));
  await logAudit(active ? "activate" : "deactivate", "product", id);
  revalidatePath("/admin/pos/produk");
  revalidatePath("/admin/pos");
  return { ok: true };
}

// Restock / koreksi stok manual + catat pergerakan.
const restockSchema = z.object({
  id: z.string().min(1),
  delta: z.coerce.number().int(), // + masuk / - keluar
  note: z.string().trim().optional().default(""),
});

export async function restockProductAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = restockSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { id, delta, note } = parsed.data;
  if (delta === 0) return { ok: false, error: "Jumlah tidak boleh 0." };
  await db.transaction(async (tx) => {
    await tx
      .update(product)
      .set({ stock: sql`${product.stock} + ${delta}` })
      .where(eq(product.id, id));
    await tx.insert(stockMovement).values({
      productId: id,
      type: delta > 0 ? "RESTOCK" : "ADJUST",
      qty: delta,
      note: note || null,
    });
  });
  await logAudit("restock", "product", `${id}:${delta}`);
  revalidatePath("/admin/pos/produk");
  revalidatePath("/admin/pos");
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(product).where(eq(product.id, id));
  await logAudit("delete", "product", id);
  revalidatePath("/admin/pos/produk");
  revalidatePath("/admin/pos");
  return { ok: true };
}

// --- Shift kasir ---
export async function openShiftAction(raw: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  const openingCash = z.coerce
    .number()
    .int()
    .min(0)
    .safeParse((raw as { openingCash?: unknown })?.openingCash);
  if (!openingCash.success) return { ok: false, error: "Modal awal tidak valid." };
  const venue = await getVenue();
  if (!venue) return { ok: false, error: "Venue belum dikonfigurasi." };
  const open = await getOpenShift(venue.id);
  if (open) return { ok: false, error: "Sudah ada shift terbuka." };
  await db.insert(cashShift).values({
    venueId: venue.id,
    cashierId: session.user.id,
    openingCash: openingCash.data,
  });
  await logAudit("open_shift", "cash_shift");
  revalidatePath("/admin/pos");
  return { ok: true };
}

export async function closeShiftAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const closingCash = z.coerce
    .number()
    .int()
    .min(0)
    .safeParse((raw as { closingCash?: unknown })?.closingCash);
  if (!closingCash.success) return { ok: false, error: "Uang fisik tidak valid." };
  const venue = await getVenue();
  if (!venue) return { ok: false, error: "Venue belum dikonfigurasi." };
  const open = await getOpenShift(venue.id);
  if (!open) return { ok: false, error: "Tidak ada shift terbuka." };

  const cashSales = await cashSalesSince(venue.id, open.openedAt);
  const expected = open.openingCash + cashSales;
  const diff = closingCash.data - expected;
  await db
    .update(cashShift)
    .set({
      closedAt: new Date(),
      closingCash: closingCash.data,
      expectedCash: expected,
      diff,
    })
    .where(eq(cashShift.id, open.id));
  await logAudit("close_shift", "cash_shift", open.id);
  revalidatePath("/admin/pos");
  return { ok: true };
}
