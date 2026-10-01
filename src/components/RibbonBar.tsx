import React, { useState, useEffect, useRef } from 'react';
import { CategoryInfo, Language, RibbonCategoryId, SubOptionItem, ToolItem } from '../types/manual';
import { CATEGORIES } from '../data/defaultManual';
import { CadIcon } from './CadIcon';
import { 
  ChevronDown, ChevronUp, Sparkles, Plus, ExternalLink, 
  Check, ArrowRight, X, Layers, Home
} from 'lucide-react';

interface RibbonBarProps {
  categories?: CategoryInfo[];
  tools: ToolItem[];
  currentCategory: RibbonCategoryId;
  onSelectCategory: (catId: RibbonCategoryId) => void;
  onSelectTool: (tool: ToolItem) => void;
  onSelectSubOption?: (tool: ToolItem, subOption: SubOptionItem) => void;
  onAddNewTool: () => void;
  onSaveTools?: (updatedTools: ToolItem[]) => void;
  onNavigateHome: () => void;
  lang: Language;
}

export const RibbonBar: React.FC<RibbonBarProps> = ({
  categories = CATEGORIES,
  tools,
  currentCategory,
  onSelectCategory,
  onSelectTool,
  onSelectSubOption,
  onAddNewTool,
  onSaveTools,
  onNavigateHome,
  lang,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Dropdown state: either a dropdown group ID or a tool ID (for subOptions)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
        setDropdownPosition(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setDropdownPosition(null);
      }
    };

    const handleScrollOrResize = () => {
      // Close dropdown if window scrolls to prevent detachment
      setOpenDropdownId(null);
      setDropdownPosition(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  // Filter tools for current category
  const activeTools = tools.filter((t) => t.categoryId === currentCategory);

  // Group tools by subgroup (e.g. "柱ツール / Column Tools", "梁・大梁ツール / Beam Tools", "スラブ・床ツール / Slab Tools", "壁ツール / Wall Tools")
  const groupedSubgroups: { [key: string]: { ja: string; en: string; tools: ToolItem[] } } = {};
  activeTools.forEach((tool) => {
    const key = tool.subgroup.ja;
    if (!groupedSubgroups[key]) {
      groupedSubgroups[key] = {
        ja: tool.subgroup.ja,
        en: tool.subgroup.en,
        tools: [],
      };
    }
    groupedSubgroups[key].tools.push(tool);
  });

  // Current category metadata
  const currentCategoryInfo = categories.find((c) => c.id === currentCategory) || categories[0];

  // Open dropdown and compute floating coordinates to cover content below like Word
  const handleToggleDropdown = (id: string, buttonElement: HTMLElement) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPosition(null);
      return;
    }

    const rect = buttonElement.getBoundingClientRect();
    const dropdownWidth = 340;
    let left = rect.left;
    
    // Boundary check so dropdown does not exceed viewport width
    if (left + dropdownWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - dropdownWidth - 16);
    }

    setDropdownPosition({
      top: rect.bottom + 4,
      left: Math.max(12, left),
    });
    setOpenDropdownId(id);
  };

  // Helper: Find active dropdown data (either group of tools or tool subOptions)
  let activeDropdownContent: {
    type: 'group' | 'subOptions';
    title: { ja: string; en: string };
    tools?: ToolItem[];
    parentTool?: ToolItem;
    subOptions?: SubOptionItem[];
  } | null = null;

  if (openDropdownId) {
    // Check if it's a dropdown group ID
    const matchingGroupTools = activeTools.filter((t) => t.dropdownGroup === openDropdownId);
    if (matchingGroupTools.length > 0) {
      const trigger = matchingGroupTools.find((t) => t.isDropdownTrigger) || matchingGroupTools[0];
      const groupName = trigger.dropdownGroupName || {
        ja: trigger.name.ja.split('（')[0],
        en: trigger.name.en.split('(')[0],
      };
      activeDropdownContent = {
        type: 'group',
        title: groupName,
        tools: matchingGroupTools,
      };
    } else {
      // Check if it's a tool with subOptions
      const matchingTool = activeTools.find((t) => t.id === openDropdownId);
      if (matchingTool && matchingTool.subOptions && matchingTool.subOptions.length > 0) {
        activeDropdownContent = {
          type: 'subOptions',
          title: matchingTool.name,
          parentTool: matchingTool,
          subOptions: matchingTool.subOptions,
        };
      }
    }
  }

  return (
    <div className="w-full bg-white border-b border-stone-200/90 text-stone-800 select-none shadow-xs relative z-30">
      {/* Top Tab Bar (GLOOBE Ribbon Tabs) */}
      <div className="flex items-center justify-between px-3 md:px-6 pt-1.5 border-b border-stone-200/80 bg-stone-50/90 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {/* USER REQUESTED: Home icon in place of flickering dot, clicking takes to main menu / home */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded-lg bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer group"
            title={lang === 'ja' ? 'ホーム / メインメニューへ移動' : 'Navigate to Home / Main Menu'}
          >
            <Home className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform shrink-0" />
            <span>GLOOBE BIM</span>
          </button>

          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            const count = tools.filter((t) => t.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setOpenDropdownId(null);
                  setDropdownPosition(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all ${
                  isActive
                    ? 'bg-white text-orange-600 border-t-2 border-orange-600 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <span>{lang === 'ja' ? cat.name.ja : cat.name.en}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isActive ? 'bg-orange-100 text-orange-700' : 'bg-stone-200 text-stone-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pl-4">
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              setOpenDropdownId(null);
              setDropdownPosition(null);
            }}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 transition text-xs flex items-center gap-1"
            title={isCollapsed ? (lang === 'ja' ? 'リボンを展開' : 'Expand Ribbon') : (lang === 'ja' ? 'リボンを折りたたむ' : 'Collapse Ribbon')}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Ribbon Tool Palette Panel */}
      {!isCollapsed && (
        <div className="px-3 md:px-6 py-2.5 bg-white min-h-[96px] flex items-stretch gap-4 overflow-x-auto scrollbar-thin">
          {Object.keys(groupedSubgroups).length > 0 ? (
            Object.entries(groupedSubgroups).map(([groupKey, groupData]) => {
              const subTools = groupData.tools;
              const subgroupName = lang === 'ja' ? groupData.ja : groupData.en;

              // Organize tools into standalone vs dropdown groups
              type RibbonItem = 
                | { type: 'standalone'; tool: ToolItem }
                | { 
                    type: 'dropdown'; 
                    groupId: string; 
                    groupName: { ja: string; en: string }; 
                    triggerTool: ToolItem; 
                    tools: ToolItem[] 
                  };

              const ribbonItems: RibbonItem[] = [];
              const seenDropdownGroups = new Set<string>();

              subTools.forEach((tool) => {
                if (!tool.dropdownGroup) {
                  ribbonItems.push({ type: 'standalone', tool });
                } else {
                  const gId = tool.dropdownGroup;
                  if (!seenDropdownGroups.has(gId)) {
                    seenDropdownGroups.add(gId);
                    const groupTools = subTools.filter((t) => t.dropdownGroup === gId);
                    const trigger = groupTools.find((t) => t.isDropdownTrigger) || groupTools[0];
                    const gName = trigger.dropdownGroupName || {
                      ja: trigger.name.ja.split('（')[0],
                      en: trigger.name.en.split('(')[0],
                    };
                    ribbonItems.push({
                      type: 'dropdown',
                      groupId: gId,
                      groupName: gName,
                      triggerTool: trigger,
                      tools: groupTools,
                    });
                  }
                }
              });

              return (
                <div
                  key={groupKey}
                  className="flex flex-col justify-between pr-4 border-r border-stone-200 last:border-r-0 min-w-max group/subgroup-col"
                >
                  {/* Tool Buttons in this Subgroup */}
                  <div className="flex items-center gap-2">
                    {ribbonItems.map((item) => {
                      if (item.type === 'standalone') {
                        const tool = item.tool;
                        const hasSubOptions = tool.subOptions && tool.subOptions.length > 0;
                        const isDropdownOpen = openDropdownId === tool.id;

                        return (
                          <div key={tool.id} className="relative">
                            {/* Standalone Button */}
                            <div
                              className={`group flex flex-col items-center justify-center rounded-xl transition-all text-center w-20 h-16 relative border ${
                                isDropdownOpen
                                  ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-xs'
                                  : 'hover:bg-orange-50/80 border-transparent hover:border-orange-300'
                              }`}
                            >
                              {/* Upper Action: Main Tool Click */}
                              <div 
                                onClick={() => onSelectTool(tool)}
                                className="flex-1 w-full flex flex-col items-center justify-center cursor-pointer pt-1"
                                title={lang === 'ja' ? `${tool.name.ja} のマニュアル詳細を開く` : `Open manual for ${tool.name.en}`}
                              >
                                <div className="relative w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-orange-600 text-stone-700 group-hover:text-white flex items-center justify-center transition border border-stone-200/80 group-hover:border-transparent shadow-2xs">
                                  <CadIcon 
                                    type={tool.iconType} 
                                    customIconUrl={tool.customIconUrl}
                                    size={18} 
                                  />
                                  {tool.media.some((m) => m.type === 'gif') && (
                                    <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded bg-orange-600 text-[8px] font-bold text-white shadow-2xs leading-none">
                                      GIF
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Lower Action: Label or Sub-options Trigger */}
                              <div 
                                onClick={(e) => {
                                  if (hasSubOptions) {
                                    handleToggleDropdown(tool.id, e.currentTarget);
                                  } else {
                                    onSelectTool(tool);
                                  }
                                }}
                                className="w-full flex items-center justify-center gap-0.5 pb-1 px-1 cursor-pointer transition text-stone-700 group-hover:text-stone-900"
                              >
                                <span className="text-[11px] truncate max-w-[56px] font-medium">
                                  {lang === 'ja' ? tool.name.ja.split('（')[0] : tool.name.en.split('(')[0]}
                                </span>
                                {hasSubOptions && (
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180 text-orange-600' : 'text-stone-400 group-hover:text-orange-600'}`} />
                                )}
                              </div>

                              {tool.shortcut && !hasSubOptions && (
                                <span className="absolute bottom-0 right-1 text-[8px] font-mono text-stone-400 group-hover:text-orange-600">
                                  [{tool.shortcut}]
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        // Dropdown Group Button (e.g. Wall Types Dropdown, Finishes Dropdown)
                        const isDropdownOpen = openDropdownId === item.groupId;
                        const triggerTool = item.triggerTool;

                        return (
                          <div key={item.groupId} className="relative">
                            <div
                              className={`group flex flex-col items-center justify-center rounded-xl transition-all text-center w-22 h-16 relative border ${
                                isDropdownOpen
                                  ? 'bg-sky-100/90 border-sky-500 text-sky-950 shadow-md ring-2 ring-sky-300'
                                  : 'bg-stone-50/60 hover:bg-sky-50/80 border-stone-200 hover:border-sky-300'
                              }`}
                            >
                              {/* Upper: Icon (clicks to toggle dropdown or select trigger tool) */}
                              <div 
                                onClick={(e) => handleToggleDropdown(item.groupId, e.currentTarget)}
                                className="flex-1 w-full flex flex-col items-center justify-center cursor-pointer pt-1"
                                title={lang === 'ja' ? `${item.groupName.ja} を展開 (${item.tools.length}件)` : `Expand ${item.groupName.en} (${item.tools.length} items)`}
                              >
                                <div className="relative w-8 h-8 rounded-lg bg-white group-hover:bg-sky-600 text-stone-700 group-hover:text-white flex items-center justify-center transition border border-stone-200 group-hover:border-transparent shadow-2xs">
                                  <CadIcon 
                                    type={triggerTool.dropdownGroupIconType || triggerTool.iconType} 
                                    customIconUrl={triggerTool.dropdownGroupCustomIconUrl || triggerTool.customIconUrl}
                                    size={18} 
                                  />
                                </div>
                              </div>

                              {/* Lower Action: GLOOBE / Office-Style Dropdown Bar with Chevron */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleDropdown(item.groupId, e.currentTarget);
                                }}
                                className={`w-full flex items-center justify-center gap-1 pb-1 px-1 cursor-pointer transition border-t rounded-b-lg font-semibold ${
                                  isDropdownOpen
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-sky-100/70 hover:bg-sky-200/90 text-sky-900 border-sky-200'
                                }`}
                                title={lang === 'ja' ? 'クリックしてドロップダウンを展開' : 'Click to expand dropdown tools'}
                              >
                                <span className="text-[11px] truncate max-w-[56px]">
                                  {lang === 'ja' ? item.groupName.ja : item.groupName.en}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180 text-white' : 'text-sky-600'}`} />
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* Grouping Label (Tool groupings are configured only in Admin Panel) */}
                  <div className="flex items-center justify-center gap-1 mt-1 pt-1 border-t border-stone-100">
                    <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase select-none">
                      {subgroupName}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-3 text-stone-500 text-xs py-4 px-2">
              <span>{lang === 'ja' ? 'このカテゴリにはまだツールが登録されていません。' : 'No tools registered in this category yet.'}</span>
              <button
                onClick={onAddNewTool}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ja' ? '新規ツールを追加' : 'Add Tool'}</span>
              </button>
            </div>
          )}

          {/* Quick Actions in Ribbon: Add Tool */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-200 min-w-max my-auto">
            <button
              onClick={onAddNewTool}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/60 text-stone-500 hover:text-orange-600 transition w-18 h-16 cursor-pointer"
              title={lang === 'ja' ? '新しいツールを追加' : 'Add new tool'}
            >
              <Plus className="w-4 h-4 mb-0.5 text-stone-400 group-hover:text-orange-600" />
              <span className="text-[10px] font-medium">
                {lang === 'ja' ? 'ツール追加' : 'Add Tool'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* USER REQUESTED: MICROSOFT WORD STYLE FLOATING DROPDOWN BAR THAT COVERS THE BOX UNDER IT */}
      {openDropdownId && dropdownPosition && activeDropdownContent && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 9999,
          }}
          className="w-[360px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border-2 border-sky-300 ring-4 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Office Style Header Bar */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span className="font-bold text-xs tracking-wide">
                {lang === 'ja' ? activeDropdownContent.title.ja : activeDropdownContent.title.en}
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/20 text-white font-medium">
                {activeDropdownContent.type === 'group' 
                  ? (lang === 'ja' ? `${activeDropdownContent.tools?.length || 0} 件` : `${activeDropdownContent.tools?.length || 0} items`)
                  : (lang === 'ja' ? `${activeDropdownContent.subOptions?.length || 0} サブ機能` : `${activeDropdownContent.subOptions?.length || 0} sub-options`)}
              </span>
            </div>

            <button
              onClick={() => {
                setOpenDropdownId(null);
                setDropdownPosition(null);
              }}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition"
              title={lang === 'ja' ? '閉じる' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subheader hint */}
          <div className="px-4 py-1.5 bg-sky-50/70 border-b border-sky-100 flex items-center justify-between text-[10px] text-sky-800">
            <span>
              {lang === 'ja' ? '項目をクリックしてマニュアルを開く:' : 'Click item to open manual guide:'}
            </span>
            <span className="font-semibold text-sky-600">GLOOBE BIM</span>
          </div>

          {/* All Dropdown Items List (Shows ALL items completely without cutoffs) */}
          <div className="max-h-[380px] overflow-y-auto p-1.5 space-y-1 divide-y divide-stone-100 scrollbar-thin">
            {activeDropdownContent.type === 'group' && activeDropdownContent.tools ? (
              activeDropdownContent.tools.map((dropdownTool) => (
                <button
                  key={dropdownTool.id}
                  onClick={() => {
                    setOpenDropdownId(null);
                    setDropdownPosition(null);
                    onSelectTool(dropdownTool);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50 text-stone-800 hover:text-sky-950 flex items-center justify-between gap-3 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Tool Logo / CAD Icon Tile */}
                    <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-sky-600 text-stone-700 group-hover:text-white flex items-center justify-center shrink-0 border border-stone-200 transition shadow-2xs">
                      <CadIcon 
                        type={dropdownTool.iconType} 
                        customIconUrl={dropdownTool.customIconUrl}
                        size={20} 
                      />
                    </div>

                    <div className="truncate">
                      <div className="font-bold text-xs text-stone-900 group-hover:text-sky-950 truncate">
                        <span>{lang === 'ja' ? dropdownTool.name.ja : dropdownTool.name.en}</span>
                      </div>
                      
                      {dropdownTool.shortDesc && (
                        <div className="text-[10px] text-stone-500 truncate mt-0.5 group-hover:text-sky-800">
                          {lang === 'ja' ? dropdownTool.shortDesc.ja : dropdownTool.shortDesc.en}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {dropdownTool.shortcut && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-stone-100 group-hover:bg-sky-100 text-stone-600 group-hover:text-sky-800 font-semibold border border-stone-200/80 group-hover:border-sky-300">
                        [{dropdownTool.shortcut}]
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              ))
            ) : activeDropdownContent.type === 'subOptions' && activeDropdownContent.subOptions && activeDropdownContent.parentTool ? (
              activeDropdownContent.subOptions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setOpenDropdownId(null);
                    setDropdownPosition(null);
                    if (onSelectSubOption && activeDropdownContent?.parentTool) {
                      onSelectSubOption(activeDropdownContent.parentTool, sub);
                    } else if (activeDropdownContent?.parentTool) {
                      onSelectTool(activeDropdownContent.parentTool);
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50 text-stone-800 hover:text-orange-950 flex items-center justify-between gap-3 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white flex items-center justify-center shrink-0 border border-orange-200 transition shadow-2xs">
                      <CadIcon 
                        type={sub.iconType || activeDropdownContent.parentTool?.iconType || 'wall'} 
                        customIconUrl={sub.customIconUrl}
                        size={20} 
                      />
                    </div>

                    <div className="truncate">
                      <div className="font-bold text-xs text-stone-900 group-hover:text-orange-950 truncate">
                        {lang === 'ja' ? sub.name.ja : sub.name.en}
                      </div>
                      {sub.desc && (
                        <div className="text-[10px] text-stone-500 truncate mt-0.5">
                          {lang === 'ja' ? sub.desc.ja : sub.desc.en}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sub.shortcut && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                        [{sub.shortcut}]
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              ))
            ) : null}
          </div>

          {/* Footer Bar */}
          <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px]">
            <span className="text-stone-500 text-[10px]">
              {lang === 'ja' ? 'キーボード [Esc] で閉じます' : 'Press [Esc] to close'}
            </span>

            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                setDropdownPosition(null);
                onAddNewTool();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:border-sky-500 hover:bg-sky-50 text-sky-800 font-bold text-[10px] shadow-2xs transition"
            >
              <Plus className="w-3 h-3" />
              <span>{lang === 'ja' ? 'ツールを追加' : 'Add Tool'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
