import React from 'react';
import { Language, ToolItem } from '../types/manual';
import { CadIcon } from './CadIcon';
import { ArrowRight, Film, Sparkles, Keyboard } from 'lucide-react';

interface ToolListItemProps {
  tool: ToolItem;
  onSelect: (tool: ToolItem) => void;
  lang: Language;
}

export const ToolListItem: React.FC<ToolListItemProps> = ({ tool, onSelect, lang }) => {
  const hasGif = tool.media.some((m) => m.type === 'gif');

  return (
    <div
      onClick={() => onSelect(tool)}
      className="group bg-white hover:bg-orange-50/40 border border-stone-200 hover:border-orange-400 rounded-xl p-3.5 sm:px-5 sm:py-3 transition flex items-center justify-between gap-4 cursor-pointer shadow-2xs"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center shrink-0 transition overflow-hidden p-1">
          <CadIcon type={tool.iconType} customIconUrl={tool.customIconUrl} size={22} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-500">
              {lang === 'ja' ? tool.subgroup.ja : tool.subgroup.en}
            </span>

            {tool.shortcut && (
              <span className="px-1.5 py-0.2 rounded bg-stone-100 font-mono text-[11px] text-stone-600 border border-stone-200">
                {tool.shortcut}
              </span>
            )}

            {hasGif && (
              <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">
                GIF
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 truncate transition">
            {lang === 'ja' ? tool.name.ja : tool.name.en}
            <span className="text-xs font-normal text-stone-400 ml-2">
              ({lang === 'ja' ? tool.name.en : tool.name.ja})
            </span>
          </h3>

          <p className="text-xs text-stone-500 truncate hidden sm:block">
            {lang === 'ja' ? tool.shortDesc.ja : tool.shortDesc.en}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-stone-400 hidden md:inline">
          {tool.steps.length} {lang === 'ja' ? '手順' : 'Steps'}
        </span>

        <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-orange-600 group-hover:text-white text-stone-500 flex items-center justify-center transition">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
