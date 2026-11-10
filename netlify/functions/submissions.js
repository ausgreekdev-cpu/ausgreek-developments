// Return stored submissions (quotes + contacts) for admin dashboard.
// Requires ADMIN_TOKEN env; pass via ?token= or X-Admin-Token header.
const { Pool } = require('pg');
let pool;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}
exports.handler = async (event) => {
  const token = (event.queryStringParameters && event.queryStringParameters.token) || event.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  const p = getPool();
  if (!p) return { statusCode: 501, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Database not configured' }) };
  try {
    await p.query('CREATE TABLE IF NOT EXISTS quotes (id SERIAL PRIMARY KEY, name TEXT, email TEXT, type TEXT, scope TEXT, estimate TEXT, created_at TIMESTAMPTZ DEFAULT NOW())');
    const r = await p.query('SELECT * FROM quotes ORDER BY created_at DESC LIMIT 100');
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quotes: r.rows }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};