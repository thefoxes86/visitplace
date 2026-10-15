#!/usr/bin/env bash
# Build on Vercel (`vercel-build` in package.json): first bring the deployment's
# database up to date, then build the site.
#
# - Preview: the Neon integration gives each preview its own branch of the
#   database, so migrations there never touch production.
# - Production: migrates the production branch.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${VERCEL_ENV:-}" = preview ] || [ "${VERCEL_ENV:-}" = production ]; then
  # Migrations want a direct connection, not the pooled one the site uses.
  url="${DATABASE_URL_UNPOOLED:-${DATABASE_URL:-}}"
  if [ -z "$url" ]; then
    echo "✗ No DATABASE_URL for this $VERCEL_ENV deployment: is the Neon database connected to it?" >&2
    exit 1
  fi
  echo "→ Migrating the $VERCEL_ENV database ($(printf '%s' "$url" | sed -E 's#^[^@]*@([^/?:]+).*#\1#'))"
  DATABASE_URL="$url" npx drizzle-kit migrate
  # Initial places, only into an empty table (a fresh branch).
  DATABASE_URL="$url" node scripts/seed.ts
fi

npx vite build
