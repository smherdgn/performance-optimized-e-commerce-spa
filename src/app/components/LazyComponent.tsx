import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { strategyConfig } from '@/config/strategy';

interface LazyComponentProps {
  children: React.ReactNode;
  placeholder: React.ReactElement;
  rootMargin?: string;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ children, placeholder, rootMargin = '200px' }) => {
  // If the 'lazy' strategy is not active, render the children immediately.
  if (!strategyConfig.isLazy) {
    return <>{children}</>;
  }

  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    rootMargin,
  });

  return (
    <div ref={ref} className="min-h-[100px]">
      {isVisible ? children : placeholder}
    </div>
  );
};

export default LazyComponent;
