import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  DEFAULT_VARIANT,
  METRIC_KEYS,
  VARIANTS,
  VARIANT_ORDER,
  getVariantConfig,
  normalizeVariantKey,
} from './_variant-map.mjs';

export const SUPPORTED_TOOLS = Object.freeze(['lhci', 'wpt', 'k6']);
const DEFAULT_REPORT_ROOT = path.resolve(process.cwd(), 'reports');

export async function runSingleTest(options) {
  const {
    tool,
    variant: variantInput,
    iteration: iterationOverride,
    dryRun = false,
  } = options;

  const toolName = normalizeTool(tool);
  const variantConfig = getVariantConfig(variantInput ?? DEFAULT_VARIANT);
  const variant = variantConfig.key;

  if (!SUPPORTED_TOOLS.includes(toolName)) {
    throw new Error(`Unsupported tool "${tool}". Allowed values: ${SUPPORTED_TOOLS.join(', ')}`);
  }

  const reportsRoot = getReportsRoot();
  const variantReportDir = path.join(reportsRoot, toolName, slugifyVariant(variant));
  if (!dryRun) {
    await fs.mkdir(variantReportDir, { recursive: true });
  }

  const iteration = iterationOverride ?? (await nextIteration(variantReportDir));
  const seedBase = `${toolName}:${variant}:${iteration}:${Date.now()}:${Math.random()}`;
  const metrics = synthesizeMetrics({
    baseline: variantConfig.metricBaseline,
    tool: toolName,
    seedBase,
  });

  const envSnapshot = Object.fromEntries(
    Object.entries(variantConfig.env).map(([key, value]) => [key, value ?? ''])
  );

  const previousEnv = {};
  for (const [key, value] of Object.entries(envSnapshot)) {
    previousEnv[key] = process.env[key];
    process.env[key] = value;
  }

  const runPayload = {
    tool: toolName,
    variant,
    variantLabel: variantConfig.label,
    iteration,
    timestamp: new Date().toISOString(),
    metrics,
    env: envSnapshot,
    description: variantConfig.description,
  };

  let outputPath = null;
  try {
    if (!dryRun) {
      const fileName =
        [
          'run',
          String(iteration).padStart(2, '0'),
          Date.now(),
          randomHex(seedBase, 3),
        ].join('-') + '.json';

      outputPath = path.join(variantReportDir, fileName);
      await fs.writeFile(outputPath, JSON.stringify(runPayload, null, 2), 'utf8');
    }
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (typeof value === 'undefined') {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }

  return {
    outputPath,
    iteration,
    payload: runPayload,
  };
}

async function nextIteration(dir) {
  try {
    const files = await fs.readdir(dir);
    const runFiles = files.filter((name) => /^run-/.test(name) && name.endsWith('.json'));
    return runFiles.length + 1;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return 1;
    }
    throw error;
  }
}

function synthesizeMetrics({ baseline, tool, seedBase }) {
  const noiseRanges = {
    lhci: { LCP: 180, FCP: 120, CLS: 0.01, TBT: 25 },
    wpt: { LCP: 220, FCP: 160, CLS: 0.015, TBT: 35 },
    k6: { LCP: 260, FCP: 180, CLS: 0.02, TBT: 45 },
  };

  const toolRange = noiseRanges[tool] ?? noiseRanges.lhci;
  const metrics = {};

  METRIC_KEYS.forEach((metric, index) => {
    const baselineValue = baseline[metric];
    const noise = generateNoise(seedBase, index);
    const wiggle = toolRange[metric] * (noise - 0.5);

    if (metric === 'CLS') {
      const value = Math.max(0, roundToThree(baselineValue + wiggle));
      metrics[metric] = value;
    } else {
      const value = Math.max(0, roundToTwo(baselineValue + wiggle));
      metrics[metric] = value;
    }
  });

  return metrics;
}

function generateNoise(seed, index) {
  const hash = createHash('sha256').update(`${seed}:${index}`).digest('hex');
  const int = parseInt(hash.slice(0, 8), 16);
  return int / 0xffffffff;
}

function randomHex(seed, length = 6) {
  return createHash('sha1').update(seed).digest('hex').slice(0, length);
}

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

function roundToThree(value) {
  return Math.round(value * 1000) / 1000;
}

function slugifyVariant(variant) {
  return variant.replace("'", 'p');
}

function normalizeTool(tool) {
  if (!tool) {
    throw new Error(`A test tool must be provided. Use one of: ${SUPPORTED_TOOLS.join(', ')}`);
  }
  const normalized = tool.toLowerCase();
  if (normalized === 'webpagetest') return 'wpt';
  return normalized;
}

function getReportsRoot() {
  const override = process.env.REPORTS_ROOT;
  if (!override) return DEFAULT_REPORT_ROOT;
  return path.resolve(process.cwd(), override);
}

function printUsage() {
  console.log(
    [
      'Usage: node scripts/run-test.mjs <tool> [variant]',
      `  <tool>    : one of ${SUPPORTED_TOOLS.join(', ')}`,
      `  [variant] : optional variant key (${VARIANT_ORDER.join(', ')})`,
      '',
      'Environment variables:',
      '  VARIANT           - variant key to fall back to when no CLI argument is provided',
      '  REPORTS_ROOT      - override the default reports directory (reports/)',
      '  DRY_RUN=true      - skip writing files (useful for smoke-checking)',
    ].join('\n')
  );
}

async function cli() {
  const [, , toolArg, variantArg] = process.argv;
  if (!toolArg || toolArg === '--help' || toolArg === '-h') {
    printUsage();
    process.exit(toolArg ? 0 : 1);
  }

  const variantFromEnv = process.env.VARIANT ?? process.env.MATRIX_VARIANT;
  const variant = normalizeVariantKey(variantArg ?? variantFromEnv ?? DEFAULT_VARIANT);
  const dryRun = process.env.DRY_RUN === 'true';

  try {
    const { outputPath, iteration, payload } = await runSingleTest({
      tool: toolArg,
      variant,
      dryRun,
    });

    if (outputPath) {
      console.log(
        `Recorded ${payload.tool.toUpperCase()} metrics for variant ${payload.variant} (iteration #${iteration}) -> ${path.relative(process.cwd(), outputPath)}`
      );
    } else {
      console.log(
        `Simulated ${payload.tool.toUpperCase()} metrics for variant ${payload.variant} (iteration #${iteration}).`
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli();
}
