#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/insightiq}"
cd "$APP_DIR" || { echo "Repository not found at $APP_DIR"; exit 1; }

if [ ! -f .env ]; then
  echo ".env is missing. Copy .env.example to .env and set production values."
  exit 1
fi

set -a
. ./.env
set +a

: "${PRIMARY_DOMAIN:=insightiq.zerotools.online}"
: "${API_DOMAIN:=api.${PRIMARY_DOMAIN}}"

if [ ! -f nginx/certs/origin.crt ] || [ ! -f nginx/certs/origin.key ]; then
  echo "Cloudflare Origin Certificate files are required:"
  echo "  nginx/certs/origin.crt"
  echo "  nginx/certs/origin.key"
  echo "Create a certificate for ${API_DOMAIN} in Cloudflare, then retry."
  exit 1
fi

echo "Building and starting PostgreSQL, NestJS, and Nginx..."
docker compose up -d --build postgres api nginx

echo "Waiting for API startup and migrations..."
attempt=0
until curl --fail --silent --show-error --resolve "${API_DOMAIN}:443:127.0.0.1" "https://${API_DOMAIN}/health" --insecure >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    docker compose logs --tail=100 api nginx
    exit 1
  fi
  sleep 2
done

echo "Initial deployment complete: https://${API_DOMAIN}/health"
