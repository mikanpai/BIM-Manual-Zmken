import React, { useState, useEffect } from 'react';
import { Language, RibbonCategoryId, ToolItem, StepItem, MediaItem, SubOptionItem, PreviewBoxItem } from '../types/manual';
import { CATEGORIES } from '../data/defaultManual';
import { 
  X, Check, Plus, Trash2, Upload, Image as ImageIcon, 
  HelpCircle, AlertTriangle, Layers, Film, ArrowUp, ArrowDown,
  ListTree, ChevronDown, CheckCircle2, Sparkles
} from 'lucide-react';
import { CadIcon } from './CadIcon';
import { uploadMediaFile } from '../lib/supabase';

interface ToolEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ToolItem | null; // null if creating a new tool
  onSave: (savedTool: ToolItem) => void;
  lang: Language;
}

export const ToolEditorModal: React.FC<ToolEditorModalProps> = ({
  isOpen,
  onClose,
  tool,
  onSave,
  lang,
}) => {
  const isEditing = !!tool;

  const [categoryId, setCategoryId] = useState<RibbonCategoryId>(
    tool ? tool.categoryId : 'architecture'
  );
  const [subgroupJa, setSubgroupJa] = useState(tool ? tool.subgroup.ja : '意匠部材');
  const [subgroupEn, setSubgroupEn] = useState(tool ? tool.subgroup.en : 'Architectural Component');
  const [nameJa, setNameJa] = useState(tool ? tool.name.ja : '');
  const [nameEn, setNameEn] = useState(tool ? tool.name.en : '');
  const [shortcut, setShortcut] = useState(tool?.shortcut || '');
  const [iconType, setIconType] = useState(tool?.iconType || 'wall');
  const [customIconUrl, setCustomIconUrl] = useState(tool?.customIconUrl || '');
  const [simulatorGifUrl, setSimulatorGifUrl] = useState(tool?.simulatorGifUrl || '');
  const [badgeJa, setBadgeJa] = useState(tool?.badge?.ja || '');
  const [badgeEn, setBadgeEn] = useState(tool?.badge?.en || '');
  const [shortDescJa, setShortDescJa] = useState(tool ? tool.shortDesc.ja : '');
  const [shortDescEn, setShortDescEn] = useState(tool ? tool.shortDesc.en : '');
  const [fullDescJa, setFullDescJa] = useState(tool ? tool.fullDesc.ja : '');
  const [fullDescEn, setFullDescEn] = useState(tool ? tool.fullDesc.en : '');

  // Preview Tool Boxes (multiple boxes support with custom title, logo, tool name, gif)
  const [previewBoxes, setPreviewBoxes] = useState<PreviewBoxItem[]>(
    tool?.previewBoxes && tool.previewBoxes.length > 0
      ? tool.previewBoxes
      : [
          {
            id: `box-${tool?.id || 'new'}-1`,
            boxTitle: { ja: 'プレビューツール', en: 'Preview Tool' },
            toolName: tool?.name || { ja: tool?.name.ja || '', en: tool?.name.en || '' },
            logoIconUrl: tool?.customIconUrl,
            iconType: tool?.iconType || 'wall',
            gifUrl: tool?.simulatorGifUrl,
          }
        ]
  );

  // Sub-options (like 仕上 -> 内部天井仕上, 外部天井仕上)
  const [subOptions, setSubOptions] = useState<SubOptionItem[]>(
    tool?.subOptions || []
  );
  
  // Steps
  const [steps, setSteps] = useState<StepItem[]>(
    tool?.steps && tool.steps.length > 0
      ? tool.steps
      : [
          {
            id: `s-${Date.now()}-1`,
            stepNumber: 1,
            title: { ja: 'コマンドの起動', en: 'Activate Command' },
            instruction: {
              ja: 'リボンメニューまたはショートカットからコマンドを実行します。',
              en: 'Activate the command from the ribbon or shortcut key.'
            }
          }
        ]
  );

  // Media (Images & GIFs)
  const [mediaList, setMediaList] = useState<MediaItem[]>(
    tool?.media || []
  );

  // Tips & Warnings
  const [tipsJa, setTipsJa] = useState<string[]>(tool?.tips?.ja || ['']);
  const [tipsEn, setTipsEn] = useState<string[]>(tool?.tips?.en || ['']);
  const [warningsJa, setWarningsJa] = useState<string[]>(tool?.warnings?.ja || ['']);
  const [warningsEn, setWarningsEn] = useState<string[]>(tool?.warnings?.en || ['']);

  // Active form tab: 'basic' | 'preview_boxes' | 'suboptions' | 'steps' | 'media' | 'tips'
  const [activeTab, setActiveTab] = useState<'basic' | 'preview_boxes' | 'suboptions' | 'steps' | 'media' | 'tips'>('basic');

  // Editor language view mode: 'en' | 'ja' | 'both'
  const [editLang, setEditLang] = useState<'both' | 'en' | 'ja'>(lang === 'en' ? 'en' : 'ja');

  // CRITICAL: Synchronize state whenever tool prop, lang, or isOpen changes so existing texts always show in current language
  useEffect(() => {
    if (!isOpen) return;

    if (tool) {
      setCategoryId(tool.categoryId);
      setSubgroupJa(tool.subgroup?.ja || '意匠部材');
      setSubgroupEn(tool.subgroup?.en || tool.subgroup?.ja || 'Architectural Component');
      setNameJa(tool.name?.ja || '');
      setNameEn(tool.name?.en || tool.name?.ja || '');
      setShortcut(tool.shortcut || '');
      setIconType(tool.iconType || 'wall');
      setCustomIconUrl(tool.customIconUrl || '');
      setSimulatorGifUrl(tool.simulatorGifUrl || '');
      setBadgeJa(tool.badge?.ja || '');
      setBadgeEn(tool.badge?.en || tool.badge?.ja || '');
      setShortDescJa(tool.shortDesc?.ja || '');
      setShortDescEn(tool.shortDesc?.en || tool.shortDesc?.ja || '');
      setFullDescJa(tool.fullDesc?.ja || tool.shortDesc?.ja || '');
      setFullDescEn(tool.fullDesc?.en || tool.shortDesc?.en || tool.fullDesc?.ja || tool.shortDesc?.ja || '');

      setPreviewBoxes(
        (tool.previewBoxes && tool.previewBoxes.length > 0
          ? tool.previewBoxes
          : [
              {
                id: `box-${tool.id}-1`,
                boxTitle: { ja: 'プレビューツール', en: 'Preview Tool' },
                toolName: tool.name ? { ja: tool.name.ja, en: tool.name.en } : { ja: '', en: '' },
                logoIconUrl: tool.customIconUrl,
                iconType: tool.iconType || 'wall',
                gifUrl: tool.simulatorGifUrl,
              }
            ]
        ).map((b) => ({
          ...b,
          boxTitle: {
            ja: b.boxTitle?.ja || 'プレビューツール',
            en: b.boxTitle?.en || b.boxTitle?.ja || 'Preview Tool',
          },
          toolName: {
            ja: b.toolName?.ja || tool.name?.ja || '',
            en: b.toolName?.en || tool.name?.en || b.toolName?.ja || tool.name?.ja || '',
          }
        }))
      );

      setSubOptions(
        (tool.subOptions || []).map((s) => ({
          ...s,
          name: {
            ja: s.name?.ja || '',
            en: s.name?.en || s.name?.ja || '',
          },
          desc: {
            ja: s.desc?.ja || '',
            en: s.desc?.en || s.desc?.ja || '',
          }
        }))
      );

      setSteps(
        (tool.steps && tool.steps.length > 0
          ? tool.steps
          : [
              {
                id: `s-${Date.now()}-1`,
                stepNumber: 1,
                title: { ja: 'コマンドの起動', en: 'Activate Command' },
                instruction: {
                  ja: 'リボンメニューまたはショートカットからコマンドを実行します。',
                  en: 'Activate the command from the ribbon or shortcut key.'
                }
              }
            ]
        ).map((st, i) => ({
          ...st,
          stepNumber: i + 1,
          title: {
            ja: st.title?.ja || `手順 ${i + 1}`,
            en: st.title?.en || st.title?.ja || `Step ${i + 1}`,
          },
          instruction: {
            ja: st.instruction?.ja || '',
            en: st.instruction?.en || st.instruction?.ja || '',
          }
        }))
      );

      setMediaList(
        (tool.media || []).map((m) => ({
          ...m,
          title: {
            ja: m.title?.ja || '',
            en: m.title?.en || m.title?.ja || '',
          },
          caption: m.caption ? {
            ja: m.caption.ja || '',
            en: m.caption.en || m.caption.ja || '',
          } : undefined
        }))
      );

      const tipsJaList = tool.tips?.ja && tool.tips.ja.length > 0 ? tool.tips.ja : [''];
      const tipsEnList = tool.tips?.en && tool.tips.en.length > 0 ? tool.tips.en : tipsJaList;
      setTipsJa(tipsJaList);
      setTipsEn(tipsEnList);

      const warnJaList = tool.warnings?.ja && tool.warnings.ja.length > 0 ? tool.warnings.ja : [''];
      const warnEnList = tool.warnings?.en && tool.warnings.en.length > 0 ? tool.warnings.en : warnJaList;
      setWarningsJa(warnJaList);
      setWarningsEn(warnEnList);
    } else {
      // New tool defaults
      setCategoryId('architecture');
      setSubgroupJa('意匠部材');
      setSubgroupEn('Architectural Component');
      setNameJa('');
      setNameEn('');
      setShortcut('');
      setIconType('wall');
      setCustomIconUrl('');
      setSimulatorGifUrl('');
      setBadgeJa('');
      setBadgeEn('');
      setShortDescJa('');
      setShortDescEn('');
      setFullDescJa('');
      setFullDescEn('');
      setPreviewBoxes([
        {
          id: `box-new-${Date.now()}`,
          boxTitle: { ja: 'プレビューツール', en: 'Preview Tool' },
          toolName: { ja: '', en: '' },
          iconType: 'wall',
        }
      ]);
      setSubOptions([]);
      setSteps([
        {
          id: `s-${Date.now()}-1`,
          stepNumber: 1,
          title: { ja: 'コマンドの起動', en: 'Activate Command' },
          instruction: {
            ja: 'リボンメニューまたはショートカットからコマンドを実行します。',
            en: 'Activate the command from the ribbon or shortcut key.'
          }
        }
      ]);
      setMediaList([]);
      setTipsJa(['']);
      setTipsEn(['']);
      setWarningsJa(['']);
      setWarningsEn(['']);
    }
    setEditLang(lang === 'en' ? 'en' : 'ja');
    setActiveTab('basic');
  }, [tool, isOpen, lang]);

  if (!isOpen) return null;

  // Custom Icon File Upload Handler
  const handleCustomIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setCustomIconUrl(await uploadMediaFile(file, 'icons')); } catch (error) { alert(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  // Preview Box handlers
  const addPreviewBox = () => {
    const nextNum = previewBoxes.length + 1;
    setPreviewBoxes([
      ...previewBoxes,
      {
        id: `box-${Date.now()}-${nextNum}`,
        boxTitle: { ja: `プレビューツール #${nextNum}`, en: `Preview Tool #${nextNum}` },
        toolName: { ja: nameJa || 'GLOOBE ツール', en: nameEn || 'GLOOBE Tool' },
        iconType: iconType,
        gifUrl: '',
      }
    ]);
  };

  const removePreviewBox = (index: number) => {
    if (previewBoxes.length <= 1) {
      alert(lang === 'ja' ? '最低1つのプレビューボックスが必要です。' : 'At least one preview box is required.');
      return;
    }
    setPreviewBoxes(previewBoxes.filter((_, i) => i !== index));
  };

  const updatePreviewBox = (index: number, field: string, value: string) => {
    const updated = [...previewBoxes];
    const box = { ...updated[index] };
    if (field === 'boxTitleJa') box.boxTitle = { ...box.boxTitle, ja: value };
    if (field === 'boxTitleEn') box.boxTitle = { ...box.boxTitle, en: value };
    if (field === 'toolNameJa') box.toolName = { ...(box.toolName || { ja: '', en: '' }), ja: value };
    if (field === 'toolNameEn') box.toolName = { ...(box.toolName || { ja: '', en: '' }), en: value };
    if (field === 'descriptionJa') box.description = { ...(box.description || { ja: '', en: '' }), ja: value };
    if (field === 'descriptionEn') box.description = { ...(box.description || { ja: '', en: '' }), en: value };
    if (field === 'gifUrl') box.gifUrl = value;
    if (field === 'logoIconUrl') box.logoIconUrl = value;
    if (field === 'iconType') box.iconType = value;
    updated[index] = box;
    setPreviewBoxes(updated);
  };

  const handleBoxLogoUpload = async (index: number, file: File) => {
    try { updatePreviewBox(index, 'logoIconUrl', await uploadMediaFile(file, 'preview-icons')); } catch (error) { alert(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  const handleBoxGifUpload = async (index: number, file: File) => {
    try { updatePreviewBox(index, 'gifUrl', await uploadMediaFile(file, 'preview-media')); } catch (error) { alert(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  // Simulator GIF Upload Handler
  const handleSimulatorGifUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setSimulatorGifUrl(await uploadMediaFile(file, 'simulator-media')); } catch (error) { alert(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  // Sub-option handlers
  const addSubOption = () => {
    const nextNum = subOptions.length + 1;
    setSubOptions([
      ...subOptions,
      {
        id: `sub-${Date.now()}-${nextNum}`,
        name: { ja: `サブ機能 ${nextNum}`, en: `Sub-option ${nextNum}` },
        desc: { ja: 'サブコマンドの説明', en: 'Sub-command description' },
        iconType: iconType,
        shortcut: ''
      }
    ]);
  };

  const removeSubOption = (index: number) => {
    setSubOptions(subOptions.filter((_, i) => i !== index));
  };

  const updateSubOption = (index: number, field: string, value: string) => {
    const updated = [...subOptions];
    const item = { ...updated[index] };
    if (field === 'nameJa') item.name = { ...item.name, ja: value };
    if (field === 'nameEn') item.name = { ...item.name, en: value };
    if (field === 'descJa') item.desc = { ja: value, en: value };
    if (field === 'shortcut') item.shortcut = value;
    if (field === 'iconType') item.iconType = value;
    if (field === 'customIconUrl') item.customIconUrl = value;
    updated[index] = item;
    setSubOptions(updated);
  };

  // Step handlers
  const addStep = () => {
    const nextNum = steps.length + 1;
    setSteps([
      ...steps,
      {
        id: `s-${Date.now()}-${nextNum}`,
        stepNumber: nextNum,
        title: { ja: `ステップ ${nextNum} のタイトル`, en: `Step ${nextNum} Title` },
        instruction: { ja: '', en: '' }
      }
    ]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      stepNumber: i + 1
    }));
    setSteps(updated);
  };

  const updateStep = (index: number, field: 'titleJa' | 'titleEn' | 'instructionJa' | 'instructionEn' | 'mediaUrl' | 'mediaCaptionJa', value: string) => {
    const updated = [...steps];
    const item = { ...updated[index] };
    if (field === 'titleJa') item.title = { ...item.title, ja: value };
    if (field === 'titleEn') item.title = { ...item.title, en: value };
    if (field === 'instructionJa') item.instruction = { ...item.instruction, ja: value };
    if (field === 'instructionEn') item.instruction = { ...item.instruction, en: value };
    if (field === 'mediaUrl') item.mediaUrl = value;
    if (field === 'mediaCaptionJa') item.mediaCaption = { ja: value, en: value };
    updated[index] = item;
    setSteps(updated);
  };

  // Media handlers (Image/GIF upload & URL)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetStepIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
    try {
      const mediaUrl = await uploadMediaFile(file, 'tool-media');
      if (typeof targetStepIndex === 'number') {
        updateStep(targetStepIndex, 'mediaUrl', mediaUrl);
      } else {
        const newMedia: MediaItem = {
          id: `m-${Date.now()}`,
          url: mediaUrl,
          title: {
            ja: file.name.replace(/\.[^/.]+$/, ''),
            en: file.name.replace(/\.[^/.]+$/, '')
          },
          caption: {
            ja: isGif ? 'GIFアニメーション操作デモ' : (isWebp ? 'WebP画像・デモ' : '操作画面スクリーンショット'),
            en: isGif ? 'GIF Animated Operation Demo' : (isWebp ? 'WebP Image / Demo' : 'Operation Screenshot')
          },
          type: isGif ? 'gif' : (isWebp ? 'webp' : 'image'),
          isPrimary: mediaList.length === 0
        };
        setMediaList([...mediaList, newMedia]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed.');
    }
  };

  const addMediaUrl = () => {
    const url = prompt(lang === 'ja' ? '画像またはGIFのURLを入力してください:' : 'Enter Image or GIF URL:');
    if (!url) return;
    const isGif = url.toLowerCase().includes('.gif');
    const newMedia: MediaItem = {
      id: `m-${Date.now()}`,
      url: url.trim(),
      title: {
        ja: isGif ? '操作GIFプレビュー' : 'キャプチャ画像',
        en: isGif ? 'Operation GIF' : 'Tool Screenshot'
      },
      caption: {
        ja: 'GLOOBE画面キャプチャ',
        en: 'GLOOBE CAD capture'
      },
      type: isGif ? 'gif' : 'image',
      isPrimary: mediaList.length === 0
    };
    setMediaList([...mediaList, newMedia]);
  };

  const removeMedia = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameJa.trim()) {
      alert(lang === 'ja' ? 'ツール名を入力してください' : 'Please provide a tool name');
      return;
    }

    const savedTool: ToolItem = {
      id: tool ? tool.id : `custom-tool-${Date.now()}`,
      categoryId,
      subgroup: { ja: subgroupJa || '一般', en: subgroupEn || 'General' },
      name: { ja: nameJa.trim(), en: nameEn.trim() || nameJa.trim() },
      shortDesc: { 
        ja: shortDescJa.trim() || 'GLOOBEコマンドの説明', 
        en: shortDescEn.trim() || 'GLOOBE command description' 
      },
      fullDesc: { 
        ja: fullDescJa.trim() || shortDescJa.trim(), 
        en: fullDescEn.trim() || shortDescEn.trim() 
      },
      shortcut: shortcut.trim() || undefined,
      iconType,
      customIconUrl: customIconUrl.trim() || undefined,
      simulatorGifUrl: simulatorGifUrl.trim() || undefined,
      previewBoxes: previewBoxes.length > 0 ? previewBoxes : undefined,
      subOptions: subOptions.length > 0 ? subOptions : undefined,
      steps: steps.filter((s) => s.title.ja.trim() || s.instruction.ja.trim()),
      media: mediaList,
      tips: {
        ja: tipsJa.filter(t => t.trim().length > 0),
        en: tipsEn.filter(t => t.trim().length > 0)
      },
      warnings: {
        ja: warningsJa.filter(w => w.trim().length > 0),
        en: warningsEn.filter(w => w.trim().length > 0)
      },
      relatedToolIds: tool?.relatedToolIds || [],
      custom: true,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSave(savedTool);
    onClose();
  };

  const iconOptions = [
    'finish', 'exterior-ceiling', 'molding', 'wall', 'column', 'beam', 
    'door', 'window', 'slab', 'stair', 'site', 'shield', 'sun', 'drawing', 'camera', 'share'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs">
              <CadIcon type={iconType} customIconUrl={customIconUrl} size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isEditing 
                  ? (lang === 'ja' ? `「${tool?.name.ja}」の編集` : `Edit Tool: ${tool?.name.en}`)
                  : (lang === 'ja' ? '新規GLOOBEツールの作成' : 'Create New GLOOBE Tool')}
              </h2>
              <p className="text-xs text-orange-100">
                {lang === 'ja' 
                  ? 'カスタムアイコン画像、サブオプション、GIF動画、手順を自由に登録できます' 
                  : 'Customize icon graphics, sub-options, GIF animations, and steps'}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 shrink-0 gap-2 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'basic'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'ja' ? '1. 基本情報・アイコン' : '1. Basic & Icon'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview_boxes')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preview_boxes'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>{lang === 'ja' ? `2. プレビューツール (${previewBoxes.length}個)` : `2. Preview Tools (${previewBoxes.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suboptions')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'suboptions'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>{lang === 'ja' ? `3. サブオプション (${subOptions.length})` : `3. Sub-options (${subOptions.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'ja' ? `4. 操作手順 (${steps.length}工程)` : `4. Steps (${steps.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{lang === 'ja' ? `5. ギャラリー画像 (${mediaList.length}件)` : `5. Gallery (${mediaList.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'tips'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'ja' ? '6. コツ・注意事項' : '6. Tips & Notes'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BASIC INFO & ICON CUSTOMIZATION */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              
              {/* Custom Icon Image Setting (REQUESTED BY USER) */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span>{lang === 'ja' ? 'アイコン画像（カスタム画像アップロード対応）' : 'Icon Graphic (Custom Image Upload)'}</span>
                  </div>
                  {customIconUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomIconUrl('')}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      {lang === 'ja' ? 'カスタム画像を解除' : 'Clear Custom Image'}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Current Icon Preview */}
                  <div className="w-16 h-16 rounded-xl bg-white border border-stone-300 shadow-sm flex items-center justify-center p-1.5 shrink-0">
                    <CadIcon type={iconType} customIconUrl={customIconUrl} size={36} />
                  </div>

                  {/* Upload Button & URL Input */}
                  <div className="flex-1 min-w-[220px] space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{lang === 'ja' ? 'PCからアイコン画像をアップロード' : 'Upload Icon Image (PNG/JPG/GIF)'}</span>
                        <input
                          type="file"
                          accept="image/*,.gif,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleCustomIconUpload}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={customIconUrl}
                      onChange={(e) => setCustomIconUrl(e.target.value)}
                      placeholder={lang === 'ja' ? 'またはアイコン画像URLを入力...' : 'Or enter custom icon image URL...'}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:border-orange-500 outline-none bg-white"
                    />
                  </div>
                </div>

                {!customIconUrl && (
                  <div className="pt-2 border-t border-orange-200/60 flex items-center gap-2">
                    <span className="text-xs text-stone-600">{lang === 'ja' ? '標準CADアイコン:' : 'Default CAD Vector Icon:'}</span>
                    <select
                      value={iconType}
                      onChange={(e) => setIconType(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-md border border-stone-300 bg-white focus:border-orange-500 outline-none"
                    >
                      {iconOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Category & Subgroup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    {lang === 'ja' ? 'リボン分類カテゴリ' : 'Ribbon Category'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value as RibbonCategoryId)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ja' ? c.name.ja : c.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      {lang === 'ja' ? '所属グループ（柱・梁・スラブ・壁等）' : 'Tool Grouping (Column, Beam, Slab, etc.)'}
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={subgroupJa}
                      onChange={(e) => setSubgroupJa(e.target.value)}
                      placeholder={lang === 'ja' ? '例: 柱ツール、スラブツール、梁ツール' : 'Group Name (Japanese)'}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                    />
                    <input
                      type="text"
                      value={subgroupEn}
                      onChange={(e) => setSubgroupEn(e.target.value)}
                      placeholder="e.g. Column Tools, Slab Tools, Beam Tools"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                    />
                    {/* Quick Group Presets */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { ja: '柱ツール', en: 'Column Tools' },
                        { ja: '梁・大梁ツール', en: 'Beam Tools' },
                        { ja: 'スラブツール', en: 'Slab Tools' },
                        { ja: '壁ツール', en: 'Wall Tools' },
                        { ja: '仕上ツール', en: 'Finish Tools' },
                        { ja: '階段ツール', en: 'Stair Tools' },
                      ].map((grp) => (
                        <button
                          key={grp.ja}
                          type="button"
                          onClick={() => {
                            setSubgroupJa(grp.ja);
                            setSubgroupEn(grp.en);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] border transition font-medium ${
                            subgroupJa === grp.ja
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-stone-100 hover:bg-orange-50 text-stone-600 border-stone-200'
                          }`}
                        >
                          {lang === 'ja' ? grp.ja : grp.en}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    {lang === 'ja' ? 'ツール・ボタン名（日本語）' : 'Tool Name (Japanese)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameJa}
                    onChange={(e) => setNameJa(e.target.value)}
                    placeholder="例: 仕上（天井・化粧材）"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    {lang === 'ja' ? 'ツール・ボタン名（英語）' : 'Tool Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Finishes (Ceiling & Trim)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                  />
                </div>
              </div>

              {/* Shortcut Key */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  {lang === 'ja' ? 'ショートカットキー' : 'Shortcut Key'}
                </label>
                <input
                  type="text"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder="例: F, W, C, Shift+D"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  {lang === 'ja' ? '概要・簡潔な説明（日本語）' : 'Short Description (Japanese)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shortDescJa}
                  onChange={(e) => setShortDescJa(e.target.value)}
                  placeholder="一覧で表示される1行の機能サマリー"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  {lang === 'ja' ? '詳細な機能説明（日本語）' : 'Detailed Function Description (Japanese)'}
                </label>
                <textarea
                  rows={3}
                  value={fullDescJa}
                  onChange={(e) => setFullDescJa(e.target.value)}
                  placeholder="このツールがGLOOBE上でどのような役割を果たし、どのようなBIMデータと連動するかを記入します"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none leading-relaxed"
                />
              </div>

            </div>
          )}

          {/* TAB: PREVIEW TOOL BOXES (USER REQUESTED: multiple boxes with custom title, logo, tool name, gif) */}
          {activeTab === 'preview_boxes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div>
                  <h3 className="text-xs font-bold text-stone-800">
                    {lang === 'ja' ? 'プレビューツール・ボックス設定' : 'Preview Tool Boxes'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {lang === 'ja' 
                      ? 'ボックス名（例: プレビューツール、壁配置シミュレータ）の改名、ツール名、ロゴアイコン、GIFデモを設定し、複数ボックスを追加できます。' 
                      : 'Customize box titles, tool names, logo icons, GIF animations, and add multiple preview boxes.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPreviewBox}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? 'ボックス追加' : 'Add Box'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {previewBoxes.map((pBox, bIdx) => (
                  <div key={pBox.id || bIdx} className="p-4 rounded-xl border border-orange-200/90 bg-stone-50/70 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                          {bIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-900">
                          {pBox.boxTitle.ja || `ボックス ${bIdx + 1}`}
                        </span>
                      </div>

                      {previewBoxes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePreviewBox(bIdx)}
                          className="p-1 text-stone-400 hover:text-red-600 transition"
                          title="Delete Box"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {lang === 'ja' ? 'ボックス名 (日本語)' : 'Box Title (JA)'} *
                        </label>
                        <input
                          type="text"
                          value={pBox.boxTitle.ja}
                          onChange={(e) => updatePreviewBox(bIdx, 'boxTitleJa', e.target.value)}
                          placeholder="例: プレビューツール / 壁配置シミュレータ"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {lang === 'ja' ? 'ボックス名 (英語)' : 'Box Title (EN)'}
                        </label>
                        <input
                          type="text"
                          value={pBox.boxTitle.en}
                          onChange={(e) => updatePreviewBox(bIdx, 'boxTitleEn', e.target.value)}
                          placeholder="e.g. Preview Tool / Action Simulator"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {lang === 'ja' ? 'ツール表示名 (日本語)' : 'Tool Display Name (JA)'}
                        </label>
                        <input
                          type="text"
                          value={pBox.toolName?.ja || ''}
                          onChange={(e) => updatePreviewBox(bIdx, 'toolNameJa', e.target.value)}
                          placeholder="例: GLOOBE 外壁・内壁配置"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {lang === 'ja' ? 'ツール表示名 (英語)' : 'Tool Display Name (EN)'}
                        </label>
                        <input
                          type="text"
                          value={pBox.toolName?.en || ''}
                          onChange={(e) => updatePreviewBox(bIdx, 'toolNameEn', e.target.value)}
                          placeholder="e.g. GLOOBE Wall Placement"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Box Description (Japanese & English) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {lang === 'ja' ? 'プレビューツールの説明 (日本語)' : 'Box Description (JA)'}
                        </label>
                        <textarea
                          rows={2}
                          value={pBox.description?.ja || ''}
                          onChange={(e) => updatePreviewBox(bIdx, 'descriptionJa', e.target.value)}
                          placeholder="操作の概要や機能解説（日本語）"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-orange-950 mb-1 flex items-center justify-between">
                          <span>{lang === 'ja' ? 'プレビューツールの説明 (英語)' : 'Box Description (English)'}</span>
                          <span className="text-[9px] text-orange-700 font-bold bg-orange-100 px-1 py-0.2 rounded">English</span>
                        </label>
                        <textarea
                          rows={2}
                          value={pBox.description?.en || ''}
                          onChange={(e) => updatePreviewBox(bIdx, 'descriptionEn', e.target.value)}
                          placeholder="English description or operational summary..."
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-orange-300 rounded-lg outline-none focus:border-orange-500 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Logo & GIF Animation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                          {lang === 'ja' ? 'ツールロゴ / アイコン画像' : 'Tool Logo / Icon'}
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-2xs">
                            <CadIcon type={pBox.iconType || iconType} customIconUrl={pBox.logoIconUrl} size={20} />
                          </div>
                          <label className="cursor-pointer px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs transition">
                            <Upload className="w-3 h-3" />
                            <span>{lang === 'ja' ? 'ロゴ選択' : 'Choose'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleBoxLogoUpload(bIdx, file);
                              }}
                              className="hidden"
                            />
                          </label>
                          {pBox.logoIconUrl && (
                            <button
                              type="button"
                              onClick={() => updatePreviewBox(bIdx, 'logoIconUrl', '')}
                              className="text-stone-400 hover:text-red-500 text-[10px]"
                            >
                              {lang === 'ja' ? 'リセット' : 'Reset'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                          {lang === 'ja' ? 'GIFアニメーション動画 (GIF DEMO)' : 'GIF Animation Demo'}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs transition">
                            <Upload className="w-3 h-3" />
                            <span>{lang === 'ja' ? 'GIFファイル選択' : 'Upload GIF'}</span>
                            <input
                              type="file"
                              accept="image/gif,image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleBoxGifUpload(bIdx, file);
                              }}
                              className="hidden"
                            />
                          </label>
                          {pBox.gifUrl && (
                            <button
                              type="button"
                              onClick={() => updatePreviewBox(bIdx, 'gifUrl', '')}
                              className="text-stone-400 hover:text-red-500 text-[10px]"
                            >
                              {lang === 'ja' ? 'クリア' : 'Clear'}
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={pBox.gifUrl || ''}
                          onChange={(e) => updatePreviewBox(bIdx, 'gifUrl', e.target.value)}
                          placeholder="またはGIF画像URL (https://...)"
                          className="mt-1 w-full px-2 py-1 text-[11px] bg-white border border-stone-300 rounded outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SUB-OPTIONS */}
          {activeTab === 'suboptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-800">
                    {lang === 'ja' ? 'サブオプション・プルダウンメニュー' : 'Sub-Options Dropdown Menu'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {lang === 'ja' 
                      ? 'GLOOBEの「仕上 ▼」ボタンのように、クリックで展開される子コマンド（例: 内部天井仕上、外部天井仕上、化粧材など）を設定します。' 
                      : 'Configure nested drop-down commands as seen in GLOOBE CAD toolbars.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSubOption}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? 'サブオプション追加' : 'Add Sub-Option'}</span>
                </button>
              </div>

              {subOptions.length > 0 ? (
                <div className="space-y-3">
                  {subOptions.map((sub, idx) => (
                    <div key={sub.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-stone-800">
                            {sub.name.ja || `サブコマンド ${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubOption(idx)}
                          className="p-1 text-stone-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            {lang === 'ja' ? 'サブ機能名（日本語）' : 'Sub-Option Name (JA)'}
                          </label>
                          <input
                            type="text"
                            value={sub.name.ja}
                            onChange={(e) => updateSubOption(idx, 'nameJa', e.target.value)}
                            placeholder="例: 内部天井仕上"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            {lang === 'ja' ? 'サブ機能名（英語）' : 'Sub-Option Name (EN)'}
                          </label>
                          <input
                            type="text"
                            value={sub.name.en}
                            onChange={(e) => updateSubOption(idx, 'nameEn', e.target.value)}
                            placeholder="e.g. Interior Ceiling Finish"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            {lang === 'ja' ? '説明・指示' : 'Description'}
                          </label>
                          <input
                            type="text"
                            value={sub.desc?.ja || ''}
                            onChange={(e) => updateSubOption(idx, 'descJa', e.target.value)}
                            placeholder="部屋領域をクリックして天井ボードを配置..."
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            {lang === 'ja' ? 'ショートカット / アイコン型' : 'Shortcut'}
                          </label>
                          <input
                            type="text"
                            value={sub.shortcut || ''}
                            onChange={(e) => updateSubOption(idx, 'shortcut', e.target.value)}
                            placeholder="Shift+F1"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs space-y-2">
                  <ListTree className="w-8 h-8 mx-auto text-stone-300" />
                  <p>{lang === 'ja' ? 'サブオプションはまだ設定されていません。' : 'No sub-options added.'}</p>
                  <p className="text-[11px] text-stone-400">
                    {lang === 'ja' ? '「仕上」や「建具」などのように、同一ボタン内に複数の分岐コマンドがある場合に登録します。' : 'Add sub-options if this tool has a drop-down menu of sub-commands.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600">
                  {lang === 'ja' 
                    ? '1, 2, 3, 4と手動で前後に動かせる操作ステップを記述します。' 
                    : 'Detail step-by-step instructions for team members.'}
                </span>
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? 'ステップを追加' : 'Add Step'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((st, index) => (
                  <div key={st.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={st.title.ja}
                          onChange={(e) => updateStep(index, 'titleJa', e.target.value)}
                          placeholder="手順タイトル（例: 壁仕様の選択）"
                          className="px-2.5 py-1 text-sm font-semibold text-stone-800 bg-white rounded border border-stone-200 focus:border-orange-500 outline-none"
                        />
                      </div>
                      
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={st.instruction.ja}
                        onChange={(e) => updateStep(index, 'instructionJa', e.target.value)}
                        placeholder="クリックする場所、キーボード操作、ダイアログ設定内容など具体的な指示内容"
                        className="w-full px-3 py-2 text-xs text-stone-700 bg-white rounded-lg border border-stone-200 focus:border-orange-500 outline-none leading-relaxed"
                      />
                    </div>

                    {/* Step specific Image or GIF upload */}
                    <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center gap-3">
                      <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span>{lang === 'ja' ? 'ステップ図版/GIF:' : 'Step Graphic:'}</span>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-stone-300 hover:border-orange-500 text-[11px] text-stone-700 font-medium transition shadow-2xs">
                        <Upload className="w-3 h-3 text-orange-600" />
                        <span>{lang === 'ja' ? '画像・GIFファイルを貼付' : 'Upload Image/GIF'}</span>
                        <input
                          type="file"
                          accept="image/*,.gif,.webp"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, index)}
                        />
                      </label>

                      {st.mediaUrl && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={st.mediaUrl} 
                            alt="preview" 
                            className="w-8 h-8 rounded object-cover border border-stone-300" 
                          />
                          <button
                            type="button"
                            onClick={() => updateStep(index, 'mediaUrl', '')}
                            className="text-[11px] text-red-500 hover:underline"
                          >
                            {lang === 'ja' ? '削除' : 'Remove'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA (GIFs & SIMULATOR GIF) */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              
              {/* Simulator GIF Setting (REQUESTED BY USER) */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-orange-600" />
                    <span>{lang === 'ja' ? 'CAD動作シミュレータ用 GIF動画' : 'CAD Action Simulator GIF'}</span>
                  </div>
                  {simulatorGifUrl && (
                    <button
                      type="button"
                      onClick={() => setSimulatorGifUrl('')}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      {lang === 'ja' ? 'シミュレータGIFを解除' : 'Clear Simulator GIF'}
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-stone-600">
                  {lang === 'ja'
                    ? 'ツールの詳細ページ上部にある「CAD動作シミュレータ」で直接再生したいGIF動画を設定できます。'
                    : 'Attach a GIF recording to directly play in the CAD Action Simulator.'}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? 'シミュレータGIF/WebPをアップロード' : 'Upload Simulator GIF/WebP'}</span>
                    <input
                      type="file"
                      accept="image/*,.gif,.webp"
                      className="hidden"
                      onChange={handleSimulatorGifUpload}
                    />
                  </label>

                  <input
                    type="text"
                    value={simulatorGifUrl}
                    onChange={(e) => setSimulatorGifUrl(e.target.value)}
                    placeholder={lang === 'ja' ? 'またはGIF動画のURLを入力...' : 'Or enter GIF URL...'}
                    className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:border-orange-500 outline-none bg-white"
                  />
                </div>

                {simulatorGifUrl && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {lang === 'ja' ? 'シミュレータGIF設定済み' : 'Simulator GIF Attached'}
                    </span>
                    <img src={simulatorGifUrl} alt="preview" className="w-12 h-8 rounded object-cover border border-stone-300" />
                  </div>
                )}
              </div>

              {/* Gallery upload controls */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 hover:border-orange-500 text-stone-700 rounded-xl text-xs font-semibold shadow-2xs transition">
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span>{lang === 'ja' ? 'ギャラリー用 画像・GIF・WebPをアップロード' : 'Upload Gallery Media'}</span>
                  <input
                    type="file"
                    accept="image/*,.gif,.webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e)}
                  />
                </label>

                <button
                  type="button"
                  onClick={addMediaUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-stone-300 hover:border-orange-500 text-stone-700 rounded-xl text-xs font-semibold shadow-2xs transition"
                >
                  <ImageIcon className="w-4 h-4 text-stone-500" />
                  <span>{lang === 'ja' ? 'URL指定で追加' : 'Add via URL'}</span>
                </button>
              </div>

              {/* Media Gallery List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {mediaList.map((m, idx) => (
                  <div key={m.id} className="relative rounded-xl border border-stone-200 bg-stone-50 overflow-hidden group">
                    <div className="relative aspect-video bg-stone-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={m.url}
                        alt={m.title.ja}
                        className="w-full h-full object-contain"
                      />
                      {m.type === 'gif' && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-orange-600 text-white text-[10px] font-bold shadow-xs">
                          GIF
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        value={m.title.ja}
                        onChange={(e) => {
                          const updated = [...mediaList];
                          updated[idx].title.ja = e.target.value;
                          setMediaList(updated);
                        }}
                        placeholder="タイトル (例: 平面配置デモ)"
                        className="w-full text-xs font-semibold px-2 py-1 bg-white border border-stone-200 rounded outline-none"
                      />
                      <input
                        type="text"
                        value={m.caption?.ja || ''}
                        onChange={(e) => {
                          const updated = [...mediaList];
                          updated[idx].caption = { ja: e.target.value, en: e.target.value };
                          setMediaList(updated);
                        }}
                        placeholder="キャプション・説明文"
                        className="w-full text-[11px] px-2 py-1 bg-white border border-stone-200 rounded outline-none text-stone-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-stone-900/60 text-white hover:bg-red-600 transition"
                      title="Delete Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TIPS & WARNINGS */}
          {activeTab === 'tips' && (
            <div className="space-y-6">
              {/* Tips Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'ja' ? '設計プロのコツ・ワンポイントTips' : 'Pro Tips'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTipsJa([...tipsJa, ''])}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    + {lang === 'ja' ? 'Tips追加' : 'Add Tip'}
                  </button>
                </div>
                {tipsJa.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => {
                        const updated = [...tipsJa];
                        updated[idx] = e.target.value;
                        setTipsJa(updated);
                      }}
                      placeholder="例: Spaceキーで壁のオフセット方向を素早く切り替えられます"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTipsJa(tipsJa.filter((_, i) => i !== idx))}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Warnings Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>{lang === 'ja' ? 'よくある失敗・注意事項' : 'Warnings & Cautions'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWarningsJa([...warningsJa, ''])}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    + {lang === 'ja' ? '注意事項追加' : 'Add Note'}
                  </button>
                </div>
                {warningsJa.map((warn, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={warn}
                      onChange={(e) => {
                        const updated = [...warningsJa];
                        updated[idx] = e.target.value;
                        setWarningsJa(updated);
                      }}
                      placeholder="例: 極小の壁を作成するとIFC書き出し時にエラーになります"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-red-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setWarningsJa(warningsJa.filter((_, i) => i !== idx))}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
            >
              {lang === 'ja' ? 'キャンセル' : 'Cancel'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ja' ? '保存してマニュアルに反映' : 'Save & Publish to Manual'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
