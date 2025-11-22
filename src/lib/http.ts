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
const PREVIEW_CACHE: Record<string, Product[] | undefined> = {};
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

export async function fetchProductsPreview(limit: number): Promise<Product[]> {
  if (limit <= 0) {
    return [];
  }

  const cached = PREVIEW_CACHE[DATA_VARIANT];
  if (cached && cached.length >= limit) {
    return cached.slice(0, limit);
  }

  const manifest = await fetchManifest();
  if (!manifest) {
    throw new Error(`Catalog manifest missing for variant "${DATA_VARIANT}"`);
  }

  const chunksNeeded = Math.max(1, Math.ceil(Math.min(limit, manifest.totalItems) / manifest.chunkSize));
  const paths = manifest.chunks.slice(0, chunksNeeded);

  const chunked = await mapWithConcurrency(
    paths,
    Math.min(CHUNK_CONCURRENCY, paths.length),
    (path) => fetchWithFallback<Product[]>(resolveAssetUrls(path)),
  );

  const merged = chunked.flat();
  PREVIEW_CACHE[DATA_VARIANT] = merged;
  return merged.slice(0, limit);
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

  const manifestUrls = resolveAssetUrls(MANIFEST_PATH);

  try {
    const manifest = await fetchWithFallback<CatalogManifest>(manifestUrls);
    MANIFEST_CACHE[DATA_VARIANT] = manifest;
    return manifest;
  } catch (error) {
    MANIFEST_CACHE[DATA_VARIANT] = null;
    throw error;
  }
}

async function fetchCatalogChunks(manifest: CatalogManifest): Promise<Product[]> {
  const chunked = await mapWithConcurrency(
    manifest.chunks,
    CHUNK_CONCURRENCY,
    (path) => fetchWithFallback<Product[]>(resolveAssetUrls(path)),
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

function resolveAssetUrls(path: string): string[] {
  const resolved = resolveAssetUrl(path);
  if (resolved === path) {
    return [path];
  }
  // Prefer CDN, then fall back to local path to avoid CORS issues during dev.
  return [resolved, path];
}

async function fetchWithFallback<T>(urls: string[]): Promise<T> {
  let lastError: unknown;
  for (const url of urls) {
    try {
      return await fetchJson<T>(url);
    } catch (error) {
      lastError = error;
      // Try next URL in the list.
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to fetch resource with all fallbacks');
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
