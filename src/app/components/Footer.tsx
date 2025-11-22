import React from 'react';
import { strategyConfig } from '@/config/strategy';

const Footer: React.FC = () => {
  const dataVariant = import.meta.env.VITE_DATA_VARIANT || 'small';
  const cdnEnabled = import.meta.env.VITE_CDN_ENABLED === 'true';
  const cdnBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || '—';

  const configItems = [
    { label: 'Strategy', value: strategyConfig.strategy },
    { label: 'Lazy Loading', value: strategyConfig.isLazy ? 'Aktif' : 'Pasif' },
    { label: 'Code Splitting', value: strategyConfig.isSplit ? 'Aktif' : 'Pasif' },
    { label: 'Prefetching', value: strategyConfig.isPrefetch ? 'Aktif' : 'Pasif' },
    { label: 'Data Variant', value: dataVariant },
    { label: 'CDN', value: cdnEnabled ? 'Açık' : 'Kapalı' },
    { label: 'CDN Base URL', value: cdnEnabled ? cdnBaseUrl : '—' },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center">&copy; {new Date().getFullYear()} PerfShop. Tüm hakları saklıdır.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-300">
          {configItems.map((item) => (
            <div key={item.label} className="flex justify-between border border-gray-800 rounded-md px-3 py-2 bg-gray-800/40">
              <span className="font-semibold text-gray-200">{item.label}</span>
              <span className="text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
