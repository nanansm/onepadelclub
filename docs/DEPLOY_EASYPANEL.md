# Deploy One Padel Club ke Easypanel

Panduan deploy `onepadel.motekreatif.com`. Tujuan: jalan stabil, tidak nyangkut,
dan setelah live **semua konten bisa diatur operator non-teknis dari `/admin`**
tanpa sentuh kode.

> Catatan model: 1 app + 1 Postgres terpisah. Tanpa Redis/worker. Port internal **3007**.

---

## 0. Ringkasan arsitektur anti-stuck (sudah terpasang)

| Pola | Lokasi | Fungsi |
|---|---|---|
| Singleton pool Postgres (`max:10`) | `src/db/index.ts` | tak bikin koneksi baru tiap request |
| Self-ping `/api/health` tiap 45s + global error handler | `instrumentation.ts` | cegah idle-freeze, log crash |
| Bootstrap admin+venue saat boot (idempotent) | `src/lib/bootstrap.ts` | operator tak perlu run command |
| Healthcheck cek DB beneran | `src/app/api/health/route.ts` | Easypanel tahu kalau DB down |
| Error/loading boundary publik + admin | `src/app/error.tsx`, `loading.tsx`, `(admin)/*` | 1 error = card, bukan layar putih |
| Migration idempotent saat boot | `scripts/migrate-prod.mjs` (`npm start`) | schema auto-update |
| Middleware scoped `/admin` saja | `src/middleware.ts` | asset statis tak kena redirect |
| Polling (live score, availability, hold) | komponen client | tanpa websocket |

---

## 1. Buat service Postgres

Easypanel → project → **+ Service → Postgres**.
- Nama: `onepadel-db`
- Postgres 16
- Catat host internal, user, password, db. Connection string internal:
  `postgresql://<user>:<pass>@onepadel-db:5432/<db>`

## 2. Buat app service dari Git + Dockerfile

Easypanel → **+ Service → App**.
- Source: repo Git ini, branch `main`
- Build: **Dockerfile** (sudah ada di root, multi-stage node:20-slim)
- Port container: **3007**

## 3. Environment variables (set di tab Environment app)

**Wajib:**
```
DATABASE_URL=postgresql://<user>:<pass>@onepadel-db:5432/<db>
BETTER_AUTH_SECRET=<random 32+ char>          # generate: openssl rand -base64 32
BETTER_AUTH_URL=https://onepadel.motekreatif.com
NEXT_PUBLIC_SITE_URL=https://onepadel.motekreatif.com
ADMIN_EMAILS=motekreatif@gmail.com
```

**Bootstrap admin pertama (dibaca sekali saat boot, idempotent):**
```
SEED_ADMIN_EMAIL=motekreatif@gmail.com
SEED_ADMIN_PASSWORD=<password kuat>
SEED_ADMIN_NAME=Admin One Padel
```
Saat container boot, kalau user belum ada → akun `super_admin` dibuat otomatis.
Sudah ada → dilewati. **Tidak perlu run command apa pun.**

**Cron (auto-batal booking PENDING terbengkalai):**
```
CRON_SECRET=<random string>
```

**R2 — WAJIB di prod biar foto upload tidak hilang saat redeploy:**
```
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_BUCKET_NAME=onepadel
```
> Tanpa R2, upload jatuh ke `public/uploads` di filesystem container yang
> **terhapus tiap redeploy**. Gambar disajikan same-origin via `/api/img/<key>`
> (bucket privat), jadi **tidak perlu** ubah `next.config` / domain image.

**Opsional (notifikasi email juga bisa diisi dari UI `/admin/settings`):**
```
NOTIFY_EMAIL=motekreatif@gmail.com
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASSWORD= SMTP_SECURE= SMTP_FROM_EMAIL= SMTP_FROM_NAME=
```

## 4. Domain + HTTPS

Easypanel → app → **Domains** → tambah `onepadel.motekreatif.com` → target port **3007** → aktifkan HTTPS (Let's Encrypt).
Di DNS `motekreatif.com`: tambah record **A/CNAME** `onepadel` → IP/host server Easypanel.

## 5. Deploy

Klik **Deploy**. Saat boot otomatis: `migrate-prod` (apply schema) → `next start`.
`instrumentation` jalankan bootstrap (venue + admin). Cek **Logs**: cari
`[migrate] selesai` dan `[bootstrap] super_admin dibuat`.

## 6. Cron expire-bookings (WAJIB)

Tanpa ini, slot booking yang belum dibayar terkunci selamanya.
Easypanel **Cron / Scheduled task** (atau cron eksternal), tiap 5 menit:
```
curl -s "https://onepadel.motekreatif.com/api/cron/expire-bookings?secret=<CRON_SECRET>"
```
Lama hold diatur operator di `/admin/settings` (default 30 menit).

## 7. Verifikasi pasca-deploy

- [ ] `https://onepadel.motekreatif.com/api/health` → `{"ok":true,"db":"up"}`
- [ ] Landing tampil (court, fasilitas, galeri)
- [ ] Login `/login` pakai SEED_ADMIN_EMAIL/PASSWORD → masuk `/admin`
- [ ] `/admin/courts` bisa tambah lapangan (venue row sudah ada via bootstrap)
- [ ] Upload logo di `/admin/settings`, redeploy, cek logo **masih ada** (bukti R2 jalan)
- [ ] Cron jalan (log endpoint atau slot PENDING lama jadi CANCELLED)

---

## 8. Yang bisa diatur operator non-teknis (di `/admin`)

Tanpa kode: identitas & kontak, jam buka, info pembayaran (bank/QRIS), copy hero &
liga, kartu "Cara Main", aturan Liga, **fasilitas**, **galeri foto**, branding
(logo/hero/warna), SEO, durasi booking, notifikasi email (SMTP). Plus CRUD penuh:
lapangan, open play, coaching, membership, liga, booking.

## 9. Catatan operasional / risiko

- **Migration gagal = container tak boot** (exit 1). Schema additive-only untuk
  meminimalkan. Selalu test migration di staging dulu kalau ada perubahan kolom.
- **Backup DB**: aktifkan backup terjadwal di service `onepadel-db`.
- **Ganti domain nanti** (mis. domain final): cukup ubah `BETTER_AUTH_URL` +
  `NEXT_PUBLIC_SITE_URL` + domain Easypanel, redeploy.
- **Reset password admin**: belum ada flow UI; sementara via DB / re-bootstrap.
