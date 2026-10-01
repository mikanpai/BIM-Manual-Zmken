import React, { useState, useEffect } from 'react';
import { Language, PreviewBoxItem, StepItem } from '../types/manual';
import { X, Check, Upload, Film, Trash2, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { CadIcon } from './CadIcon';

interface PreviewBoxEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: PreviewBoxItem | null; // null if creating a new preview box
  defaultToolType?: string;
  defaultToolName?: { ja: string; en: string };
  onSave: (savedBox: PreviewBoxItem) => void;
  lang: Language;
}

export const PreviewBoxEditorModal: React.FC<PreviewBoxEditorModalProps> = ({
  isOpen,
  onClose,
  box,
  defaultToolType = 'wall',
  defaultToolName,
  onSave,
  lang,
}) => {
  const isEditing = !!box;

  const [boxTitleJa, setBoxTitleJa] = useState(box?.boxTitle?.ja || 'プレビューツール');
  const [boxTitleEn, setBoxTitleEn] = useState(box?.boxTitle?.en || 'Preview Tool');
  const [toolNameJa, setToolNameJa] = useState(box?.toolName?.ja || defaultToolName?.ja || '');
  const [toolNameEn, setToolNameEn] = useState(box?.toolName?.en || defaultToolName?.en || '');
  const [logoIconUrl, setLogoIconUrl] = useState(box?.logoIconUrl || '');
  const [iconType, setIconType] = useState(box?.iconType || defaultToolType);
  const [gifUrl, setGifUrl] = useState(box?.gifUrl || '');

  // Steps for manual 1, 2, 3, 4 arrow bar
  const defaultInitialSteps: StepItem[] = [
    {
      id: `step-1`,
      stepNumber: 1,
      title: { ja: 'コマンド起動・基準設定', en: 'Activate Command & Setup' },
      instruction: { ja: 'リボンまたはショートカットからコマンドを選択し、仕様を設定します。', en: 'Select command from ribbon or shortcut and set specs.' }
    },
    {
      id: `step-2`,
      stepNumber: 2,
      title: { ja: '始点スナップ・属性確認', en: 'Snap Start Point' },
      instruction: { ja: '通り芯や交点をクリックして始点を指定します。', en: 'Click grid axis or intersection to set start point.' }
    },
    {
      id: `step-3`,
      stepNumber: 3,
      title: { ja: '終点入力・配置実行', en: 'Specify End Point & Place' },
      instruction: { ja: '終点位置をクリックすると部材がモデリングされます。', en: 'Click end position to generate geometry.' }
    },
    {
      id: `step-4`,
      stepNumber: 4,
      title: { ja: '自動包絡・連動完了', en: 'Auto Cleanup & Sync' },
      instruction: { ja: '交差部が自動包絡接合され、3Dビューと平面図がリアルタイム連動します。', en: 'Junctions auto-clean and 3D geometry synchronizes.' }
    }
  ];

  const [steps, setSteps] = useState<StepItem[]>(
    box?.steps && box.steps.length > 0 ? box.steps : defaultInitialSteps
  );

  // Sync state whenever box or isOpen changes
  useEffect(() => {
    if (!isOpen) return;
    if (box) {
      setBoxTitleJa(box.boxTitle?.ja || 'プレビューツール');
      setBoxTitleEn(box.boxTitle?.en || 'Preview Tool');
      setToolNameJa(box.toolName?.ja || defaultToolName?.ja || '');
      setToolNameEn(box.toolName?.en || defaultToolName?.en || '');
      setLogoIconUrl(box.logoIconUrl || '');
      setIconType(box.iconType || defaultToolType);
      setGifUrl(box.gifUrl || '');
      setSteps(box.steps && box.steps.length > 0 ? box.steps : defaultInitialSteps);
    } else {
      setBoxTitleJa('プレビューツール');
      setBoxTitleEn('Preview Tool');
      setToolNameJa(defaultToolName?.ja || '');
      setToolNameEn(defaultToolName?.en || '');
      setLogoIconUrl('');
      setIconType(defaultToolType);
      setGifUrl('');
      setSteps(defaultInitialSteps);
    }
  }, [box, isOpen]);

  if (!isOpen) return null;

  // Handle logo image upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoIconUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle GIF file upload
  const handleGifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setGifUrl(event.target?.result as string);
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
    const savedBox: PreviewBoxItem = {
      id: box?.id || `preview-box-${Date.now()}`,
      boxTitle: {
        ja: boxTitleJa.trim() || 'プレビューツール',
        en: boxTitleEn.trim() || 'Preview Tool',
      },
      toolName: {
        ja: toolNameJa.trim(),
        en: toolNameEn.trim() || toolNameJa.trim(),
      },
      logoIconUrl: logoIconUrl.trim() || undefined,
      iconType: iconType || 'wall',
      gifUrl: gifUrl.trim() || undefined,
      steps: steps.map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
    };
    onSave(savedBox);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden p-1 shadow-xs">
              <CadIcon type={iconType} customIconUrl={logoIconUrl} size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isEditing
                  ? (lang === 'ja' ? 'プレビューツール ボックスの編集' : 'Edit Preview Tool Box')
                  : (lang === 'ja' ? '新規プレビューツール ボックスの追加' : 'Add New Preview Tool Box')}
              </h3>
              <p className="text-xs text-orange-100">
                {lang === 'ja' ? 'ボックス名、ツール名、ロゴアイコン、GIFアニメーションを設定します' : 'Configure box name, tool name, logo icon, and GIF animation'}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-700">
          
          {/* Section 1: Box Title & Tool Name */}
          <div className="space-y-4 p-4 rounded-xl bg-orange-50/40 border border-orange-200/80">
            <div className="flex items-center gap-1.5 font-bold text-orange-950 text-xs">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>{lang === 'ja' ? 'ボックス名とツール名（タイトル表示）' : 'Box Title & Tool Name'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {lang === 'ja' ? 'ボックス名 (日本語)' : 'Box Title (Japanese)'} *
                </label>
                <input
                  type="text"
                  value={boxTitleJa}
                  onChange={(e) => setBoxTitleJa(e.target.value)}
                  placeholder="例: プレビューツール / 壁配置シミュレータ"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {lang === 'ja' ? 'ボックス名 (英語)' : 'Box Title (English)'}
                </label>
                <input
                  type="text"
                  value={boxTitleEn}
                  onChange={(e) => setBoxTitleEn(e.target.value)}
                  placeholder="e.g. Preview Tool / Wall Placement Simulator"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {lang === 'ja' ? 'ツール名 (日本語)' : 'Tool Name (Japanese)'}
                </label>
                <input
                  type="text"
                  value={toolNameJa}
                  onChange={(e) => setToolNameJa(e.target.value)}
                  placeholder="例: GLOOBE 外壁・内壁配置"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {lang === 'ja' ? 'ツール名 (英語)' : 'Tool Name (English)'}
                </label>
                <input
                  type="text"
                  value={toolNameEn}
                  onChange={(e) => setToolNameEn(e.target.value)}
                  placeholder="e.g. GLOOBE Wall Placement"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Logo / Icon & GIF Animation */}
          <div className="space-y-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <Film className="w-4 h-4 text-orange-600" />
              <span>{lang === 'ja' ? 'ツールロゴ・アイコン & GIFアニメーション' : 'Tool Logo / Icon & GIF Animation'}</span>
            </div>

            {/* Logo / Icon */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? 'ツールロゴ / アイコン画像' : 'Tool Logo / Icon Image'}
              </label>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-2xs">
                  <CadIcon type={iconType} customIconUrl={logoIconUrl} size={28} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'ja' ? 'ロゴ画像をアップロード' : 'Upload Logo Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {logoIconUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoIconUrl('')}
                        className="text-stone-400 hover:text-red-500 text-xs px-2 py-1"
                      >
                        {lang === 'ja' ? 'リセット' : 'Reset'}
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={logoIconUrl}
                    onChange={(e) => setLogoIconUrl(e.target.value)}
                    placeholder="または画像URL (https://...)"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* GIF Animation */}
            <div className="pt-3 border-t border-stone-200">
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {lang === 'ja' ? 'GIFアニメーション動画 (GIF DEMO)' : 'GIF Animation (GIF DEMO)'}
              </label>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? 'GIFファイルをアップロード' : 'Upload GIF File'}</span>
                    <input
                      type="file"
                      accept="image/gif,image/*"
                      onChange={handleGifUpload}
                      className="hidden"
                    />
                  </label>

                  {gifUrl && (
                    <button
                      type="button"
                      onClick={() => setGifUrl('')}
                      className="text-stone-400 hover:text-red-500 text-xs px-2 py-1"
                    >
                      {lang === 'ja' ? 'クリア' : 'Clear'}
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={gifUrl}
                  onChange={(e) => setGifUrl(e.target.value)}
                  placeholder="またはGIF画像URL (例: https://.../demo.gif)"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />

                {gifUrl && (
                  <div className="mt-2 relative max-h-36 rounded-lg overflow-hidden border border-stone-300 bg-stone-900 flex items-center justify-center p-1">
                    <img src={gifUrl} alt="GIF Preview" className="max-h-32 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Manual 1, 2, 3, 4 Steps */}
          <div className="space-y-3">
            <div className="font-bold text-stone-900 text-xs flex items-center justify-between">
              <span>{lang === 'ja' ? '手動矢印バーステップ (1, 2, 3, 4)' : 'Manual Step Scrubber Steps (1, 2, 3, 4)'}</span>
              <span className="text-[10px] text-stone-400 font-normal">
                {lang === 'ja' ? '矢印ボタンで切り替わる手順内容' : 'Steps shown on manual arrow scrubber'}
              </span>
            </div>

            <div className="space-y-2.5">
              {steps.map((step, idx) => (
                <div key={step.id || idx} className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title.ja}
                      onChange={(e) => handleStepChange(idx, 'titleJa', e.target.value)}
                      placeholder={`ステップ ${idx + 1} タイトル (日本語)`}
                      className="flex-1 px-2.5 py-1 text-xs rounded border border-stone-300 bg-white font-medium"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={step.instruction.ja}
                    onChange={(e) => handleStepChange(idx, 'instructionJa', e.target.value)}
                    placeholder={`ステップ ${idx + 1} の操作説明 (日本語)`}
                    className="w-full px-2.5 py-1 text-xs rounded border border-stone-300 bg-white"
                  />
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
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'ja' ? 'ボックスを保存' : 'Save Box'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
