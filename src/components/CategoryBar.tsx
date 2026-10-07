import React from 'react';
import { Category } from '../types';
import { Wrench, Zap, Paintbrush, Sparkles, Key, Hammer, LayoutGrid } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Wrench':
        return <Wrench className="w-4 h-4 shrink-0" />;
      case 'Zap':
        return <Zap className="w-4 h-4 shrink-0" />;
      case 'Paintbrush':
        return <Paintbrush className="w-4 h-4 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 shrink-0" />;
      case 'Key':
        return <Key className="w-4 h-4 shrink-0" />;
      case 'Hammer':
        return <Hammer className="w-4 h-4 shrink-0" />;
      default:
        return <Wrench className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
      {/* "Todos" button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border min-h-[44px] ${
          selectedCategoryId === null
            ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Todos los Oficios</span>
      </button>

      {categories.map((cat) => {
        const isActive = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(isActive ? null : cat.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border min-h-[44px] ${
              isActive
                ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {getIcon(cat.iconName)}
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
