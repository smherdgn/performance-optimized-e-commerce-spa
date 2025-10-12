import fs from 'fs';
import path from 'path';

// Mock WPT Runner
// This script simulates a WebPageTest run and generates mock data.
console.log('--- WPT Runner (MOCK) ---');

const getArg = (name) => {
    const flag = `--${name}=`;
    const arg = process.argv.find(a => a.startsWith(flag));
    return arg ? arg.substring(flag.length) : null;
}

const outFile = getArg('out');

if (!outFile) {
  console.error('WPT Mock Runner: --out=<file_path> argument is required.');
  process.exit(1);
}

console.log('Simulating WPT run and generating mock data...');
console.log(`Output file: ${outFile}`);

const mockData = {
  "tool": "wpt",
  "mock": true,
  "metrics": {
    "lcp": 1800 + Math.random() * 500,
    "fcp": 1500 + Math.random() * 400,
    "cls": 0.05 + Math.random() * 0.05,
    "tbt": 150 + Math.random() * 100,
  }
};

try {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(mockData, null, 2));
  console.log('--- WPT Runner (MOCK) Finished ---');
} catch (e) {
  console.error('Failed to write mock WPT report:', e);
  process.exit(1);
}
