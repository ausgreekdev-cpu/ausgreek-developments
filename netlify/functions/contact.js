// Netlify Function: contact form handler
// Env vars (optional):
//   RESEND_API_KEY  - Resend API key for email sending
//   CONTACT_EMAIL   - destination email (default ausgreekdev@gmail.com)
//   RECAPTCHA_SECRET - Google reCAPTCHA secret (optional)
//   SITE_URL        - site base URL for forwarding to Netlify Forms (optional)
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const buckets = new Map();

function rateLimit(ip) {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now - b.start > RATE_LIMIT.windowMs) {
    b = { start: now, count: 0 };
    buckets.set(ip, b);
  }
  b.count++;
  return b.count <= RATE_LIMIT.max;
}

function json(status, body) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

async function sendEmail(apiKey, to, subject, html, replyTo) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Ausgreek Developments <onboarding@resend.dev>', to: [to], subject, html, reply_to: replyTo }),
  });
  return res.ok;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // Parse form data
  let fields = {};
  const ct = event.headers['content-type'] || '';
  if (ct.includes('application/json')) {
    try { fields = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Bad JSON' }); }
  } else {
    const params = new URLSearchParams(event.body || '');
    for (const [k, v] of params) fields[k] = v;
  }

  // Honeypot
  if (fields['bot-field']) {
    return json(200, { ok: true });
  }

  const name = (fields.name || '').trim();
  const email = (fields.email || '').trim();
  const service = (fields.service || '').trim();
  const message = (fields.message || '').trim();
  if (!name || !email || !message) return json(400, { error: 'Missing required fields' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'Invalid email' });

  // Rate limit
  const ip = (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!rateLimit(ip)) return json(429, { error: 'Too many requests. Try again later.' });

  // Optional reCAPTCHA
  const secret = process.env.RECAPTCHA_SECRET;
  if (secret && fields['g-recaptcha-response']) {
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'secret=' + encodeURIComponent(secret) + '&response=' + encodeURIComponent(fields['g-recaptcha-response']),
    });
    const data = await r.json();
    if (!data.success) return json(400, { error: 'reCAPTCHA failed' });
  }

  const to = process.env.CONTACT_EMAIL || 'ausgreekdev@gmail.com';
  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.URL || process.env.SITE_URL || '';

  // Send notification + auto-responder if API key present
  if (apiKey) {
    const html = '<h2>New contact submission</h2>' +
      '<p><strong>Name:</strong> ' + name + '</p>' +
      '<p><strong>Email:</strong> ' + email + '</p>' +
      '<p><strong>Service:</strong> ' + service + '</p>' +
      '<p><strong>Message:</strong><br>' + message.replace(/\n/g, '<br>') + '</p>';
    await sendEmail(apiKey, to, 'New contact: ' + name, html, email).catch(() => {});

    const auto = '<p>Hi ' + name + ',</p><p>Thanks for reaching out to Ausgreek Developments. We\'ve received your message and will get back to you within 24 hours.</p><p>— Ausgreek Developments</p>';
    await sendEmail(apiKey, email, 'Thanks for contacting Ausgreek Developments', auto, to).catch(() => {});
  }

  // Forward to Netlify Forms for dashboard capture (best-effort)
  if (siteUrl) {
    try {
      const fd = new URLSearchParams();
      for (const k of ['form-name', 'name', 'email', 'service', 'message']) if (fields[k]) fd.append(k, fields[k]);
      fd.append('form-name', 'contact');
      await fetch(siteUrl + '/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
    } catch (e) { /* ignore */ }
  }

  return json(200, { ok: true });
};