#!/usr/bin/env bash
# Deploy exactly what's committed (git HEAD) to Netlify production.
# Keeps untracked/ignored files (opencode config, etc.) off the live site —
# netlify-cli 26 no longer honours .netlifyignore/.gitignore for deploys.
set -euo pipefail
cd "$(dirname "$0")"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree not clean — commit first, then deploy." >&2
  exit 1
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git archive -o "$tmp/site.tar" HEAD
tar -xf "$tmp/site.tar" -C "$tmp"

netlify deploy --dir="$tmp" --prod
