// Stripe Checkout session creator. Env: STRIPE_SECRET_KEY, STRIPE_PRICE_ID (or pass amount in body)
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { statusCode: 501, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }
  const siteUrl = process.env.URL || 'https://ausgreek-developments.netlify.app';
  const params = new URLSearchParams();
  params.append('mode', body.mode || 'payment');
  params.append('success_url', (body.success_url || siteUrl + '/thanks.html') + '?session_id={CHECKOUT_SESSION_ID}');
  params.append('cancel_url', body.cancel_url || siteUrl + '/#pricing');
  if (body.price_id) {
    params.append('line_items[0][price]', body.price_id);
    params.append('line_items[0][quantity]', '1');
  } else {
    params.append('line_items[0][price_data][currency]', 'aud');
    params.append('line_items[0][price_data][product_data][name]', body.product_name || 'Ausgreek Developments — Deposit');
    params.append('line_items[0][price_data][unit_amount]', String(body.amount || 149000));
    params.append('line_items[0][quantity]', '1');
  }
  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error && data.error.message || 'Stripe error');
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: data.url, id: data.id }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};