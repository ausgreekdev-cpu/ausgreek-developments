// Dynamic sitemap generator
const PAGES = [
  { url: '/', priority: '1.0', changefreq: 'monthly' },
  { url: '/blog/', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms.html', priority: '0.3', changefreq: 'yearly' },
  { url: '/portfolio/krystal.html', priority: '0.7', changefreq: 'monthly' },
  { url: '/portfolio/hd-mechanic.html', priority: '0.7', changefreq: 'monthly' },
  { url: '/portfolio/lux.html', priority: '0.7', changefreq: 'monthly' },
  { url: '/blog/posts/why-fast-sites-win.html', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog/posts/from-spreadsheets-to-portal.html', priority: '0.6', changefreq: 'monthly' },
];
exports.handler = async () => {
  const base = process.env.URL || 'https://ausgreek-developments.netlify.app';
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map(p =>
    '  <url>\n    <loc>' + base.replace(/\/$/, '') + p.url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>' + p.changefreq + '</changefreq>\n    <priority>' + p.priority + '</priority>\n  </url>'
  ).join('\n');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>';
  return { statusCode: 200, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }, body: xml };
};