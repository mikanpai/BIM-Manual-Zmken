import React, { useState, useEffect } from 'react';
import { Language, StepItem, SubOptionItem } from '../types/manual';
import { X, Check, Upload, Trash2, Plus, Sparkles, Film, Image as ImageIcon } from 'lucide-react';
import { CadIcon } from './CadIcon';

interface SubOptionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subOption: SubOptionItem;
  parentToolName: { ja: string; en: string };
  defaultIconType: string;
  onSave: (updatedSubOption: SubOptionItem) => void;
  lang: Language;
}

export const SubOptionEditorModal: React.FC<SubOptionEditorModalProps> = ({
  isOpen,
  onClose,
  subOption,
  parentToolName,
  defaultIconType,
  onSave,
  lang,
}) => {
  const [nameJa, setNameJa] = useState(subOption.name.ja);
  const [nameEn, setNameEn] = useState(subOption.name.en);
  const [descJa, setDescJa] = useState(subOption.desc?.ja || '');
  const [descEn, setDescEn] = useState(subOption.desc?.en || '');
  const [fullDescJa, setFullDescJa] = useState(subOption.fullDesc?.ja || subOption.desc?.ja || '');
  const [fullDescEn, setFullDescEn] = useState(subOption.fullDesc?.en || subOption.desc?.en || '');
  const [shortcut, setShortcut] = useState(subOption.shortcut || '');
  const [customIconUrl, setCustomIconUrl] = useState(subOption.customIconUrl || '');
  const [mediaUrl, setMediaUrl] = useState(subOption.mediaUrl || '');

  // Steps
  const defaultSteps: StepItem[] = [
    {
      id: `sub-step-1`,
      stepNumber: 1,
      title: { ja: `${nameJa || 'サブ機能'}の選択・起動`, en: 'Activate Sub-Option' },
      instruction: { 
        ja: subOption.instruction?.ja || 'リボンのプルダウンメニューまたはショートカットから選択します。', 
        en: subOption.instruction?.en || 'Select from the ribbon dropdown or shortcut key.' 
      }
    },
    {
      id: `sub-step-2`,
      stepNumber: 2,
      title: { ja: 'プロパティ・寸法仕様設定', en: 'Configure Properties & Spec' },
      instruction: { 
        ja: '画面左のプロパティパレットで部材仕様や基準高さを指定します。', 
        en: 'Set element specifications and base level constraints in properties palette.' 
      }
    },
    {
      id: `sub-step-3`,
      stepNumber: 3,
      title: { ja: '作図位置ピック配置', en: 'Click Pick Placement' },
      instruction: { 
        ja: '通り芯や交点、または部屋領域を指示して部材を配置します。', 
        en: 'Snap to grid lines or pick boundaries to place the component.' 
      }
    },
    {
      id: `sub-step-4`,
      stepNumber: 4,
      title: { ja: 'モデル生成・連動確認', en: 'Confirm 3D Geometry Sync' },
      instruction: { 
        ja: '平面図と3Dモデルが自動連動し、数量集計表にも即座に反映されます。', 
        en: '2D plans and 3D geometry synchronize and schedules update in real time.' 
      }
    }
  ];

  const [steps, setSteps] = useState<StepItem[]>(
    subOption.steps && subOption.steps.length > 0 ? subOption.steps : defaultSteps
  );

  // Sync state when subOption or isOpen changes
  useEffect(() => {
    if (!isOpen) return;
    const initialNameJa = subOption.name?.ja || '';
    const initialNameEn = subOption.name?.en || subOption.name?.ja || '';
    setNameJa(initialNameJa);
    setNameEn(initialNameEn);
    setDescJa(subOption.desc?.ja || '');
    setDescEn(subOption.desc?.en || subOption.desc?.ja || '');
    setFullDescJa(subOption.fullDesc?.ja || subOption.desc?.ja || '');
    setFullDescEn(subOption.fullDesc?.en || subOption.desc?.en || subOption.fullDesc?.ja || '');
    setShortcut(subOption.shortcut || '');
    setCustomIconUrl(subOption.customIconUrl || '');
    setMediaUrl(subOption.mediaUrl || '');

    const existingSteps = subOption.steps && subOption.steps.length > 0 ? subOption.steps : defaultSteps;
    setSteps(
      existingSteps.map((st, i) => ({
        ...st,
        stepNumber: i + 1,
        title: {
          ja: st.title.ja || `ステップ ${i + 1}`,
          en: st.title.en || st.title.ja || `Step ${i + 1}`,
        },
        instruction: {
          ja: st.instruction.ja || '',
          en: st.instruction.en || st.instruction.ja || '',
        }
      }))
    );
  }, [subOption, isOpen]);

  if (!isOpen) return null;

  // Handle custom icon upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomIconUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle GIF/Image upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStepChange = (index: number, field: 'titleJa' | 'titleEn' | 'instructionJa' | 'instructionEn', value: string) => {
    const updated = [...steps];
    const s = { ...updated[index] };
    if (field === 'titleJa') s.title = { ...s.title, ja: value };
    if (field === 'titleEn') s.title = { ...s.title, en: value };
    if (field === 'instructionJa') s.instruction = { ...s.instruction, ja: value };
    if (field === 'instructionEn') s.instruction = { ...s.instruction, en: value };
    updated[index] = s;
    setSteps(updated);
  };

  const handleSave = () => {
    const updated: SubOptionItem = {
      ...subOption,
      name: {
        ja: nameJa.trim() || 'サブ機能',
        en: nameEn.trim() || nameJa.trim(),
      },
      desc: descJa.trim() ? { ja: descJa.trim(), en: descEn.trim() || descJa.trim() } : undefined,
      fullDesc: fullDescJa.trim() ? { ja: fullDescJa.trim(), en: fullDescEn.trim() || fullDescJa.trim() } : undefined,
      shortcut: shortcut.trim() || undefined,
      customIconUrl: customIconUrl.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
      steps: steps.map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
      instruction: {
        ja: steps[0]?.instruction.ja || '',
        en: steps[0]?.instruction.en || '',
      }
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden p-1 shadow-xs">
              <CadIcon type={subOption.iconType || defaultIconType} customIconUrl={customIconUrl} size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {lang === 'ja' ? `サブ機能「${subOption.name.ja}」の編集` : `Edit Sub-Option: ${subOption.name.en}`}
              </h3>
              <p className="text-xs text-sky-100">
                {lang === 'ja' ? `親ツール: ${parentToolName.ja}` : `Parent: ${parentToolName.en}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-stone-700">
          
          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? 'サブ機能名 (日本語)' : 'Sub-Option Name (Japanese)'} *
              </label>
              <input
                type="text"
                value={nameJa}
                onChange={(e) => setNameJa(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? 'サブ機能名 (英語)' : 'Sub-Option Name (English)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? 'ショートカットキー' : 'Shortcut'}
              </label>
              <input
                type="text"
                value={shortcut}
                onChange={(e) => setShortcut(e.target.value)}
                placeholder="例: Shift+W1"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? '簡単な要約説明 (日本語)' : 'Short Description (Japanese)'}
              </label>
              <input
                type="text"
                value={descJa}
                onChange={(e) => setDescJa(e.target.value)}
                placeholder={lang === 'ja' ? "例: RC外壁の配筋と壁芯基準の配置" : "Brief description in Japanese"}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? '簡単な要約説明 (英語)' : 'Short Description (English)'}
              </label>
              <input
                type="text"
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="e.g. Exterior RC wall placement and rebar specification"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
              />
            </div>
          </div>

          {/* Full Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? '詳細な機能説明 & BIM設計用途 (日本語)' : 'Detailed BIM Description (Japanese)'}
              </label>
              <textarea
                rows={3}
                value={fullDescJa}
                onChange={(e) => setFullDescJa(e.target.value)}
                placeholder="このサブ機能の具体的な仕様、使用目的、注意点を記述します"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? '詳細な機能説明 & BIM設計用途 (英語)' : 'Detailed BIM Description (English)'}
              </label>
              <textarea
                rows={3}
                value={fullDescEn}
                onChange={(e) => setFullDescEn(e.target.value)}
                placeholder="Specific parameters, BIM constraints, and construction modeling workflow"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>
          </div>

          {/* Media / GIF URL */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
              <Film className="w-4 h-4 text-sky-600" />
              <span>{lang === 'ja' ? 'アイコン & GIFデモ動画' : 'Icon & GIF Demo'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Icon Upload */}
              <div>
                <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'ja' ? 'カスタムアイコン画像' : 'Custom Icon Image'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-2xs">
                    <CadIcon type={subOption.iconType || defaultIconType} customIconUrl={customIconUrl} size={22} />
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs flex items-center gap-1 shadow-2xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? '画像選択' : 'Choose'}</span>
                    <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                  </label>
                  {customIconUrl && (
                    <button type="button" onClick={() => setCustomIconUrl('')} className="text-stone-400 hover:text-red-500 text-xs">
                      {lang === 'ja' ? '解除' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* GIF Upload */}
              <div>
                <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'ja' ? 'GIFアニメーション (GIF DEMO)' : 'GIF Animation'}
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs flex items-center gap-1 shadow-2xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? 'GIF/WebP選択' : 'Choose GIF/WebP'}</span>
                    <input type="file" accept="image/gif,image/webp,image/*" onChange={handleMediaUpload} className="hidden" />
                  </label>
                  {mediaUrl && (
                    <button type="button" onClick={() => setMediaUrl('')} className="text-stone-400 hover:text-red-500 text-xs">
                      {lang === 'ja' ? 'クリア' : 'Clear'}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="またはGIF画像URL (https://...)"
                  className="mt-1.5 w-full px-2.5 py-1 text-xs rounded border border-stone-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 4 Steps for manual scrubber */}
          <div className="space-y-3">
            <div className="font-bold text-stone-900 text-xs">
              {lang === 'ja' ? '操作手順ステップ (1, 2, 3, 4)' : 'Operation Steps (1, 2, 3, 4)'}
            </div>

            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={step.id || idx} className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={step.title.ja}
                        onChange={(e) => handleStepChange(idx, 'titleJa', e.target.value)}
                        placeholder={`ステップ ${idx + 1} タイトル (日本語)`}
                        className="w-full px-2.5 py-1 text-xs rounded border border-stone-300 bg-white font-medium"
                      />
                      <input
                        type="text"
                        value={step.title.en}
                        onChange={(e) => handleStepChange(idx, 'titleEn', e.target.value)}
                        placeholder={`Step ${idx + 1} Title (English)`}
                        className="w-full px-2.5 py-1 text-xs rounded border border-stone-300 bg-white font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    <textarea
                      rows={2}
                      value={step.instruction.ja}
                      onChange={(e) => handleStepChange(idx, 'instructionJa', e.target.value)}
                      placeholder={`ステップ ${idx + 1} の操作説明 (日本語)`}
                      className="w-full px-2.5 py-1 text-xs rounded border border-stone-300 bg-white"
                    />
                    <textarea
                      rows={2}
                      value={step.instruction.en}
                      onChange={(e) => handleStepChange(idx, 'instructionEn', e.target.value)}
                      placeholder={`Step ${idx + 1} Instruction (English)`}
                      className="w-full px-2.5 py-1 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 font-medium text-xs transition"
          >
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'ja' ? 'サブ機能を保存' : 'Save Sub-Option'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
