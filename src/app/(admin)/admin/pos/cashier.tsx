"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Trash2,
  ScanLine,
  X,
  Printer,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";
import { rupiah } from "@/lib/utils";
import { createSaleAction } from "./actions";

type ProductLite = {
  id: string;
  name: string;
  category: "FNB" | "RETAIL" | "RENTAL" | "SERVICE";
  price: number;
  barcode: string | null;
  trackStock: boolean;
  stock: number;
};

type CartItem = { product: ProductLite; qty: number };

type Pay = "CASH" | "QRIS" | "TRANSFER";

const CATEGORY_LABEL: Record<ProductLite["category"], string> = {
  FNB: "F&B",
  RETAIL: "Pro-shop",
  RENTAL: "Sewa Alat",
  SERVICE: "Jasa",
};

const PAY_LABEL: Record<Pay, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
};

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

type BookingOption = { id: string; label: string };

export function Cashier({
  products,
  taxPercent,
  bookings,
}: {
  products: ProductLite[];
  taxPercent: number;
  bookings: BookingOption[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cat, setCat] = useState<"ALL" | ProductLite["category"]>("ALL");
  const [query, setQuery] = useState("");
  const [discount, setDiscount] = useState("");
  const [pay, setPay] = useState<Pay>("CASH");
  const [customerName, setCustomerName] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [tendered, setTendered] = useState("");
  const [lastSale, setLastSale] = useState<{
    code: string;
    total: number;
    change?: number;
  } | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  // --- Transaksi ditahan (park) — localStorage ---
  type Held = {
    id: string;
    label: string;
    savedAt: number;
    lines: { productId: string; qty: number }[];
    discount: string;
    customerName: string;
  };
  const [held, setHeld] = useState<Held[]>([]);
  const [showHeld, setShowHeld] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pos_held");
      if (raw) setHeld(JSON.parse(raw) as Held[]);
    } catch {
      // abaikan localStorage rusak
    }
  }, []);

  function persistHeld(list: Held[]) {
    setHeld(list);
    try {
      localStorage.setItem("pos_held", JSON.stringify(list));
    } catch {
      // storage penuh / private mode — abaikan
    }
  }

  function holdCart() {
    if (!cart.length) return;
    const entry: Held = {
      id: `${cart.length}-${cart.reduce((s, c) => s + c.qty, 0)}-${held.length}`,
      label:
        customerName.trim() ||
        `${cart.length} item · ${rupiah(
          cart.reduce((s, c) => s + c.product.price * c.qty, 0),
        )}`,
      savedAt: Date.now(),
      lines: cart.map((c) => ({ productId: c.product.id, qty: c.qty })),
      discount,
      customerName,
    };
    persistHeld([entry, ...held]);
    setCart([]);
    setDiscount("");
    setCustomerName("");
    toast.success("Transaksi ditahan");
  }

  function resumeHold(h: Held) {
    const items: CartItem[] = [];
    let missing = 0;
    for (const l of h.lines) {
      const p = products.find((x) => x.id === l.productId);
      if (p) items.push({ product: p, qty: l.qty });
      else missing++;
    }
    setCart(items);
    setDiscount(h.discount);
    setCustomerName(h.customerName);
    persistHeld(held.filter((x) => x.id !== h.id));
    setShowHeld(false);
    if (missing > 0) toast.warning(`${missing} produk sudah tak tersedia, dilewati`);
  }

  function deleteHold(id: string) {
    persistHeld(held.filter((x) => x.id !== id));
  }

  // Kategori yang benar-benar ada produknya.
  const cats = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return (["FNB", "RETAIL", "RENTAL", "SERVICE"] as const).filter((c) =>
      set.has(c),
    );
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "ALL" || p.category === cat) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          (p.barcode ?? "").toLowerCase().includes(q)),
    );
  }, [products, cat, query]);

  function stockLeft(p: ProductLite) {
    if (!p.trackStock) return Infinity;
    const inCart = cart.find((c) => c.product.id === p.id)?.qty ?? 0;
    return p.stock - inCart;
  }

  function add(p: ProductLite) {
    if (stockLeft(p) <= 0) {
      toast.error(`Stok ${p.name} habis.`);
      return;
    }
    setCart((prev) => {
      const ex = prev.find((c) => c.product.id === p.id);
      if (ex)
        return prev.map((c) =>
          c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c,
        );
      return [...prev, { product: p, qty: 1 }];
    });
  }

  function setQty(id: string, qty: number) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((c) => c.product.id !== id)
        : prev.map((c) => (c.product.id === id ? { ...c, qty } : c)),
    );
  }

  function onScan(e: React.FormEvent) {
    e.preventDefault();
    const code = query.trim();
    if (!code) return;
    const hit = products.find((p) => p.barcode && p.barcode === code);
    if (hit) {
      add(hit);
      setQuery("");
    } else {
      toast.error("Barcode tak cocok produk apa pun.");
    }
    scanRef.current?.focus();
  }

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const tax = Math.round(((subtotal - disc) * taxPercent) / 100);
  const total = subtotal - disc + tax;

  const tenderedNum = Number(tendered) || 0;
  const change = tenderedNum - total;

  // Tombol "Bayar": tunai → buka modal uang diterima; non-tunai → langsung.
  function onPay() {
    if (!cart.length) return;
    if (pay === "CASH") {
      setTendered("");
      setPayOpen(true);
    } else {
      void checkout();
    }
  }

  async function checkout(changeVal?: number) {
    if (!cart.length) return;
    setBusy(true);
    const res = await createSaleAction({
      items: cart.map((c) => ({ productId: c.product.id, qty: c.qty })),
      discount: disc,
      paymentMethod: pay,
      customerName,
      ...(bookingId ? { bookingId, bookingType: "court" } : {}),
      ...(pay === "CASH" && tenderedNum > 0 ? { cashReceived: tenderedNum } : {}),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Gagal");
      return;
    }
    toast.success(`Transaksi ${res.code} berhasil`);
    setLastSale({
      code: res.code!,
      total: res.total ?? total,
      change: changeVal,
    });
    setCart([]);
    setDiscount("");
    setCustomerName("");
    setPay("CASH");
    setBookingId("");
    setTendered("");
    setPayOpen(false);
    router.refresh();
  }

  // Saran nominal uang cepat: pas, lalu pecahan umum di atas total.
  const quickCash = (() => {
    const set = new Set<number>([total]);
    for (const d of [5000, 10000, 20000, 50000, 100000]) {
      set.add(Math.ceil(total / d) * d);
    }
    return [...set].filter((n) => n >= total).sort((a, b) => a - b).slice(0, 5);
  })();

  return (
    <div className="space-y-4">
      {/* Banner sukses + cetak struk */}
      {lastSale ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="text-sm font-medium">
              Transaksi <strong>{lastSale.code}</strong> berhasil ·{" "}
              {rupiah(lastSale.total)}
              {lastSale.change != null && lastSale.change > 0 ? (
                <>
                  {" "}
                  · Kembalian{" "}
                  <strong>{rupiah(lastSale.change)}</strong>
                </>
              ) : null}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/pos/struk/${lastSale.code}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-fg"
            >
              <Printer className="size-4" /> Cetak Struk
            </Link>
            <button
              type="button"
              onClick={() => setLastSale(null)}
              className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-cream/40"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        {/* Katalog */}
        <div className="space-y-3">
        <form onSubmit={onScan} className="relative">
          <ScanLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            ref={scanRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk atau scan barcode…"
            className={`${inputClass} pl-9`}
            autoComplete="off"
          />
        </form>

        {held.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowHeld(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            <PauseCircle className="size-4" /> Transaksi ditahan ({held.length})
          </button>
        ) : null}

        {/* Tab kategori */}
        <div className="flex flex-wrap gap-2">
          <CatChip active={cat === "ALL"} onClick={() => setCat("ALL")}>
            Semua
          </CatChip>
          {cats.map((c) => (
            <CatChip key={c} active={cat === c} onClick={() => setCat(c)}>
              {CATEGORY_LABEL[c]}
            </CatChip>
          ))}
        </div>

        {/* Grid produk — tombol besar (touch) */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => {
            const left = stockLeft(p);
            const out = left <= 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p)}
                disabled={out}
                className="flex min-h-[84px] flex-col justify-between rounded-xl border bg-card p-3 text-left transition active:scale-95 hover:border-brand/40 disabled:opacity-40"
              >
                <span className="line-clamp-2 text-sm font-medium leading-tight">
                  {p.name}
                </span>
                <span className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand">
                    {rupiah(p.price)}
                  </span>
                  {p.trackStock ? (
                    <span className="text-[11px] text-muted">
                      {out ? "habis" : `${left}`}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
          {visible.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted">
              Tak ada produk cocok.
            </p>
          ) : null}
        </div>
      </div>

      {/* Keranjang */}
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Keranjang</h2>
            {cart.length > 0 ? (
              <button
                type="button"
                onClick={() => setCart([])}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-600"
              >
                <X className="size-3.5" /> Kosongkan
              </button>
            ) : null}
          </div>

          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Tap produk untuk menambah.
            </p>
          ) : (
            <ul className="space-y-2">
              {cart.map((c) => (
                <li
                  key={c.product.id}
                  className="flex items-center gap-2 rounded-lg border bg-white p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {c.product.name}
                    </p>
                    <p className="text-xs text-muted">
                      {rupiah(c.product.price)} × {c.qty} ={" "}
                      {rupiah(c.product.price * c.qty)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBtn onClick={() => setQty(c.product.id, c.qty - 1)}>
                      <Minus className="size-4" />
                    </IconBtn>
                    <span className="w-6 text-center text-sm font-semibold">
                      {c.qty}
                    </span>
                    <IconBtn
                      onClick={() => add(c.product)}
                      disabled={stockLeft(c.product) <= 0}
                    >
                      <Plus className="size-4" />
                    </IconBtn>
                    <IconBtn onClick={() => setQty(c.product.id, 0)}>
                      <Trash2 className="size-4 text-red-600" />
                    </IconBtn>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Diskon + pelanggan */}
          <div className="mt-3 space-y-2">
            <label className="block">
              <span className="text-xs font-medium text-muted">Diskon (Rp)</span>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">
                Nama pelanggan (opsional)
              </span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
              />
            </label>
            {bookings.length > 0 ? (
              <label className="block">
                <span className="text-xs font-medium text-muted">
                  Tempel ke booking lapangan (opsional)
                </span>
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Walk-in (tanpa booking) —</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {/* Metode bayar */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["CASH", "QRIS", "TRANSFER"] as Pay[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPay(m)}
                className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                  pay === m
                    ? "border-brand bg-brand/10 text-brand"
                    : "hover:bg-cream/40"
                }`}
              >
                {PAY_LABEL[m]}
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="mt-3 space-y-1 border-t pt-3 text-sm">
            <Row label="Subtotal" value={rupiah(subtotal)} />
            {disc > 0 ? <Row label="Diskon" value={`- ${rupiah(disc)}`} /> : null}
            {taxPercent > 0 ? (
              <Row label={`Pajak ${taxPercent}%`} value={rupiah(tax)} />
            ) : null}
            <div className="flex items-center justify-between pt-1 text-base font-bold">
              <span>Total</span>
              <span className="text-brand">{rupiah(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onPay}
            disabled={busy || cart.length === 0}
            className="mt-3 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-brand-fg transition active:scale-[0.99] disabled:opacity-50"
          >
            {busy ? "Memproses…" : `Bayar ${rupiah(total)}`}
          </button>
          <button
            type="button"
            onClick={holdCart}
            disabled={cart.length === 0}
            className="mt-2 w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-cream/40 disabled:opacity-40"
          >
            Tahan transaksi
          </button>
        </div>
      </div>
      </div>

      {/* Modal transaksi ditahan */}
      {showHeld ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Transaksi Ditahan</h3>
              <button
                type="button"
                onClick={() => setShowHeld(false)}
                className="rounded-lg p-1 text-muted hover:bg-cream/40"
              >
                <X className="size-5" />
              </button>
            </div>
            {held.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Tidak ada.</p>
            ) : (
              <ul className="space-y-2">
                {held.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.label}</p>
                      <p className="text-xs text-muted">
                        {h.lines.reduce((s, l) => s + l.qty, 0)} item
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => resumeHold(h)}
                        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg"
                      >
                        Lanjutkan
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHold(h.id)}
                        className="rounded-lg border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {/* Modal bayar tunai — uang diterima + kembalian (untuk kasir non-teknis) */}
      {payOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl border bg-card p-5 shadow-xl sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pembayaran Tunai</h3>
              <button
                type="button"
                onClick={() => setPayOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-cream/40"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-cream/40 px-4 py-3">
              <span className="text-sm text-muted">Total tagihan</span>
              <span className="text-xl font-bold text-brand">{rupiah(total)}</span>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-medium text-muted">Uang diterima</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                autoFocus
                placeholder="0"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-3 text-lg font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            {/* Tombol nominal cepat */}
            <div className="mt-2 flex flex-wrap gap-2">
              {quickCash.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTendered(String(n))}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-cream/40"
                >
                  {n === total ? "Uang pas" : rupiah(n)}
                </button>
              ))}
            </div>

            {/* Kembalian */}
            <div className="mt-4 flex items-center justify-between rounded-xl border px-4 py-3">
              <span className="text-sm font-medium">Kembalian</span>
              <span
                className={`text-xl font-bold ${
                  tenderedNum === 0
                    ? "text-muted"
                    : change < 0
                      ? "text-red-600"
                      : "text-green-600"
                }`}
              >
                {tenderedNum === 0
                  ? "—"
                  : change < 0
                    ? `Kurang ${rupiah(-change)}`
                    : rupiah(change)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => checkout(change)}
              disabled={busy || tenderedNum < total}
              className="mt-4 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-brand-fg transition active:scale-[0.99] disabled:opacity-50"
            >
              {busy ? "Memproses…" : "Selesaikan Pembayaran"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active ? "border-brand bg-brand text-brand-fg" : "hover:bg-cream/40"
      }`}
    >
      {children}
    </button>
  );
}

function IconBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-lg border bg-white transition active:scale-90 hover:bg-cream/40 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
