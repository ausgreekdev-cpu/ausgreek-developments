// A/B test variant assignment based on a cookie/id. Query: ?exp=hero_cta
exports.handler = async (event) => {
  const exp = (event.queryStringParameters && event.queryStringParameters.exp) || 'default';
  const cookie = event.headers.cookie || '';
  const m = cookie.match(/ab_' + exp + '=([AB])/);
  let variant = m ? m[1] : (Math.random() < 0.5 ? 'A' : 'B');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'ab_' + exp + '=' + variant + '; Path=/; Max-Age=2592000', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ experiment: exp, variant }),
  };
};