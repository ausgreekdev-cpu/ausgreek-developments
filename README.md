# Ausgreek Developments — Website

Static marketing site for **Ausgreek Developments** (custom software, web & app development).

**Live:** <https://ausgreek-developments.netlify.app>

## Stack
- HTML5 + CSS3 + Vanilla JS — no build step
- Netlify Forms (contact form with optional file attachment)
- PWA service worker (`sw.js`) — network-first pages, cached assets, offline fallback
- SEO: sitemap, OG/twitter cards, JSON-LD (ProfessionalService, FAQPage, Organization, BlogPosting, BreadcrumbList)

## Local Development
```bash
python3 -m http.server 8000
# or
npx serve .
```
Open http://localhost:8000

Contact form shows a demo-mode message on localhost; on the live site it posts to Netlify Forms.

## Deploy

Use **`./deploy.sh`** (commit first — it refuses a dirty tree):

```bash
git add -A && git commit -m "..."
./deploy.sh
```

It deploys exactly the committed tree (`git archive HEAD`) to production via
Netlify CLI. This is deliberate: netlify-cli 26 no longer honours
`.netlifyignore`/`.gitignore` for deploys, so a plain `netlify deploy --dir=.`
would upload local files such as `opencode.json`. Don't deploy any other way.

Netlify runs a Lighthouse audit on each deploy (see build output).

## Edit Content
- `index.html` — homepage copy, services, portfolio, pricing, contact form
- `portfolio/*.html` — case studies (one file per client)
- `blog/index.html` + `blog/posts/*.html` — blog posts
- `css/style.css` — colours via CSS variables at the top (`--navy`, `--gold`, `--blue`)
- `js/main.js` — nav, contact form, lazy Calendly loader
- Contact email `ausgreekdev@gmail.com` appears in `index.html` and `js/main.js`

## Calendly
The booking widget is **lazy-loaded**: `index.html` holds a placeholder
(`#calendlyEmbed`), and `js/main.js` injects Calendly's script only when the
visitor clicks "Show calendar". Keep it that way — eagerly embedding the
widget dropped Lighthouse Performance from 96 to 51.

## Contact Form
Netlify Forms, no backend. Submissions (including attachments) appear in
Netlify Dashboard → Forms. Add a notification email in Netlify → Forms → Settings.
Fields: name, email, service, message, optional attachment (pdf/png/jpg/doc).

## PWA / service worker
`sw.js` caches pages (network-first) and static assets (stale-while-revalidate).
**Bump `const VERSION` in `sw.js` whenever you change pages or assets** so
returning visitors pick up the new version and old caches get purged.

## Structure
```
index.html          homepage
404.html            not-found
thanks.html         form success page
privacy.html        privacy policy
terms.html          terms
blog/               blog index + posts/
portfolio/          case studies
assets/             images (og-image.jpg, icons), icon.svg
css/ js/            styles + behaviour
sw.js               service worker
sitemap.xml         all public URLs
deploy.sh           production deploy (see above)
```

## Security headers / CSP maintenance
`netlify.toml` sets security headers for all routes. `Content-Security-Policy-Report-Only` is currently enabled (not enforcing) so you can check browser console for violations after deploy — especially when clicking **Show calendar** (Calendly). Once clean, rename the header to `Content-Security-Policy` to enforce.

**Important:** inline `<script>` / JSON-LD blocks on site pages are allowed by SHA-256 hashes in the CSP. If you edit any inline script or `application/ld+json` block (or add a new one), recompute its hash and update `netlify.toml`, otherwise the script will be reported/blocked. External scripts (`js/main.js`, Calendly) are allowed by source.

Recompute all inline script hashes (outputs `sha256-...` values for the `script-src` list):
```bash
python3 - <<'PY'
import hashlib, pathlib, re, base64
files=['index.html','portfolio/krystal.html','portfolio/hd-mechanic.html','portfolio/lux.html',
 'blog/posts/why-fast-sites-win.html','blog/posts/from-spreadsheets-to-portal.html','blog/index.html']
for f in files:
    t=pathlib.Path(f).read_text()
    for b in re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>',t,re.S):
        print(f, 'sha256-'+base64.b64encode(hashlib.sha256(b.encode()).digest()).decode())
    if f=='blog/index.html':
        for b in re.findall(r'<script>(.*?)</script>',t,re.S):
            print(f, 'sha256-'+base64.b64encode(hashlib.sha256(b.encode()).digest()).decode())
PY
```
