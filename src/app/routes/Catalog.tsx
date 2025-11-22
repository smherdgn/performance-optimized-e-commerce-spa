import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProducts } from '@/lib/http';
import { Product } from '@/types';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import Filters from '../components/Filters';
import Spinner from '../components/Spinner';
import LazyComponent from '../components/LazyComponent';

const ITEMS_PER_PAGE = 12;

const Catalog: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = React.useRef(1);
  const loadingMoreRef = React.useRef(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const loaderRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const products = await fetchProducts();
      setAllProducts(products);
      setLoading(false);
    };
    getProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  useEffect(() => {
    pageRef.current = 1;
    loadingMoreRef.current = false;
    const newProducts = filteredProducts.slice(0, ITEMS_PER_PAGE);
    setDisplayedProducts(newProducts);
    setHasMore(filteredProducts.length > ITEMS_PER_PAGE);
  }, [filteredProducts]);

  const loadMoreProducts = useCallback(() => {
    if (loadingMoreRef.current || !hasMore) {
      return;
    }
    loadingMoreRef.current = true;

    const nextPage = pageRef.current + 1;
    const newProducts = filteredProducts.slice(0, nextPage * ITEMS_PER_PAGE);
    pageRef.current = nextPage;
    setDisplayedProducts(newProducts);

    if (newProducts.length >= filteredProducts.length) {
      setHasMore(false);
    }

    loadingMoreRef.current = false;
  }, [filteredProducts, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadMoreProducts();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '200px',
      }
    );

    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader);
    }
    return () => {
      if (loader) {
        observer.unobserve(loader);
      }
    };
  }, [hasMore, loadMoreProducts]);

  const categories = useMemo(() => [...new Set(allProducts.map(p => p.category))], [allProducts]);
  
  const renderSkeletons = () => (
    Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
  );

  return (
    <div className="grid md:grid-cols-4 gap-8">
      <div className="md:col-span-1">
        <Filters 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      <div className="md:col-span-3">
        <LazyComponent
          rootMargin="350px"
          placeholder={
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderSkeletons()}
              </div>
              <div className="h-20 flex justify-center items-center">
                <Spinner />
              </div>
            </div>
          }
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderSkeletons()}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <div ref={loaderRef} className="flex flex-col items-center gap-3 py-6">
                {hasMore ? (
                  <>
                    <Spinner />
                    <button
                      type="button"
                      onClick={loadMoreProducts}
                      className="px-4 py-2 rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                      disabled={loadingMoreRef.current}
                    >
                      {loadingMoreRef.current ? 'Yükleniyor...' : 'Daha fazla ürün yükle'}
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Tüm ürünler görüntülendi.</p>
                )}
              </div>
            </>
          )}
        </LazyComponent>
      </div>
    </div>
  );
};

export default Catalog;
