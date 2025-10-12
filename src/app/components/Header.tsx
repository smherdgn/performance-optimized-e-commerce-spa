import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { t } from '@/i18n';
import { useCart } from '@/hooks/useCart';
import { usePrefetch } from '@/hooks/usePrefetch';
import { strategyConfig } from '@/config/strategy';

const PrefetchNavLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
  const { prefetchHandlers } = usePrefetch(to);
  const navLinkProps = strategyConfig.isPrefetch ? prefetchHandlers : {};
  
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
        }`
      }
      {...navLinkProps}
    >
      {children}
    </NavLink>
  );
}

const Header: React.FC = () => {
  const { cartCount } = useCart();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            PerfShop
          </Link>
          <div className="flex items-center space-x-4">
            <PrefetchNavLink to="/">{t('home')}</PrefetchNavLink>
            <PrefetchNavLink to="/catalog">{t('catalog')}</PrefetchNavLink>
            <PrefetchNavLink to="/about">{t('about')}</PrefetchNavLink>
            <NavLink
              to="/cart"
              className="relative text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
