import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { t } from '@/i18n';
import { useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
  const { totalPrice, clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate order placement
    console.log('Placing order...');
    setTimeout(() => {
      setIsSuccess(true);
      clearCart();
      setTimeout(() => navigate('/'), 3000);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-20 bg-green-50 p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-green-700">{t('orderSuccess')}</h1>
        <p className="mt-2 text-gray-600">Redirecting to homepage...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">{t('checkout')}</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('contactInfo')}</h2>
            <label className="block mb-2">Email Address</label>
            <input type="email" required className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('shippingAddress')}</h2>
            <label className="block mb-2">Full Name</label>
            <input type="text" required className="w-full p-2 border rounded-md" />
            <label className="block mt-4 mb-2">Address</label>
            <input type="text" required className="w-full p-2 border rounded-md" />
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>{t('total')}:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button type="submit" className="mt-6 w-full bg-indigo-600 text-white p-4 rounded-md text-lg font-semibold hover:bg-indigo-700">
            {t('placeOrder')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
