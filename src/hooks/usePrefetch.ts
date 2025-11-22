import { useCallback, useEffect, useRef } from 'react';
import { strategyConfig } from '@/config/strategy';
import { prefetchRoute } from '@/lib/prefetch';

export const usePrefetch = (path: string) => {
  const prefetchTimer = useRef<number | null>(null);
  const elementRef = useRef<HTMLAnchorElement | null>(null);

  const startPrefetch = useCallback(() => {
    if (!strategyConfig.isPrefetch) return;
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
    }
    prefetchTimer.current = window.setTimeout(() => {
      prefetchRoute(path);
    }, 120);
  }, [path]);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
      prefetchTimer.current = null;
    }
  }, []);

  useEffect(() => cancelPrefetch, [cancelPrefetch]);

  useEffect(() => {
    if (!strategyConfig.isPrefetch || !elementRef.current) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          prefetchRoute(path);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '300px' });
    const target = elementRef.current;
    if (target) {
      observer.observe(target);
    }
    return () => observer.disconnect();
  }, [path]);

  const prefetchHandlers = strategyConfig.isPrefetch
    ? {
        onMouseEnter: startPrefetch,
        onMouseLeave: cancelPrefetch,
        onFocus: startPrefetch,
        onBlur: cancelPrefetch,
      }
    : {};

  return {
    prefetchHandlers,
    prefetchRef: elementRef,
  };
};
