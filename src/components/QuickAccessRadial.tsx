import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CategoryInfo, Language, SubOptionItem, ToolItem } from '../types/manual';
import { CadIcon } from './CadIcon';
import { ChevronDown, ChevronLeft, Command, Folder, EyeOff, X } from 'lucide-react';

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
const labelForSubOption = (item: SubOptionItem, lang: Language) =>
  lang === 'ja' ? item.name.ja : item.name.en || item.name.ja;

// Centered radial menu: concentric circles keep bubbles evenly spaced
// around the central hub. Each page is capped to the available collision-free slots.
const PAGE_SIZE = 48;
const makeRadialPositions = (count: number, width: number, height: number) => {
  if (!count) return [];
  const maxRadius = Math.max(190, Math.min(340, width * 0.29, height * 0.39));
  if (count <= 6) {
    const radius = count === 1 ? 138 : count <= 3 ? 160 : 190;
    return Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, ring: 0 };
    });
  }
  const rings = [
    { radius: maxRadius, capacity: Math.max(12, Math.floor((2 * Math.PI * maxRadius) / 92)) },
    { radius: maxRadius - 96, capacity: Math.max(10, Math.floor((2 * Math.PI * (maxRadius - 96)) / 92)) },
    { radius: maxRadius - 192, capacity: Math.max(8, Math.floor((2 * Math.PI * (maxRadius - 192)) / 92)) },
  ];
  let remaining = count;
  const allocations = rings.map(({ capacity }) => { const n = Math.min(remaining, capacity); remaining -= n; return n; });
  const result: { x: number; y: number; ring: number }[] = [];
  rings.forEach(({ radius }, ring) => {
    const amount = allocations[ring];
    for (let i = 0; i < amount; i += 1) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / amount;
      result.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, ring });
    }
  });
  return result;
};

export const QuickAccessRadial: React.FC<QuickAccessRadialProps> = ({
  categories, tools, currentCategory, lang, onSelectCategory, onSelectTool,
  onSelectSubOption, onNavigateHome, hidden = false,
}) => {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem('gloobe_radial_quick_access_enabled') !== 'false'; }
    catch { return true; }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [stack, setStack] = useState<RadialEntry[]>([]);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    try { localStorage.setItem('gloobe_radial_quick_access_enabled', String(enabled)); } catch { /* session-only fallback */ }
  }, [enabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        setEnabled((v) => !v);
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

  const toolsToEntries = (items: ToolItem[], includeGroups = true): RadialEntry[] => {
    const result: RadialEntry[] = [];
    const handled = new Set<string>();
    items.forEach((tool) => {
      if (includeGroups && tool.dropdownGroup) {
        if (handled.has(tool.dropdownGroup)) return;
        handled.add(tool.dropdownGroup);
        const groupTools = items.filter((item) => item.dropdownGroup === tool.dropdownGroup);
        const trigger = groupTools.find((item) => item.isDropdownTrigger) || groupTools[0];
        const groupName = trigger.dropdownGroupName || {
          ja: trigger.name.ja.split('（')[0], en: trigger.name.en.split('(')[0],
        };
        result.push({
          kind: 'group', id: `group:${tool.dropdownGroup}`,
          label: lang === 'ja' ? groupName.ja : groupName.en || groupName.ja,
          detail: lang === 'ja' ? `${groupTools.length}件のツール` : `${groupTools.length} tools`,
          tools: groupTools, iconTool: trigger,
        });
      } else if (tool.subOptions?.length) {
        result.push({
          kind: 'suboptions', id: `suboptions:${tool.id}`, label: labelForTool(tool, lang),
          detail: lang === 'ja' ? `${tool.subOptions.length}件の項目` : `${tool.subOptions.length} items`,
          tool, subOptions: tool.subOptions,
        });
      } else {
        result.push({
          kind: 'tool', id: tool.id, label: labelForTool(tool, lang),
          detail: lang === 'ja' ? tool.subgroup.ja : tool.subgroup.en || tool.subgroup.ja, tool,
        });
      }
    });
    return result;
  };

  let entries: RadialEntry[] = [];
  if (!stack.length) {
    entries = categories.map((category) => ({
      kind: 'category', id: category.id,
      label: lang === 'ja' ? category.name.ja : category.name.en || category.name.ja,
      detail: `${tools.filter((tool) => tool.categoryId === category.id).length}${lang === 'ja' ? '件' : ' tools'}`,
      categoryId: category.id,
    }));
  } else {
    const node = stack[stack.length - 1];
    if (node.kind === 'category') entries = toolsToEntries(tools.filter((tool) => tool.categoryId === node.categoryId));
    else if (node.kind === 'group') entries = toolsToEntries(node.tools, false);
    else if (node.kind === 'suboptions') entries = node.subOptions.map((item) => ({
      kind: 'suboption', id: item.id, label: labelForSubOption(item, lang),
      detail: node.tool.name.ja, tool: node.tool, subOption: item,
    }));
  }

  const currentNode = stack[stack.length - 1];
  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const visibleEntries = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  useEffect(() => { setPage(0); }, [stack.length, currentNode?.id]);
  const centerLabel = currentNode?.label || (lang === 'ja' ? 'クイックアクセス' : 'Quick Access');
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const positions = useMemo(() => makeRadialPositions(visibleEntries.length, viewport.width, viewport.height), [visibleEntries.length, viewport.width, viewport.height]);

  const completeEntry = (entry: RadialEntry) => {
    setTransitioningId(null);
    if (entry.kind === 'category') {
      onSelectCategory(entry.categoryId);
      setStack((v) => [...v, entry]);
    } else if (entry.kind === 'group' || entry.kind === 'suboptions') setStack((v) => [...v, entry]);
    else if (entry.kind === 'tool') {
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
  const selectEntry = (entry: RadialEntry) => {
    if (transitioningId) return;
    setTransitioningId(entry.id);
    window.setTimeout(() => completeEntry(entry), prefersReducedMotion ? 0 : 280);
  };
  const goBack = () => {
    if (transitioningId) return;
    setTransitioningId('back');
    window.setTimeout(() => {
      setTransitioningId(null);
      setStack((v) => v.slice(0, -1));
    }, prefersReducedMotion ? 0 : 200);
  };
  const closeMenu = () => {
    if (transitioningId) return;
    setIsOpen(false);
    setStack([]);
    setTransitioningId(null);
  };

  if (!enabled || hidden) return null;
  const spring = prefersReducedMotion ? { duration: 0.01 } : { type: 'spring' as const, stiffness: 310, damping: 25, mass: 0.72 };
  const bubbleOrigin = { left: '50%', top: '50%' };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="quick-access-layer"
            className="fixed inset-0 z-[80] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: prefersReducedMotion ? 0.01 : 0.2 } }}
          >
            <motion.div
              className="absolute inset-0 bg-stone-950/15 backdrop-blur-[1.5px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {visibleEntries.map((entry, index) => {
              const p = positions[index] || { x: -36, y: -36, ring: 0 };
              const selected = transitioningId === entry.id;
              const transitioning = Boolean(transitioningId);
              return (
                <motion.button
                  key={`level-${stack.length}-page-${page}-${entry.id}`}
                  type="button"
                  onClick={() => selectEntry(entry)}
                  disabled={transitioning}
                  title={entry.label}
                  aria-label={entry.label}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.35 }}
                  animate={{
                    x: selected || transitioning ? 0 : p.x,
                    y: selected || transitioning ? 0 : p.y,
                    opacity: selected ? 1 : transitioning ? 0 : 1,
                    scale: selected ? 1.14 : transitioning ? 0.45 : 1,
                    transition: selected
                      ? (prefersReducedMotion ? spring : { type: 'spring', stiffness: 330, damping: 22 })
                      : (prefersReducedMotion ? spring : { ...spring, delay: p.ring * 0.025 + (index % 6) * 0.008 }),
                  }}
                  exit={{
                    x: 0, y: 0, opacity: 0, scale: 0.3,
                    transition: prefersReducedMotion ? spring : { duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.01, 0.1) },
                  }}
                  style={bubbleOrigin}
                  className="pointer-events-auto absolute flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border-2 border-orange-300 bg-white px-1.5 text-center text-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <span className="relative flex h-9 w-9 items-center justify-center text-orange-700">
                    {entry.kind === 'category' ? <Folder className="h-5 w-5" />
                      : entry.kind === 'group' ? <CadIcon type={entry.iconTool.iconType} customIconUrl={entry.iconTool.customIconUrl} size={25} />
                      : entry.kind === 'suboptions' ? <ChevronLeft className="h-5 w-5 rotate-180" />
                      : <CadIcon type={entry.tool.iconType} customIconUrl={entry.tool.customIconUrl} size={20} />}
                    {entry.kind === 'group' && (
                      <span className="absolute -right-2 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-orange-500 text-white shadow-sm">
                        <ChevronDown className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  {entry.kind !== 'group' && <span className="line-clamp-2 w-full text-[9px] font-bold leading-tight">{entry.label}</span>}
                </motion.button>
              );
            })}
            {pageCount > 1 && (
              <div className="pointer-events-auto fixed bottom-5 right-[104px] z-[91] flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-2 py-1.5 text-xs font-semibold text-stone-700 shadow-lg">
                <button type="button" disabled={page === 0 || Boolean(transitioningId)} onClick={() => setPage((p) => Math.max(0, p - 1))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-orange-50 disabled:opacity-30" aria-label="Previous tools"><ChevronLeft className="h-4 w-4" /></button>
                <span className="min-w-[34px] text-center tabular-nums">{page + 1} / {pageCount}</span>
                <button type="button" disabled={page >= pageCount - 1 || Boolean(transitioningId)} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-orange-50 disabled:opacity-30" aria-label="Next tools"><ChevronLeft className="h-4 w-4 rotate-180" /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* One persistent launcher morphs into the hub and back to its corner. */}
      <motion.button
        type="button"
        onClick={() => {
          if (isOpen) {
            if (stack.length) goBack();
            else closeMenu();
          } else {
            setStack([]);
            setTransitioningId(null);
            setIsOpen(true);
          }
        }}
        className="fixed z-[90] flex flex-col items-center justify-center rounded-full border-2 border-white bg-orange-600 text-white shadow-xl hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-300"
        style={{ left: viewport.width - 80, top: viewport.height - 80 }}
        animate={{
          left: isOpen ? viewport.width / 2 - 52 : viewport.width - 80,
          top: isOpen ? viewport.height / 2 - 52 : viewport.height - 80,
          width: isOpen ? 104 : 56,
          height: isOpen ? 104 : 56,
          scale: 1,
          borderRadius: '9999px',
          transition: prefersReducedMotion ? { duration: 0.01 } : { left: { type: 'spring', stiffness: 250, damping: 26 }, top: { type: 'spring', stiffness: 250, damping: 26 }, width: { type: 'spring', stiffness: 300, damping: 24 }, height: { type: 'spring', stiffness: 300, damping: 24 } },
        }}
        aria-label={isOpen ? (stack.length ? (lang === 'ja' ? '一つ戻る' : 'Back one level') : (lang === 'ja' ? '閉じる' : 'Close')) : (lang === 'ja' ? 'クイックアクセスを開く' : 'Open quick access')}
        title={isOpen ? (stack.length ? (lang === 'ja' ? '一つ戻る' : 'Back one level') : (lang === 'ja' ? '閉じる' : 'Close')) : (lang === 'ja' ? 'クイックアクセスを開く（Alt+Q）' : 'Open quick access (Alt+Q)')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="hub" className="flex flex-col items-center px-2 text-center" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.65 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.14 }}>
              {stack.length ? <ChevronLeft className="mb-1 h-5 w-5" /> : <X className="mb-1 h-5 w-5" />}
              <span className="line-clamp-2 text-[11px] font-extrabold leading-tight">{stack.length ? centerLabel : (lang === 'ja' ? '閉じる' : 'Close')}</span>
              {stack.length > 0 && <span className="mt-1 text-[9px] text-orange-100">{lang === 'ja' ? '戻る' : 'Back'}</span>}
            </motion.span>
          ) : (
            <motion.span key="launcher" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.14 }}>
              <Command className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {isOpen && (
        <button
          type="button"
          onClick={() => { setEnabled(false); setIsOpen(false); setStack([]); }}
          title={lang === 'ja' ? 'クイックアクセスを無効化（Alt+Qで復元）' : 'Disable quick access (Alt+Q to restore)'}
          aria-label={lang === 'ja' ? 'クイックアクセスを無効化' : 'Disable quick access'}
          className="fixed right-5 top-5 z-[91] flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 shadow-md hover:border-red-400 hover:text-red-600"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      )}
    </>
  );
};
