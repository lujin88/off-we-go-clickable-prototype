(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OffWeGoDuration = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function parseDayCount(value, fallback = 5) {
    if (Number.isFinite(value)) return Math.max(1, Math.round(value));
    const clean = String(value ?? '').replace(/[–—]/g, '-').trim();
    const range = clean.match(/^(\d+)\s*-\s*(\d+)/);
    if (range) return Math.max(1, Number(range[1]));
    const exact = clean.match(/\d+/);
    return exact ? Math.max(1, Number(exact[0])) : fallback;
  }

  return { parseDayCount };
});
