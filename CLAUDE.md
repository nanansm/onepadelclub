# CLAUDE.md — One Padel Club

Web app **One Padel Club**: landing + booking lapangan (4 skema) **dan** Liga Padel Kota Intan. Satu app, satu DB, satu klub (bukan multitenant). Spec liga di [`PRD_Liga_Padel_Kota_Intan.md`](./PRD_Liga_Padel_Kota_Intan.md). Rencana build di [`BUILD_PLAN.md`](./BUILD_PLAN.md). Baca keduanya sebelum kerja.

## Stack (kanonik Nanan — sama seperti mote-team, proven di Easypanel)
Next.js 15 (App Router) · TypeScript strict · Drizzle ORM · **PostgreSQL 16** (schema `onepadel`) · better-auth **email/password** (BUKAN Google) · Tailwind v4 · shadcn/ui (style base-nova, `@base-ui/react` — komponen pakai prop `render`, BUKAN `asChild`) · file upload Cloudflare R2 (private bucket + proxy `/api/r2/<key>`, mock mode ke `public/uploads` kalau env kosong). **Tanpa Redis/worker.**

Deploy: Easypanel, source git + **Dockerfile** (node:20-slim multi-stage). App port **3005**. DB = service Postgres terpisah (`onepadel-db`). Migration jalan saat boot via `start` = `node scripts/migrate-prod.mjs && next start -p 3005`.

## Anti-stuck / anti-lemot (WAJIB — permintaan eksplisit Nanan)
Pola ini diadopsi dari mote-team yang sudah teruji:
- **Singleton Postgres pool** di `src/db/index.ts` — jangan bikin koneksi baru per-request.
- `instrumentation.ts` — global error handler + self-ping `/api/health` tiap 45s (cegah cold idle).
- Semua fetch eksternal: **timeout (≤8s) + cache**, dibungkus `safe()` — 1 service mati tak blank seluruh halaman.
- Error boundaries: `error.tsx` + `loading.tsx` per route group + `global-error.tsx`. 1 throw = card recoverable, bukan layar putih.
- Query agregat (klasemen, dashboard) = **SQL aggregate / server-computed**, BUKAN fetch-all-rows. Index kolom yang difilter.
- Middleware matcher WAJIB exclude static (`.*\\..*`) — kalau tidak, asset `/brand/*.png` ke-redirect 307.
- Live score & availability = **polling** (15s), bukan websocket (v1).

## Timezone
SEMUA date-logic lewat `src/lib/tz.ts` (WIB `Asia/Jakarta`). JANGAN `new Date().toISOString().slice(0,10)` buat "hari ini" — server UTC, geser 7 jam. Pakai `todayJakarta()`/`ymdOffset()`/`jakartaParts()`. `new Date()` buat `createdAt/updatedAt` (instant) OK.

## Auth & akses
- Email/password via better-auth. Tanpa Google OAuth.
- Role `admin` / `super_admin` di `user` (better-auth additionalFields). Gate admin: `requireAdmin()`. Bootstrap: `ADMIN_EMAILS` env + `npm run seed:admin`.
- **Customer booking TANPA login** (guest checkout) — cuma nama + no WA. Login cuma buat admin/panitia.

## Brand
Logo di `public/brand/` (`logo-transparent.png`, `logo-white.png`, `logo-black.png` — sudah dibuat). Warna brand: hijau tua `#1a4d33`, aksen oranye `#d97721`, cream `#dfe8d0`. `next/image` `unoptimized` buat logo.

## Aturan kerja
- Kerjakan **bertahap per fase** (lihat BUILD_PLAN.md). Selesai → user test → lanjut. Jangan lompat fase.
- **JANGAN push** ke GitHub tanpa konfirmasi eksplisit Nanan. Berhenti di lokal.
- Schema **additive only** — jangan modify/drop kolom existing tanpa izin.
- Semua delete di UI wajib dialog konfirmasi.
- Quality gate tiap fase: `npm run typecheck` · `npm run build` · `npm run lint` · `npm run dev` jalan · cek responsive mobile (390px).

## Perintah
- `npm run dev` — port 3005
- `npm run typecheck` / `lint` / `build`
- `npm run db:generate` — generate migration dari schema (offline)
- `npm run db:migrate` / `db:push` — butuh `DATABASE_URL`
- `npm run seed:admin` / `npm run db:seed`

## Ports
- Web app: **3005** (dev + prod internal). Easypanel expose via Traefik.
- Dev DB: **5434** (docker-compose host→container 5432). Prod pakai `onepadel-db` Easypanel.

## Bahasa
Default Bahasa Indonesia. Istilah teknis pakai Inggris yang umum.
