import { Product } from '@/types';
import { getAssetUrl } from '@/config/cdn';

const DATA_VARIANT = import.meta.env.VITE_DATA_VARIANT || 'small';

const API_CACHE: Record<string, Product[]> = {};
const RELATIVE_PATH = `/assets/data/catalog.${DATA_VARIANT}.json`;
const cdnUrl = getAssetUrl(RELATIVE_PATH);
const preferCdn = cdnUrl !== RELATIVE_PATH;

export async function fetchProducts(): Promise<Product[]> {
  if (API_CACHE[RELATIVE_PATH]) {
    return API_CACHE[RELATIVE_PATH];
  }

  const targetUrl = preferCdn ? cdnUrl : RELATIVE_PATH;
  const data = await fetchJson(targetUrl);
  API_CACHE[RELATIVE_PATH] = data;
  return data;
}

async function fetchJson(url: string): Promise<Product[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const products = await fetchProducts();
  return products.find((p) => p.id === id);
}

// Preload function for the prefetch strategy
export async function preloadProducts() {
  if (!API_CACHE[RELATIVE_PATH]) {
    await fetchProducts();
  }
}
