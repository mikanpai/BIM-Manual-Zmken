import React from 'react';
import { Language, SubOptionItem, ToolItem } from '../types/manual';
import { CadIcon } from './CadIcon';
import { ArrowRight, BookOpen, Film, HelpCircle, Keyboard, Sparkles, Edit2, ChevronDown } from 'lucide-react';

interface ToolCardProps {
  tool: ToolItem;
  onSelect: (tool: ToolItem) => void;
  onSelectSubOption?: (tool: ToolItem, subOption: SubOptionItem) => void;
  onEdit: (tool: ToolItem) => void;
  lang: Language;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onSelect,
  onSelectSubOption,
  onEdit,
  lang,
}) => {
  const hasGif = tool.media.some((m) => m.type === 'gif');
  const mediaCount = tool.media.length;
  const stepsCount = tool.steps.length;

  return (
    <div 
      onClick={() => onSelect(tool)}
      className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-orange-500/80 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Banner & Category Badge */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* CAD Icon button */}
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-2xs border border-orange-200/60 group-hover:border-transparent shrink-0 overflow-hidden p-1">
              <CadIcon type={tool.iconType} customIconUrl={tool.customIconUrl} size={24} />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-stone-500 tracking-wide">
                  {lang === 'ja' ? tool.subgroup.ja : tool.subgroup.en}
                </span>

                {tool.subOptions && tool.subOptions.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                    {lang === 'ja' ? `サブ機能 ${tool.subOptions.length}件` : `${tool.subOptions.length} sub-options`}
                  </span>
                )}

                {tool.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                    {lang === 'ja' ? tool.badge.ja : tool.badge.en}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-stone-900 group-hover:text-orange-600 transition-colors leading-snug">
                {lang === 'ja' ? tool.name.ja : tool.name.en}
              </h3>
              
              <p className="text-[11px] text-stone-400 font-normal">
                {lang === 'ja' ? tool.name.en : tool.name.ja}
              </p>
            </div>
          </div>

          {/* Shortcut Key Badge */}
          {tool.shortcut && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-600 text-xs font-mono font-medium shadow-2xs shrink-0 group-hover:border-orange-300">
              <Keyboard className="w-3 h-3 text-stone-400 group-hover:text-orange-500" />
              <span>{tool.shortcut}</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {lang === 'ja' ? tool.shortDesc.ja : tool.shortDesc.en}
        </p>

        {/* Sub-Options Dropdown Bar on the Card */}
        {tool.subOptions && tool.subOptions.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-sky-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 mb-1.5">
              <span className="flex items-center gap-1">
                <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
                <span>{lang === 'ja' ? 'サブオプション (専用ページ対応):' : 'Sub-Options (Dedicated Pages):'}</span>
              </span>
              <span className="text-[9px] text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded-full border border-sky-200 font-bold">
                {tool.subOptions.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {tool.subOptions.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectSubOption) {
                      onSelectSubOption(tool, sub);
                    } else {
                      onSelect(tool);
                    }
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-sky-50/70 hover:bg-sky-100 text-sky-950 border border-sky-200/80 hover:border-sky-300 text-xs flex items-center justify-between transition group/sub"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CadIcon type={sub.iconType || tool.iconType} customIconUrl={sub.customIconUrl} size={14} />
                    <span className="font-semibold truncate text-[11px]">{lang === 'ja' ? sub.name.ja : sub.name.en}</span>
                  </div>
                  <span className="text-[10px] text-sky-600 group-hover/sub:text-sky-900 font-bold shrink-0 flex items-center gap-0.5">
                    <span>{lang === 'ja' ? '専用ページ' : 'Page'}</span>
                    <ArrowRight className="w-3 h-3 group-hover/sub:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature Badges & Meta info */}
      <div className="px-5 py-2.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            <span>{stepsCount} {lang === 'ja' ? '手順' : 'Steps'}</span>
          </span>

          {hasGif ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-600/10 text-orange-700 font-semibold text-[10px]">
              <Film className="w-3 h-3 text-orange-600" />
              <span>GIF</span>
            </span>
          ) : mediaCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-stone-500">
              <span>{mediaCount} {lang === 'ja' ? '画像' : 'Images'}</span>
            </span>
          ) : null}

          {tool.tips.ja.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-amber-600" title="Tips">
              <Sparkles className="w-3 h-3" />
              <span>Tips</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
          <span>{lang === 'ja' ? 'マニュアル表示' : 'Open Page'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
