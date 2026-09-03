# Ausgreek Developments — Website

Static marketing site for **Ausgreek Developments** (Software Development).

**Live:** Deploy to Netlify (see below)

## Stack
- HTML5 + CSS3 + Vanilla JS
- No build step — deploys as static site
- Netlify Forms for contact form
- Responsive, SEO-ready

## Local Development
```bash
# Simple server
python3 -m http.server 8000
# or
npx serve .
```
Open http://localhost:8000

## Deploy to Netlify

### Option 1 — Drag & Drop (fastest)
1. Go to https://app.netlify.com/drop
2. Drag the entire `Ausgreek developments` folder
3. Site is live instantly at `*.netlify.app`

### Option 2 — Git + Netlify
1. Push to GitHub
2. Netlify Dashboard → Add new site → Import from Git
3. Build command: (empty)  Publish directory: `.`

### Option 3 — Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.
```

## Edit Content
- `index.html` — all copy, services, portfolio
- `css/style.css` — colours via CSS variables at top (`--navy`, `--gold`, `--blue`)
- Contact email: `ausgreekdev@gmail.com` in `index.html` and `js/main.js`

## Contact Form
Works automatically on Netlify (no backend). Submissions appear in Netlify Dashboard → Forms.
Add notification email in Netlify → Forms → Settings.
