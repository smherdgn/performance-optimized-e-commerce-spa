import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProducts } from '@/lib/http';
import { Product } from '@/types';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import Filters from '../components/Filters';
import Spinner from '../components/Spinner';

const ITEMS_PER_PAGE = 12;

const Catalog: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
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
    setPage(1);
    const newProducts = filteredProducts.slice(0, ITEMS_PER_PAGE);
    setDisplayedProducts(newProducts);
    setHasMore(filteredProducts.length > ITEMS_PER_PAGE);
  }, [filteredProducts]);

  const loadMoreProducts = useCallback(() => {
    const nextPage = page + 1;
    const newProducts = filteredProducts.slice(0, nextPage * ITEMS_PER_PAGE);
    setDisplayedProducts(newProducts);
    setPage(nextPage);
    if (newProducts.length >= filteredProducts.length) {
      setHasMore(false);
    }
  }, [page, filteredProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProducts();
        }
      },
      { threshold: 1.0 }
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
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderSkeletons()}
            </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div ref={loaderRef} className="h-20 flex justify-center items-center">
              {hasMore && <Spinner />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;
