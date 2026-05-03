#!/bin/bash
# =============================================================================
# ORTHONOBA — Zero-downtime Deployment Script
# =============================================================================
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh [production|staging]
#
# Called by:
#   .github/workflows/deploy-production.yml via SSH
#   Manually: ssh deploy@server "cd /opt/orthonoba && ./scripts/deploy.sh"
# =============================================================================
set -euo pipefail

APP_DIR="/opt/orthonoba"
ENV=${1:-production}
COMPOSE_FILE="docker-compose.yml"
HEALTH_URL="http://localhost:3000/api/health"
HEALTH_RETRIES=15
HEALTH_INTERVAL=5

# Color helpers
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
warn()  { echo -e "${YELLOW}[DEPLOY]${NC} $*"; }
error() { echo -e "${RED}[DEPLOY]${NC} $*"; exit 1; }

# Use staging compose override if requested
if [ "$ENV" = "staging" ]; then
  COMPOSE_FILE="docker-compose.yml -f docker-compose.staging.yml"
fi

info "Deploying Orthonoba to $ENV environment..."
echo "  App dir:  $APP_DIR"
echo "  Compose:  $COMPOSE_FILE"
echo "  Commit:   ${GITHUB_SHA:-local}"
echo ""

cd "$APP_DIR"

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
info "Running pre-flight checks..."

command -v docker >/dev/null 2>&1 || error "Docker is not installed"
[ -f ".env" ] || error ".env file not found in $APP_DIR"
docker info >/dev/null 2>&1 || error "Docker daemon is not running"

# ---------------------------------------------------------------------------
# Pull latest image
# ---------------------------------------------------------------------------
info "Pulling latest Docker image..."
# shellcheck disable=SC2086
docker compose -f $COMPOSE_FILE pull app || warn "Pull failed — using local image"

# ---------------------------------------------------------------------------
# Run database migrations (placeholder — wire up when Neon DB is connected)
# ---------------------------------------------------------------------------
# info "Running database migrations..."
# docker compose -f $COMPOSE_FILE run --rm app node scripts/migrate.js

# ---------------------------------------------------------------------------
# Zero-downtime rolling restart of app service only
# ---------------------------------------------------------------------------
info "Starting rolling restart of app service..."
# shellcheck disable=SC2086
docker compose -f $COMPOSE_FILE up -d --no-deps --build app

# ---------------------------------------------------------------------------
# Health check — wait for the app to become ready
# ---------------------------------------------------------------------------
info "Waiting for health check at $HEALTH_URL..."

for i in $(seq 1 $HEALTH_RETRIES); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    info "App healthy! (check $i/$HEALTH_RETRIES, HTTP $HTTP_CODE)"
    break
  fi

  if [ "$i" = "$HEALTH_RETRIES" ]; then
    error "App failed health check after $HEALTH_RETRIES attempts (last status: HTTP $HTTP_CODE)"
  fi

  warn "Not ready yet (HTTP $HTTP_CODE) — waiting ${HEALTH_INTERVAL}s... ($i/$HEALTH_RETRIES)"
  sleep $HEALTH_INTERVAL
done

# ---------------------------------------------------------------------------
# Prune old/dangling images to free disk space
# ---------------------------------------------------------------------------
info "Pruning unused Docker images..."
docker image prune -f
DISK_FREE=$(df -h / | awk 'NR==2 {print $4}')
info "Disk space free: $DISK_FREE"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo "  Environment: $ENV"
echo "  Timestamp:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  Commit:      ${GITHUB_SHA:-local}"
info "Deployment successful"
