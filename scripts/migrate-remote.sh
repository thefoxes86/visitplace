#!/usr/bin/env bash
# Applies the migrations in drizzle/ to a Neon database of the Vercel project.
#
#   npm run db:migrate:development [-- --seed]
#   npm run db:migrate:production  [-- --seed]
#
# development: the URL comes from .env.development.local (pulled from Vercel if missing).
# production:  Vercel never lets secret values be pulled, so the URL comes from
#              $PRODUCTION_DATABASE_URL or is asked for (Neon console → Connect,
#              connection pooling off). It is never written to disk.
#
# --seed also loads the initial places (only into an empty pois table).
# The local Docker database keeps using `npm run db:migrate`.
set -euo pipefail
cd "$(dirname "$0")/.."

target="${1:-}"
seed=false
for arg in "${@:2}"; do
  case "$arg" in
    --seed) seed=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

# Value of KEY in an env file, without quotes ("" if missing).
env_value() {
  [ -f "$1" ] || return 0
  grep -E "^$2=" "$1" | head -1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/'
}

case "$target" in
  development)
    file=.env.development.local
    url="$(env_value "$file" DATABASE_URL_UNPOOLED)"
    if [ -z "$url" ]; then
      echo "→ $file has no DATABASE_URL_UNPOOLED: pulling it from Vercel…"
      npx vercel env pull "$file" --environment=development --yes
      url="$(env_value "$file" DATABASE_URL_UNPOOLED)"
    fi
    ;;
  production)
    url="${PRODUCTION_DATABASE_URL:-}"
    if [ -z "$url" ]; then
      echo "Neon console → the production branch → Connect, connection pooling OFF."
      read -rsp "Production connection string (hidden): " url
      echo
    fi
    ;;
  *)
    echo "Usage: $0 <development|production> [--seed]" >&2
    exit 1
    ;;
esac

# Accept a pasted `psql '…'` snippet too.
url="$(printf '%s' "$url" | sed -E "s/^psql +//; s/^'(.*)'$/\1/")"

if [ -z "$url" ] || [[ "$url" == *SENSITIVE* ]] || [[ "$url" != postgres* ]]; then
  echo "✗ No valid connection string for $target (it must start with postgresql://)." >&2
  exit 1
fi

host="$(printf '%s' "$url" | sed -E 's#^[^@]*@([^/?:]+).*#\1#')"
if [[ "$host" == localhost* || "$host" == 127.* ]]; then
  echo "✗ $host is the local database: use npm run db:migrate for it." >&2
  exit 1
fi
if [[ "$host" == *-pooler* ]]; then
  echo "✗ $host is a pooled connection: use the direct one (connection pooling off)." >&2
  exit 1
fi

echo "→ Database: $target ($host)"
if [ "$target" = production ]; then
  read -rp "Type 'production' to apply the migrations to it: " answer
  [ "$answer" = production ] || { echo "Cancelled."; exit 1; }
fi

export DATABASE_URL="$url"

echo "→ Migrations"
npx drizzle-kit migrate

if $seed; then
  echo "→ Initial places"
  node scripts/seed.ts
fi

echo "✓ $target is up to date."
echo "  First admin: DATABASE_URL='…' node scripts/create-admin.ts <email> <password> [name]"
