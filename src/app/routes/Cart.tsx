import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { t } from '@/i18n';
import { getAssetUrl } from '@/config/cdn';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">{t('shoppingCart')}</h1>
        <p className="text-gray-600 mb-6">{t('emptyCart')}</p>
        <Link to="/catalog" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
          {t('viewCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">{t('shoppingCart')}</h1>
      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center">
              <img src={getAssetUrl(item.imageUrl)} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
            </div>
            <div className="flex items-center">
              <p className="font-semibold mr-4">${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-right">
        <p className="text-2xl font-bold">{t('total')}: ${totalPrice.toFixed(2)}</p>
        <Link to="/checkout" className="mt-4 inline-block bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700">
          {t('proceedToCheckout')}
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
