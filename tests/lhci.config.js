module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      url: ['http://localhost:3000'],
      numberOfRuns: 5, // This would be controlled by the run script
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'uses-long-cache-ttl': 'off',
        'service-worker': 'off',
        'color-contrast': 'warn',
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './reports/lhci-results', // This would be parameterized by variant
    },
  },
};
