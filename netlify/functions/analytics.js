// Custom analytics event endpoint. Stores events in memory (ephemeral) + logs.
// Body: { event, props, page, ts }
const events = [];
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,GET', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  if (event.httpMethod === 'POST') {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }
    events.push({ ...body, ip: (event.headers['x-forwarded-for'] || '').split(',')[0], ts: body.ts || Date.now() });
    if (events.length > 1000) events.shift();
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };
  }
  if (event.httpMethod === 'GET') {
    const token = (event.queryStringParameters && event.queryStringParameters.token) || event.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) return { statusCode: 401, body: 'Unauthorized' };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ count: events.length, events: events.slice(-100) }) };
  }
  return { statusCode: 405, body: 'Method not allowed' };
};