# PRD — Liga Padel Kota Intan Web App

**Versi:** 1.0 · **Status:** Draft · **Platform:** Web (mobile-first) · **Season I — 2025**
Disusun oleh Panitia Liga Padel Kota Intan. Dokumen internal, living document.

**Skala:** 4 kategori · 2 jenjang liga · 8 tim/liga · 28 match/kategori.

---

## 01 — Ringkasan & Tujuan

Web app = pusat informasi + manajemen Liga Padel Kota Intan. Publik lihat klasemen, jadwal, live score, profil tim. Admin kelola semua data dari satu dashboard.

Liga = **4 kategori** (Upper Beginner Pria/Wanita & Bronze Pria/Wanita). Tiap kategori punya **Liga 1 & Liga 2**, masing-masing **8 tim**, format **round robin**, promosi-degradasi **bulanan**.

**Sasaran utama:**
- Transparansi klasemen real-time (tanpa hubungi panitia).
- Jadwal match mudah diakses dari smartphone.
- Profil tim & pemain dengan foto — bangun identitas/komunitas.
- Input skor admin → klasemen auto-update.
- Hall of Fame + riwayat juara = arsip permanen.

## 02 — Pengguna & Peran

| Peran | Akses | Kebutuhan utama |
|---|---|---|
| Pengunjung publik | Baca semua halaman publik | Cek klasemen & match hari ini |
| Pemain terdaftar | Publik + profil pribadi | Statistik diri, jadwal tim |
| Kapten tim | Konfirmasi kehadiran | Hadir/tidak hadir sebelum match |
| Admin panitia | Full CRUD data liga | Input skor, kelola jadwal/tim/pemain |
| Super admin | Admin + konfig sistem | Kelola season, kategori, aturan |

> Catatan: login pemain/kapten = **out of scope v1**. Hanya admin login di v1.

## 03 — Data Model

| Entitas | Atribut |
|---|---|
| **Season** | id · nama · tahun · bulan · status · tanggal_mulai · tanggal_selesai |
| **Kategori** | id · nama · gender · level · hari_liga1 · hari_liga2 |
| **Liga** | id · season_id · kategori_id · jenjang (1/2) · status |
| **Tim** | id · nama · logo_url · warna_hex · kapten_id · liga_id · deposit_wo_status |
| **Pemain** | id · nama · foto_url · tim_id · posisi (inti/cadangan) · no_hp |
| **Match** | id · liga_id · tim_a_id · tim_b_id · jadwal · court · status · skor_a · skor_b |
| **Game** | id · match_id · urutan · pemenang (A/B) · catatan |
| **Klasemen** | tim_id · main · menang · kalah · wo · game_menang · game_kalah · selisih · poin |
| **Hall of Fame** | id · season_id · kategori_id · tim_id · award · foto_url · catatan |

**Relasi kunci:** Tim → Liga → Kategori → Season. Satu Match → banyak Game.
Tiap Game selesai → **trigger auto-update tabel Klasemen** (database function/trigger Supabase).

## 04 — Halaman & Fitur

| ID | Halaman | Isi |
|---|---|---|
| P-01 | Beranda/Dashboard | Match malam ini, klasemen mini 4 kategori, highlight tim teratas, status liga aktif |
| P-02 | Klasemen | Tab per kategori, toggle Liga 1/2. Kolom: Main, M, K, Poin, GM, GK, +/-. Tiebreaker auto |
| P-03 | Jadwal & Hasil | Filter kategori/minggu/tim. Status: akan datang, berlangsung, selesai + skor |
| P-04 | Live Score | Polling 15 detik. Court, waktu berjalan, skor game-demi-game per match aktif |
| P-05 | Profil Tim | Logo, warna, daftar pemain + foto, statistik season, riwayat 5 match terakhir |
| P-06 | Profil Pemain | Foto, nama, posisi, statistik: total match, win rate, game menang, kategori |
| P-07 | Hall of Fame | Arsip juara per season/kategori. Award: Champion, MVP, Best Pair, Fair Play, Best Identity |
| P-08 | Regulasi Liga | Sistem skor, aturan WO & keterlambatan, promosi-degradasi, T&C |
| P-09 | Admin — Input Skor | Pilih match, input game-per-game, submit → klasemen auto-update. Edit dalam 24 jam |
| P-10 | Admin — Kelola Tim & Pemain | CRUD tim/pemain, upload logo/foto, atur posisi inti/cadangan, kelola roster |
| P-11 | Admin — Jadwal Generator | Auto-generate round robin 8 tim (28 match), assign slot waktu & court, edit manual |
| P-12 | Admin — Manajemen Season | Buka/tutup season, eksekusi promosi-degradasi, kelola deposit WO, buat season baru |

## 05 — Contoh Data Tim (Seed)

| Kategori | Jenjang | Hari pertandingan | Total tim |
|---|---|---|---|
| Upper Beginner Pria | Liga 1 & 2 | Rabu (L1) / Senin (L2) | 8 + 8 = 16 |
| Upper Beginner Wanita | Liga 1 & 2 | Kamis (L1) / Selasa (L2) | 8 + 8 = 16 |
| Bronze Pria | Liga 1 & 2 | Rabu (L1) / Senin (L2) | 8 + 8 = 16 |
| Bronze Wanita | Liga 1 & 2 | Kamis (L1) / Selasa (L2) | 8 + 8 = 16 |

**Roster contoh — Upper Beginner Pria (Liga 1):** 8 tim, nama Alpha–Hotel.

| Tim | Pemain inti | Cadangan |
|---|---|---|
| Alpha | Andi R. & Budi S. | Cika D. & Dani F. |
| Bravo | Eko P. & Fajar M. | Gilang H. & Hendra I. |
| Charlie | Ivan K. & Joko L. | Kevin M. & Leo N. |
| Delta | Mario T. & Nanda W. | Oscar P. & Pandu Q. |
| Echo | Raka S. & Surya N. | Taufik U. & Udin V. |
| Foxtrot | Vino H. & Wahyu P. | Xander Y. & Yudi Z. |
| Golf | Zaki M. & Agus R. | Bagas S. & Candra T. |
| Hotel | Dewa K. & Eka F. | Fandi G. & Galih H. |

Kategori lain pakai pola nama sama (Alpha–Hotel), pemain berbeda.

**Foto:** avatar lingkaran. Dev = placeholder `ui-avatars.com` / `dicebear.com` (param nama). Production = Supabase Storage.

## 06 — Aturan Bisnis Kritis

| Aturan | Logika |
|---|---|
| **Penghitungan poin** | Menang = +3, Kalah = 0, WO = -1. Auto-update tiap skor disubmit via DB trigger |
| **Tiebreaker** | (1) head-to-head, (2) selisih game, (3) game menang, (4) WO paling sedikit, (5) sudden death playoff 10 menit |
| **WO & keterlambatan** | Telat 1–5 mnt: lawan +1 game. >5 mnt: lawan +2 game. >10 mnt: WO. WO ke-2: diskualifikasi season |
| **Promosi-degradasi** | Akhir season: rank 7–8 Liga 1 → turun ke Liga 2; rank 1–2 Liga 2 → naik ke Liga 1. Tombol 'Finalisasi Season' |
| **Hall of Fame lock** | Juara 3× berturut di kategori sama → masuk HoF + diblokir 1 season dari kategori itu |
| **Roster lock** | Setelah jadwal rilis, ubah roster hanya via admin, maks 1 orang/bulan |
| **Lock edit skor** | Skor diubah admin maks 24 jam pasca match. Lebih dari itu perlu approval super admin |
| **Deposit WO** | Rp100.000/tim, refund penuh akhir season jika tim tak pernah WO |

## 07 — Prioritas Fitur

**Must have (v1):**
- Klasemen otomatis — core, tanpa ini app tak berguna
- Input skor admin — trigger semua kalkulasi
- Jadwal match per kategori — mobile-friendly
- Profil tim + pemain (foto) — pembeda vs spreadsheet
- Admin dashboard (login) — auth sederhana, no OAuth v1
- Live score (polling 15 dtk) — no websocket v1
- Jadwal generator round robin — 28 match dari 8 tim
- Hall of Fame — arsip juara

**Should have:**
- Statistik pemain (win rate, game menang, konsistensi hadir)
- Promosi-degradasi otomatis (1 klik)
- Notifikasi WhatsApp (reminder ke kapten)
- Konfirmasi kehadiran kapten

**Nice to have (v2+):**
- Gallery foto/highlight + share Instagram
- PWA / installable
- Realtime score (websocket / Supabase Realtime)

## 08 — Rekomendasi Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR + SSG satu framework, optimal SEO klasemen |
| UI | Tailwind CSS + shadcn/ui | Konsisten, cepat, mudah kustomisasi |
| Tabel data | TanStack Table v8 | Sort & filter klasemen sisi klien cepat |
| State & fetching | SWR + polling | Cukup untuk live score v1, no websocket |
| Database | Supabase (PostgreSQL) | Free tier cukup; auth + storage + realtime built-in |
| Auth | Supabase Auth | Mudah setup, ada RLS untuk peran admin |
| File storage | Supabase Storage | Upload foto/logo, URL publik otomatis |
| Deploy | Vercel | Native ke Next.js, CI/CD dari GitHub |
| Foto placeholder | ui-avatars / dicebear | Dev awal sebelum foto nyata |
| Realtime (v2) | Supabase Realtime | Upgrade live score tanpa ganti stack |

> Supabase dipilih: free tier cukup skala liga lokal (500MB storage, 2GB bandwidth/bln), auth + RLS bawaan, upgrade ke realtime tanpa ganti stack.

## 09 — Milestone Pengembangan

| Minggu | Milestone | Deliverable |
|---|---|---|
| 1 | Setup & Data Model | Init Next.js + Supabase, buat semua tabel, seed 8 tim × 4 kategori + pemain placeholder |
| 2 | Halaman Publik Core | P-01 Beranda, P-02 Klasemen, P-03 Jadwal, P-05 Profil Tim, P-06 Profil Pemain (mobile-first) |
| 3 | Admin Dashboard | Login admin, P-09 input skor + auto-klasemen, P-10 kelola tim + upload foto, P-12 manajemen season |
| 4 | Live Score & Generator | P-04 live score (polling), P-11 jadwal generator, P-07 Hall of Fame, P-08 Regulasi |
| 5 | QA, Polish & Launch | Test edge case (WO, tie, promosi-degradasi), responsif mobile, soft launch Season I |

## 10 — Out of Scope (v1)

- Login pemain/kapten (hanya admin v1)
- Pembayaran registrasi online (manual transfer bank)
- Streaming video live match
- Mobile native app (iOS/Android) — web mobile-first cukup
- Integrasi auto-posting Instagram
- Multi-kota / franchise liga
- Bracket turnamen single/double elimination
- Sistem ELO / rating pemain lintas season
