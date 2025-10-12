import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
    <div className="bg-gray-300 h-48 w-full rounded-md"></div>
    <div className="mt-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

export const ProductDetailSkeleton: React.FC = () => (
  <div className="grid md:grid-cols-2 gap-8 animate-pulse">
    <div>
      <div className="bg-gray-300 h-96 w-full rounded-lg"></div>
    </div>
    <div>
      <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>
      <div className="h-12 bg-gray-300 rounded w-48"></div>
    </div>
  </div>
);
