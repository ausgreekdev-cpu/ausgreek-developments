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

# Bundle local dependencies for Netlify Functions (not committed)
if [ -d node_modules ]; then cp -a node_modules "$tmp/node_modules"; fi

# Deploy as draft, then publish (production context may be locked)
DEPLOY_OUTPUT=$(netlify deploy --dir="$tmp" 2>&1)
echo "$DEPLOY_OUTPUT"
DEPLOY_ID=$(echo "$DEPLOY_OUTPUT" | grep -oE 'Deploy ID: [a-f0-9]+' | head -1 | awk '{print $3}')
if [ -z "$DEPLOY_ID" ]; then
  # Try extracting from URL
  DEPLOY_ID=$(echo "$DEPLOY_OUTPUT" | grep -oE '[a-f0-9]{24}' | head -1)
fi
if [ -n "$DEPLOY_ID" ]; then
  echo "Publishing deploy $DEPLOY_ID..."
  netlify api restoreSiteDeploy --data "{\"site_id\":\"4d4b9988-a1c9-4377-ae06-594091af0085\",\"deploy_id\":\"$DEPLOY_ID\"}" > /dev/null 2>&1
  echo "✅ Deployed to production"
else
  echo "❌ Could not extract deploy ID"
  exit 1
fi
