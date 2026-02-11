#!/usr/bin/env bash
set -euo pipefail

# --------------------------------------------------------------------------- #
# test-build.sh — Local Docker build & smoke-test for Frontend after rollout
# --------------------------------------------------------------------------- #
# Usage:
#   ./scripts/test-build.sh              # full build + test
#   ./scripts/test-build.sh --skip-build # retest with existing image
#   ./scripts/test-build.sh --keep       # leave container running after test
# --------------------------------------------------------------------------- #

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Image / container names
IMG="somnia-frontend-test"
CONTAINER="somnia-frontend-test"

# Flags
SKIP_BUILD=false
KEEP=false

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --keep)       KEEP=true ;;
    *)            echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

# ---- Colours --------------------------------------------------------------- #
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }

# ---- Version --------------------------------------------------------------- #
VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version" 2>/dev/null || echo "unknown")
GIT_SHA=$(git -C "$PROJECT_ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown")
info "Project version: $VERSION  commit: $GIT_SHA"

# ---- Cleanup trap ---------------------------------------------------------- #
cleanup() {
  if [ "$KEEP" = true ]; then
    warn "Keeping container running (--keep). Clean up manually:"
    warn "  docker rm -f $CONTAINER"
    return
  fi
  info "Cleaning up..."
  docker rm -f "$CONTAINER" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# ---- Step 1: Build image -------------------------------------------------- #
if [ "$SKIP_BUILD" = false ]; then
  info "Building Docker image ($IMG)..."
  docker build \
    -f "$PROJECT_ROOT/Dockerfile" \
    --build-arg "GIT_COMMIT_SHA=$GIT_SHA" \
    --build-arg "GIT_TAG=" \
    -t "$IMG" \
    "$PROJECT_ROOT"

  if [ $? -eq 0 ]; then
    pass "Docker image built successfully"
  else
    fail "Docker image build failed"
    exit 1
  fi
else
  info "Skipping build (--skip-build)"
  docker image inspect "$IMG" >/dev/null 2>&1 || { fail "Image $IMG not found"; exit 1; }
  pass "Existing image found"
fi

# ---- Step 2: Start container ---------------------------------------------- #
info "Starting frontend container..."

# Remove any previous test container
docker rm -f "$CONTAINER" 2>/dev/null || true

# Minimal env vars required for the frontend to start
docker run -d --name "$CONTAINER" \
  -p 3099:3000 \
  -e "NEXT_PUBLIC_APP_HOST=localhost" \
  -e "NEXT_PUBLIC_APP_PROTOCOL=http" \
  -e "NEXT_PUBLIC_APP_PORT=3099" \
  -e "NEXT_PUBLIC_API_HOST=localhost" \
  -e "NEXT_PUBLIC_API_PROTOCOL=http" \
  -e "NEXT_PUBLIC_API_PORT=3001" \
  -e "NEXT_PUBLIC_NETWORK_NAME=Somnia Testnet" \
  -e "NEXT_PUBLIC_NETWORK_SHORT_NAME=Somnia" \
  -e "NEXT_PUBLIC_NETWORK_ID=50312" \
  -e "NEXT_PUBLIC_NETWORK_CURRENCY_NAME=STT" \
  -e "NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL=STT" \
  -e "NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18" \
  -e "NEXT_PUBLIC_NETWORK_RPC_URL=https://dream-rpc.somnia.network" \
  -e "NEXT_PUBLIC_HOMEPAGE_CHARTS=[\"daily_txs\"]" \
  -e "NEXT_PUBLIC_IS_TESTNET=true" \
  -e "SKIP_ENVS_VALIDATION=true" \
  "$IMG"

# ---- Step 3: Wait for healthy response ------------------------------------ #
info "Waiting for frontend to become available..."
RETRIES=40
READY=false

while [ "$RETRIES" -gt 0 ]; do
  HTTP_CODE=$(curl -sf -o /dev/null -w '%{http_code}' http://localhost:3099/api/healthz 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    READY=true
    break
  fi
  RETRIES=$((RETRIES - 1))
  sleep 3
done

if [ "$READY" = false ]; then
  fail "Frontend did not become available (last HTTP code: $HTTP_CODE)"
  echo ""
  warn "Container logs (last 50 lines):"
  docker logs "$CONTAINER" 2>&1 | tail -50
  exit 1
fi
pass "Frontend is responding on http://localhost:3099"

# ---- Step 4: Smoke-test endpoints ----------------------------------------- #
info "Checking endpoints..."

check_endpoint() {
  local path="$1"
  local expected="${2:-200}"
  local code
  code=$(curl -sf -o /dev/null -w '%{http_code}' "http://localhost:3099${path}" 2>/dev/null || echo "000")
  if [ "$code" = "$expected" ]; then
    pass "GET $path -> $code"
  else
    fail "GET $path -> $code (expected $expected)"
    return 1
  fi
}

ERRORS=0
check_endpoint "/api/healthz"  || ERRORS=$((ERRORS + 1))
check_endpoint "/api/config"   || ERRORS=$((ERRORS + 1))

# Homepage may redirect or return 200/302 depending on config
HOME_CODE=$(curl -sf -o /dev/null -w '%{http_code}' http://localhost:3099/ 2>/dev/null || echo "000")
if [ "$HOME_CODE" = "200" ] || [ "$HOME_CODE" = "302" ] || [ "$HOME_CODE" = "307" ]; then
  pass "GET / -> $HOME_CODE"
else
  fail "GET / -> $HOME_CODE (expected 200, 302, or 307)"
  ERRORS=$((ERRORS + 1))
fi

# ---- Step 5: Check container is still running (no crash) ------------------- #
if docker inspect "$CONTAINER" --format='{{.State.Running}}' 2>/dev/null | grep -q "true"; then
  pass "Container is still running (no crash)"
else
  fail "Container crashed during smoke test"
  docker logs "$CONTAINER" 2>&1 | tail -30
  ERRORS=$((ERRORS + 1))
fi

# ---- Done ----------------------------------------------------------------- #
echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}========================================${NC}"
  echo -e "${RED} $ERRORS check(s) failed${NC}"
  echo -e "${RED}========================================${NC}"
  exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} All checks passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
info "Image: $IMG"
info "Version: $VERSION  Commit: $GIT_SHA"
