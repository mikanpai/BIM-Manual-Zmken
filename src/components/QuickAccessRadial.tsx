import React, { useEffect, useState } from 'react';
import { CategoryInfo, Language, SubOptionItem, ToolItem } from '../types/manual';
import { CadIcon } from './CadIcon';
import { ChevronDown, ChevronLeft, Command, Folder, EyeOff } from 'lucide-react';

interface QuickAccessRadialProps {
  categories: CategoryInfo[];
  tools: ToolItem[];
  currentCategory: string;
  lang: Language;
  onSelectCategory: (categoryId: string) => void;
  onSelectTool: (tool: ToolItem) => void;
  onSelectSubOption: (tool: ToolItem, subOption: SubOptionItem) => void;
  onNavigateHome: () => void;
  hidden?: boolean;
}

type RadialEntry =
  | { kind: 'category'; id: string; label: string; detail: string; categoryId: string }
  | { kind: 'group'; id: string; label: string; detail: string; tools: ToolItem[]; iconTool: ToolItem }
  | { kind: 'suboptions'; id: string; label: string; detail: string; tool: ToolItem; subOptions: SubOptionItem[] }
  | { kind: 'tool'; id: string; label: string; detail: string; tool: ToolItem }
  | { kind: 'suboption'; id: string; label: string; detail: string; tool: ToolItem; subOption: SubOptionItem };

const labelForTool = (tool: ToolItem, lang: Language) =>
  lang === 'ja' ? tool.name.ja : tool.name.en || tool.name.ja;

const labelForSubOption = (subOption: SubOptionItem, lang: Language) =>
  lang === 'ja' ? subOption.name.ja : subOption.name.en || subOption.name.ja;

export const QuickAccessRadial: React.FC<QuickAccessRadialProps> = ({
  categories,
  tools,
  currentCategory,
  lang,
  onSelectCategory,
  onSelectTool,
  onSelectSubOption,
  onNavigateHome,
  hidden = false,
}) => {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('gloobe_radial_quick_access_enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [stack, setStack] = useState<RadialEntry[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('gloobe_radial_quick_access_enabled', String(enabled));
    } catch {
      // The menu still works for this session if storage is unavailable.
    }
  }, [enabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        setEnabled((value) => !value);
        setIsOpen(false);
        setStack([]);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        setStack([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedCategory = stack.find((entry) => entry.kind === 'category');
  const toolsToEntries = (categoryTools: ToolItem[], includeDropdownGroups = true): RadialEntry[] => {
    const entries: RadialEntry[] = [];
    const handledGroups = new Set<string>();

    categoryTools.forEach((tool) => {
      if (includeDropdownGroups && tool.dropdownGroup) {
        if (handledGroups.has(tool.dropdownGroup)) return;
        handledGroups.add(tool.dropdownGroup);
        const groupTools = categoryTools.filter((item) => item.dropdownGroup === tool.dropdownGroup);
        const trigger = groupTools.find((item) => item.isDropdownTrigger) || groupTools[0];
        const groupName = trigger.dropdownGroupName || {
          ja: trigger.name.ja.split('（')[0],
          en: trigger.name.en.split('(')[0],
        };
        entries.push({
          kind: 'group',
          id: `group:${tool.dropdownGroup}`,
          label: lang === 'ja' ? groupName.ja : groupName.en || groupName.ja,
          detail: lang === 'ja' ? `${groupTools.length}件のツール` : `${groupTools.length} tools`,
          tools: groupTools,
          iconTool: trigger,
        });
        return;
      }

      if (tool.subOptions && tool.subOptions.length > 0) {
        entries.push({
          kind: 'suboptions',
          id: `suboptions:${tool.id}`,
          label: labelForTool(tool, lang),
          detail: lang === 'ja' ? `${tool.subOptions.length}件の項目` : `${tool.subOptions.length} items`,
          tool,
          subOptions: tool.subOptions,
        });
      } else {
        entries.push({
          kind: 'tool',
          id: tool.id,
          label: labelForTool(tool, lang),
          detail: lang === 'ja' ? tool.subgroup.ja : tool.subgroup.en || tool.subgroup.ja,
          tool,
        });
      }
    });
    return entries;
  };

  let entries: RadialEntry[] = [];
  if (stack.length === 0) {
    entries = categories.map((category) => ({
      kind: 'category',
      id: category.id,
      label: lang === 'ja' ? category.name.ja : category.name.en || category.name.ja,
      detail: `${tools.filter((tool) => tool.categoryId === category.id).length}${lang === 'ja' ? '件' : ' tools'}`,
      categoryId: category.id,
    }));
  } else {
    const current = stack[stack.length - 1];
    if (current.kind === 'category') {
      entries = toolsToEntries(tools.filter((tool) => tool.categoryId === current.categoryId));
    } else if (current.kind === 'group') {
      entries = toolsToEntries(current.tools, false);
    } else if (current.kind === 'suboptions') {
      entries = current.subOptions.map((subOption) => ({
        kind: 'suboption',
        id: subOption.id,
        label: labelForSubOption(subOption, lang),
        detail: current.tool.name.ja,
        tool: current.tool,
        subOption,
      }));
    }
  }

  const currentNode = stack.length > 0 ? stack[stack.length - 1] : null;
  const centerLabel = currentNode?.label || (lang === 'ja' ? 'クイックアクセス' : 'Quick Access');
  const centerDetail = currentNode?.detail || (lang === 'ja' ? 'リボンタブを選択' : 'Choose a ribbon tab');
  // Arrange choices in a roomy matrix around the fixed center instead of a crowded ring.
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const matrixColumns = viewportWidth >= 900 ? 5 : 3;
  const matrixRows = Math.max(3, Math.ceil((entries.length + 1) / matrixColumns) + 1);
  const centeredRows = matrixRows % 2 === 0 ? matrixRows + 1 : matrixRows;
  const centerRow = Math.floor(centeredRows / 2);
  const centerColumn = Math.floor(matrixColumns / 2);
  const cellWidth = matrixColumns === 5 ? 122 : 106;
  const cellHeight = Math.max(94, Math.min(120, (viewportHeight - 96) / centeredRows));
  const matrixSlots = Array.from({ length: centeredRows * matrixColumns }, (_, index) => ({
    row: Math.floor(index / matrixColumns),
    column: index % matrixColumns,
  }))
    .filter((slot) => !(slot.row === centerRow && slot.column === centerColumn))
    .sort((a, b) => {
      const distanceA = Math.abs(a.row - centerRow) + Math.abs(a.column - centerColumn);
      const distanceB = Math.abs(b.row - centerRow) + Math.abs(b.column - centerColumn);
      return distanceA - distanceB || a.row - b.row || a.column - b.column;
    })
    .slice(0, entries.length);

  const handleEntryClick = (entry: RadialEntry) => {
    if (entry.kind === 'category') {
      onSelectCategory(entry.categoryId);
      setStack((current) => [...current, entry]);
      return;
    }
    if (entry.kind === 'group' || entry.kind === 'suboptions') {
      setStack((current) => [...current, entry]);
      return;
    }
    if (entry.kind === 'tool') {
      onSelectCategory(entry.tool.categoryId);
      onSelectTool(entry.tool);
      setIsOpen(false);
      setStack([]);
      return;
    }
    if (entry.kind === 'suboption') {
      onSelectCategory(entry.tool.categoryId);
      onSelectSubOption(entry.tool, entry.subOption);
      setIsOpen(false);
      setStack([]);
    }
  };

  const goBack = () => setStack((current) => current.slice(0, -1));
  const closeMenu = () => {
    setIsOpen(false);
    setStack([]);
  };

  if (!enabled || hidden) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[80] pointer-events-none" aria-label="Radial quick access">
          {entries.map((entry, index) => {
            const slot = matrixSlots[index];
            const x = (slot.column - centerColumn) * cellWidth;
            const y = (slot.row - centerRow) * cellHeight;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleEntryClick(entry)}
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                title={entry.label}
                className="pointer-events-auto absolute flex h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border-2 border-orange-300 bg-white/95 px-1.5 text-center text-stone-800 shadow-lg transition duration-150 hover:scale-110 hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <span className="relative flex h-9 w-9 items-center justify-center text-orange-700">
                  {entry.kind === 'category'
                    ? <Folder className="h-5 w-5" />
                    : entry.kind === 'group'
                      ? <CadIcon type={entry.iconTool.iconType} customIconUrl={entry.iconTool.customIconUrl} size={25} />
                      : entry.kind === 'suboptions'
                        ? <ChevronLeft className="h-5 w-5 rotate-180" />
                        : <CadIcon type={entry.tool.iconType} customIconUrl={entry.tool.customIconUrl} size={20} />}
                  {entry.kind === 'group' && (
                    <span className="absolute -right-2 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-orange-500 text-white shadow-sm">
                      <ChevronDown className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </span>
                {entry.kind !== 'group' && (
                  <span className="line-clamp-2 w-full text-[11px] font-bold leading-tight">{entry.label}</span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={stack.length > 0 ? goBack : closeMenu}
            title={stack.length > 0 ? (lang === 'ja' ? '一つ戻る' : 'Back one level') : (lang === 'ja' ? '閉じる' : 'Close')}
            className="pointer-events-auto absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] border-orange-500 bg-orange-600 px-3 text-center text-white shadow-xl transition hover:scale-105"
          >
            {stack.length > 0 ? <ChevronLeft className="mb-1 h-5 w-5" /> : <Command className="mb-1 h-5 w-5" />}
            <span className="line-clamp-2 text-xs font-extrabold leading-tight">{centerLabel}</span>
            <span className="mt-1 text-[9px] text-orange-100">
              {stack.length > 0 ? (lang === 'ja' ? '戻る' : 'Back') : (lang === 'ja' ? '閉じる' : 'Close')}
            </span>
          </button>

          {entries.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-[calc(50%+76px)] -translate-x-1/2 text-center text-xs text-stone-500">
              {lang === 'ja' ? '項目がありません' : 'No items'}
            </div>
          )}

          <button
            type="button"
            onClick={() => { setEnabled(false); closeMenu(); }}
            title={lang === 'ja' ? 'クイックアクセスを無効化（Alt+Qで復元）' : 'Disable quick access (Alt+Q to restore)'}
            aria-label={lang === 'ja' ? 'クイックアクセスを無効化' : 'Disable quick access'}
            className="pointer-events-auto absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white/95 text-stone-600 shadow-md transition hover:border-red-400 hover:text-red-600"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => { setStack([]); setIsOpen(true); }}
          className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-white shadow-lg transition hover:scale-110 hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-300"
          title={lang === 'ja' ? 'クイックアクセスを開く（Alt+Qで表示/非表示）' : 'Open quick access (Alt+Q toggles visibility)'}
          aria-label={lang === 'ja' ? 'クイックアクセスを開く' : 'Open quick access'}
        >
          <Command className="h-6 w-6" />
        </button>
      )}
    </>
  );
};
