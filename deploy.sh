#!/usr/bin/env bash
set -Eeuo pipefail

APP_PORT="${1:-3001}"
APP_DIR="/home/appuser/music-interval-training"
COMPOSE_BIN="podman-compose"
COMPOSE_FILE="docker-compose.yml"

cd "$APP_DIR"

PREV_HASH=$(git rev-parse --short HEAD)

echo "[1/7] Fetch latest code"
git fetch --all --prune

echo "[2/7] Reset to origin/main"
git reset --hard origin/main

export BIND_HOST=127.0.0.1
export APP_PORT
export COMMIT_HASH=$(git rev-parse --short HEAD)

echo "[3/7] Stop and remove old containers"
$COMPOSE_BIN -f "$COMPOSE_FILE" down || true

echo "[4/7] Rebuild and restart containers (${COMMIT_HASH})"
$COMPOSE_BIN -f "$COMPOSE_FILE" up -d --build

echo "[5/7] Health check"
curl --fail --silent --show-error "http://localhost:${APP_PORT}" >/dev/null

echo "[6/7] Tag deployed commit"
TAG="prod-$(date +%Y%m%d-%H%M%S)"
git tag "$TAG" "$COMMIT_HASH"
echo "  Tagged ${COMMIT_HASH} as ${TAG}"

echo "[7/7] Cleanup old images"
podman image prune -f

echo "Deploy done: ${PREV_HASH} -> ${COMMIT_HASH}"
