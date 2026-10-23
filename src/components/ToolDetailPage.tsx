import React, { useState } from 'react';
import { CategoryInfo, CompanySettings, Language, PreviewBoxItem, StepItem, SubOptionItem, ToolItem } from '../types/manual';
import { CadIcon } from './CadIcon';
import { InteractiveCadCanvas } from './InteractiveCadCanvas';
import { 
  ArrowLeft, ArrowRight, ChevronRight, Edit3, Printer, Share2, 
  HelpCircle, AlertTriangle, Film, 
  Image as ImageIcon, MousePointer, BookOpen, Sparkles,
  ExternalLink, Plus, Check, Layers
} from 'lucide-react';
import { PreviewBoxEditorModal } from './PreviewBoxEditorModal';

interface ToolDetailPageProps {
  tool: ToolItem;
  categories: CategoryInfo[];
  allTools: ToolItem[];
  companySettings: CompanySettings;
  lang: Language;
  onBack: () => void;
  onSelectTool: (tool: ToolItem) => void;
  onSelectSubOption?: (tool: ToolItem, subOption: SubOptionItem) => void;
  onEditTool: (tool: ToolItem) => void;
  onSaveTool?: (tool: ToolItem) => void;
  onOpenLightbox: (imageUrl: string, title: string, caption?: string, isGif?: boolean) => void;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({
  tool,
  categories,
  allTools,
  companySettings,
  lang,
  onBack,
  onSelectTool,
  onSelectSubOption,
  onEditTool,
  onSaveTool,
  onOpenLightbox,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedSubOptionId, setSelectedSubOptionId] = useState<string | null>(
    tool.subOptions && tool.subOptions.length > 0 ? tool.subOptions[0].id : null
  );

  // Preview Box Editor Modal State
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [editingBoxIndex, setEditingBoxIndex] = useState<number | null>(null);

  // Preview boxes list (default to single box from tool if none)
  const defaultPreviewBox: PreviewBoxItem = {
    id: `box-${tool.id}-default`,
    boxTitle: {
      ja: companySettings.defaultPreviewBoxTitleJa || 'プレビューツール',
      en: companySettings.defaultPreviewBoxTitleEn || 'Preview Tool',
    },
    toolName: tool.name,
    logoIconUrl: tool.customIconUrl,
    iconType: tool.iconType,
    gifUrl: tool.simulatorGifUrl,
    steps: tool.steps,
  };

  const previewBoxes = (tool.previewBoxes && tool.previewBoxes.length > 0)
    ? tool.previewBoxes
    : [defaultPreviewBox];

  const category = categories.find((c) => c.id === tool.categoryId);

  // Navigation between tools
  const currentIndex = allTools.findIndex((t) => t.id === tool.id);
  const prevTool = currentIndex > 0 ? allTools[currentIndex - 1] : null;
  const nextTool = currentIndex < allTools.length - 1 ? allTools[currentIndex + 1] : null;

  // Related tools
  const relatedTools = allTools.filter((t) => tool.relatedToolIds.includes(t.id));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Breadcrumb & Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-stone-700 hover:text-orange-600 font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ja' ? 'マニュアル一覧へ戻る' : 'Back to Manual List'}</span>
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          
          <span className="text-stone-600">
            {category ? (lang === 'ja' ? category.name.ja : category.name.en) : tool.categoryId}
          </span>

          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

          <span className="text-orange-600 font-semibold truncate max-w-xs">
            {lang === 'ja' ? tool.name.ja : tool.name.en}
          </span>
        </div>

        {/* Prev / Next Tool Switcher */}
        <div className="flex items-center gap-2">
          {prevTool && (
            <button
              onClick={() => onSelectTool(prevTool)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-orange-500 bg-white text-xs font-medium text-stone-700 hover:text-orange-600 shadow-2xs transition"
              title={lang === 'ja' ? `前のツール: ${prevTool.name.ja}` : `Previous: ${prevTool.name.en}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ja' ? '前へ' : 'Prev'}</span>
            </button>
          )}

          {nextTool && (
            <button
              onClick={() => onSelectTool(nextTool)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-orange-500 bg-white text-xs font-medium text-stone-700 hover:text-orange-600 shadow-2xs transition"
              title={lang === 'ja' ? `次のツール: ${nextTool.name.ja}` : `Next: ${nextTool.name.en}`}
            >
              <span className="hidden sm:inline">{lang === 'ja' ? '次へ' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tool Header Card */}
      <div className="relative bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 overflow-hidden">
        {/* Subtle orange accent gradient bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* GLOOBE CAD Icon Button Graphic */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0 border-2 border-orange-400 overflow-hidden p-2">
              <CadIcon type={tool.iconType} customIconUrl={tool.customIconUrl} size={42} />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                  {category ? (lang === 'ja' ? category.name.ja : category.name.en) : tool.categoryId} • {lang === 'ja' ? tool.subgroup.ja : tool.subgroup.en}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {lang === 'ja' ? tool.name.ja : tool.name.en}
              </h1>

              <p className="text-sm font-medium text-stone-500">
                {lang === 'ja' ? tool.name.en : tool.name.ja}
              </p>
            </div>
          </div>

          {/* Quick Actions (Edit, Print, Share) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
            <button
              onClick={() => onEditTool(tool)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm hover:shadow transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === 'ja' ? 'このマニュアルを編集' : 'Edit Tool Manual'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-stone-300 hover:border-orange-500 bg-white text-stone-700 hover:text-orange-600 text-xs transition shadow-2xs"
              title={lang === 'ja' ? '印刷 / PDF出力' : 'Print / Export PDF'}
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl border border-stone-300 hover:border-orange-500 bg-white text-stone-700 hover:text-orange-600 text-xs transition shadow-2xs relative"
              title={lang === 'ja' ? '共有リンクをコピー' : 'Copy Link'}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Company Subtitle Badge */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">
              {lang === 'ja' ? companySettings.nameJa : companySettings.nameEn}
            </span>
            <span className="text-stone-300">|</span>
            <span>
              {lang === 'ja' ? companySettings.departmentJa : companySettings.departmentEn}
            </span>
          </div>

          {tool.updatedAt && (
            <div className="text-[11px] text-stone-400">
              {lang === 'ja' ? `改訂日: ${tool.updatedAt}` : `Updated: ${tool.updatedAt}`}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Detailed Content, Right Utilities */}
      <div className="space-y-6">
        
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="space-y-6">
          
          {/* Section 1: Overview (機能概要) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <h2 className="text-base font-bold text-stone-900">
                {lang === 'ja' ? '機能概要 & 設計用途' : 'Overview & BIM Functionality'}
              </h2>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed font-normal whitespace-pre-line">
              {lang === 'ja' ? tool.fullDesc.ja : tool.fullDesc.en}
            </p>
          </div>

          {/* Section 2: PREVIEW TOOL (USER REQUESTED: Preview Tool with multiple boxes & 1-4 manual arrow bar) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-orange-600" />
                <h2 className="text-base font-bold text-stone-900">
                  {lang === 'ja' ? 'プレビューツール (リアルタイムデモ)' : 'Preview Tool (Real-time Demo)'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBoxIndex(null);
                    setIsBoxModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? 'ボックス追加' : 'Add Box'}</span>
                </button>
              </div>
            </div>

            {/* Multiple Preview Tool Boxes */}
            <div className="space-y-6">
              {previewBoxes.map((box, idx) => (
                <InteractiveCadCanvas 
                  key={box.id || idx}
                  toolType={box.iconType || tool.iconType} 
                  lang={lang} 
                  boxTitle={box.boxTitle}
                  toolName={box.toolName}
                  boxDescription={box.description}
                  logoIconUrl={box.logoIconUrl}
                  simulatorGifUrl={box.gifUrl}
                  gifUrls={box.gifUrls}
                  mediaList={box.mediaList}
                  steps={box.steps && box.steps.length > 0 ? box.steps : tool.steps}
                  onEditBox={() => {
                    setEditingBoxIndex(idx);
                    setIsBoxModalOpen(true);
                  }}
                  onDeleteBox={() => {
                    if (previewBoxes.length <= 1) {
                      alert(lang === 'ja' ? '最低1つのプレビューボックスが必要です。' : 'At least one preview box is required.');
                      return;
                    }
                    const updated = previewBoxes.filter((_, i) => i !== idx);
                    if (onSaveTool) {
                      onSaveTool({ ...tool, previewBoxes: updated });
                    }
                  }}
                  canDelete={previewBoxes.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Section 5: Pro Tips & Warnings (コツと注意事項) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tips Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <h3>{lang === 'ja' ? '設計プロのコツ・ワンポイント' : 'Pro Tips & Best Practices'}</h3>
              </div>
              <ul className="space-y-2 text-xs text-amber-950/85 leading-relaxed font-normal">
                {(lang === 'ja' ? tool.tips.ja : tool.tips.en).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings Card */}
            <div className="bg-red-50/60 border border-red-200/70 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3>{lang === 'ja' ? 'よくある失敗・注意事項' : 'Common Pitfalls & Warnings'}</h3>
              </div>
              <ul className="space-y-2 text-xs text-red-950/85 leading-relaxed font-normal">
                {(lang === 'ja' ? tool.warnings.ja : tool.warnings.en).map((warn, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">!</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Related tools remain available below the full-width manual content. */}
        <div className="space-y-6">
          {/* Box 2: Related Tools */}
          {relatedTools.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <MousePointer className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  {lang === 'ja' ? '連動・関連コマンド' : 'Related Commands'}
                </h3>
              </div>

              <div className="space-y-2">
                {relatedTools.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => onSelectTool(rel)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-orange-500 hover:bg-orange-50/50 text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <CadIcon type={rel.iconType} size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800 group-hover:text-orange-600">
                          {lang === 'ja' ? rel.name.ja : rel.name.en}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {lang === 'ja' ? rel.subgroup.ja : rel.subgroup.en}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-orange-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Preview Box Editor Modal */}
      {isBoxModalOpen && (
        <PreviewBoxEditorModal
          isOpen={isBoxModalOpen}
          onClose={() => setIsBoxModalOpen(false)}
          box={editingBoxIndex !== null ? previewBoxes[editingBoxIndex] : null}
          defaultToolType={tool.iconType}
          defaultToolName={tool.name}
          onSave={(savedBox) => {
            let updated: PreviewBoxItem[];
            if (editingBoxIndex !== null) {
              updated = [...previewBoxes];
              updated[editingBoxIndex] = savedBox;
            } else {
              updated = [...previewBoxes, savedBox];
            }
            if (onSaveTool) {
              onSaveTool({
                ...tool,
                previewBoxes: updated,
              });
            }
          }}
          lang={lang}
        />
      )}

    </div>
  );
};