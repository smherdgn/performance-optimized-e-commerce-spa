import React from 'react';
import { strategyConfig } from '@/config/strategy';

const Footer: React.FC = () => {
  const dataVariant = import.meta.env.VITE_DATA_VARIANT || 'small';
  const cdnEnabled = import.meta.env.VITE_CDN_ENABLED === 'true';

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} PerfShop. Tüm hakları saklıdır.</p>
        <div className="mt-2 text-xs text-gray-400">
          <span className="font-semibold">Strategy:</span> {strategyConfig.strategy} | 
          <span className="font-semibold"> Data:</span> {dataVariant} | 
          <span className="font-semibold"> CDN:</span> {cdnEnabled ? 'On' : 'Off'}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
