import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { strategyConfig } from '@/config/strategy';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Spinner from '@/app/components/Spinner';
import { CartProvider } from '@/hooks/useCart';

const routeLoaders = {
  Home: () => import('@/app/routes/Home'),
  Catalog: () => import('@/app/routes/Catalog'),
  Product: () => import('@/app/routes/Product'),
  Cart: () => import('@/app/routes/Cart'),
  Checkout: () => import('@/app/routes/Checkout'),
  About: () => import('@/app/routes/About'),
};

const shouldPreloadRoutes = !strategyConfig.isSplit;
if (shouldPreloadRoutes) {
  // Kick off preloading immediately for non-split strategy to mimic eager bundling.
  Object.values(routeLoaders).forEach((loader) => {
    loader();
  });
}

const HomeLazy = React.lazy(routeLoaders.Home);
const CatalogLazy = React.lazy(routeLoaders.Catalog);
const ProductLazy = React.lazy(routeLoaders.Product);
const CartLazy = React.lazy(routeLoaders.Cart);
const CheckoutLazy = React.lazy(routeLoaders.Checkout);
const AboutLazy = React.lazy(routeLoaders.About);

const App: React.FC = () => {
  const Home = HomeLazy;
  const Catalog = CatalogLazy;
  const Product = ProductLazy;
  const Cart = CartLazy;
  const Checkout = CheckoutLazy;
  const About = AboutLazy;
  
  return (
    <CartProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Suspense fallback={<Spinner />}>
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
