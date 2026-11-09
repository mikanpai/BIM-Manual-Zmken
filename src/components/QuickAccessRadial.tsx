import React, { useEffect, useState } from 'react';
import {
  CategoryInfo,
  Language,
  SubOptionItem,
  ToolItem,
} from '../types/manual';
import { CadIcon } from './CadIcon';
import {
  ChevronLeft,
  Command,
  Folder,
  Home,
  Layers,
  X,
} from 'lucide-react';

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
  | { kind: 'group'; id: string; label: string; detail: string; tools: ToolItem[] }
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
  const maxRadius = Math.max(100, Math.min(300, window.innerWidth * 0.34, window.innerHeight * 0.30));
  const radius = Math.min(maxRadius, Math.max(108, entries.length * 9));

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
        <div
          className="fixed inset-0 z-[80] bg-stone-950/55 backdrop-blur-sm flex items-center justify-center p-3"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMenu();
          }}
          role="presentation"
        >
          <div className="relative w-[min(94vw,780px)] h-[min(88vh,780px)] rounded-[2rem] border border-white/60 bg-white/95 shadow-2xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-stone-500">
                <Command className="w-4 h-4 text-orange-600" />
                <span>GLOOBE QUICK ACCESS</span>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                aria-label={lang === 'ja' ? '閉じる' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute inset-0">
              {entries.map((entry, index) => {
                const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(entries.length, 1);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius + 8;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleEntryClick(entry)}
                    style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                    className="absolute left-1/2 top-1/2 z-10 flex h-[68px] w-[76px] flex-col items-center justify-center gap-1 rounded-2xl border border-stone-200 bg-white px-1.5 text-center shadow-md transition hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                      {entry.kind === 'tool' && 'tool' in entry
                        ? <CadIcon type={entry.tool.iconType} customIconUrl={entry.tool.customIconUrl} size={19} />
                        : entry.kind === 'category'
                          ? <Folder className="h-4 w-4" />
                          : entry.kind === 'group'
                            ? <Layers className="h-4 w-4" />
                            : entry.kind === 'suboptions'
                              ? <ChevronLeft className="h-4 w-4 rotate-180" />
                              : <CadIcon type={entry.tool.iconType} customIconUrl={entry.tool.customIconUrl} size={19} />}
                    </span>
                    <span className="w-full truncate text-[10px] font-bold leading-tight text-stone-800">{entry.label}</span>
                  </button>
                );
              })}

              <div className="absolute left-1/2 top-1/2 z-20 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[5px] border-orange-200 bg-gradient-to-br from-orange-600 to-amber-500 px-3 text-center text-white shadow-xl">
                <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  {stack.length === 0 ? <Command className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </span>
                <span className="max-w-full line-clamp-2 text-xs font-extrabold leading-tight">{centerLabel}</span>
                <span className="mt-1 text-[9px] text-white/80">{centerDetail}</span>
                <button
                  type="button"
                  onClick={stack.length > 0 ? goBack : closeMenu}
                  className="mt-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold hover:bg-white/30"
                >
                  {stack.length > 0 ? (lang === 'ja' ? '戻る' : 'Back') : (lang === 'ja' ? '閉じる' : 'Close')}
                </button>
              </div>

              {entries.length === 0 && (
                <div className="absolute left-1/2 top-[calc(50%+112px)] -translate-x-1/2 rounded-xl bg-stone-100 px-4 py-2 text-center text-xs text-stone-500">
                  {lang === 'ja' ? '項目がありません' : 'No items in this section'}
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => { onNavigateHome(); closeMenu(); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2 text-[11px] font-semibold text-stone-600 hover:border-orange-300 hover:text-orange-700"
              >
                <Home className="h-3.5 w-3.5" />
                {lang === 'ja' ? 'マニュアル一覧' : 'Manual Home'}
              </button>
              <button
                type="button"
                onClick={() => { setEnabled(false); closeMenu(); }}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100"
              >
                {lang === 'ja' ? 'クイックアクセスを無効化（Alt+Qで復元）' : 'Disable Quick Access (restore with Alt+Q)'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => { setStack([]); setIsOpen(true); }}
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-xl shadow-orange-900/20 transition hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-300"
        title={lang === 'ja' ? 'クイックアクセスを開く（Alt+Qで表示/非表示）' : 'Open Quick Access (Alt+Q toggles visibility)'}
        aria-label={lang === 'ja' ? 'クイックアクセスを開く' : 'Open Quick Access'}
      >
        <Command className="h-6 w-6" />
      </button>
    </>
  );
};
