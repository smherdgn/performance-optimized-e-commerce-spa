/**
 * Central, version-controlled config to pin Vercel URLs and default test knobs.
 * Use this to keep Lighthouse/WebPageTest/k6/Sitespeed runs stable across variants.
 */

export const VARIANT_URLS = Object.freeze({
  A: 'https://performance-optimized-strategy-a.vercel.app',
  "A'": 'https://strategy-a-cdn-performance-optimize.vercel.app',
  B: 'https://strategy-b-performance-optimized.vercel.app',
  "B'": 'https://strategy-b-cdn-performance-optimize.vercel.app',
  C: 'https://strategy-c-performance-optimized.vercel.app',
  "C'": 'https://strategy-c-cdn-performance-optimize.vercel.app',
  D: 'https://strategy-d-performance-optimized.vercel.app',
  "D'": 'https://strategy-d-cdn-performance-optimize.vercel.app',
});

export const LHCI_DEFAULTS = Object.freeze({
  numberOfRuns: 3,
  formFactor: 'desktop', // switch to "mobile" if you target mobile profile
  throttlingMethod: 'simulate',
  preset: 'lighthouse:no-pwa',
});

export const WPT_DEFAULTS = Object.freeze({
  location: 'Dulles:Chrome',
  connectivity: '3GFast',
  runs: 3,
  mobile: true,
});

export const K6_DEFAULTS = Object.freeze({
  vus: 20,
  duration: '1m',
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 0 },
  ],
});

export const SITESPEED_DEFAULTS = Object.freeze({
  iterations: 3,
  browser: 'chrome',
  mobile: true,
});

export function getVariantUrl(variantKey) {
  if (!variantKey) return null;
  const normalized = normalizeVariantKey(variantKey);
  return VARIANT_URLS[normalized] ?? null;
}

function normalizeVariantKey(input) {
  const canonical = String(input)
    .trim()
    .toUpperCase()
    .replace(/PRIME$/, "'")
    .replace(/’/g, "'")
    .replace(/-PRIME$/, "'");
  if (canonical === 'APRIME') return "A'";
  if (canonical === 'BPRIME') return "B'";
  if (canonical === 'CPRIME') return "C'";
  if (canonical === 'DPRIME') return "D'";
  return canonical;
}
