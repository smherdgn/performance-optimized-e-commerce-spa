import { Product } from '@/types';
import { getAssetUrl } from '@/config/cdn';

const DATA_VARIANT = import.meta.env.VITE_DATA_VARIANT || 'small';

const API_CACHE: { [key: string]: any } = {};

export async function fetchProducts(): Promise<Product[]> {
  const url = getAssetUrl(`/assets/data/catalog.${DATA_VARIANT}.json`);
  
  if (API_CACHE[url]) {
    return API_CACHE[url];
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    API_CACHE[url] = data;
    return data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const products = await fetchProducts();
  return products.find(p => p.id === id);
}

// Preload function for the prefetch strategy
export async function preloadProducts() {
  const url = getAssetUrl(`/assets/data/catalog.${DATA_VARIANT}.json`);
  if (!API_CACHE[url]) {
    await fetchProducts();
  }
}
