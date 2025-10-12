import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { strategyConfig } from '@/config/strategy';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Spinner from '@/app/components/Spinner';
import { CartProvider } from '@/hooks/useCart';

// Eagerly import components for non-split strategies
import HomeEager from '@/app/routes/Home';
import CatalogEager from '@/app/routes/Catalog';
import ProductEager from '@/app/routes/Product';
import CartEager from '@/app/routes/Cart';
import CheckoutEager from '@/app/routes/Checkout';
import AboutEager from '@/app/routes/About';

// Lazily import components for split strategy
const HomeLazy = React.lazy(() => import('@/app/routes/Home'));
const CatalogLazy = React.lazy(() => import('@/app/routes/Catalog'));
const ProductLazy = React.lazy(() => import('@/app/routes/Product'));
const CartLazy = React.lazy(() => import('@/app/routes/Cart'));
const CheckoutLazy = React.lazy(() => import('@/app/routes/Checkout'));
const AboutLazy = React.lazy(() => import('@/app/routes/About'));

const App: React.FC = () => {
  const { isSplit } = strategyConfig;

  const Home = isSplit ? HomeLazy : HomeEager;
  const Catalog = isSplit ? CatalogLazy : CatalogEager;
  const Product = isSplit ? ProductLazy : ProductEager;
  const Cart = isSplit ? CartLazy : CartEager;
  const Checkout = isSplit ? CheckoutLazy : CheckoutEager;
  const About = isSplit ? AboutLazy : AboutEager;
  
  return (
    <CartProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Suspense fallback={<div className="flex justify-center items-center h-96"><Spinner /></div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </CartProvider>
  );
};

export default App;
