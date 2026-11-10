// Feature flags endpoint. Flags can be overridden via env var FEATURE_FLAGS (JSON).
exports.handler = async () => {
  let flags = { darkMode: true, chatWidget: true, quoteEstimator: true, blogSearch: true, newsletter: true };
  if (process.env.FEATURE_FLAGS) {
    try { flags = { ...flags, ...JSON.parse(process.env.FEATURE_FLAGS) }; } catch (e) {}
  }
  return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }, body: JSON.stringify(flags) };
};