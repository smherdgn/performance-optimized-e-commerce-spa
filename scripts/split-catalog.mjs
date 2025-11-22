#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'assets', 'data');
const PAGES_DIR = path.join(DATA_DIR, 'pages');

const DEFAULT_VARIANTS = ['small', 'medium', 'large'];
const VARIANTS = (process.env.CATALOG_VARIANTS || DEFAULT_VARIANTS.join(','))
  .split(',')
  .map((variant) => variant.trim())
  .filter(Boolean);

const CHUNK_SIZE = Number(process.env.CATALOG_CHUNK_SIZE || '500');

async function main() {
  for (const variant of VARIANTS) {
    await splitVariant(variant);
  }
}

async function splitVariant(variant) {
  const sourceFile = path.join(DATA_DIR, `catalog.${variant}.json`);

  try {
    const sourceRaw = await readFile(sourceFile, 'utf8');
    const products = JSON.parse(sourceRaw);

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Source dataset must be a non-empty array.');
    }

    const targetDir = path.join(PAGES_DIR, variant);
    await mkdir(targetDir, { recursive: true });

    const manifest = {
      variant,
      chunkSize: CHUNK_SIZE,
      totalItems: products.length,
      chunks: [],
    };

    let fileIndex = 1;
    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      const chunkName = `catalog.${variant}.chunk-${String(fileIndex).padStart(3, '0')}.json`;
      const chunkPath = path.join(targetDir, chunkName);
      await writeFile(chunkPath, JSON.stringify(chunk));

      manifest.chunks.push(`/assets/data/pages/${variant}/${chunkName}`);
      fileIndex += 1;
    }

    const manifestPath = path.join(DATA_DIR, `catalog.${variant}.manifest.json`);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(
      `Split ${variant}: ${products.length.toLocaleString()} items into ${manifest.chunks.length} files of ${CHUNK_SIZE} each.`,
    );
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[split-catalog] Skipping ${variant} (missing source at ${sourceFile})`);
      return;
    }

    console.error(`[split-catalog] ${error.message}`);
    process.exitCode = 1;
  }
}

main();
