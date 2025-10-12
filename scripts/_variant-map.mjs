/**
 * Variant definitions for running performance experiments.
 *
 * The experiment matrix is built around four strategies (Lazy, Split, Prefetch, Combo)
 * and two dataset/CDN toggles (local/small vs. CDN/large) which yield eight variants:
 * A, A', B, B', C, C', D, D'.
 *
 * Each variant carries the environment variables required to reproduce the scenario
 * alongside baseline metric expectations that are used by the synthetic test runner.
 */

const CDN_BASE_URL = 'https://cdn.perfshop.test';

const createVariant = ({
  key,
  label,
  description,
  strategy,
  dataVariant,
  cdn,
  metricBaseline,
}) => {
  const variantKey = key;
  return {
    key: variantKey,
    label,
    description,
    strategy,
    order: VARIANT_ORDER.indexOf(variantKey),
    env: {
      VITE_STRATEGY: strategy,
      VITE_DATA_VARIANT: dataVariant,
      VITE_CDN_ENABLED: cdn ? 'true' : 'false',
      VITE_ASSET_BASE_URL: cdn ? `${CDN_BASE_URL}/${strategy}` : '',
    },
    metricBaseline,
  };
};

export const VARIANT_ORDER = Object.freeze([
  'A',
  "A'",
  'B',
  "B'",
  'C',
  "C'",
  'D',
  "D'",
]);

const BASELINES = {
  lazy: { LCP: 2500, FCP: 1200, CLS: 0.05, TBT: 120 },
  split: { LCP: 2300, FCP: 1350, CLS: 0.04, TBT: 100 },
  prefetch: { LCP: 2100, FCP: 1100, CLS: 0.03, TBT: 90 },
  combo: { LCP: 1800, FCP: 950, CLS: 0.02, TBT: 70 },
};

const PRIME_DELTA = {
  LCP: -150,
  FCP: -90,
  CLS: -0.005,
  TBT: -10,
};

export const VARIANTS = Object.freeze({
  A: createVariant({
    key: 'A',
    label: 'Lazy (Local)',
    description: 'Lazy loading enabled, local assets, small dataset.',
    strategy: 'lazy',
    dataVariant: 'small',
    cdn: false,
    metricBaseline: BASELINES.lazy,
  }),
  "A'": createVariant({
    key: "A'",
    label: "Lazy (CDN)",
    description: 'Lazy loading with CDN-hosted large dataset.',
    strategy: 'lazy',
    dataVariant: 'large',
    cdn: true,
    metricBaseline: applyPrimeDelta(BASELINES.lazy),
  }),
  B: createVariant({
    key: 'B',
    label: 'Split (Local)',
    description: 'Code-splitting strategy, local assets, small dataset.',
    strategy: 'split',
    dataVariant: 'small',
    cdn: false,
    metricBaseline: BASELINES.split,
  }),
  "B'": createVariant({
    key: "B'",
    label: "Split (CDN)",
    description: 'Code-splitting with CDN and large dataset.',
    strategy: 'split',
    dataVariant: 'large',
    cdn: true,
    metricBaseline: applyPrimeDelta(BASELINES.split),
  }),
  C: createVariant({
    key: 'C',
    label: 'Prefetch (Local)',
    description: 'Aggressive prefetching, local assets, small dataset.',
    strategy: 'prefetch',
    dataVariant: 'small',
    cdn: false,
    metricBaseline: BASELINES.prefetch,
  }),
  "C'": createVariant({
    key: "C'",
    label: "Prefetch (CDN)",
    description: 'Prefetch strategy backed by CDN assets and large dataset.',
    strategy: 'prefetch',
    dataVariant: 'large',
    cdn: true,
    metricBaseline: applyPrimeDelta(BASELINES.prefetch),
  }),
  D: createVariant({
    key: 'D',
    label: 'Combo (Local)',
    description: 'Combined lazy, split, and prefetch optimisations, local assets.',
    strategy: 'combo',
    dataVariant: 'small',
    cdn: false,
    metricBaseline: BASELINES.combo,
  }),
  "D'": createVariant({
    key: "D'",
    label: "Combo (CDN)",
    description: 'All optimisations enabled with CDN-hosted large dataset.',
    strategy: 'combo',
    dataVariant: 'large',
    cdn: true,
    metricBaseline: applyPrimeDelta(BASELINES.combo),
  }),
});

export const DEFAULT_VARIANT = 'A';

export function getVariantConfig(variantKey = DEFAULT_VARIANT) {
  const key = normalizeVariantKey(variantKey);
  const variant = VARIANTS[key];
  if (!variant) {
    const supported = VARIANT_ORDER.join(', ');
    throw new Error(`Unknown variant "${variantKey}". Supported variants: ${supported}`);
  }
  return variant;
}

export function normalizeVariantKey(input) {
  if (!input) return DEFAULT_VARIANT;
  const trimmed = input.trim();
  // Allow users to pass e.g. a, A’, A-prime, etc.
  const canonical = trimmed
    .toUpperCase()
    .replace(/PRIME$/, "'")
    .replace(/’/g, "'")
    .replace(/-PRIME$/, "'");
  if (VARIANT_ORDER.includes(canonical)) {
    return canonical;
  }
  if (canonical === 'APRIME') return "A'";
  if (canonical === 'BPRIME') return "B'";
  if (canonical === 'CPRIME') return "C'";
  if (canonical === 'DPRIME') return "D'";
  return canonical;
}

function applyPrimeDelta(baseline) {
  return {
    LCP: roundToTwo(baseline.LCP + PRIME_DELTA.LCP),
    FCP: roundToTwo(baseline.FCP + PRIME_DELTA.FCP),
    CLS: roundToThree(baseline.CLS + PRIME_DELTA.CLS),
    TBT: roundToTwo(baseline.TBT + PRIME_DELTA.TBT),
  };
}

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

function roundToThree(value) {
  return Math.round(value * 1000) / 1000;
}

export const METRIC_KEYS = Object.freeze(['LCP', 'FCP', 'CLS', 'TBT']);
