import React, { useState, useEffect } from 'react';
import { Language, PreviewBoxItem, PreviewMediaItem, StepItem } from '../types/manual';
import { 
  X, Check, Upload, Film, Trash2, Plus, Sparkles, Image as ImageIcon, 
  Video, ArrowUp, ArrowDown, MoveUp, MoveDown 
} from 'lucide-react';
import { CadIcon } from './CadIcon';
import { uploadMediaFile } from '../lib/supabase';

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
  const [descriptionJa, setDescriptionJa] = useState(box?.description?.ja || '');
  const [descriptionEn, setDescriptionEn] = useState(box?.description?.en || '');
  const [logoIconUrl, setLogoIconUrl] = useState(box?.logoIconUrl || '');
  const [iconType, setIconType] = useState(box?.iconType || defaultToolType);

  // Multiple media items (supports 2, 3, or more GIFs / WebM videos per preview tool)
  const [mediaList, setMediaList] = useState<PreviewMediaItem[]>([]);

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
      setDescriptionJa(box.description?.ja || '');
      setDescriptionEn(box.description?.en || '');
      setLogoIconUrl(box.logoIconUrl || '');
      setIconType(box.iconType || defaultToolType);
      setSteps(box.steps && box.steps.length > 0 ? box.steps : defaultInitialSteps);

      // Populate media list
      if (box.mediaList && box.mediaList.length > 0) {
        setMediaList(box.mediaList);
      } else if (box.gifUrls && box.gifUrls.length > 0) {
        setMediaList(
          box.gifUrls.map((url, i) => ({
            id: `media-${Date.now()}-${i}`,
            url,
            type: url.includes('.webm') || url.includes('.mp4') ? 'webm' : 'gif',
            title: { ja: `GIF / 動画 ${i + 1}`, en: `Media ${i + 1}` },
          }))
        );
      } else if (box.gifUrl) {
        setMediaList([
          {
            id: `media-${Date.now()}-0`,
            url: box.gifUrl,
            type: box.gifUrl.includes('.webm') ? 'webm' : 'gif',
            title: { ja: 'GIF 1: 操作デモ', en: 'Demo GIF 1' },
          },
        ]);
      } else {
        setMediaList([]);
      }
    } else {
      setBoxTitleJa('プレビューツール');
      setBoxTitleEn('Preview Tool');
      setToolNameJa(defaultToolName?.ja || '');
      setToolNameEn(defaultToolName?.en || '');
      setDescriptionJa('');
      setDescriptionEn('');
      setLogoIconUrl('');
      setIconType(defaultToolType);
      setSteps(defaultInitialSteps);
      setMediaList([]);
    }
  }, [box, isOpen]);

  if (!isOpen) return null;

  // Handle logo image upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setLogoIconUrl(await uploadMediaFile(file, 'preview-icons')); } catch (error) { alert(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  // Add new media item (GIF or WebM video)
  const handleAddNewMedia = () => {
    const newIdx = mediaList.length + 1;
    const newItem: PreviewMediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: '',
      type: 'gif',
      title: {
        ja: `GIF ${newIdx}: 手順デモ`,
        en: `Demo GIF ${newIdx}`,
      },
      caption: {
        ja: '',
        en: '',
      },
    };
    setMediaList([...mediaList, newItem]);
  };

  // Handle media file upload
  const handleMediaFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideoFile = file.type.includes('webm') || file.type.includes('mp4') || file.name.toLowerCase().endsWith('.webm') || file.name.toLowerCase().endsWith('.mp4');
    const isWebpFile = file.type.includes('webp') || file.name.toLowerCase().endsWith('.webp');
    const isGifFile = file.type.includes('gif') || file.name.toLowerCase().endsWith('.gif');

    let detectedType: 'gif' | 'webm' | 'video' | 'image' | 'webp' = 'gif';
    if (isVideoFile) detectedType = 'webm';
    else if (isWebpFile) detectedType = 'webp';
    else if (isGifFile) detectedType = 'gif';
    else detectedType = 'image';

    try {
      const updated = [...mediaList];
      updated[index] = {
        ...updated[index],
        url: await uploadMediaFile(file, 'preview-media'),
        type: detectedType,
      };
      setMediaList(updated);
    } catch (error) { alert(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  const handleUpdateMedia = (index: number, updates: Partial<PreviewMediaItem>) => {
    const updated = [...mediaList];
    updated[index] = { ...updated[index], ...updates };
    setMediaList(updated);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleMoveMedia = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === mediaList.length - 1) return;
    const updated = [...mediaList];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setMediaList(updated);
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

  const handleStepMediaChange = (index: number, mediaId: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], mediaId: mediaId || undefined };
    setSteps(updated);
  };

  const addStep = () => {
    const nextNumber = steps.length + 1;
    setSteps([...steps, {
      id: `step-${Date.now()}-${nextNumber}`,
      stepNumber: nextNumber,
      title: { ja: `ステップ ${nextNumber}`, en: `Step ${nextNumber}` },
      instruction: { ja: '', en: '' },
      mediaId: mediaList[nextNumber - 1]?.id,
    }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, stepIndex) => stepIndex !== index).map((step, stepIndex) => ({ ...step, stepNumber: stepIndex + 1 })));
  };

  const handleSave = () => {
    const cleanedMedia = mediaList.filter((m) => m.url.trim().length > 0);
    const gifUrls = cleanedMedia.map((m) => m.url);
    const primaryGif = gifUrls[0] || undefined;

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
      description: (descriptionJa.trim() || descriptionEn.trim()) ? {
        ja: descriptionJa.trim(),
        en: descriptionEn.trim() || descriptionJa.trim(),
      } : undefined,
      logoIconUrl: logoIconUrl.trim() || undefined,
      iconType: iconType || 'wall',
      gifUrl: primaryGif,
      gifUrls: gifUrls.length > 0 ? gifUrls : undefined,
      mediaList: cleanedMedia.length > 0 ? cleanedMedia : undefined,
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
                {lang === 'ja' ? 'ボックス名、ツール名、複数のGIF/WebM動画（2〜3件以上）を設定します' : 'Configure box name, tool name, and multiple GIF/WebM demo files'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
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

            {/* Box Description (Japanese & English) */}
            <div className="pt-2 border-t border-orange-200/60 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {lang === 'ja' ? 'プレビューツールの説明 (日本語)' : 'Box Description (Japanese)'}
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionJa}
                    onChange={(e) => setDescriptionJa(e.target.value)}
                    placeholder="このプレビューツールの操作概要や機能説明（日本語）"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-orange-950 mb-1 flex items-center justify-between">
                    <span>{lang === 'ja' ? 'プレビューツールの説明 (英語)' : 'Box Description (English)'}</span>
                    <span className="text-[10px] text-orange-700 font-bold bg-orange-100 px-1.5 py-0.2 rounded">English Description</span>
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Enter English description or operational summary for this preview tool..."
                    className="w-full px-3 py-2 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Logo / Icon */}
          <div className="space-y-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>{lang === 'ja' ? 'ツールロゴ・アイコン設定' : 'Tool Logo & Icon'}</span>
            </div>

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
                        className="text-stone-400 hover:text-red-500 text-xs px-2 py-1 cursor-pointer"
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
          </div>

          {/* Section 3: MULTIPLE GIF / WebM Media List (USER REQUEST: upload 2-3 GIF or WebM files) */}
          <div className="space-y-4 p-4 rounded-xl bg-orange-50/30 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Film className="w-4 h-4 text-orange-600" />
                <span>{lang === 'ja' ? 'GIF / WebM 動画リスト（2〜3件以上の複数登録に対応）' : 'GIF / WebM Video Demos (Upload 2-3+ files)'}</span>
              </div>

              <button
                type="button"
                onClick={handleAddNewMedia}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ja' ? 'GIF/動画を追加' : 'Add GIF/Video'}</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-500">
              {lang === 'ja'
                ? 'このプレビューツールに複数のGIFファイルやWebM動画（2〜3ファイルなど）を登録できます。登録したメディアはプレビュー画面上部のタブや矢印で切り替え再生されます。'
                : 'Upload 2-3 or more GIF and WebM files for this preview box. Viewers can switch between them with tabs or arrows.'}
            </p>

            {mediaList.length === 0 ? (
              <div className="p-6 rounded-xl border-2 border-dashed border-stone-200 bg-white text-center space-y-2">
                <Film className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-medium">
                  {lang === 'ja' ? '登録されているGIF/動画はありません。' : 'No GIF / WebM files added yet.'}
                </p>
                <button
                  type="button"
                  onClick={handleAddNewMedia}
                  className="px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? '最初のGIF/WebM動画を追加する' : 'Add First Demo GIF/WebM'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {mediaList.map((item, idx) => {
                  const isVid = item.type === 'webm' || item.type === 'video' || item.url.includes('.webm') || item.url.includes('.mp4');

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-stone-800 text-xs">
                            {isVid ? 'WebM / MP4 動画' : 'アニメーション GIF'} #{idx + 1}
                          </span>
                          <span className="text-[10px] text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded font-semibold">
                            {idx === 0 ? (lang === 'ja' ? 'メイン表示' : 'Primary') : `サブ ${idx}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveMedia(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMedia(idx, 'down')}
                            disabled={idx === mediaList.length - 1}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="p-1 rounded text-stone-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                            {lang === 'ja' ? '見出し (日本語)' : 'Label (JA)'}
                          </label>
                          <input
                            type="text"
                            value={item.title?.ja || ''}
                            onChange={(e) =>
                              handleUpdateMedia(idx, {
                                title: {
                                  ja: e.target.value,
                                  en: item.title?.en || e.target.value,
                                },
                              })
                            }
                            placeholder={`例: GIF ${idx + 1}: 壁入力`}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50/50"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                            {lang === 'ja' ? '見出し (英語)' : 'Label (EN)'}
                          </label>
                          <input
                            type="text"
                            value={item.title?.en || ''}
                            onChange={(e) =>
                              handleUpdateMedia(idx, {
                                title: {
                                  ja: item.title?.ja || e.target.value,
                                  en: e.target.value,
                                },
                              })
                            }
                            placeholder={`e.g. Demo GIF ${idx + 1}`}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                            {lang === 'ja' ? '形式' : 'Format'}
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) =>
                              handleUpdateMedia(idx, { type: e.target.value as any })
                            }
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50/50"
                          >
                            <option value="gif">GIF アニメーション</option>
                            <option value="webp">WebP 画像 / アニメーション</option>
                            <option value="webm">WebM 動画</option>
                            <option value="video">MP4 動画</option>
                            <option value="image">静止画 (PNG, JPEG)</option>
                          </select>
                        </div>
                      </div>

                      {/* Media Description / Caption (JA & EN) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                            {lang === 'ja' ? 'メディア説明 (日本語)' : 'Caption / Description (JA)'}
                          </label>
                          <input
                            type="text"
                            value={item.caption?.ja || ''}
                            onChange={(e) =>
                              handleUpdateMedia(idx, {
                                caption: {
                                  ja: e.target.value,
                                  en: item.caption?.en || e.target.value,
                                },
                              })
                            }
                            placeholder="このGIF/動画の説明や注記"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-stone-50/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                            {lang === 'ja' ? 'メディア説明 (英語)' : 'Caption / Description (EN)'}
                          </label>
                          <input
                            type="text"
                            value={item.caption?.en || ''}
                            onChange={(e) =>
                              handleUpdateMedia(idx, {
                                caption: {
                                  ja: item.caption?.ja || e.target.value,
                                  en: e.target.value,
                                },
                              })
                            }
                            placeholder="English caption or notes for this media"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-stone-50/50"
                          />
                        </div>
                      </div>

                      {/* File Upload / URL input */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{lang === 'ja' ? 'ファイルをアップロード' : 'Upload File'}</span>
                            <input
                              type="file"
                              accept="image/gif,image/webp,image/*,video/webm,video/mp4"
                              onChange={(e) => handleMediaFileUpload(idx, e)}
                              className="hidden"
                            />
                          </label>

                          <span className="text-[10px] text-stone-400">
                            {lang === 'ja' ? '（GIF, WebP, WebM, MP4対応）' : '(GIF, WebP, WebM, MP4)'}
                          </span>
                        </div>

                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleUpdateMedia(idx, { url: e.target.value })}
                          placeholder="またはURLを直接入力 (https://...)"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50/50 font-mono"
                        />

                        {/* Thumbnail / Player preview */}
                        {item.url && (
                          <div className="relative mt-2 max-h-36 rounded-lg overflow-hidden border border-stone-300 bg-stone-900 flex items-center justify-center p-1">
                            {isVid ? (
                              <video
                                src={item.url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="max-h-32 object-contain"
                              />
                            ) : (
                              <img
                                src={item.url}
                                alt={`Media ${idx + 1}`}
                                className="max-h-32 object-contain"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Manual 1, 2, 3, 4 Steps */}
          <div className="space-y-3">
            <div className="font-bold text-stone-900 text-xs flex items-center justify-between">
              <span>{lang === 'ja' ? '手動矢印バーステップ (1, 2, 3, 4)' : 'Manual Step Scrubber Steps (1, 2, 3, 4)'}</span>
              <button type="button" onClick={addStep} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 hover:bg-orange-100">
                <Plus className="w-3 h-3" />
                {lang === 'ja' ? 'ステップ追加' : 'Add Step'}
              </button>
            </div>

            <div className="space-y-2.5">
              {steps.map((step, idx) => (
                <div key={step.id || idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5 shadow-2xs">
                  {/* Step Header & Titles (JA & EN) */}
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
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
                    <button type="button" onClick={() => removeStep(idx)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600" title={lang === 'ja' ? 'ステップを削除' : 'Remove step'}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <label className="block text-[10px] font-semibold text-stone-600">
                    {lang === 'ja' ? 'このステップで表示するGIF / WebM / 画像' : 'GIF / WebM / image to show for this step'}
                    <select value={step.mediaId || ''} onChange={(event) => handleStepMediaChange(idx, event.target.value)} className="mt-1 w-full rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs">
                      <option value="">{lang === 'ja' ? 'メディアを選択しない' : 'No linked media'}</option>
                      {mediaList.filter((media) => media.url.trim()).map((media, mediaIndex) => (
                        <option key={media.id} value={media.id}>{media.title ? (lang === 'ja' ? media.title.ja : media.title.en) : `Media ${mediaIndex + 1}`}</option>
                      ))}
                    </select>
                  </label>

                  {/* Step Instructions / Descriptions (JA & EN) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                        {lang === 'ja' ? `ステップ ${idx + 1} 操作説明 (日本語)` : `Step ${idx + 1} Description (JA)`}
                      </label>
                      <textarea
                        rows={2}
                        value={step.instruction.ja}
                        onChange={(e) => handleStepChange(idx, 'instructionJa', e.target.value)}
                        placeholder={`ステップ ${idx + 1} の操作説明 (日本語)`}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-orange-950 mb-0.5 flex items-center justify-between">
                        <span>{lang === 'ja' ? `ステップ ${idx + 1} 操作説明 (英語)` : `Step ${idx + 1} Description (EN)`}</span>
                        <span className="text-[9px] text-orange-700 font-bold bg-orange-100 px-1 py-0.2 rounded">English</span>
                      </label>
                      <textarea
                        rows={2}
                        value={step.instruction.en}
                        onChange={(e) => handleStepChange(idx, 'instructionEn', e.target.value)}
                        placeholder={`Enter English description and instructions for step ${idx + 1}...`}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-orange-300 bg-white leading-relaxed"
                      />
                    </div>
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
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 font-medium text-xs transition cursor-pointer"
          >
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'ja' ? 'ボックスを保存' : 'Save Box'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
