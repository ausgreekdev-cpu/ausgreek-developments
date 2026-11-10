// Health / status endpoint
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ status: 'ok', time: new Date().toISOString(), version: 'v14', functions: ['contact','quote','upload','submissions','newsletter','calendly','sitemap','og-image','analytics','flags','ab'] }),
  };
};