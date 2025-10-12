import fs from 'node:fs/promises';
import path from 'node:path';
import { METRIC_KEYS, VARIANT_ORDER, getVariantConfig } from './_variant-map.mjs';

const REPORTS_ROOT = path.resolve(process.cwd(), 'reports');
const SUMMARY_JSON = path.join(REPORTS_ROOT, 'summary.json');
const SUMMARY_MD = path.join(REPORTS_ROOT, 'summary.md');

async function generateReports() {
  const matrix = await collectMatrix();
  const summary = buildSummary(matrix);

  await fs.mkdir(REPORTS_ROOT, { recursive: true });
  await fs.writeFile(SUMMARY_JSON, JSON.stringify(summary, null, 2), 'utf8');
  await fs.writeFile(SUMMARY_MD, renderMarkdown(summary), 'utf8');

  console.log(`Summary written to ${path.relative(process.cwd(), SUMMARY_JSON)} and ${path.relative(process.cwd(), SUMMARY_MD)}`);
}

async function collectMatrix() {
  const payload = {};

  let dirEntries = [];
  try {
    dirEntries = await fs.readdir(REPORTS_ROOT, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return payload;
    }
    throw error;
  }

  for (const entry of dirEntries) {
    if (!entry.isDirectory()) continue;
    const tool = entry.name;
    payload[tool] = await collectTool(tool);
  }

  return payload;
}

async function collectTool(tool) {
  const toolDir = path.join(REPORTS_ROOT, tool);
  const variants = {};

  let variantEntries = [];
  try {
    variantEntries = await fs.readdir(toolDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return variants;
    }
    throw error;
  }

  for (const entry of variantEntries) {
    if (!entry.isDirectory()) continue;
    const variantKey = restoreVariant(entry.name);
    variants[variantKey] = await collectVariant(toolDir, entry.name);
  }

  return variants;
}

async function collectVariant(toolDir, variantSlug) {
  const variantDir = path.join(toolDir, variantSlug);
  let files = [];

  try {
    files = await fs.readdir(variantDir);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const runs = [];
  for (const file of files) {
    if (!file.endsWith('.json') || !file.startsWith('run-')) continue;
    const filePath = path.join(variantDir, file);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      runs.push(parsed);
    } catch (error) {
      console.warn(`Skipping invalid report file: ${filePath}`, error);
    }
  }

  runs.sort((a, b) => (a.iteration ?? 0) - (b.iteration ?? 0));
  return runs;
}

function buildSummary(matrix) {
  const summary = {
    generatedAt: new Date().toISOString(),
    metrics: METRIC_KEYS,
    tools: {},
  };

  for (const [tool, variants] of Object.entries(matrix)) {
    summary.tools[tool] = {
      variants: {},
    };

    for (const key of VARIANT_ORDER) {
      const variantRuns = variants[key] ?? [];
      if (variantRuns.length === 0) continue;

      const stats = computeMetrics(variantRuns);
      summary.tools[tool].variants[key] = {
        label: getVariantConfig(key).label,
        runs: variantRuns.length,
        metrics: stats,
      };
    }
  }

  return summary;
}

function computeMetrics(runs) {
  const metrics = {};

  for (const metric of METRIC_KEYS) {
    const values = runs
      .map((run) => run.metrics?.[metric])
      .filter((value) => typeof value === 'number' && Number.isFinite(value));

    if (values.length === 0) continue;

    metrics[metric] = {
      mean: mean(values),
      stdDev: standardDeviation(values),
      values,
    };
  }

  return metrics;
}

function mean(values) {
  if (values.length === 0) return 0;
  const total = values.reduce((acc, value) => acc + value, 0);
  return +(total / values.length).toFixed(3);
}

function standardDeviation(values) {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, value) => acc + (value - m) ** 2, 0) / (values.length - 1);
  return +Math.sqrt(variance).toFixed(3);
}

function renderMarkdown(summary) {
  const lines = [
    '# Performance Summary',
    '',
    `Generated at ${summary.generatedAt}`,
    '',
  ];

  const toolEntries = Object.entries(summary.tools);
  if (toolEntries.length === 0) {
    lines.push('_No reports were found. Run `pnpm run-matrix` first._');
    return `${lines.join('\n')}\n`;
  }

  for (const [tool, data] of toolEntries) {
    lines.push(`## ${tool.toUpperCase()}`, '');
    lines.push(
      '| Variant | Runs | LCP (mean ± σ) | FCP (mean ± σ) | CLS (mean ± σ) | TBT (mean ± σ) |'
    );
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');

    for (const key of VARIANT_ORDER) {
      const variant = data.variants[key];
      if (!variant) continue;
      const cells = METRIC_KEYS.map((metric) => renderMetricCell(variant.metrics[metric]));
      lines.push(
        `| ${key} | ${variant.runs} | ${cells[0]} | ${cells[1]} | ${cells[2]} | ${cells[3]} |`
      );
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function renderMetricCell(metricStats = null) {
  if (!metricStats) return '—';
  const { mean, stdDev } = metricStats;
  return `${mean.toFixed(3)} ± ${stdDev.toFixed(3)}`;
}

function restoreVariant(slug) {
  return slug.replace(/p$/, "'");
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  generateReports().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
