#!/bin/bash
# =============================================================================
# ORTHONOBA — PostgreSQL Backup Script
# =============================================================================
# Usage:
#   chmod +x scripts/backup-db.sh
#   ./scripts/backup-db.sh
#
# Cron (daily at 02:00 UTC):
#   0 2 * * * /opt/orthonoba/scripts/backup-db.sh >> /opt/orthonoba/logs/backup.log 2>&1
#
# Required env vars (sourced from /opt/orthonoba/.env):
#   POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD
#
# Optional env vars for S3/Hetzner Object Storage:
#   BACKUP_S3_BUCKET   — bucket name (e.g. orthonoba-backups)
#   AWS_ACCESS_KEY_ID  — Hetzner Object Storage access key
#   AWS_SECRET_ACCESS_KEY
#   AWS_ENDPOINT_URL   — https://fsn1.your-objectstorage.com (Hetzner)
# =============================================================================
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/orthonoba/backups"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-orthonoba-postgres}"

# Source env if not already set
if [ -z "${POSTGRES_USER:-}" ] && [ -f "/opt/orthonoba/.env" ]; then
  # shellcheck disable=SC1091
  set -a && source /opt/orthonoba/.env && set +a
fi

# Validate required variables
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting PostgreSQL backup..."

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/orthonoba_${TIMESTAMP}.pgdump"

# ---------------------------------------------------------------------------
# PostgreSQL dump — custom format with max compression
# ---------------------------------------------------------------------------
echo "Dumping database '$POSTGRES_DB' from container '$CONTAINER_NAME'..."

docker exec "$CONTAINER_NAME" pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-password \
  --format=custom \
  --compress=9 \
  --verbose \
  > "$BACKUP_FILE"

DUMP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "Dump size: $DUMP_SIZE — compressing..."

# ---------------------------------------------------------------------------
# Gzip compression
# ---------------------------------------------------------------------------
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"
FINAL_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "Final backup size: $FINAL_SIZE"

# ---------------------------------------------------------------------------
# Upload to S3-compatible storage (Hetzner Object Storage)
# ---------------------------------------------------------------------------
if [ -n "$S3_BUCKET" ]; then
  echo "Uploading to s3://$S3_BUCKET..."

  # Build AWS CLI endpoint flag for Hetzner (if endpoint URL is set)
  ENDPOINT_FLAG=""
  if [ -n "${AWS_ENDPOINT_URL:-}" ]; then
    ENDPOINT_FLAG="--endpoint-url $AWS_ENDPOINT_URL"
  fi

  aws s3 cp "$BACKUP_FILE" \
    "s3://$S3_BUCKET/backups/$(date +%Y/%m)/$(basename "$BACKUP_FILE")" \
    --storage-class STANDARD_IA \
    $ENDPOINT_FLAG

  echo "Upload complete: s3://$S3_BUCKET/backups/$(date +%Y/%m)/$(basename "$BACKUP_FILE")"
else
  echo "S3_BUCKET not set — skipping remote upload (local backup only)"
fi

# ---------------------------------------------------------------------------
# Cleanup old local backups
# ---------------------------------------------------------------------------
echo "Removing local backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "*.pgdump.gz" -mtime +"$RETENTION_DAYS" -print -delete | wc -l)
echo "Deleted $DELETED old backup(s)"

# ---------------------------------------------------------------------------
# Verify backup integrity
# ---------------------------------------------------------------------------
echo "Verifying backup integrity..."
gunzip -t "$BACKUP_FILE" && echo "Integrity check: OK" || {
  echo "ERROR: Backup file failed integrity check!"
  exit 1
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup complete!"
echo "  File:      $(basename "$BACKUP_FILE")"
echo "  Size:      $FINAL_SIZE"
echo "  Location:  $BACKUP_FILE"
echo "  Retention: $RETENTION_DAYS days"
