// Dynamic OG image (SVG) based on ?title= query param
exports.handler = async (event) => {
  const title = (event.queryStringParameters && event.queryStringParameters.title) || 'Ausgreek Developments';
  const subtitle = (event.queryStringParameters && event.queryStringParameters.subtitle) || 'Custom Software & Web Solutions';
  const safe = (s) => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs>' +
    '<rect width="1200" height="630" fill="url(#g)"/>' +
    '<text x="80" y="260" font-family="Space Grotesk, sans-serif" font-size="64" font-weight="700" fill="#ffffff">' + safe(title) + '</text>' +
    '<text x="80" y="340" font-family="Inter, sans-serif" font-size="32" fill="#cbd5e1">' + safe(subtitle) + '</text>' +
    '<text x="80" y="560" font-family="Inter, sans-serif" font-size="24" fill="#94a3b8">ausgreek-developments.netlify.app</text>' +
    '</svg>';
  return { statusCode: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }, body: svg };
};