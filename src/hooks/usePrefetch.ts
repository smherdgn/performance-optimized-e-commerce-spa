import { useCallback, useEffect, useRef } from 'react';
import { strategyConfig } from '@/config/strategy';
import { prefetchRoute } from '@/lib/prefetch';

export const usePrefetch = (path: string) => {
  const prefetchTimer = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  const startPrefetch = useCallback(() => {
    if (!strategyConfig.isPrefetch) return;
    
    // Clear any existing timer
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
    }
    
    // Prefetch on hover with a small delay
    prefetchTimer.current = window.setTimeout(() => {
      prefetchRoute(path);
    }, 100); // Small delay to avoid prefetching on accidental mouse-overs
  }, [path]);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
      prefetchTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!strategyConfig.isPrefetch || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prefetchRoute(path);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '300px' } // Trigger when 300px away from viewport
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [path]);

  return {
    prefetchHandlers: {
      onMouseEnter: startPrefetch,
      onMouseLeave: cancelPrefetch,
      onFocus: startPrefetch,
      onBlur: cancelPrefetch,
    },
    prefetchRef: elementRef,
  };
};
