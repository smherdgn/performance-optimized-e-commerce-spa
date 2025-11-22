import { Product } from '@/types';
import { getAssetUrl } from '@/config/cdn';

type CatalogManifest = {
  variant: string;
  chunkSize: number;
  totalItems: number;
  chunks: string[];
};

const DATA_VARIANT = import.meta.env.VITE_DATA_VARIANT || 'small';
const MANIFEST_PATH = `/assets/data/catalog.${DATA_VARIANT}.manifest.json`;
const API_CACHE: Record<string, Product[]> = {};
const MANIFEST_CACHE: Record<string, CatalogManifest | null | undefined> = {};
const CHUNK_CONCURRENCY = 8;

export async function fetchProducts(): Promise<Product[]> {
  if (API_CACHE[DATA_VARIANT]) {
    return API_CACHE[DATA_VARIANT];
  }

  const manifest = await fetchManifest();
  if (!manifest) {
    throw new Error(`Catalog manifest missing for variant "${DATA_VARIANT}"`);
  }
  const products = await fetchCatalogChunks(manifest);

  API_CACHE[DATA_VARIANT] = products;
  return products;
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const products = await fetchProducts();
  return products.find((p) => p.id === id);
}

export async function preloadProducts() {
  if (!API_CACHE[DATA_VARIANT]) {
    await fetchProducts();
  }
}

async function fetchManifest(): Promise<CatalogManifest | null> {
  if (MANIFEST_CACHE[DATA_VARIANT] !== undefined) {
    return MANIFEST_CACHE[DATA_VARIANT] ?? null;
  }

  const manifestUrl = resolveAssetUrl(MANIFEST_PATH);

  try {
    const response = await fetch(manifestUrl);

    if (!response.ok) {
      throw new Error(`Manifest request failed with status ${response.status}`);
    }

    const manifest = (await response.json()) as CatalogManifest;
    MANIFEST_CACHE[DATA_VARIANT] = manifest;
    return manifest;
  } catch (error) {
    MANIFEST_CACHE[DATA_VARIANT] = null;
    throw error;
  }
}

async function fetchCatalogChunks(manifest: CatalogManifest): Promise<Product[]> {
  const urls = manifest.chunks.map((path) => resolveAssetUrl(path));
  const chunked = await mapWithConcurrency(urls, CHUNK_CONCURRENCY, (url) =>
    fetchJson<Product[]>(url),
  );
  return chunked.flat();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function resolveAssetUrl(path: string): string {
  const cdnUrl = getAssetUrl(path);
  return cdnUrl !== path ? cdnUrl : path;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;

      if (index >= items.length) {
        break;
      }

      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}
