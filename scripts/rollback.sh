#!/bin/bash
# =============================================================================
# ORTHONOBA — Rollback Script
# =============================================================================
# Usage:
#   chmod +x scripts/rollback.sh
#   ./scripts/rollback.sh                   # auto-detect previous image
#   ./scripts/rollback.sh <git-sha-or-tag>  # rollback to specific tag
#
# How it works:
#   1. Finds the second-most-recent orthonoba-app image (the previous deploy)
#   2. Tags it as :latest
#   3. Restarts the app container with the previous image
#   4. Validates health
# =============================================================================
set -euo pipefail

APP_DIR="/opt/orthonoba"
HEALTH_URL="http://localhost:3000/api/health"
HEALTH_RETRIES=10
HEALTH_INTERVAL=5
TARGET_TAG="${1:-}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[ROLLBACK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[ROLLBACK]${NC} $*"; }
error() { echo -e "${RED}[ROLLBACK]${NC} $*"; exit 1; }

cd "$APP_DIR"

# ---------------------------------------------------------------------------
# Determine target image
# ---------------------------------------------------------------------------
if [ -n "$TARGET_TAG" ]; then
  # Explicit tag provided (e.g., a git SHA)
  PREVIOUS_IMAGE="$TARGET_TAG"
  info "Rolling back to explicitly specified tag: $TARGET_TAG"
else
  # Auto-detect: the second most recent orthonoba-app image
  PREVIOUS_IMAGE=$(docker images orthonoba-app --format "{{.Tag}}" | grep -v "latest" | head -n 2 | tail -n 1)

  if [ -z "$PREVIOUS_IMAGE" ]; then
    # Fallback: second entry including latest
    PREVIOUS_IMAGE=$(docker images orthonoba-app --format "{{.Tag}}" | sed -n '2p')
  fi
fi

if [ -z "$PREVIOUS_IMAGE" ]; then
  error "No previous image found. Cannot rollback."
fi

info "Target rollback image: orthonoba-app:$PREVIOUS_IMAGE"

# Safety confirmation for non-CI environments
if [ -t 0 ]; then
  echo ""
  warn "Current images:"
  docker images orthonoba-app --format "table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
  echo ""
  read -rp "Confirm rollback to orthonoba-app:$PREVIOUS_IMAGE? [y/N] " CONFIRM
  [[ "$CONFIRM" =~ ^[Yy]$ ]] || { info "Rollback cancelled."; exit 0; }
fi

# ---------------------------------------------------------------------------
# Tag previous image as latest and restart
# ---------------------------------------------------------------------------
info "Tagging orthonoba-app:$PREVIOUS_IMAGE as latest..."
docker tag "orthonoba-app:$PREVIOUS_IMAGE" orthonoba-app:latest

info "Restarting app container with previous image..."
docker compose up -d --no-deps app

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
info "Waiting for health check..."

for i in $(seq 1 $HEALTH_RETRIES); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    info "App healthy after rollback! (check $i/$HEALTH_RETRIES)"
    break
  fi

  if [ "$i" = "$HEALTH_RETRIES" ]; then
    error "App unhealthy after rollback (HTTP $HTTP_CODE). Manual intervention required."
  fi

  warn "Not ready yet (HTTP $HTTP_CODE) — waiting ${HEALTH_INTERVAL}s... ($i/$HEALTH_RETRIES)"
  sleep $HEALTH_INTERVAL
done

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Rollback Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo "  Rolled back to: orthonoba-app:$PREVIOUS_IMAGE"
echo "  Timestamp:      $(date -u +%Y-%m-%dT%H:%M:%SZ)"
info "Rollback successful. Investigate the failed deployment before re-deploying."
