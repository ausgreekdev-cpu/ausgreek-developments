// Persist a quote request to Postgres (DATABASE_URL).
// Body: { name, email, type, scope, estimate }
const { Pool } = require('pg');
let pool;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const p = getPool();
  if (!p) return { statusCode: 501, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Database not configured (DATABASE_URL)' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }
  const { name, email, type, scope, estimate } = body;
  if (!email) return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'email required' }) };
  try {
    await p.query(
      'CREATE TABLE IF NOT EXISTS quotes (id SERIAL PRIMARY KEY, name TEXT, email TEXT, type TEXT, scope TEXT, estimate TEXT, created_at TIMESTAMPTZ DEFAULT NOW())'
    );
    await p.query('INSERT INTO quotes (name, email, type, scope, estimate) VALUES ($1,$2,$3,$4,$5)',
      [name || null, email, type || null, scope || null, estimate || null]);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};