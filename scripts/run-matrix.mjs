import { SUPPORTED_TOOLS, runSingleTest } from './run-test.mjs';
import { VARIANT_ORDER } from './_variant-map.mjs';

const DEFAULT_ITERATIONS = 15;

async function runMatrix() {
  const tools = resolveTools();
  const iterations = resolveIterations();

  console.log(
    `Running performance matrix for variants [${VARIANT_ORDER.join(
      ', '
    )}] across tools [${tools.join(', ')}] with ${iterations} iteration(s).`
  );

  for (const tool of tools) {
    for (const variant of VARIANT_ORDER) {
      for (let count = 1; count <= iterations; count += 1) {
        await runVariant(tool, variant);
      }
    }
  }

  console.log('Matrix run complete.');
}

async function runVariant(tool, variant) {
  const start = Date.now();
  const { outputPath, payload } = await runSingleTest({
    tool,
    variant,
  });

  const duration = Date.now() - start;
  const relativePath = outputPath
    ? outputPath.replace(`${process.cwd()}/`, '')
    : '(dry-run)';
  console.log(
    `[${tool.toUpperCase()}][${variant}] iteration #${payload.iteration} -> ${relativePath} (${duration}ms)`
  );
  return payload;
}

function resolveTools() {
  const raw = process.env.MATRIX_TOOLS;
  if (!raw || raw.trim() === '') {
    return SUPPORTED_TOOLS;
  }

  const tools = raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((tool) => (tool === 'webpagetest' ? 'wpt' : tool));

  const unsupported = tools.filter((tool) => !SUPPORTED_TOOLS.includes(tool));
  if (unsupported.length > 0) {
    throw new Error(
      `Unsupported tool(s) in MATRIX_TOOLS: ${unsupported.join(
        ', '
      )}. Supported tools: ${SUPPORTED_TOOLS.join(', ')}`
    );
  }

  return tools;
}

function resolveIterations() {
  const raw = process.env.MATRIX_ITER;
  if (!raw) return DEFAULT_ITERATIONS;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('MATRIX_ITER must be a positive integer.');
  }
  return parsed;
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  runMatrix().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
