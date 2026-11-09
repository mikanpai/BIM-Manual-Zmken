import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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

// A compact upper-half orbit anchored in the lower-right quadrant. This keeps
// the ribbon and the manual's title/search area readable while retaining the
// circular visual language. Extra items flow into a second, wider orbit.
const makeRadialPositions = (count: number, width: number, height: number) => {
  if (!count) return [];
  const outerRadius = Math.max(150, Math.min(230, width * 0.19, height * 0.27));
  const innerRadius = Math.max(105, outerRadius - 92);
  const diameter = 72;
  const arcStart = Math.PI;
  const arcSpan = Math.PI;
  const positions: { x: number; y: number; ring: number }[] = [];
  let remaining = count;

  [outerRadius, innerRadius, Math.max(92, innerRadius - 82)].forEach((radius, ring) => {
    if (remaining <= 0) return;
    const capacity = Math.max(3, Math.floor((Math.PI * radius) / 84) + 1);
    const amount = Math.min(remaining, capacity);
    for (let i = 0; i < amount; i += 1) {
      const angle = arcStart + (arcSpan * (i + 0.5)) / amount;
      positions.push({
        x: Math.cos(angle) * radius - diameter / 2,
        y: Math.sin(angle) * radius - diameter / 2,
        ring,
      });
    }
    remaining -= amount;
  });

  return positions;
};

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
  const [transitioningId, setTransitioningId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    try { localStorage.setItem('gloobe_radial_quick_access_enabled', String(enabled)); } catch { /* session-only fallback */ }
  }, [enabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        setEnabled((value) => !value);
        setIsOpen(false);
        setStack([]);
        setTransitioningId(null);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        setStack([]);
        setTransitioningId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toolsToEntries = (categoryTools: ToolItem[], includeDropdownGroups = true): RadialEntry[] => {
    const result: RadialEntry[] = [];
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
        result.push({
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
        result.push({
          kind: 'suboptions',
          id: `suboptions:${tool.id}`,
          label: labelForTool(tool, lang),
          detail: lang === 'ja' ? `${tool.subOptions.length}件の項目` : `${tool.subOptions.length} items`,
          tool,
          subOptions: tool.subOptions,
        });
      } else {
        result.push({
          kind: 'tool',
          id: tool.id,
          label: labelForTool(tool, lang),
          detail: lang === 'ja' ? tool.subgroup.ja : tool.subgroup.en || tool.subgroup.ja,
          tool,
        });
      }
    });
    return result;
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
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const positions = useMemo(
    () => makeRadialPositions(entries.length, viewport.width, viewport.height),
    [entries.length, viewport.width, viewport.height],
  );

  const performEntryAction = (entry: RadialEntry) => {
    setTransitioningId(null);
    if (entry.kind === 'category') {
      onSelectCategory(entry.categoryId);
      setStack((current) => [...current, entry]);
    } else if (entry.kind === 'group' || entry.kind === 'suboptions') {
      setStack((current) => [...current, entry]);
    } else if (entry.kind === 'tool') {
      onSelectCategory(entry.tool.categoryId);
      onSelectTool(entry.tool);
      setIsOpen(false);
      setStack([]);
    } else if (entry.kind === 'suboption') {
      onSelectCategory(entry.tool.categoryId);
      onSelectSubOption(entry.tool, entry.subOption);
      setIsOpen(false);
      setStack([]);
    }
  };

  const handleEntryClick = (entry: RadialEntry) => {
    if (transitioningId) return;
    setTransitioningId(entry.id);
    window.setTimeout(() => performEntryAction(entry), prefersReducedMotion ? 0 : 260);
  };

  const goBack = () => {
    if (transitioningId) return;
    setTransitioningId('back');
    window.setTimeout(() => {
      setTransitioningId(null);
      setStack((current) => current.slice(0, -1));
    }, prefersReducedMotion ? 0 : 180);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setStack([]);
    setTransitioningId(null);
  };

  if (!enabled || hidden) return null;
  const spring = prefersReducedMotion
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 300, damping: 25, mass: 0.72 };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="radial-menu"
            className="fixed inset-0 z-[80] pointer-events-none"
            aria-label="Radial quick access"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.28 } }}
          >
            {entries.map((entry, index) => {
              const position = positions[index] || { x: -36, y: -36, ring: 0 };
              const isSelected = transitioningId === entry.id;
              const isTransitioning = Boolean(transitioningId);
              return (
                <motion.button
                  key={`level-${stack.length}-${entry.id}`}
                  type="button"
                  onClick={() => handleEntryClick(entry)}
                  disabled={isTransitioning}
                  title={entry.label}
                  aria-label={entry.label}
                  initial={{ x: -36, y: -36, opacity: 0, scale: 0.35 }}
                  animate={{
                    x: isSelected ? -36 : isTransitioning ? -36 : position.x,
                    y: isSelected ? -36 : isTransitioning ? -36 : position.y,
                    opacity: isSelected ? 1 : isTransitioning ? 0 : 1,
                    scale: isSelected ? 1.12 : isTransitioning ? 0.5 : 1,
                    transition: isSelected
                      ? (prefersReducedMotion ? spring : { type: 'spring', stiffness: 320, damping: 22 })
                      : (prefersReducedMotion ? spring : { ...spring, delay: index * 0.018 }),
                  }}
                  exit={{
                    x: -36,
                    y: -36,
                    opacity: 0,
                    scale: 0.3,
                    transition: prefersReducedMotion ? spring : { duration: 0.24, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.012, 0.12) },
                  }}
                  style={{ left: '84%', top: '84%' }}
                  className="pointer-events-auto absolute flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 rounded-full border-2 border-orange-300 bg-white/95 px-1.5 text-center text-stone-800 shadow-lg transition-colors hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    <span className="line-clamp-2 w-full text-[9px] font-bold leading-tight">{entry.label}</span>
                  )}
                </motion.button>
              );
            })}

            <motion.button
              type="button"
              onClick={stack.length > 0 ? goBack : closeMenu}
              disabled={Boolean(transitioningId)}
              title={stack.length > 0 ? (lang === 'ja' ? '一つ戻る' : 'Back one level') : (lang === 'ja' ? '閉じる' : 'Close')}
              aria-label={stack.length > 0 ? (lang === 'ja' ? '一つ戻る' : 'Back one level') : (lang === 'ja' ? '閉じる' : 'Close')}
              initial={prefersReducedMotion ? false : { scale: 0.65, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: spring }}
              exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.55, opacity: 0, transition: { duration: 0.2 } }}
              style={{ left: '84%', top: '84%' }}
              className="pointer-events-auto absolute z-10 flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] border-orange-500 bg-orange-600 px-3 text-center text-white shadow-xl transition-colors hover:bg-orange-500"
            >
              {stack.length > 0 ? <ChevronLeft className="mb-1 h-5 w-5" /> : <Command className="mb-1 h-5 w-5" />}
              <span className="line-clamp-2 text-xs font-extrabold leading-tight">{centerLabel}</span>
              <span className="mt-1 text-[9px] text-orange-100">
                {stack.length > 0 ? (lang === 'ja' ? '戻る' : 'Back') : (lang === 'ja' ? '閉じる' : 'Close')}
              </span>
            </motion.button>

            {entries.length === 0 && (
              <div className="pointer-events-none absolute left-[84%] top-[calc(84%+76px)] -translate-x-1/2 text-center text-xs text-stone-500">
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
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          type="button"
          onClick={() => { setStack([]); setTransitioningId(null); setIsOpen(true); }}
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
