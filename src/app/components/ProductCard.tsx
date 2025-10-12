import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { getAssetUrl } from '@/config/cdn';
import { usePrefetch } from '@/hooks/usePrefetch';
import { strategyConfig } from '@/config/strategy';
import { useCart } from '@/hooks/useCart';
import { t } from '@/i18n';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { prefetchHandlers, prefetchRef } = usePrefetch(`/product/${product.id}`);
  const { addToCart } = useCart();
  const linkProps = strategyConfig.isPrefetch ? prefetchHandlers : {};
  const imageUrl = product.imageUrl.startsWith('http') ? product.imageUrl : getAssetUrl(product.imageUrl);

  return (
    <div ref={prefetchRef as React.RefObject<HTMLDivElement>} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link to={`/product/${product.id}`} {...linkProps}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy" // Native browser lazy loading for images
          width="400"
          height="300"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 flex-grow">
          <Link to={`/product/${product.id}`} {...linkProps} className="hover:text-indigo-600">
            {product.name}
          </Link>
        </h3>
        <p className="text-gray-500 text-sm mt-1">{product.category}</p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
          <button 
            onClick={() => addToCart(product)}
            aria-label={`${t('addToCart')} ${product.name}`}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
