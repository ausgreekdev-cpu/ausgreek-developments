#!/usr/bin/env bash
# Pre-deploy checklist — run before ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"
echo "=== Pre-deploy checks ==="

# 1. Clean working tree
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working tree not clean. Commit or stash changes first."
  exit 1
fi
echo "✅ Working tree clean"

# 2. SW version bump check (warn if HTML changed but sw.js didn't)
if git diff HEAD~1 --name-only 2>/dev/null | grep -q '\.html$'; then
  if ! git diff HEAD~1 --name-only 2>/dev/null | grep -q 'sw.js'; then
    echo "⚠️  HTML changed but sw.js VERSION not bumped. Consider bumping."
  else
    echo "✅ SW version bumped"
  fi
fi

# 3. CSP hash check (verify inline scripts have matching hashes)
echo "Checking CSP hashes..."
python3 - <<'PY'
import hashlib, pathlib, re, base64
# Extract hashes from netlify.toml
toml = pathlib.Path('netlify.toml').read_text()
listed = set(re.findall(r"sha256-[A-Za-z0-9+/=]+", toml))
# Compute current hashes from HTML
files = ['index.html','portfolio/krystal.html','portfolio/hd-mechanic.html','portfolio/lux.html',
         'blog/posts/why-fast-sites-win.html','blog/posts/from-spreadsheets-to-portal.html',
         'blog/posts/lean-mvp-roadmap.html','blog/posts/offline-first-mobile-apps.html',
         'blog/posts/ai-agents-vs-chatbots.html','blog/posts/fixed-price-vs-hourly.html',
         'blog/posts/custom-vs-off-the-shelf.html','blog/posts/offline-first-field-teams.html',
         'mining.html','artisans.html','startups.html','blog/index.html']
missing = []
for f in files:
    t = pathlib.Path(f).read_text()
    for b in re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', t, re.S):
        h = 'sha256-' + base64.b64encode(hashlib.sha256(b.encode()).digest()).decode()
        if h not in listed:
            missing.append((f, h))
    if f == 'blog/index.html':
        for b in re.findall(r'<script>(.*?)</script>', t, re.S):
            h = 'sha256-' + base64.b64encode(hashlib.sha256(b.encode()).digest()).decode()
            if h not in listed:
                missing.append((f, h))
# analytics inline script in index.html
t = pathlib.Path('index.html').read_text()
for b in re.findall(r'<script>\s*(.*?)\s*</script>', t, re.S):
    h = 'sha256-' + base64.b64encode(hashlib.sha256(b.encode()).digest()).decode()
    if h not in listed:
        missing.append(('index.html (inline)', h))
if missing:
    print("⚠️  Missing CSP hashes:")
    for f, h in missing:
        print(f"   {f}: {h}")
else:
    print("✅ All inline script hashes present in CSP")
PY

echo "=== Checks complete ==="