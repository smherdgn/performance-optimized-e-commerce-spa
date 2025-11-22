// Fix: Define ImportMeta interface to provide types for import.meta.env.
// This is a workaround for when /// <reference types="vite/client" /> is not working.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_CDN_ENABLED?: string;
      readonly VITE_ASSET_BASE_URL?: string;
      readonly VITE_STRATEGY?: string;
      readonly VITE_DATA_VARIANT?: string;
    }
  }
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery?: string[];
  category: string;
  rating: number;
  reviewCount: number;
}

export interface CartItem extends Product {
  quantity: number;
}
