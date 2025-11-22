#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'assets', 'data');

const SOURCE_FILE = process.env.CATALOG_SOURCE || path.join(DATA_DIR, 'catalog.small.json');
const TARGET_FILE = process.env.CATALOG_TARGET || path.join(DATA_DIR, 'catalog.large.json');
const TARGET_MB = Number(process.env.TARGET_SIZE_MB || '110');

async function main() {
  const sourceRaw = await readFile(SOURCE_FILE, 'utf8');
  const baseProducts = JSON.parse(sourceRaw);

  if (!Array.isArray(baseProducts) || baseProducts.length === 0) {
    throw new Error('Source dataset must be a non-empty array.');
  }

  const targetBytes = TARGET_MB * 1024 * 1024;
  const avgProductBytes = Buffer.byteLength(sourceRaw) / baseProducts.length;
  const targetCount = Math.max(
    baseProducts.length,
    Math.ceil(targetBytes / avgProductBytes)
  );

  const expanded = [...baseProducts];
  let iteration = 1;

  while (expanded.length < targetCount) {
    for (let i = 0; i < baseProducts.length && expanded.length < targetCount; i += 1) {
      const product = baseProducts[i];
      const suffix = `${iteration}-${i}`;
      expanded.push(cloneProduct(product, suffix));
    }
    iteration += 1;
  }

  await mkdir(path.dirname(TARGET_FILE), { recursive: true });
  const output = JSON.stringify(expanded, null, 2);
  await writeFile(TARGET_FILE, output);
  const sizeMb = Buffer.byteLength(output) / (1024 * 1024);

  console.log(
    `Generated ${expanded.length.toLocaleString()} products at ${TARGET_FILE}`,
  );
  console.log(`Approximate size: ${sizeMb.toFixed(2)} MB`);
}

function cloneProduct(product, suffix) {
  const mutateImage = (url, extra = '') => {
    if (!url) {
      return url;
    }
    const [base, query] = url.split('?');
    const variant = extra ? `${suffix}-${extra}` : suffix;
    const param = `variant=${variant}`;
    return `${base}?${query ? `${query}&${param}` : param}`;
  };

  return {
    ...product,
    id: `${product.id}-${suffix}`,
    name: `${product.name} (${suffix})`,
    imageUrl: mutateImage(product.imageUrl),
    gallery: Array.isArray(product.gallery)
      ? product.gallery.map((url, idx) => mutateImage(url, `g${idx}`))
      : product.gallery,
  };
}

main().catch((error) => {
  console.error(`[generate-large-catalog] ${error.message}`);
  process.exitCode = 1;
});
