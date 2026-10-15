#!/usr/bin/env bash
# Vercel's "Ignored Build Step" (ignoreCommand in vercel.json): decides, before
# each build, whether the push gets deployed. Exit 1 = build, exit 0 = skip.
#
# Production (main) always builds; previews only for feature/*, chore/* and bugfix/*,
# so other branches don't create deployments or Neon database branches.
branch="${VERCEL_GIT_COMMIT_REF:-}"

if [ "${VERCEL_ENV:-}" = production ]; then
  echo "✓ Production: building."
  exit 1
fi

case "$branch" in
  feature/* | chore/* | bugfix/*)
    echo "✓ Preview for $branch: building."
    exit 1
    ;;
  *)
    echo "· Skipping $branch: previews are only built for feature/*, chore/* and bugfix/*."
    exit 0
    ;;
esac
