#!/usr/bin/env bash
# Backup Postgres Padel Club -> file gzip. Jalankan via cron / Easypanel
# Scheduled Task harian. Upload hasilnya ke R2/offsite (lihat catatan bawah).
#
#   DATABASE_URL=postgresql://... ./scripts/backup.sh /path/to/backups
#
set -euo pipefail

OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$OUT_DIR/onepadel-$STAMP.sql.gz"

: "${DATABASE_URL:?set DATABASE_URL}"

pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip -9 > "$FILE"
echo "backup: $FILE ($(du -h "$FILE" | cut -f1))"

# Simpan 14 backup terbaru, hapus sisanya.
ls -1t "$OUT_DIR"/onepadel-*.sql.gz | tail -n +15 | xargs -r rm -f

# Catatan: untuk offsite, pipe ke R2:
#   aws s3 cp "$FILE" s3://onepadelclub/backups/ --endpoint-url "$R2_ENDPOINT"
