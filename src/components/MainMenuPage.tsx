/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CategoryInfo, CompanySettings, Language, RibbonCategoryId, 
  SubOptionItem, ToolItem 
} from '../types/manual';
import { ToolCard } from './ToolCard';
import { ToolListItem } from './ToolListItem';
import { 
  Search, Sparkles, Building2, Layers, Film, ArrowRight, 
  LayoutGrid, List, CheckCircle2, ShieldCheck, X,
  SlidersHorizontal, Command, Plus
} from 'lucide-react';

interface MainMenuPageProps {
  categories: CategoryInfo[];
  tools: ToolItem[];
  companySettings: CompanySettings;
  lang: Language;
  activeCategory?: RibbonCategoryId;
  onSelectCategory: (catId: RibbonCategoryId) => void;
  onSelectTool: (tool: ToolItem) => void;
  onSelectSubOption: (tool: ToolItem, subOption: SubOptionItem) => void;
  onAddNewTool: () => void;
  onEditTool: (tool: ToolItem) => void;
  onOpenAdminPanel: () => void;
  onOpenAdminSupabase: () => void;
  onOpenLightbox: (url: string, title: string, caption?: string, isGif?: boolean) => void;
}

export const MainMenuPage: React.FC<MainMenuPageProps> = ({
  categories,
  tools,
  companySettings,
  lang,
  activeCategory,
  onSelectCategory,
  onSelectTool,
  onSelectSubOption,
  onAddNewTool,
  onEditTool,
  onOpenAdminPanel,
  onOpenAdminSupabase,
  onOpenLightbox,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<RibbonCategoryId | 'all'>(
    activeCategory || 'all'
  );
  const [filterTag, setFilterTag] = useState<'all' | 'has_media'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync category filter when activeCategory prop changes from RibbonBar
  useEffect(() => {
    if (activeCategory) {
      setSelectedCategoryFilter(activeCategory);
    }
  }, [activeCategory]);

  // Filter tools based on search query, category, and tags
  const filteredTools = tools.filter((tool) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchJa = tool.name.ja.toLowerCase().includes(q) || tool.shortDesc.ja.toLowerCase().includes(q);
      const matchEn = tool.name.en.toLowerCase().includes(q) || tool.shortDesc.en.toLowerCase().includes(q);
      const matchFullJa = tool.fullDesc.ja.toLowerCase().includes(q);
      const matchFullEn = tool.fullDesc.en.toLowerCase().includes(q);
      const matchSubgroupJa = tool.subgroup.ja.toLowerCase().includes(q);
      const matchSubgroupEn = tool.subgroup.en.toLowerCase().includes(q);
      const matchShortcut = tool.shortcut ? tool.shortcut.toLowerCase() === q || tool.shortcut.toLowerCase().includes(q) : false;
      
      const matchSub = tool.subOptions?.some((s) => 
        s.name.ja.toLowerCase().includes(q) || 
        s.name.en.toLowerCase().includes(q) ||
        (s.shortcut && s.shortcut.toLowerCase().includes(q)) ||
        (s.desc && (s.desc.ja.toLowerCase().includes(q) || s.desc.en.toLowerCase().includes(q)))
      );

      const matchSteps = tool.steps.some((s) => 
        s.title.ja.toLowerCase().includes(q) || 
        s.title.en.toLowerCase().includes(q) || 
        s.instruction.ja.toLowerCase().includes(q) ||
        s.instruction.en.toLowerCase().includes(q)
      );

      const matchPreviewBoxes = tool.previewBoxes?.some((b) => 
        b.boxTitle.ja.toLowerCase().includes(q) || 
        b.boxTitle.en.toLowerCase().includes(q) ||
        (b.toolName && (b.toolName.ja.toLowerCase().includes(q) || b.toolName.en.toLowerCase().includes(q)))
      );

      if (!matchJa && !matchEn && !matchFullJa && !matchFullEn && !matchSubgroupJa && !matchSubgroupEn && !matchShortcut && !matchSub && !matchSteps && !matchPreviewBoxes) {
        return false;
      }
    }

    // 2. Category Filter
    if (selectedCategoryFilter !== 'all' && tool.categoryId !== selectedCategoryFilter) {
      return false;
    }

    // 3. Filter Tag
    if (filterTag === 'has_media') {
      const hasMedia = 
        tool.media.length > 0 || 
        tool.steps.some((s) => !!s.mediaUrl) || 
        !!tool.simulatorGifUrl ||
        tool.previewBoxes?.some((b) => !!b.gifUrl || (b.gifUrls && b.gifUrls.length > 0) || (b.mediaList && b.mediaList.length > 0));
      if (!hasMedia) return false;
    }

    return true;
  });

  // Calculate statistics
  const totalSubOptions = tools.reduce((acc, t) => acc + (t.subOptions?.length || 0), 0);
  const totalToolsWithMedia = tools.filter(
    (t) => t.media.length > 0 || t.steps.some((s) => !!s.mediaUrl) || !!t.simulatorGifUrl || (t.previewBoxes && t.previewBoxes.length > 0)
  ).length;

  const handleCategoryClick = (catId: RibbonCategoryId | 'all') => {
    setSelectedCategoryFilter(catId);
    if (catId !== 'all') {
      onSelectCategory(catId);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setFilterTag('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. Hero & Fast BIM Search Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-orange-950 text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-stone-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-orange-600/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          {/* Top Brand Pill & Company Notice */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-200">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span>GLOOBE BIM MANUAL & SEARCH</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Building2 className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-semibold text-white">
                {lang === 'ja' ? companySettings.nameJa : companySettings.nameEn}
              </span>
              <span className="text-stone-400 hidden sm:inline">
                {lang === 'ja' ? companySettings.departmentJa : companySettings.departmentEn}
              </span>
            </div>
          </div>

          {/* Headline & Description */}
          <div className="max-w-3xl space-y-1.5">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {lang === 'ja'
                ? '建築BIM統合マニュアル & ツール検索'
                : 'Architectural BIM Integrated Manual & Tool Search'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              {lang === 'ja'
                ? 'ツール名、ショートカットキー（W, C, S..）、部材仕様、または手順キーワードを入力すると直下に検索結果が表示されます。'
                : 'Search any BIM tool, shortcut (W, C, S..), or operation step. Results appear directly below.'}
            </p>
          </div>

          {/* Search Box inside Hero */}
          <div className="pt-1">
            <div className="relative max-w-3xl">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                placeholder={
                  lang === 'ja'
                    ? 'ツール名、ショートカットキー（W, C, S..）、手順キーワードで検索...'
                    : 'Search BIM tools, shortcuts (W, C, S..), or operation steps...'
                }
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/40 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? 'クリア' : 'Clear'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Line */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 text-xs text-stone-300">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm">{tools.length}</span>
              <span className="text-stone-400">{lang === 'ja' ? '個のツール' : 'tools'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-orange-300 text-sm">{categories.length}</span>
              <span className="text-stone-400">{lang === 'ja' ? '分野カテゴリ' : 'categories'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm">{totalSubOptions}</span>
              <span className="text-stone-400">{lang === 'ja' ? 'サブ機能' : 'sub-options'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-400 text-sm">{totalToolsWithMedia}</span>
              <span className="text-stone-400">{lang === 'ja' ? 'GIF/動画連動' : 'with media'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DIRECTLY UNDER SEARCH BAR: Filters & Search Results */}
      <section className="space-y-4">
        
        {/* Category Tabs & Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
          
          {/* Category Filter Pills (All + Categories) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-visible">
            <span className="text-xs font-bold text-stone-600 mr-1 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <span>{lang === 'ja' ? '分野:' : 'Discipline:'}</span>
            </span>

            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {lang === 'ja' ? 'すべて' : 'All Disciplines'} ({tools.length})
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryFilter === cat.id;
              const catToolCount = tools.filter((t) => t.categoryId === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-orange-600 text-white font-bold shadow-2xs ring-2 ring-orange-200'
                      : 'bg-stone-100 hover:bg-orange-50 hover:text-orange-800 text-stone-700'
                  }`}
                >
                  <span>{lang === 'ja' ? cat.name.ja : cat.name.en}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-orange-700 text-white' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {catToolCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-Filters & View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-600 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                <span>{lang === 'ja' ? '絞り込み:' : 'Filter:'}</span>
              </span>

              {[
                { id: 'all', ja: '全件', en: 'All' },
                { id: 'has_media', ja: 'GIF / 動画付き', en: 'With GIF/WebM' },
              ].map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setFilterTag(tag.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterTag === tag.id
                      ? 'bg-orange-600 text-white shadow-2xs font-bold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {lang === 'ja' ? tag.ja : tag.en}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <div className="flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title={lang === 'ja' ? 'グリッド表示' : 'Grid View'}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title={lang === 'ja' ? 'リスト表示' : 'List View'}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Tool Shortcut */}
              <button
                onClick={onAddNewTool}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ja' ? 'ツール追加' : 'Add Tool'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
              {searchQuery.trim()
                ? (lang === 'ja' ? `検索結果: ${filteredTools.length} 件` : `Search Results: ${filteredTools.length} tools`)
                : (lang === 'ja' ? `ツール一覧: ${filteredTools.length} 件` : `Tool Directory: ${filteredTools.length} tools`)}
            </h2>

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-xs font-medium">
                <span>キーワード: "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {selectedCategoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-xs font-medium">
                <span>
                  {categories.find((c) => c.id === selectedCategoryFilter)?.name[lang] || selectedCategoryFilter}
                </span>
                <button
                  onClick={() => handleCategoryClick('all')}
                  className="hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {(searchQuery || selectedCategoryFilter !== 'all' || filterTag !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-stone-500 hover:text-orange-600 font-medium underline cursor-pointer"
            >
              {lang === 'ja' ? 'フィルターを全てリセット' : 'Reset all filters'}
            </button>
          )}
        </div>

        {/* Tools Results Grid or List (DIRECTLY UNDER SEARCH) */}
        {filteredTools.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={onSelectTool}
                  onSelectSubOption={onSelectSubOption}
                  onEdit={onEditTool}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTools.map((tool) => (
                <ToolListItem
                  key={tool.id}
                  tool={tool}
                  onSelect={onSelectTool}
                  lang={lang}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              {lang === 'ja' ? '該当するツールが見つかりませんでした' : 'No matching tools found'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {lang === 'ja'
                ? `「${searchQuery}」に一致するGLOOBEツールが見つかりませんでした。キーワードを変更するか、フィルター条件をリセットしてください。`
                : `No GLOOBE tools matched "${searchQuery}". Try different keywords or reset filters.`}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
              >
                {lang === 'ja' ? '検索条件をクリア' : 'Clear Filters'}
              </button>
              <button
                onClick={onAddNewTool}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                {lang === 'ja' ? '新規ツールを追加' : 'Add New Tool'}
              </button>
            </div>
          </div>
        )}

      </section>

    </div>
  );
};
