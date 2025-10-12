import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '@/lib/http';
import { Product } from '@/types';
import { ProductDetailSkeleton } from '../components/Skeleton';
import Gallery from '../components/Gallery';
import Recommendations from '../components/Recommendations';
import LazyComponent from '../components/LazyComponent';
import { useCart } from '@/hooks/useCart';
import { t } from '@/i18n';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const getProductData = async () => {
      if (!id) return;
      setLoading(true);
      const fetchedProduct = await fetchProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        const allProducts = await fetchProducts();
        const related = allProducts.filter(p => p.category === fetchedProduct.category && p.id !== fetchedProduct.id).slice(0, 4);
        setRelatedProducts(related);
      }
      setLoading(false);
    };
    getProductData();
  }, [id]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }
  
  // Create a dummy list of images for the gallery using the main product image as a base
  // This assumes a naming convention like product-1.webp, product-1-2.webp, etc.
  const baseImageUrl = product.imageUrl.replace('.webp', '');
  const galleryImages = [
    product.imageUrl,
    `${baseImageUrl}-2.webp`,
    `${baseImageUrl}-3.webp`,
    `${baseImageUrl}-4.webp`,
    `${baseImageUrl}-5.webp`,
  ];

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Gallery images={galleryImages} productName={product.name} />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-indigo-600 mb-4">${product.price.toFixed(2)}</p>
          <div className="text-gray-600 mb-6">{product.description}</div>
          <button 
            onClick={() => addToCart(product)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
      
      <LazyComponent placeholder={<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-12"><div className="h-64 bg-gray-200 rounded-lg col-span-full"></div></div>}>
        <Recommendations products={relatedProducts} />
      </LazyComponent>
    </div>
  );
};

export default ProductPage;
