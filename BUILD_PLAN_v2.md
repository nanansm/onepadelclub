# BUILD PLAN v2 — Padel by Mote (white-label product)

Pivot dari **One Padel Club** (proyek 1 klien) → **produk white-label** yang bisa dijual ulang ke owner court padel lain (target market: Bandung, Garut, Sumedang). Domain produk: `padel.motekreati.com`. Repo: `padel-mote`.

Stack & konvensi tetap di [`CLAUDE.md`](./CLAUDE.md). Fondasi yang sudah jadi (booking 4 skema + liga) di [`BUILD_PLAN.md`](./BUILD_PLAN.md) — v2 ini **menambah** di atasnya, additive only.

> **Prinsip produk:** semua identitas & konfigurasi klien diatur lewat **UI `/admin/settings`**, bukan hardcode. Klien baru = ganti di UI (nama, logo, warna, kontak, rekening, modul on/off). Zero edit codebase per klien.

---

## Keputusan final (sesi 2026-06-21)

1. **Payment dual-mode.** Default **transfer manual + bukti via WA**. Field `venue.paymentMode` (`MANUAL` | `GATEWAY` | `BOTH`). Gateway (Midtrans/Xendit) disiapkan **scaffold + webhook route (dummy, nonaktif)** — tinggal isi API key di Setting untuk aktif nanti. Integrasi penuh = tunda.
2. **Laporan keuangan terpadu.** Gabung revenue booking + POS dalam satu laporan.
3. **Notifikasi WA via Evolution API** (self-hosted di Easypanel Nanan). Setting admin: `evoBaseUrl`, `evoInstance`, `evoApiKey` + toggle. Helper `sendWa()`.
4. **Liga = modul opsional** (`venue.ligaEnabled`, default OFF). OFF → menu admin + halaman publik liga disembunyikan. Nilai-plus, bukan beban. Owner kolaborasi komunitas setempat.
5. **POS = modul DI DALAM app yang sama** (bukan integrasi pihak ketiga). Termasuk **tempel POS ke booking** (tab lapangan) di v1.
6. **White-label 100% UI-driven.** Hapus semua hardcode identitas dari `bootstrap.ts`.

---

## A. White-label & parametrize (hapus hardcode)

**Masalah sekarang:** `src/lib/bootstrap.ts` paksa 1 venue `"One Padel Club"` + slug `"one-padel-club"`. Semua query `getVenue()` ambil `.limit(1)` (sudah OK untuk single-tenant per-deploy).

**Strategi tenant: single-tenant per-deploy.** 1 klien = 1 deploy Easypanel + 1 DB + 1 subdomain. **Tidak** bikin multitenant routing (over-engineering untuk <10 klien). Isolasi penuh per klien, aman, cepat jual.

**Kerjaan:**
- Seed venue awal di `bootstrap.ts` → ambil dari env `VENUE_NAME` / `VENUE_SLUG` (fallback netral `"Padel Club"`), bukan hardcode "One Padel Club".
- Brand default → netral (bukan hijau One Padel). Warna/logo wajib di-set klien via Setting.
- Tambah field venue: `paymentMode`, `ligaEnabled`, `taxPercent`, `posEnabled`, Evolution WA (`evoBaseUrl`, `evoInstance`, `evoApiKey`, `waEnabled`), gateway (`gatewayProvider`, `gatewayServerKey`, `gatewayClientKey` — nullable, nonaktif).
- `/admin/settings`: tambah seksi **Modul** (toggle Liga, POS, WA, Payment mode) + seksi **Integrasi** (Evolution, gateway keys, password-type input).

---

## B. Modul WA (Evolution API)

- Helper `src/lib/wa.ts` → `sendWa({to, text})` POST ke `${evoBaseUrl}/message/sendText/${evoInstance}` header `apikey: evoApiKey`. Bungkus `safe()` + timeout ≤8s, fire-and-forget.
- Trigger: booking dibuat (instruksi bayar), pembayaran dikonfirmasi admin, reminder H-1 (lazy/manual dulu, cron tunda).
- `waEnabled` off → no-op. Nomor customer dari `customerWa` (normalisasi `08` → `628`).
- Template di `src/lib/wa-templates.ts` (bisa di-edit owner nanti, v2).

---

## C. Payment dual-mode

- `venue.paymentMode`: `MANUAL` (default) tampilkan rekening/QRIS + tombol "Kirim bukti ke WA". `GATEWAY` tampilkan tombol bayar online. `BOTH` kasih pilihan.
- Scaffold gateway: route `src/app/api/payment/webhook/route.ts` (verifikasi signature + update status PAID) — **stub, return 200, belum dipakai**. Helper `createPaymentSession()` placeholder.
- Aktivasi nanti: isi `gatewayServerKey` di Setting → `paymentMode` = `GATEWAY`/`BOTH`. Tanpa refactor.

---

## D. POS Kasir (modul `/admin/pos`)

**Hardware = zero-driver, browser-native.** Cetak struk via `window.print()` + CSS 58/80mm (printer thermal jadi default printer OS, atau RawBT Bluetooth di Android). Scan barcode = HID keyboard → field input fokus. Cash-drawer kick = tunda v2. Target device: tablet Android / PC di meja kasir. App jadi **PWA installable**.

### Data model (additive, schema `onepadel`)
```
product           id, venueId, category(FNB|RETAIL|RENTAL|SERVICE), name, sku, barcode,
                  price, cost, trackStock(bool), stock, active, imageUrl, sortOrder
pos_order         id, venueId, code, cashierId, bookingId(nullable), bookingType(nullable),
                  customerName?, subtotal, discount, tax, total,
                  paymentMethod(CASH|QRIS|TRANSFER|GATEWAY), status(OPEN|PAID|VOID), createdAt
pos_order_item    id, orderId, productId, nameSnapshot, priceSnapshot, qty, lineTotal
stock_movement    id, productId, type(SALE|RESTOCK|ADJUST), qty, ref, note, createdAt
cash_shift        id, venueId, cashierId, openedAt, openingCash,
                  closedAt, closingCash, expectedCash, diff
```
- `bookingId` nullable → kunci tab lapangan (tempel F&B ke booking). Index `(venueId, createdAt)`, `(bookingId)`.
- `cost` → laba kotor di laporan. `nameSnapshot`/`priceSnapshot` → struk lama tetap valid kalau harga produk berubah.

### Fitur
- Layar kasir: katalog (grid + tab kategori) → cart → qty → diskon → pilih bayar → cetak/share struk WA.
- Field scan barcode auto-add.
- Inventory: stok turun saat jual, alert menipis, entri restock, cost untuk margin.
- Shift kasir: buka (saldo awal) → tutup (hitung selisih cash). Z-report.
- **Tempel ke booking**: dari `/admin/bookings` buka tab court → tambah produk → bayar court+F&B sekaligus.
- Pajak opsional `venue.taxPercent` (PB1/PPN), default 0.

---

## E. Laporan keuangan terpadu (`/admin/laporan`)

- Revenue total = booking (4 skema) + POS. Breakdown per kategori, per periode (hari/bulan).
- Laba kotor = revenue − cost (POS). Z-report kasir per shift.
- Query = **SQL aggregate server-computed** (bukan fetch-all-rows), index kolom tanggal. Export CSV/Excel.

---

## Fase pengerjaan (semua dikerjakan, tetap bertahap — test tiap fase)

| Fase | Isi | Gate |
|---|---|---|
| **V2-0 — Rebrand & parametrize** | Hapus hardcode `bootstrap.ts` → env. Brand default netral. Tambah field venue (modul toggle + integrasi). Seksi Modul + Integrasi di `/admin/settings`. Rename repo→`padel-mote`, domain `padel.motekreati.com`. | Klien baru bisa full-config dari UI. `typecheck`+`build`+`dev` OK. |
| **V2-1 — Liga toggle** | `venue.ligaEnabled`. Sembunyikan menu admin + route publik liga saat OFF. | OFF = liga tak terlihat; ON = muncul. |
| **V2-2 — WA Evolution** | `src/lib/wa.ts` + setting Evolution. Trigger booking dibuat & dikonfirmasi. Normalisasi nomor. | WA terkirim saat booking (instance aktif). |
| **V2-3 — Payment dual-mode** | `venue.paymentMode`. UI invoice cabang manual/gateway. Webhook stub + helper placeholder. | Manual jalan; gateway scaffold ada, nonaktif. |
| **V2-4 — POS inti** | Product CRUD + kategori + stok. Layar kasir (cart, diskon, bayar). `pos_order`/`item`. | Jual walk-in F&B/retail end-to-end. |
| **V2-5 — POS struk + scan + PWA** | Cetak `window.print` CSS 58/80mm + share WA. Field scan barcode. Manifest PWA installable. | Struk cetak + scan + install ke homescreen. |
| **V2-6 — POS shift + inventory** | Shift buka/tutup/rekonsiliasi. Stock movement + alert + restock. | Z-report + stok akurat. |
| **V2-7 — POS × booking (tab)** | Tempel `pos_order.bookingId` ke booking. Bayar court+F&B sekaligus dari `/admin/bookings`. | Tab lapangan jalan. |
| **V2-8 — Laporan terpadu** | `/admin/laporan`: booking+POS, margin, Z-report, breakdown periode, export CSV. | Owner lihat semua pemasukan 1 halaman. |
| **v3 (tunda)** | ESC/POS raw + cash-drawer, payment gateway aktif penuh, multitenant true (kalau klien >10), WA template editor, reminder cron. | nanti |

---

## Catatan
- **Additive only** — tabel/kolom lama tidak diubah/di-drop (aturan CLAUDE.md).
- Tiap fase: `npm run typecheck` · `build` · `lint` · `dev` jalan · cek mobile 390px (kasir cek tablet ~768px juga).
- **Jangan push tanpa izin Nanan.**
- Rename repo: `git remote set-url` + buat repo `padel-mote` di GitHub (konfirmasi dulu). Domain Easypanel + env `BETTER_AUTH_URL`.
