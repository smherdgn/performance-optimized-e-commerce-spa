const STRATEGY = import.meta.env.VITE_STRATEGY || 'combo';

export const strategyConfig = {
  isLazy: ['lazy', 'combo'].includes(STRATEGY),
  isSplit: ['split', 'combo'].includes(STRATEGY),
  isPrefetch: ['prefetch', 'combo'].includes(STRATEGY),
  strategy: STRATEGY,
};

console.log('Active Strategy Config:', strategyConfig);