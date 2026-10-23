import React, { useState } from 'react';
import { CategoryInfo, CompanySettings, Language, PreviewBoxItem, StepItem, SubOptionItem, ToolItem } from '../types/manual';
import { CadIcon } from './CadIcon';
import { InteractiveCadCanvas } from './InteractiveCadCanvas';
import { 
  ArrowLeft, ArrowRight, ChevronRight, Edit3, Printer, Share2, 
  HelpCircle, AlertTriangle, Film, 
  Keyboard, Sparkles, Plus, Check, Layers
} from 'lucide-react';
import { PreviewBoxEditorModal } from './PreviewBoxEditorModal';
import { SubOptionEditorModal } from './SubOptionEditorModal';

interface SubOptionDetailPageProps {
  tool: ToolItem; // Parent tool
  categories: CategoryInfo[];
  subOption: SubOptionItem;
  companySettings: CompanySettings;
  lang: Language;
  onBackToParent: () => void;
  onBackToList: () => void;
  onSelectSubOption: (sub: SubOptionItem) => void;
  onSaveSubOption: (updatedSubOption: SubOptionItem) => void;
  onSaveTool: (updatedTool: ToolItem) => void;
}

export const SubOptionDetailPage: React.FC<SubOptionDetailPageProps> = ({
  tool,
  categories,
  subOption,
  companySettings,
  lang,
  onBackToParent,
  onBackToList,
  onSelectSubOption,
  onSaveSubOption,
  onSaveTool,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Preview Box Editor State
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [editingBoxIndex, setEditingBoxIndex] = useState<number | null>(null);

  // Sub-option Editor Modal State
  const [isSubEditorOpen, setIsSubEditorOpen] = useState(false);

  const category = categories.find((c) => c.id === tool.categoryId);

  // Default preview boxes if none yet
  const defaultPreviewBox: PreviewBoxItem = {
    id: `box-${subOption.id}-default`,
    boxTitle: {
      ja: companySettings.defaultPreviewBoxTitleJa || 'プレビューツール',
      en: companySettings.defaultPreviewBoxTitleEn || 'Preview Tool',
    },
    toolName: {
      ja: subOption.name.ja,
      en: subOption.name.en,
    },
    logoIconUrl: subOption.customIconUrl || tool.customIconUrl,
    iconType: subOption.iconType || tool.iconType,
    gifUrl: subOption.mediaUrl || tool.simulatorGifUrl,
    steps: subOption.steps && subOption.steps.length > 0 ? subOption.steps : tool.steps,
  };

  const previewBoxes = (subOption.previewBoxes && subOption.previewBoxes.length > 0)
    ? subOption.previewBoxes
    : [defaultPreviewBox];

  // Steps
  const steps: StepItem[] = subOption.steps && subOption.steps.length > 0
    ? subOption.steps
    : [
        {
          id: 's-sub-1',
          stepNumber: 1,
          title: { ja: `${subOption.name.ja}の選択・起動`, en: 'Activate Sub-Option' },
          instruction: { 
            ja: subOption.instruction?.ja || 'リボンのプルダウンメニューまたはショートカットから選択します。', 
            en: subOption.instruction?.en || 'Select from the ribbon dropdown or shortcut key.' 
          }
        },
        {
          id: 's-sub-2',
          stepNumber: 2,
          title: { ja: 'プロパティ・寸法仕様設定', en: 'Configure Properties & Spec' },
          instruction: { 
            ja: '画面左のプロパティパレットで部材仕様や基準高さを指定します。', 
            en: 'Set element specifications and base level constraints in properties palette.' 
          }
        },
        {
          id: 's-sub-3',
          stepNumber: 3,
          title: { ja: '作図位置ピック配置', en: 'Click Pick Placement' },
          instruction: { 
            ja: '通り芯や交点、または部屋領域を指示して部材を配置します。', 
            en: 'Snap to grid lines or pick boundaries to place the component.' 
          }
        },
        {
          id: 's-sub-4',
          stepNumber: 4,
          title: { ja: 'モデル生成・連動確認', en: 'Confirm 3D Geometry Sync' },
          instruction: { 
            ja: '平面図と3Dモデルが自動連動し、数量集計表にも即座に反映されます。', 
            en: '2D plans and 3D geometry synchronize and schedules update in real time.' 
          }
        }
      ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Preview Box Actions
  const handleAddNewBox = () => {
    setEditingBoxIndex(null);
    setIsBoxModalOpen(true);
  };

  const handleEditBox = (index: number) => {
    setEditingBoxIndex(index);
    setIsBoxModalOpen(true);
  };

  const handleDeleteBox = (index: number) => {
    if (previewBoxes.length <= 1) {
      alert(lang === 'ja' ? '最低1つのプレビューボックスが必要です。' : 'At least one preview box is required.');
      return;
    }
    const updated = previewBoxes.filter((_, i) => i !== index);
    const updatedSub: SubOptionItem = {
      ...subOption,
      previewBoxes: updated,
    };
    onSaveSubOption(updatedSub);
  };

  const handleSaveBox = (savedBox: PreviewBoxItem) => {
    let updated: PreviewBoxItem[];
    if (editingBoxIndex !== null) {
      updated = [...previewBoxes];
      updated[editingBoxIndex] = savedBox;
    } else {
      updated = [...previewBoxes, savedBox];
    }
    const updatedSub: SubOptionItem = {
      ...subOption,
      previewBoxes: updated,
    };
    onSaveSubOption(updatedSub);
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Breadcrumb & Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium overflow-x-auto">
          <button
            onClick={onBackToList}
            className="text-stone-600 hover:text-orange-600 font-semibold transition whitespace-nowrap"
          >
            {lang === 'ja' ? 'マニュアル一覧' : 'Manual'}
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          
          <span className="text-stone-600 whitespace-nowrap">
            {category ? (lang === 'ja' ? category.name.ja : category.name.en) : tool.categoryId}
          </span>

          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

          {/* Parent Tool Link */}
          <button
            onClick={onBackToParent}
            className="text-stone-700 hover:text-orange-600 font-semibold transition whitespace-nowrap"
          >
            {lang === 'ja' ? tool.name.ja : tool.name.en}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

          <span className="text-sky-700 font-bold truncate max-w-xs">
            {lang === 'ja' ? subOption.name.ja : subOption.name.en}
          </span>
        </div>

        {/* Back to Parent Tool Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToParent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-orange-500 bg-white text-xs font-semibold text-stone-700 hover:text-orange-600 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-orange-600" />
            <span>{lang === 'ja' ? `親ツール「${tool.name.ja}」へ戻る` : `Back to ${tool.name.en}`}</span>
          </button>
        </div>
      </div>

      {/* Sibling Sub-Options Switcher Bar */}
      {tool.subOptions && tool.subOptions.length > 1 && (
        <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-sky-900 shrink-0 flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>{lang === 'ja' ? 'サブ機能切替:' : 'Sub-Options:'}</span>
          </span>
          {tool.subOptions.map((sub) => {
            const isCurrent = sub.id === subOption.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubOption(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                    : 'bg-white text-sky-900 border border-sky-200 hover:bg-sky-100 hover:border-sky-300'
                }`}
              >
                <CadIcon type={sub.iconType || tool.iconType} customIconUrl={sub.customIconUrl} size={14} />
                <span>{lang === 'ja' ? sub.name.ja : sub.name.en}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Sub-Option Header Card */}
      <div className="relative bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 overflow-hidden">
        {/* Subtle sky blue / orange accent gradient bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-sky-400 to-orange-500"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Sub-Option Icon Button Graphic */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/20 shrink-0 border-2 border-sky-400 overflow-hidden p-2">
              <CadIcon type={subOption.iconType || tool.iconType} customIconUrl={subOption.customIconUrl} size={42} />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
                  {lang === 'ja' ? `親ツール: ${tool.name.ja}` : `Parent: ${tool.name.en}`}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                  {lang === 'ja' ? 'サブオプション専用ページ' : 'Dedicated Sub-Option Page'}
                </span>

                {subOption.shortcut && (
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-mono font-semibold border border-stone-200">
                    [{subOption.shortcut}]
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {lang === 'ja' ? subOption.name.ja : subOption.name.en}
              </h1>

              <p className="text-sm font-medium text-stone-500">
                {lang === 'ja' ? subOption.name.en : subOption.name.ja}
              </p>
            </div>
          </div>

          {/* Quick Actions (Edit, Print, Share) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
            <button
              onClick={() => setIsSubEditorOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm hover:shadow transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === 'ja' ? 'このサブ機能を編集' : 'Edit Sub-Option'}</span>
            </button>

            <button
              onClick={() => window.print()}
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

          <div className="text-[11px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            {lang === 'ja' ? `GLOOBE BIM コマンド: ${tool.shortcut || '標準'}` : `Command: ${tool.shortcut || 'Standard'}`}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Detailed Content, Right Utilities */}
      <div className="space-y-6">
        
        {/* Full-width content */}
        <div className="space-y-6">
          
          {/* Section 1: Overview */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <h2 className="text-base font-bold text-stone-900">
                {lang === 'ja' ? '機能概要 & 仕様用途' : 'Overview & BIM Functionality'}
              </h2>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed font-normal whitespace-pre-line">
              {subOption.fullDesc 
                ? (lang === 'ja' ? subOption.fullDesc.ja : subOption.fullDesc.en)
                : subOption.desc 
                ? (lang === 'ja' ? subOption.desc.ja : subOption.desc.en)
                : (lang === 'ja' 
                    ? `GLOOBEの「${subOption.name.ja}」は、親ツール「${tool.name.ja}」のサブコマンド・派生機能として実行されます。` 
                    : `The GLOOBE command "${subOption.name.en}" is a specialized sub-option of ${tool.name.en}.`)}
            </p>
          </div>

          {/* Section 2: PREVIEW TOOL */}
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
                  onClick={handleAddNewBox}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? 'ボックス追加' : 'Add Box'}</span>
                </button>
              </div>
            </div>

            {/* Render Preview Boxes */}
            <div className="space-y-6">
              {previewBoxes.map((box, idx) => (
                <InteractiveCadCanvas
                  key={box.id || idx}
                  toolType={box.iconType || subOption.iconType || tool.iconType}
                  lang={lang}
                  boxTitle={box.boxTitle}
                  toolName={box.toolName}
                  boxDescription={box.description}
                  logoIconUrl={box.logoIconUrl}
                  simulatorGifUrl={box.gifUrl}
                  gifUrls={box.gifUrls}
                  mediaList={box.mediaList}
                  steps={box.steps && box.steps.length > 0 ? box.steps : steps}
                  onEditBox={() => handleEditBox(idx)}
                  onDeleteBox={() => handleDeleteBox(idx)}
                  canDelete={previewBoxes.length > 1}
                />
              ))}
            </div>
          </div>


        </div>

      </div>

      {/* Preview Box Editor Modal */}
      {isBoxModalOpen && (
        <PreviewBoxEditorModal
          isOpen={isBoxModalOpen}
          onClose={() => setIsBoxModalOpen(false)}
          box={editingBoxIndex !== null ? previewBoxes[editingBoxIndex] : null}
          defaultToolType={subOption.iconType || tool.iconType}
          defaultToolName={subOption.name}
          onSave={handleSaveBox}
          lang={lang}
        />
      )}

      {/* Sub-Option Editor Modal */}
      {isSubEditorOpen && (
        <SubOptionEditorModal
          isOpen={isSubEditorOpen}
          onClose={() => setIsSubEditorOpen(false)}
          subOption={subOption}
          parentToolName={tool.name}
          defaultIconType={subOption.iconType || tool.iconType}
          onSave={(updated) => {
            onSaveSubOption(updated);
          }}
          lang={lang}
        />
      )}

    </div>
  );
};