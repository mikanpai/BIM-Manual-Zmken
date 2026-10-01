import React from 'react';
import { CategoryInfo, CompanySettings, Language, RibbonCategoryId } from '../types/manual';
import { CATEGORIES } from '../data/defaultManual';
import { Search, Sparkles, Filter, LayoutGrid, List, CheckCircle, ShieldCheck } from 'lucide-react';

interface ManualHeroProps {
  categories?: CategoryInfo[];
  companySettings: CompanySettings;
  lang: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: RibbonCategoryId | 'all';
  onSelectCategory: (cat: RibbonCategoryId | 'all') => void;
  filterTag: 'all' | 'has_media';
  onSelectFilterTag: (tag: 'all' | 'has_media') => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  totalTools: number;
}

export const ManualHero: React.FC<ManualHeroProps> = ({
  categories = CATEGORIES,
  companySettings,
  lang,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  filterTag,
  onSelectFilterTag,
  viewMode,
  onToggleViewMode,
  totalTools,
}) => {
  return (
    <div className="space-y-6">
      {/* Calm Bright Architectural Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-50/50 to-white text-stone-800 p-6 sm:p-8 overflow-hidden shadow-xs border border-orange-200/90">
        
        {/* Subtle CAD grid watermark */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Warm Orange Ambient Light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>{lang === 'ja' ? '福井コンピュータ GLOOBE BIM 準拠' : 'Fukui Computer GLOOBE BIM Standard'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {lang === 'ja' ? companySettings.nameJa : companySettings.nameEn}
            <span className="block text-orange-600 text-xl sm:text-2xl mt-1 font-bold">
              {lang === 'ja' ? 'GLOOBE 操作マニュアル・ツール一覧' : 'GLOOBE Operation Manual & Tools'}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-normal pt-1">
            {lang === 'ja' ? companySettings.welcomeNoticeJa : companySettings.welcomeNoticeEn}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Search input + View mode toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === 'ja' ? 'ツール名、ショートカット（W, C, Dなど）、機能説明で検索...' : 'Search by tool name, shortcut key, or feature...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded"
              >
                {lang === 'ja' ? 'クリア' : 'Clear'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Filter tags */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-semibold text-stone-600">
              <button
                onClick={() => onSelectFilterTag('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTag === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'
                }`}
              >
                {lang === 'ja' ? 'すべて' : 'All'}
              </button>
              <button
                onClick={() => onSelectFilterTag('has_media')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTag === 'has_media' ? 'bg-orange-600 text-white shadow-2xs' : 'hover:text-stone-900'
                }`}
              >
                {lang === 'ja' ? 'GIF/動画付き' : 'GIF/Media'}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xl text-stone-600">
              <button
                onClick={() => onToggleViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:text-stone-900'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:text-stone-900'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {lang === 'ja' ? '全カテゴリ' : 'All Categories'} ({totalTools})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {lang === 'ja' ? cat.name.ja : cat.name.en}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
