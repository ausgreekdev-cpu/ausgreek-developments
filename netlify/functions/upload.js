// Upload a file (base64) to Cloudflare R2 (S3-compatible).
// Body: { filename, contentType, data (base64) }
// Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
let client;
function getClient() {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET) return null;
  if (!client) client = new S3Client({
    region: 'auto',
    endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
  return client;
}
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const c = getClient();
  if (!c) return { statusCode: 501, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'R2 not configured' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }
  const { filename, contentType, data } = body;
  if (!filename || !data) return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'filename and data required' }) };
  try {
    let buf = Buffer.from(data, 'base64');
    let ct = contentType || 'application/octet-stream';
    try {
      const sharp = require('sharp');
      if (/\.(jpe?g|png|webp)$/i.test(filename)) {
        buf = await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).toBuffer();
        ct = 'image/webp';
        filename = filename.replace(/\.[^.]+$/, '.webp');
      }
    } catch (e) { /* sharp not available; upload original */ }
    await c.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: filename, Body: buf, ContentType: ct }));
    const url = 'https://' + process.env.R2_BUCKET + '.' + process.env.R2_ACCOUNT_ID + '.r2.dev/' + encodeURIComponent(filename);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, url }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};