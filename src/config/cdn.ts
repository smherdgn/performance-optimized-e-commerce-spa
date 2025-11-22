const CDN_ENABLED = import.meta.env.VITE_CDN_ENABLED === 'true';
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || '';

/**
 * Resolves an asset path to a full CDN URL if CDN is enabled,
 * otherwise returns the local path.
 * @param path - The local path to the asset (e.g., '/assets/images/product-1.webp').
 * @returns The resolved URL for the asset.
 */
export const getAssetUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  if (CDN_ENABLED && ASSET_BASE_URL) {
    const sanitizedBase = ASSET_BASE_URL.endsWith('/') ? ASSET_BASE_URL.slice(0, -1) : ASSET_BASE_URL;
    const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${sanitizedBase}${sanitizedPath}`;
  }
  return path;
};
