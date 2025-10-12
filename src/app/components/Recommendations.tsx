import React, { Suspense, useState } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { t } from '@/i18n';
import Spinner from './Spinner';

const HeavyCharts = React.lazy(() => import('@/modules/charts'));

interface RecommendationsProps {
  products: Product[];
}

const Recommendations: React.FC<RecommendationsProps> = ({ products }) => {
  const [showCharts, setShowCharts] = useState(false);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t('similarProducts')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-8 text-center">
         <button 
            onClick={() => setShowCharts(true)}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('heavyCharts')}
          </button>
      </div>

      {showCharts && (
        <div className="mt-8 p-4 border rounded-lg bg-white">
          <Suspense fallback={<div className="h-64 flex justify-center items-center"><Spinner /></div>}>
            <HeavyCharts />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
