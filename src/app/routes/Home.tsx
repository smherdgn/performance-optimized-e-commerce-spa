import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '@/lib/http';
import { Product } from '@/types';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import LazyComponent from '../components/LazyComponent';
import { t } from '@/i18n';
import Spinner from '../components/Spinner';

const HeavyCharts = React.lazy(() => import('@/modules/charts'));
const HeavyMap = React.lazy(() => import('@/modules/maps'));

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModule, setShowModule] = useState<'charts' | 'map' | null>(null);

  const campaignPlaceholder = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    ),
    []
  );

  const recommendationPlaceholder = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-72 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    ),
    []
  );

  useEffect(() => {
    const getProducts = async () => {
      const allProducts = await fetchProducts();
      setFeaturedProducts(allProducts.slice(0, 4));
      setLoading(false);
    };
    getProducts();
  }, []);

  const renderSkeletons = () => (
    Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
  );

  return (
    <div>
      <section className="bg-indigo-600 text-white rounded-lg p-12 text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">{t('heroTitle')}</h1>
        <p className="text-lg mb-6">{t('heroSubtitle')}</p>
        <Link to="/catalog" className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors">
          {t('viewCatalog')}
        </Link>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">{t('featuredProducts')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? renderSkeletons() : featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <LazyComponent placeholder={campaignPlaceholder} rootMargin="350px">
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Saha Kampanyaları</h2>
            <span className="text-indigo-600 font-semibold">Haftalık güncellenir</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Bakım Kiti Kampanyası', description: 'Raylı sistem bakım setlerinde %25 indirim.', badge: 'Stokta' },
              { title: 'Enerji Tasarrufu', description: 'HVAC yedek parçalarda toplu alıma özel fiyat.', badge: 'Yeni' },
              { title: 'Depo İyileştirme', description: 'Sensörlü güvenlik kitlerinde 48 saat içinde teslimat.', badge: 'Popüler' },
            ].map(item => (
              <div key={item.title} className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <span className="text-xs uppercase tracking-wide bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{item.badge}</span>
                </div>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </LazyComponent>

      <LazyComponent placeholder={recommendationPlaceholder} rootMargin="400px">
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Size Özel Öneriler</h2>
            <Link to="/catalog" className="text-indigo-600 font-semibold hover:underline">
              Daha fazlasını keşfet
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? renderSkeletons() : featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </LazyComponent>

      <LazyComponent placeholder={<div className="h-64 flex justify-center items-center"><p>Loading heavy components...</p></div>}>
        <section className="mt-16 p-8 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Dynamically Loaded Modules</h2>
            <p className="text-gray-600 mb-6">These modules are only loaded when you click the buttons below.</p>
            <div className="space-x-4">
              <button onClick={() => setShowModule('charts')} className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600">{t('heavyCharts')}</button>
              <button onClick={() => setShowModule('map')} className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">{t('heavyMap')}</button>
            </div>
            {showModule && (
              <div className="mt-8 border-t pt-8">
                <Suspense fallback={<div className="h-64 flex justify-center items-center"><Spinner /></div>}>
                  {showModule === 'charts' && <HeavyCharts />}
                  {showModule === 'map' && <HeavyMap />}
                </Suspense>
              </div>
            )}
        </section>
      </LazyComponent>
    </div>
  );
};

export default Home;
