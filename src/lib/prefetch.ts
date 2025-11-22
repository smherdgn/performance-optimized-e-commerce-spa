import { preloadProducts } from './http';
import { strategyConfig } from '@/config/strategy';

const preloadedRoutes = new Set<string>();

const routeComponentMap: Record<string, () => Promise<any>> = {
  '/catalog': () => import('@/app/routes/Catalog'),
  '/product': () => import('@/app/routes/Product'), // Generic product route
  '/about': () => import('@/app/routes/About'),
};

export const prefetchRoute = (path: string) => {
  if (!strategyConfig.isPrefetch) {
    return;
  }

  const routeKey = path.startsWith('/product/') ? '/product' : path;
  
  if (!preloadedRoutes.has(routeKey) && routeComponentMap[routeKey]) {
    routeComponentMap[routeKey]();
    preloadedRoutes.add(routeKey);
    console.log(`Prefetching component for route: ${routeKey}`);
  }

  if (routeKey === '/catalog' || routeKey === '/product') {
    preloadProducts();
    console.log(`Prefetching product data`);
  }
};
