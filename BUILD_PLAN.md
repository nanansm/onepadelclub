# BUILD PLAN — One Padel Club

Satu app Next.js: **booking (4 skema)** + **Liga Padel Kota Intan**. Stack & konvensi di [`CLAUDE.md`](./CLAUDE.md). Referensi pola booking dipelajari dari repo `RafiulM/padel-mythos` (guest checkout, anti double-booking, bayar manual QRIS/transfer, public slug page) — di-port ke stack Postgres+Drizzle Nanan.

---

## Arsitektur data (Postgres schema `onepadel`)

### Auth (better-auth)
`user` (+ role admin/super_admin) · `session` · `account` · `verification`.

### Klub & lapangan
- **`venue`** — 1 klub: id, name, slug, address, whatsapp, open_hour, close_hour, bank_name, bank_number, bank_holder, qris_url, payment_notes.
- **`court`** — id, venue_id, name, type (Indoor/Outdoor), price_per_hour.
- **`court_reservation`** (ledger okupansi terpusat) — court_id, date, start_hour, duration, source (RENTAL/OPEN_PLAY/COACHING), ref_id, status. **Semua skema yang pakai lapangan nulis ke sini** → cek anti-bentrok cukup 1 query ke tabel ini. Index `(court_id, date)`.

### Booking — 4 skema
1. **Sewa lapangan / `court_booking`** — code, court_id, customer_name, customer_wa, date, start_hour, duration, total_price, status, notes. (Pola padel-mythos.)
2. **Open Play / Mabar** — `open_play_session` (venue_id, court_id?, title, level, date, start_hour, duration, max_players, price_per_player, status) + `open_play_registration` (session_id, customer_name, customer_wa, status). Kuota peserta, daftar per-kursi.
3. **Coaching / Klinik** — `coach` (name, photo_url (R2), bio, rate_per_hour, active) + `coaching_booking` (coach_id, court_id?, customer_name, customer_wa, date, start_hour, duration, total_price, status, notes).
4. **Membership** — `membership_plan` (name, price, duration_days, quota_sessions?, benefits, active) + `membership` (plan_id, customer_name, customer_wa, start_date, end_date, status).

Status enum bersama: `PENDING / PAID / CANCELLED / COMPLETED`. Bayar manual (transfer/QRIS), admin konfirmasi → slot terkunci.

### Liga (dari PRD — Supabase diganti Drizzle/Postgres)
`season` · `category` (kategori) · `league` (liga, jenjang 1/2) · `team` (tim) · `player` (pemain) · `match` · `game` · `standings` (klasemen) · `hall_of_fame`.
- **Auto-klasemen** = server-computed dalam **transaksi** saat admin submit skor (bukan DB trigger Supabase). Recompute baris `standings` tim terkait dari `game`/`match`. Pola "server-computed aggregate" mote-team.
- Poin: M +3, K 0, WO −1. Tiebreaker 5 level (H2H → selisih game → game menang → WO sedikit → playoff). Promosi/degradasi tombol "Finalisasi Season".
- Foto tim/pemain → R2 (dev: ui-avatars/dicebear placeholder).

---

## Routing

**Publik (tanpa login):**
- `/` — landing: hero + logo, 4 kartu skema booking, teaser liga (klasemen mini + match malam ini), CTA WhatsApp.
- `/sewa` — sewa lapangan: pilih court → tanggal → slot jam hijau → form (nama/WA/durasi) → invoice + QRIS.
- `/open-play` — list sesi mabar + daftar.
- `/coaching` — list pelatih + booking sesi.
- `/membership` — paket member + daftar.
- `/booking/[code]` — halaman invoice/status booking (share ke WA).
- `/liga` — hub liga; sub: `/liga/klasemen` (P-02), `/liga/jadwal` (P-03), `/liga/live` (P-04, polling 15s), `/liga/tim/[id]` (P-05), `/liga/pemain/[id]` (P-06), `/liga/hall-of-fame` (P-07), `/liga/regulasi` (P-08).

**Admin (protected `(admin)`, better-auth):**
- `/admin` — dashboard (booking masuk + match hari ini).
- `/admin/bookings` — kalender semua skema, konfirmasi pembayaran.
- `/admin/courts` · `/admin/open-play` · `/admin/coaching` · `/admin/membership` · `/admin/payments` (QRIS/rekening).
- Liga: `/admin/liga/skor` (P-09 input skor + auto-klasemen) · `/admin/liga/tim` (P-10) · `/admin/liga/jadwal` (P-11 generator round-robin) · `/admin/liga/season` (P-12 + promosi/degradasi).

---

## Fase pengerjaan (bertahap, test tiap fase)

| Fase | Isi | Deliverable / gate |
|---|---|---|
| **0 — Scaffold** | Next 15 + TS strict + Drizzle + Postgres 16 + better-auth + Tailwind v4/shadcn. Dockerfile + docker-compose dev (PG :5434) + scripts migrate-prod/seed-admin. `instrumentation.ts` health self-ping, singleton pool, `tz.ts`, error/loading boundaries, middleware. Brand logo + tema warna. | `dev` jalan di :3005, `/api/health` 200, login admin bisa. |
| **1 — Landing + Sewa Lapangan** | Landing page (hero, 4 kartu, teaser liga, mobile-first). Court rental: availability real-time, guest checkout, invoice + QRIS, anti double-booking via `court_reservation`. Admin: kalender + konfirmasi. | **MVP launchable.** Booking court end-to-end + admin confirm. |
| **2 — 3 Skema lain** | Open Play (+registrasi/kuota), Coaching (+coach CRUD, foto R2), Membership (+plan CRUD). Admin tiap skema. Semua nulis okupansi ke `court_reservation`. | 4 skema jalan + admin. |
| **3 — Liga publik** | Schema liga + seed 8 tim × 4 kategori (PRD §5). Halaman: klasemen, jadwal, live (polling), profil tim, profil pemain, hall of fame, regulasi. Mobile-first. | Liga publik tampil dari seed. |
| **4 — Liga admin** | Input skor + auto-klasemen (transaksi). Tim/pemain CRUD + upload foto. Jadwal generator round-robin (8 tim → 28 match). Season mgmt + promosi/degradasi 1 klik. Tiebreaker + aturan WO/telat. | Admin liga penuh, edge case WO/tie diuji. |
| **5 — QA & Deploy** | Edge case (WO ke-2 diskualifikasi, tie, promosi/degradasi, double-booking lintas skema). Responsive 390px. Deploy Easypanel: project `onepadel` + `onepadel-db` (postgres:16) + app dari git/Dockerfile, env, domain, scheduled task kalau perlu reminder. | Live di Easypanel. |

**Catatan urutan:** Fase 1 (landing + sewa) = prioritas pertama sesuai permintaan. Liga (fase 3-4) menyusul. Fase 0 fondasi wajib duluan.

---

## Keputusan yang sudah final
- Stack = kanonik Nanan (mote-team), bukan Supabase. Liga auto-klasemen → server-computed transaksi. Foto → R2. Live score → polling.
- Satu klub (drop multitenant padel-mythos — tanpa layer `tenant`).
- 4 skema booking: sewa per jam, open play/mabar, coaching, membership.
- Deploy Easypanel (Postgres terpisah, app git+Dockerfile, port 3005).

## Masih perlu konfirmasi sebelum Fase 0
- Nama domain target (mis. `onepadelclub.com` / subdomain).
- Repo GitHub: bikin baru `nanansm/onepadelclub`? (jangan push tanpa izin).
- Detail klub real: nama venue, jumlah court + harga/jam, jam operasional, rekening/QRIS — atau pakai dummy dulu.
