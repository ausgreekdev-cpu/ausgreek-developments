// Proxy Calendly availability. Env: CALENDLY_TOKEN (personal access token)
// Query: ?event_type=... (optional) returns event types + scheduling url
exports.handler = async (event) => {
  const token = process.env.CALENDLY_TOKEN;
  if (!token) return { statusCode: 501, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Calendly not configured (CALENDLY_TOKEN)' }) };
  try {
    const res = await fetch('https://api.calendly.com/users/me', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) throw new Error('Calendly auth failed');
    const me = await res.json();
    const etRes = await fetch('https://api.calendly.com/event_types?user=' + encodeURIComponent(me.resource.uri), { headers: { 'Authorization': 'Bearer ' + token } });
    const et = await etRes.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }, body: JSON.stringify({ user: me.resource, event_types: et.collection || [] }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};