import {
  boolean,
  index,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { onepadel } from "./_base";
import { venue } from "./booking";
import { user } from "./auth";

// ============================================================================
// POS Kasir — modul opsional (venue.posEnabled). Additive, schema `onepadel`.
// Jual non-booking: F&B, pro-shop, sewa alat. Bisa nempel ke booking (tab).
// ============================================================================

export const productCategory = onepadel.enum("product_category", [
  "FNB", // makanan & minuman
  "RETAIL", // pro-shop (bola, grip, kaos)
  "RENTAL", // sewa alat (raket, bola)
  "SERVICE", // jasa lain (stringing, dll)
]);

export const posOrderStatus = onepadel.enum("pos_order_status", [
  "OPEN", // keranjang/tab belum dibayar
  "PAID",
  "VOID",
]);

export const posPaymentMethod = onepadel.enum("pos_payment_method", [
  "CASH",
  "QRIS",
  "TRANSFER",
  "GATEWAY",
]);

export const stockMovementType = onepadel.enum("stock_movement_type", [
  "SALE", // keluar karena penjualan
  "RESTOCK", // masuk (beli stok)
  "ADJUST", // koreksi manual (rusak, hilang, opname)
]);

// --- Produk ---
export const product = onepadel.table(
  "product",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    venueId: text("venue_id")
      .notNull()
      .references(() => venue.id, { onDelete: "cascade" }),
    category: productCategory("category").notNull().default("FNB"),
    name: text("name").notNull(),
    sku: text("sku"), // kode internal opsional
    barcode: text("barcode"), // untuk scan
    price: integer("price").notNull(), // harga jual (rupiah)
    cost: integer("cost").notNull().default(0), // modal (untuk laba kotor)
    trackStock: boolean("track_stock").notNull().default(true),
    stock: integer("stock").notNull().default(0),
    active: boolean("active").notNull().default(true),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("product_venue_idx").on(t.venueId),
    index("product_barcode_idx").on(t.barcode),
  ],
);

// --- Order POS ---
export const posOrder = onepadel.table(
  "pos_order",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    venueId: text("venue_id")
      .notNull()
      .references(() => venue.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(), // nomor struk publik singkat
    cashierId: text("cashier_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // Tempel ke booking (tab lapangan). null = walk-in. Tanpa FK keras karena
    // bisa rujuk beberapa jenis booking; pakai discriminator bookingType.
    bookingId: text("booking_id"),
    bookingType: text("booking_type"), // "court" | "coaching" | ...
    customerName: text("customer_name"),
    subtotal: integer("subtotal").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    tax: integer("tax").notNull().default(0),
    total: integer("total").notNull().default(0),
    paymentMethod: posPaymentMethod("payment_method").notNull().default("CASH"),
    status: posOrderStatus("status").notNull().default("OPEN"),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    paidAt: timestamp("paid_at"),
  },
  (t) => [
    index("pos_order_venue_idx").on(t.venueId, t.createdAt),
    index("pos_order_booking_idx").on(t.bookingId),
  ],
);

// --- Item dalam order (snapshot nama+harga saat transaksi) ---
export const posOrderItem = onepadel.table(
  "pos_order_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => posOrder.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    nameSnapshot: text("name_snapshot").notNull(),
    priceSnapshot: integer("price_snapshot").notNull(),
    qty: integer("qty").notNull().default(1),
    lineTotal: integer("line_total").notNull().default(0),
  },
  (t) => [index("pos_order_item_order_idx").on(t.orderId)],
);

// --- Pergerakan stok (audit + hitung ulang) ---
export const stockMovement = onepadel.table(
  "stock_movement",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    type: stockMovementType("type").notNull(),
    qty: integer("qty").notNull(), // + masuk / - keluar
    ref: text("ref"), // mis. order code
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("stock_movement_product_idx").on(t.productId)],
);

// --- Shift kasir (buka/tutup + rekonsiliasi cash) ---
export const cashShift = onepadel.table(
  "cash_shift",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    venueId: text("venue_id")
      .notNull()
      .references(() => venue.id, { onDelete: "cascade" }),
    cashierId: text("cashier_id").references(() => user.id, {
      onDelete: "set null",
    }),
    openedAt: timestamp("opened_at").notNull().defaultNow(),
    openingCash: integer("opening_cash").notNull().default(0),
    closedAt: timestamp("closed_at"),
    closingCash: integer("closing_cash"), // hitungan fisik saat tutup
    expectedCash: integer("expected_cash"), // opening + penjualan cash
    diff: integer("diff"), // closing - expected
    note: text("note"),
  },
  (t) => [index("cash_shift_venue_idx").on(t.venueId)],
);

// Tipe inferensi (dipakai lib/pos.ts & UI).
export type Product = typeof product.$inferSelect;
export type PosOrder = typeof posOrder.$inferSelect;
export type PosOrderItem = typeof posOrderItem.$inferSelect;
export type CashShift = typeof cashShift.$inferSelect;
