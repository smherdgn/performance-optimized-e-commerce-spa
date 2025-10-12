import React from 'react';
import { t } from '@/i18n';

interface FiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <aside className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t('filterByCategory')}</h3>
      <ul>
        <li>
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left p-2 rounded ${selectedCategory === 'all' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
          >
            {t('allCategories')}
          </button>
        </li>
        {categories.map(category => (
          <li key={category}>
            <button
              onClick={() => onSelectCategory(category)}
              className={`w-full text-left p-2 rounded ${selectedCategory === category ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Filters;
