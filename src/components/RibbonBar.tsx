import React, { useState, useEffect, useRef } from 'react';
import {
  CategoryInfo,
  Language,
  RibbonCategoryId,
  SubOptionItem,
  ToolItem,
} from '../types/manual';
import { CATEGORIES } from '../data/defaultManual';
import { CadIcon } from './CadIcon';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  X,
  Check,
  Home,
  Layers,
} from 'lucide-react';

interface RibbonBarProps {
  categories?: CategoryInfo[];
  tools: ToolItem[];
  currentCategory: RibbonCategoryId;
  onSelectCategory: (catId: RibbonCategoryId) => void;
  onSelectTool: (tool: ToolItem) => void;
  onSelectSubOption?: (tool: ToolItem, subOption: SubOptionItem) => void;
  onAddNewTool: () => void;
  onAddSubOption?: (tool: ToolItem) => void;
  onSaveTools?: (updatedTools: ToolItem[]) => void;
  onNavigateHome: () => void;
  isPaletteVisible?: boolean;
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
  onAddSubOption,
  onNavigateHome,
  isPaletteVisible = true,
  lang,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<{
    toolId: string;
    subOptionId: string;
  } | null>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setOpenDropdownId(null);
    setDropdownPosition(null);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDropdown();
    };

    const handleScrollOrResize = (event: Event) => {
      // Scrolling the list INSIDE the popup must not close it
      if (
        event.type === 'scroll' &&
        dropdownRef.current &&
        event.target instanceof Node &&
        dropdownRef.current.contains(event.target)
      ) {
        return;
      }
      closeDropdown();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, []);

  const activeTools = tools.filter(
    (tool) => tool.categoryId === currentCategory
  );

  const groupedSubgroups: {
    [key: string]: { ja: string; en: string; tools: ToolItem[] };
  } = {};

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

  const currentCategoryInfo =
    categories.find((category) => category.id === currentCategory) ||
    categories[0];

  const handleToggleDropdown = (
    id: string,
    buttonElement: HTMLElement
  ) => {
    if (openDropdownId === id) {
      closeDropdown();
      return;
    }

    const rect = buttonElement.getBoundingClientRect();
    const dropdownWidth = 360;

    let left = rect.left;

    if (left + dropdownWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - dropdownWidth - 16);
    }

    setDropdownPosition({
      top: rect.bottom + 4,
      left: Math.max(12, left),
    });

    setOpenDropdownId(id);
  };

  const selectMainTool = (tool: ToolItem) => {
    setSelectedToolId(tool.id);
    setSelectedSubOption(null);
    closeDropdown();
    onSelectTool(tool);
  };

  const selectSubOption = (
    parentTool: ToolItem,
    subOption: SubOptionItem
  ) => {
    setSelectedToolId(parentTool.id);
    setSelectedSubOption({
      toolId: parentTool.id,
      subOptionId: subOption.id,
    });

    closeDropdown();

    if (onSelectSubOption) {
      onSelectSubOption(parentTool, subOption);
    } else {
      onSelectTool(parentTool);
    }
  };

  let activeDropdownContent: {
    type: 'group' | 'subOptions';
    title: { ja: string; en: string };
    tools?: ToolItem[];
    parentTool?: ToolItem;
    subOptions?: SubOptionItem[];
  } | null = null;

  if (openDropdownId) {
    const matchingGroupTools = activeTools.filter(
      (tool) => tool.dropdownGroup === openDropdownId
    );

    if (matchingGroupTools.length > 0) {
      const trigger =
        matchingGroupTools.find((tool) => tool.isDropdownTrigger) ||
        matchingGroupTools[0];

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
      const matchingTool = activeTools.find(
        (tool) => tool.id === openDropdownId
      );

      if (
        matchingTool &&
        matchingTool.subOptions &&
        matchingTool.subOptions.length > 0
      ) {
        activeDropdownContent = {
          type: 'subOptions',
          title: matchingTool.name,
          parentTool: matchingTool,
          subOptions: matchingTool.subOptions,
        };
      }
    }
  }

  const selectedSubOptionData = selectedSubOption
    ? tools
        .find((tool) => tool.id === selectedSubOption.toolId)
        ?.subOptions?.find(
          (subOption) => subOption.id === selectedSubOption.subOptionId
        )
    : null;

  return (
    <div className="sticky top-0 z-50 w-full bg-white text-stone-800 select-none border-b border-stone-200/90 shadow-md">
      {/* Main ribbon tabs */}
      <div className="flex items-center justify-between px-3 md:px-6 pt-1.5 border-b border-stone-200/80 bg-stone-50/90 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded-lg bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all"
            title={
              lang === 'ja'
                ? 'ホーム / メインメニューへ移動'
                : 'Navigate to Home / Main Menu'
            }
          >
            <Home className="w-3.5 h-3.5" />
            <span>GLOOBE BIM</span>
          </button>

          {categories.map((category) => {
            const isActive = currentCategory === category.id;
            const count = tools.filter(
              (tool) => tool.categoryId === category.id
            ).length;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onSelectCategory(category.id);
                  closeDropdown();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all ${
                  isActive
                    ? 'bg-white text-orange-600 border-t-2 border-orange-600 font-bold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <span>
                  {lang === 'ja' ? category.name.ja : category.name.en}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pl-4">
          <button
            type="button"
            onClick={() => {
              setIsCollapsed((previous) => !previous);
              closeDropdown();
            }}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 transition text-xs flex items-center gap-1"
            title={
              isCollapsed
                ? lang === 'ja'
                  ? 'リボンを展開'
                  : 'Expand Ribbon'
                : lang === 'ja'
                  ? 'リボンを折りたたむ'
                  : 'Collapse Ribbon'
            }
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tool palette */}
      {!isCollapsed && isPaletteVisible && (
        <div className="px-3 md:px-6 py-2.5 bg-white min-h-[96px] flex items-stretch gap-4 overflow-x-auto scrollbar-thin">
          {Object.keys(groupedSubgroups).length > 0 ? (
            Object.entries(groupedSubgroups).map(([groupKey, groupData]) => {
              const subTools = groupData.tools;
              const subgroupName =
                lang === 'ja' ? groupData.ja : groupData.en;

              type RibbonItem =
                | { type: 'standalone'; tool: ToolItem }
                | {
                    type: 'dropdown';
                    groupId: string;
                    groupName: { ja: string; en: string };
                    triggerTool: ToolItem;
                    tools: ToolItem[];
                  };

              const ribbonItems: RibbonItem[] = [];
              const seenDropdownGroups = new Set<string>();

              subTools.forEach((tool) => {
                if (!tool.dropdownGroup) {
                  ribbonItems.push({ type: 'standalone', tool });
                } else {
                  const groupId = tool.dropdownGroup;

                  if (!seenDropdownGroups.has(groupId)) {
                    seenDropdownGroups.add(groupId);

                    const groupTools = subTools.filter(
                      (item) => item.dropdownGroup === groupId
                    );

                    const trigger =
                      groupTools.find((item) => item.isDropdownTrigger) ||
                      groupTools[0];

                    const groupName = trigger.dropdownGroupName || {
                      ja: trigger.name.ja.split('（')[0],
                      en: trigger.name.en.split('(')[0],
                    };

                    ribbonItems.push({
                      type: 'dropdown',
                      groupId,
                      groupName,
                      triggerTool: trigger,
                      tools: groupTools,
                    });
                  }
                }
              });

              return (
                <div
                  key={groupKey}
                  className="flex flex-col justify-between pr-4 border-r border-stone-200 last:border-r-0 min-w-max"
                >
                  <div className="flex items-center gap-2">
                    {ribbonItems.map((item) => {
                      if (item.type === 'standalone') {
                        const tool = item.tool;
                        const hasSubOptions = Boolean(
                          tool.subOptions && tool.subOptions.length > 0
                        );

                        const isDropdownOpen =
                          openDropdownId === tool.id;

                        const isSelected =
                          selectedToolId === tool.id;

                        const isSubOptionSelected =
                          selectedSubOption?.toolId === tool.id;

                        return (
                          <div key={tool.id} className="relative">
                            <div
                              className={`group flex flex-col items-center justify-center rounded-xl transition-all duration-200 text-center w-20 h-16 relative border ${
                                isSelected
                                  ? 'bg-orange-50 border-orange-400 text-orange-950 shadow-sm ring-1 ring-orange-200'
                                  : isDropdownOpen
                                    ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-sm'
                                    : 'hover:bg-orange-50/80 border-transparent hover:border-orange-300'
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-orange-500" />
                              )}

                              <div
                                onClick={() => selectMainTool(tool)}
                                className="flex-1 w-full flex flex-col items-center justify-center cursor-pointer pt-1"
                                title={
                                  lang === 'ja'
                                    ? `${tool.name.ja} のマニュアル詳細を開く`
                                    : `Open manual for ${tool.name.en}`
                                }
                              >
                                <div className="relative w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-orange-600 text-stone-700 group-hover:text-white flex items-center justify-center transition border border-stone-200/80 group-hover:border-transparent shadow-sm">
                                  <CadIcon
                                    type={tool.iconType}
                                    customIconUrl={tool.customIconUrl}
                                    size={18}
                                  />

                                  {tool.media.some(
                                    (media) => media.type === 'gif'
                                  ) && (
                                    <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded bg-orange-600 text-[8px] font-bold text-white shadow-sm leading-none">
                                      GIF
                                    </span>
                                  )}

                                  {isSubOptionSelected && (
                                    <span
                                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-white ring-2 ring-white"
                                      title={
                                        lang === 'ja'
                                          ? 'サブ機能を選択中'
                                          : 'Sub-option selected'
                                      }
                                    >
                                      <Layers className="h-2.5 w-2.5" />
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div
                                onClick={(event) => {
                                  if (hasSubOptions) {
                                    handleToggleDropdown(
                                      tool.id,
                                      event.currentTarget
                                    );
                                  } else {
                                    selectMainTool(tool);
                                  }
                                }}
                                className="w-full flex items-center justify-center gap-0.5 pb-1 px-1 cursor-pointer transition text-stone-700 group-hover:text-stone-900"
                              >
                                <span className="text-[11px] truncate max-w-[56px] font-medium">
                                  {lang === 'ja'
                                    ? tool.name.ja.split('（')[0]
                                    : tool.name.en.split('(')[0]}
                                </span>

                                {hasSubOptions && (
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${
                                      isDropdownOpen
                                        ? 'rotate-180 text-orange-600'
                                        : 'text-stone-400 group-hover:text-orange-600'
                                    }`}
                                  />
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
                      }

                      const isDropdownOpen =
                        openDropdownId === item.groupId;

                      const isSelected = item.tools.some(
                        (tool) =>
                          selectedToolId === tool.id ||
                          selectedSubOption?.toolId === tool.id
                      );

                      const triggerTool = item.triggerTool;

                      return (
                        <div key={item.groupId} className="relative">
                          <div
                            className={`group flex flex-col items-center justify-center rounded-xl transition-all duration-200 text-center w-22 h-16 relative border ${
                              isSelected
                                ? 'bg-orange-50 border-orange-400 text-orange-950 shadow-sm ring-1 ring-orange-200'
                                : isDropdownOpen
                                  ? 'bg-sky-100/90 border-sky-500 text-sky-950 shadow-sm'
                                  : 'bg-stone-50/60 hover:bg-sky-50/80 border-stone-200 hover:border-sky-300'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-0.5 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-orange-500" />
                            )}

                            <div
                              onClick={(event) =>
                                handleToggleDropdown(
                                  item.groupId,
                                  event.currentTarget
                                )
                              }
                              className="flex-1 w-full flex flex-col items-center justify-center cursor-pointer pt-1"
                              title={
                                lang === 'ja'
                                  ? `${item.groupName.ja} を展開`
                                  : `Expand ${item.groupName.en}`
                              }
                            >
                              <div className="relative w-8 h-8 rounded-lg bg-white group-hover:bg-sky-600 text-stone-700 group-hover:text-white flex items-center justify-center transition border border-stone-200 group-hover:border-transparent shadow-sm">
                                <CadIcon
                                  type={
                                    triggerTool.dropdownGroupIconType ||
                                    triggerTool.iconType
                                  }
                                  customIconUrl={
                                    triggerTool.dropdownGroupCustomIconUrl ||
                                    triggerTool.customIconUrl
                                  }
                                  size={18}
                                />
                              </div>
                            </div>

                            <div
                              onClick={(event) => {
                                event.stopPropagation();
                                handleToggleDropdown(
                                  item.groupId,
                                  event.currentTarget
                                );
                              }}
                              className={`w-full flex items-center justify-center gap-1 pb-1 px-1 cursor-pointer transition border-t rounded-b-lg font-semibold ${
                                isDropdownOpen
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-sky-100/70 hover:bg-sky-200/90 text-sky-900 border-sky-200'
                              }`}
                            >
                              <span className="text-[11px] truncate max-w-[56px]">
                                {lang === 'ja'
                                  ? item.groupName.ja
                                  : item.groupName.en}
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform shrink-0 ${
                                  isDropdownOpen
                                    ? 'rotate-180 text-white'
                                    : 'text-sky-600'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

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
              <span>
                {lang === 'ja'
                  ? 'このカテゴリにはまだツールが登録されていません。'
                  : 'No tools registered in this category yet.'}
              </span>
              <button
                type="button"
                onClick={onAddNewTool}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ja' ? '新規ツールを追加' : 'Add Tool'}</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-stone-200 min-w-max my-auto">
            <button
              type="button"
              onClick={onAddNewTool}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/60 text-stone-500 hover:text-orange-600 transition w-18 h-16"
              title={lang === 'ja' ? '新しいツールを追加' : 'Add new tool'}
            >
              <Plus className="w-4 h-4 mb-0.5 text-stone-400" />
              <span className="text-[10px] font-medium">
                {lang === 'ja' ? 'ツール追加' : 'Add Tool'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Floating dropdown */}
      {openDropdownId && dropdownPosition && activeDropdownContent && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 9999,
          }}
          className="w-[360px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-stone-200 ring-4 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/90" />
              <span className="font-bold text-xs tracking-wide">
                {lang === 'ja'
                  ? activeDropdownContent.title.ja
                  : activeDropdownContent.title.en}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                {activeDropdownContent.type === 'group'
                  ? lang === 'ja'
                    ? `${activeDropdownContent.tools?.length || 0} 件`
                    : `${activeDropdownContent.tools?.length || 0} items`
                  : lang === 'ja'
                    ? `${activeDropdownContent.subOptions?.length || 0} サブ機能`
                    : `${activeDropdownContent.subOptions?.length || 0} sub-options`}
              </span>
            </div>

            <button
              type="button"
              onClick={closeDropdown}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition"
              title={lang === 'ja' ? '閉じる' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Context hint */}
          {activeDropdownContent.type === 'subOptions' &&
            activeDropdownContent.parentTool && (
              <div className="px-3 py-2 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-white text-orange-700">
                  <CadIcon
                    type={activeDropdownContent.parentTool.iconType}
                    customIconUrl={
                      activeDropdownContent.parentTool.customIconUrl
                    }
                    size={17}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-orange-700">
                    {lang === 'ja'
                      ? 'このツールのサブ機能'
                      : 'BROWSING UNDER THIS TOOL'}
                  </div>
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {lang === 'ja'
                      ? activeDropdownContent.parentTool.name.ja
                      : activeDropdownContent.parentTool.name.en}
                  </div>
                </div>
                <Layers className="h-4 w-4 shrink-0 text-orange-500" />
              </div>
            )}

          {activeDropdownContent.type === 'group' && (
            <div className="px-4 py-1.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[10px] text-stone-600">
              <span>
                {lang === 'ja'
                  ? '項目をクリックしてマニュアルを開く'
                  : 'Select a tool to open its manual'}
              </span>
              <span className="font-semibold text-orange-600">
                GLOOBE BIM
              </span>
            </div>
          )}

          <div className="max-h-[380px] overflow-y-auto overscroll-contain p-1.5 space-y-1 scrollbar-thin">
            {activeDropdownContent.type === 'group' &&
              activeDropdownContent.tools?.map((dropdownTool) => {
                const isSelected = selectedToolId === dropdownTool.id;

                return (
                  <button
                    type="button"
                    key={dropdownTool.id}
                    onClick={() => selectMainTool(dropdownTool)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition group ${
                      isSelected
                        ? 'bg-orange-50 ring-1 ring-orange-300 text-orange-950'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-stone-100 text-stone-700 border-stone-200 group-hover:bg-orange-600 group-hover:text-white'
                        }`}
                      >
                        <CadIcon
                          type={dropdownTool.iconType}
                          customIconUrl={dropdownTool.customIconUrl}
                          size={20}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">
                          {lang === 'ja'
                            ? dropdownTool.name.ja
                            : dropdownTool.name.en}
                        </div>
                        {dropdownTool.shortDesc && (
                          <div className="text-[10px] text-stone-500 truncate mt-0.5">
                            {lang === 'ja'
                              ? dropdownTool.shortDesc.ja
                              : dropdownTool.shortDesc.en}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected ? (
                      <Check className="w-4 h-4 shrink-0 text-orange-600" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-stone-300 group-hover:text-orange-600" />
                    )}
                  </button>
                );
              })}

            {activeDropdownContent.type === 'subOptions' &&
              activeDropdownContent.subOptions?.map((subOption) => {
                const parentTool = activeDropdownContent?.parentTool;

                if (!parentTool) return null;

                const isSelected =
                  selectedSubOption?.toolId === parentTool.id &&
                  selectedSubOption?.subOptionId === subOption.id;

                return (
                  <button
                    type="button"
                    key={subOption.id}
                    onClick={() => selectSubOption(parentTool, subOption)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition group ${
                      isSelected
                        ? 'bg-orange-100 text-orange-950 ring-1 ring-orange-300 shadow-sm'
                        : 'hover:bg-orange-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-orange-50 text-orange-600 border-orange-200 group-hover:bg-orange-600 group-hover:text-white'
                        }`}
                      >
                        <CadIcon
                          type={
                            subOption.iconType || parentTool.iconType || 'wall'
                          }
                          customIconUrl={subOption.customIconUrl}
                          size={20}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">
                          {lang === 'ja'
                            ? subOption.name.ja
                            : subOption.name.en}
                        </div>
                        {subOption.desc && (
                          <div className="text-[10px] text-stone-500 truncate mt-0.5">
                            {lang === 'ja'
                              ? subOption.desc.ja
                              : subOption.desc.en}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 shrink-0">
                        <Check className="h-4 w-4" />
                        {lang === 'ja' ? '選択中' : 'SELECTED'}
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-stone-300 group-hover:text-orange-600" />
                    )}
                  </button>
                );
              })}
          </div>

          <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px]">
            <span className="text-stone-500 text-[10px]">
              {lang === 'ja'
                ? 'Esc キーで閉じる'
                : 'Press Esc to close'}
            </span>

            {activeDropdownContent.type === 'subOptions' &&
            activeDropdownContent.parentTool &&
            onAddSubOption ? (
              /* Inside a tool's sub-option list: add a sub-option to THIS tool */
              <button
                type="button"
                onClick={() => {
                  const parent = activeDropdownContent.parentTool!;
                  closeDropdown();
                  onAddSubOption(parent);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:border-orange-500 hover:bg-orange-50 text-orange-800 font-bold text-[10px] shadow-sm transition"
              >
                <Plus className="w-3 h-3" />
                <span>{lang === 'ja' ? 'サブ機能を追加' : 'Add Sub-Option'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  onAddNewTool();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:border-orange-500 hover:bg-orange-50 text-orange-800 font-bold text-[10px] shadow-sm transition"
              >
                <Plus className="w-3 h-3" />
                <span>{lang === 'ja' ? 'ツールを追加' : 'Add Tool'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};