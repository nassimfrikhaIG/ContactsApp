#!/bin/bash
set -e

# ==========================================
# ContactHub — Deploy Script
# ==========================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; NC='\033[0m'; BOLD='\033[1m'

info()    { echo -e "${BLUE}ℹ${NC}  $1"; }
success() { echo -e "${GREEN}✅${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️${NC}  $1"; }
error()   { echo -e "${RED}❌${NC} $1"; exit 1; }
header()  { echo -e "\n${BOLD}${BLUE}$1${NC}"; echo "$(printf '=%.0s' {1..50})"; }

header "ContactHub — Production Deploy"

# Prerequisite checks
command -v docker       >/dev/null 2>&1 || error "Docker is not installed"
command -v docker       >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 || error "Docker Compose is not installed"

# Check env file
if [ ! -f "backend/.env.production" ]; then
  warning "backend/.env.production not found — copying from template"
  cp backend/.env.example backend/.env.production
  warning "Please edit backend/.env.production with your production values, then re-run this script."
  exit 1
fi

# Verify JWT secret was changed
JWT_SECRET=$(grep JWT_SECRET backend/.env.production | cut -d= -f2)
if [[ "$JWT_SECRET" == *"CHANGE_THIS"* ]] || [[ "$JWT_SECRET" == *"change_in_production"* ]]; then
  error "Please set a secure JWT_SECRET in backend/.env.production before deploying!"
fi

header "Building & Starting Services"

info "Pulling base images..."
docker compose pull --ignore-pull-failures 2>/dev/null || true

info "Building images..."
docker compose build --no-cache

info "Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

info "Starting services..."
docker compose up -d

header "Waiting for Health Checks"

MAX_WAIT=120
ELAPSED=0

wait_healthy() {
  local name=$1
  info "Waiting for $name..."
  while [ $ELAPSED -lt $MAX_WAIT ]; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "healthy" ]; then
      success "$name is healthy"
      return 0
    fi
    sleep 3; ELAPSED=$((ELAPSED+3))
    echo -n "."
  done
  error "$name did not become healthy in ${MAX_WAIT}s"
}

wait_healthy "contacthub-mongo"
wait_healthy "contacthub-api"
wait_healthy "contacthub-frontend"

header "Deploy Summary"
success "ContactHub is running!"
echo ""
echo "  Frontend:  http://localhost"
echo "  API:       http://localhost/api"
echo "  Health:    http://localhost/api/health"
echo ""
info "Useful commands:"
echo "  docker compose logs -f          # stream logs"
echo "  docker compose logs backend -f  # backend only"
echo "  docker compose ps               # container status"
echo "  docker compose down             # stop all"
