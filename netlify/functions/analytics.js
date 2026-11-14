// Custom analytics event endpoint. Persists to Supabase when DATABASE_URL set, else in-memory.
const { Pool } = require('pg');
let pool;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}
const events = [];
async function ensureTable(p) {
  await p.query('CREATE TABLE IF NOT EXISTS analytics_events (id SERIAL PRIMARY KEY, event TEXT, page TEXT, props JSONB, ip TEXT, ts TIMESTAMPTZ DEFAULT NOW())');
}
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,GET', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  const p = getPool();
  if (event.httpMethod === 'POST') {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }
    const ip = (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (p) {
      try {
        await ensureTable(p);
        await p.query('INSERT INTO analytics_events (event, page, props, ip, ts) VALUES ($1,$2,$3,$4,$5)',
          [body.event || 'pageview', body.page || null, body.props ? JSON.stringify(body.props) : null, ip, body.ts ? new Date(body.ts) : new Date()]);
      } catch (e) { /* fall through to memory */ }
    }
    events.push({ ...body, ip, ts: body.ts || Date.now() });
    if (events.length > 1000) events.shift();
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };
  }
  if (event.httpMethod === 'GET') {
    const token = (event.queryStringParameters && event.queryStringParameters.token) || event.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) return { statusCode: 401, body: 'Unauthorized' };
    if (p) {
      try {
        await ensureTable(p);
        const r = await p.query('SELECT * FROM analytics_events ORDER BY ts DESC LIMIT 100');
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ count: r.rows.length, events: r.rows }) };
      } catch (e) { /* fall through */ }
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ count: events.length, events: events.slice(-100) }) };
  }
  return { statusCode: 405, body: 'Method not allowed' };
};