// Newsletter signup (Mailchimp/ConvertKit). Env: NEWSLETTER_PROVIDER ('mailchimp'|'convertkit'), NEWSLETTER_API_KEY, NEWSLETTER_LIST_ID (mailchimp) or NEWSLETTER_FORM_ID (convertkit)
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }
  const email = (body.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid email' }) };

  const provider = process.env.NEWSLETTER_PROVIDER || 'mailchimp';
  const key = process.env.NEWSLETTER_API_KEY;
  if (!key) return { statusCode: 501, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Newsletter not configured (NEWSLETTER_API_KEY)' }) };

  try {
    if (provider === 'mailchimp') {
      const listId = process.env.NEWSLETTER_LIST_ID;
      const dc = key.split('-').pop();
      const res = await fetch('https://' + dc + '.api.mailchimp.com/3.0/lists/' + listId + '/members', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + Buffer.from('anystring:' + key).toString('base64'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email, status: 'subscribed' }),
      });
      if (!res.ok && res.status !== 400) throw new Error('Mailchimp error');
    } else if (provider === 'convertkit') {
      const formId = process.env.NEWSLETTER_FORM_ID;
      const res = await fetch('https://api.convertkit.com/v3/forms/' + formId + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key, email }),
      });
      if (!res.ok) throw new Error('ConvertKit error');
    } else {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unknown provider' }) };
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};