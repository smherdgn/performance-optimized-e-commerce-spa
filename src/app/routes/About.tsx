import React from 'react';
import { t } from '@/i18n';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">{t('about')} PerfShop</h1>
      <p className="text-lg text-gray-700 leading-relaxed mb-4">
        Welcome to PerfShop, a special e-commerce application built to demonstrate and benchmark modern web performance optimization techniques. This is not a real store, but a high-fidelity sandbox for developers and performance engineers.
      </p>
      <p className="text-lg text-gray-700 leading-relaxed mb-4">
        Our goal is to provide a realistic environment to measure the impact of strategies like:
      </p>
      <ul className="list-disc list-inside text-lg text-gray-700 space-y-2 mb-6 pl-4">
        <li><strong>Code Splitting:</strong> Loading code only when it's needed for a specific route.</li>
        <li><strong>Lazy Loading:</strong> Deferring the load of below-the-fold components and images.</li>
        <li><strong>Prefetching:</strong> Intelligently preloading assets for anticipated user actions.</li>
        <li><strong>CDN Integration:</strong> Measuring the benefits of serving assets from a global Content Delivery Network.</li>
      </ul>
      <p className="text-lg text-gray-700 leading-relaxed">
        By switching between different configurations via environment variables, you can run performance analysis tools like Lighthouse, WebPageTest, and k6 to see concrete data on how each strategy affects metrics like Largest Contentful Paint (LCP), First Contentful Paint (FCP), and Total Blocking Time (TBT).
      </p>
    </div>
  );
};

export default AboutPage;
