import React, { useState } from 'react';
import { CategoryInfo, CompanySettings, Language, SupabaseConfig, ToolItem } from '../types/manual';
import { 
  X, Check, Plus, Trash2, ArrowUp, ArrowDown, Sliders, 
  Building2, Layers, Film, RotateCcw, Download, Upload, ShieldCheck, Sparkles,
  ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Edit3, ArrowRight, CornerDownRight, Box, FolderPlus,
  Database, Copy, CheckCircle2, AlertCircle, RefreshCw, Palette, Lock
} from 'lucide-react';
import { CadIcon } from './CadIcon';
import { 
  getSupabaseConfig, testSupabaseConnection, 
  SUPABASE_TABLE_SQL, DEFAULT_SAMPLE_MEDIA 
} from '../lib/supabase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  onSaveCategories: (updatedCategories: CategoryInfo[]) => void;
  tools?: ToolItem[];
  onSaveTools?: (updatedTools: ToolItem[]) => void;
  onAddNewTool?: () => void;
  companySettings: CompanySettings;
  onSaveCompanySettings: (updated: CompanySettings) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetDefault: () => void;
  initialTab?: 'categories' | 'ribbon_groupings' | 'ribbon_dropdowns' | 'preview_tool' | 'company' | 'backup' | 'supabase';
  lang: Language;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  tools = [],
  onSaveTools,
  onAddNewTool,
  companySettings,
  onSaveCompanySettings,
  onExportJson,
  onImportJson,
  onResetDefault,
  initialTab = 'categories',
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'ribbon_groupings' | 'ribbon_dropdowns' | 'preview_tool' | 'company' | 'backup' | 'supabase'>(initialTab);

  // Categories local state
  const [localCategories, setLocalCategories] = useState<CategoryInfo[]>(categories);

  // Tools local state
  const [localTools, setLocalTools] = useState<ToolItem[]>(tools);

  // Selected Category filter for Ribbon Dropdowns & Groupings tab
  const [selectedCatId, setSelectedCatId] = useState<string>(
    categories.length > 0 ? categories[0].id : 'architecture'
  );

  // State for editing Dropdown Group Icon & Name
  const [editingDropdownConfigId, setEditingDropdownConfigId] = useState<string | null>(null);
  const [tempDropdownNameJa, setTempDropdownNameJa] = useState('');
  const [tempDropdownNameEn, setTempDropdownNameEn] = useState('');
  const [tempDropdownIconType, setTempDropdownIconType] = useState('wall');
  const [tempDropdownCustomUrl, setTempDropdownCustomUrl] = useState('');

  // Supabase Configuration from environment variables (.env)
  const supabaseConfig = getSupabaseConfig();
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    rowCount?: number;
  }>({ loading: false });
  const [copiedSql, setCopiedSql] = useState(false);

  // State for creating new Grouping (Column tools, Beam tools, Slab tools, etc.)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupNameJa, setNewGroupNameJa] = useState('');
  const [newGroupNameEn, setNewGroupNameEn] = useState('');

  // State for editing a specific group name inline
  const [editingGroupJa, setEditingGroupJa] = useState<string | null>(null);
  const [tempGroupNameJa, setTempGroupNameJa] = useState('');
  const [tempGroupNameEn, setTempGroupNameEn] = useState('');

  // Preview Tool Global Title local state
  const [previewTitleJa, setPreviewTitleJa] = useState(companySettings.defaultPreviewBoxTitleJa || 'プレビューツール');
  const [previewTitleEn, setPreviewTitleEn] = useState(companySettings.defaultPreviewBoxTitleEn || 'Preview Tool');

  // Company Profile local state
  const [companyJa, setCompanyJa] = useState(companySettings.nameJa);
  const [companyEn, setCompanyEn] = useState(companySettings.nameEn);
  const [deptJa, setDeptJa] = useState(companySettings.departmentJa);
  const [deptEn, setDeptEn] = useState(companySettings.departmentEn);
  const [welcomeJa, setWelcomeJa] = useState(companySettings.welcomeNoticeJa);
  const [welcomeEn, setWelcomeEn] = useState(companySettings.welcomeNoticeEn);

  // Modal for quick adding tool to a dropdown
  const [quickAddDropdownId, setQuickAddDropdownId] = useState<string | null>(null);
  const [quickAddNameJa, setQuickAddNameJa] = useState('');
  const [quickAddNameEn, setQuickAddNameEn] = useState('');
  const [quickAddShortcut, setQuickAddShortcut] = useState('');
  const [quickAddIconType, setQuickAddIconType] = useState('wall');
  const [quickAddDescJa, setQuickAddDescJa] = useState('');

  // Modal for creating new dropdown box
  const [isCreatingDropdown, setIsCreatingDropdown] = useState(false);
  const [newDropdownNameJa, setNewDropdownNameJa] = useState('');
  const [newDropdownNameEn, setNewDropdownNameEn] = useState('');
  const [newDropdownSubgroupJa, setNewDropdownSubgroupJa] = useState('壁ツール');
  const [newDropdownSubgroupEn, setNewDropdownSubgroupEn] = useState('Wall Tools');

  if (!isOpen) return null;

  // Move Category Up
  const moveCategoryUp = (index: number) => {
    if (index === 0) return;
    const updated = [...localCategories];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setLocalCategories(updated);
  };

  // Move Category Down
  const moveCategoryDown = (index: number) => {
    if (index === localCategories.length - 1) return;
    const updated = [...localCategories];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setLocalCategories(updated);
  };

  // Update Category Field
  const updateCategory = (index: number, field: string, value: string) => {
    const updated = [...localCategories];
    const cat = { ...updated[index] };
    if (field === 'nameJa') cat.name = { ...cat.name, ja: value };
    if (field === 'nameEn') cat.name = { ...cat.name, en: value };
    if (field === 'descJa') cat.desc = { ...cat.desc, ja: value };
    if (field === 'descEn') cat.desc = { ...cat.desc, en: value };
    updated[index] = cat;
    setLocalCategories(updated);
  };

  // Add New Category
  const addCategory = () => {
    const newId = `cat-custom-${Date.now()}`;
    const newCat: CategoryInfo = {
      id: newId,
      name: { ja: '新規カテゴリ', en: 'New Category' },
      desc: { ja: '新規カテゴリの説明', en: 'New Category Description' },
      iconName: 'Layers',
      accentColor: '#EA580C',
    };
    setLocalCategories([...localCategories, newCat]);
    setSelectedCatId(newId);
  };

  // Apply Standard Architectural Presets Requested by User:
  // "architecture and framing, doors and windows, structure and rebar, and so on"
  const applyStandardPresets = () => {
    const presets: CategoryInfo[] = [
      {
        id: 'architecture',
        name: { ja: '意匠・躯体', en: 'Architecture & Framing' },
        desc: { ja: '壁、柱、梁、スラブ、天井などの基本躯体モデリング', en: 'Core BIM elements: walls, columns, beams, slabs, ceilings' },
        iconName: 'Building2',
        accentColor: '#EA580C',
      },
      {
        id: 'framing',
        name: { ja: '軸組・フレーム', en: 'Timber & Steel Framing' },
        desc: { ja: '木造軸組、鉄骨フレーム、金物プレカット連動', en: 'Post-and-beam timber framing and steel structural framing' },
        iconName: 'Boxes',
        accentColor: '#D97706',
      },
      {
        id: 'openings',
        name: { ja: '建具・窓・ドア', en: 'Doors & Windows' },
        desc: { ja: '壁配置建具、カーテンウォール、建具表自動連動', en: 'Wall-hosted doors, windows, curtain walls, schedules' },
        iconName: 'DoorOpen',
        accentColor: '#F97316',
      },
      {
        id: 'structure',
        name: { ja: '構造・配筋', en: 'Structure & Rebar' },
        desc: { ja: '基礎、小梁、ブレース、構造伏図の作成・連動', en: 'Foundations, secondary beams, structural plans, rebar details' },
        iconName: 'Layers',
        accentColor: '#B45309',
      },
      {
        id: 'finishes',
        name: { ja: '内装・仕上', en: 'Finishes & Interior' },
        desc: { ja: '天井仕上、床仕上、壁仕上、化粧材、部屋面積積算', en: 'Ceilings, wall finishes, moldings, room bounding' },
        iconName: 'Paintbrush',
        accentColor: '#E11D48',
      },
      {
        id: 'mep',
        name: { ja: '設備・配管', en: 'MEP & Equipment' },
        desc: { ja: '衛生・空調・電気配管ルート、スリーブ干渉チェック', en: 'Mechanical, electrical, plumbing routing and clash checks' },
        iconName: 'Cpu',
        accentColor: '#0284C7',
      },
      {
        id: 'site',
        name: { ja: '敷地・外構', en: 'Site & Exterior' },
        desc: { ja: '敷地境界、高低差、造成、道路、外構マテリアル', en: 'Property boundary, elevation contours, topography, roads' },
        iconName: 'Trees',
        accentColor: '#059669',
      },
      {
        id: 'drawing',
        name: { ja: '図面・集計', en: 'Drawings & Schedules' },
        desc: { ja: '平面図、立面図、断面図、求積図、数量拾い出し', en: 'Floor plans, elevations, sections, area calculation, takeoff' },
        iconName: 'FileSpreadsheet',
        accentColor: '#2563EB',
      },
    ];
    setLocalCategories(presets);
    setSelectedCatId('architecture');
  };

  // Remove Category
  const removeCategory = (index: number) => {
    if (localCategories.length <= 1) {
      alert(lang === 'ja' ? '最低1つのカテゴリが必要です。' : 'At least one category is required.');
      return;
    }
    const cat = localCategories[index];
    const confirmMsg = lang === 'ja'
      ? `カテゴリ「${cat.name.ja}」を削除しますか？`
      : `Delete category "${cat.name.en}"?`;
    if (window.confirm(confirmMsg)) {
      const updated = localCategories.filter((_, i) => i !== index);
      setLocalCategories(updated);
      if (selectedCatId === cat.id) {
        setSelectedCatId(updated[0].id);
      }
    }
  };

  // Move Tool into Dropdown
  const moveToolToDropdown = (toolId: string, dropdownId: string, dropdownName: string) => {
    setLocalTools((prev) =>
      prev.map((t) => {
        if (t.id === toolId) {
          return {
            ...t,
            dropdownGroup: dropdownId,
            dropdownGroupName: { ja: dropdownName, en: dropdownName },
          };
        }
        return t;
      })
    );
  };

  // Move Tool out of Dropdown to Standalone
  const moveToolToStandalone = (toolId: string) => {
    setLocalTools((prev) =>
      prev.map((t) => {
        if (t.id === toolId) {
          const { dropdownGroup, dropdownGroupName, isDropdownTrigger, ...rest } = t;
          return rest as ToolItem;
        }
        return t;
      })
    );
  };

  // Set Tool as Dropdown Trigger
  const setAsDropdownTrigger = (toolId: string, dropdownId: string) => {
    setLocalTools((prev) =>
      prev.map((t) => {
        if (t.dropdownGroup === dropdownId) {
          return {
            ...t,
            isDropdownTrigger: t.id === toolId,
          };
        }
        return t;
      })
    );
  };

  // Quick Add Tool to Dropdown
  const handleQuickAddToolToDropdown = () => {
    if (!quickAddDropdownId || !quickAddNameJa.trim()) return;

    // Find trigger or sibling tool in this dropdown to get subgroup & dropdownGroupName
    const sibling = localTools.find((t) => t.dropdownGroup === quickAddDropdownId);
    const subgroup = sibling?.subgroup || { ja: '壁ツール', en: 'Wall Tools' };
    const dropdownGroupName = sibling?.dropdownGroupName || { ja: 'ドロップダウン', en: 'Dropdown' };
    const categoryId = sibling?.categoryId || selectedCatId;

    const newId = `tool-custom-${Date.now()}`;
    const newTool: ToolItem = {
      id: newId,
      categoryId,
      subgroup,
      name: { ja: quickAddNameJa.trim(), en: quickAddNameEn.trim() || quickAddNameJa.trim() },
      shortDesc: { 
        ja: quickAddDescJa.trim() || 'GLOOBEドロップダウンメニューのツールです。', 
        en: 'Custom tool inside GLOOBE dropdown.' 
      },
      fullDesc: {
        ja: `${quickAddNameJa.trim()}のBIM操作手順と仕様設定マニュアルです。`,
        en: `Operation guide and specifications for ${quickAddNameEn.trim() || quickAddNameJa.trim()}.`
      },
      shortcut: quickAddShortcut.trim() || undefined,
      iconType: quickAddIconType,
      dropdownGroup: quickAddDropdownId,
      dropdownGroupName,
      steps: [
        {
          id: `step-1-${Date.now()}`,
          stepNumber: 1,
          title: { ja: `${quickAddNameJa.trim()}の起動`, en: `Activate ${quickAddNameEn.trim() || quickAddNameJa.trim()}` },
          instruction: { 
            ja: `リボンバーの「${dropdownGroupName.ja}」ドロップダウンから選択して実行します。`, 
            en: `Select from the ribbon dropdown menu to execute.` 
          }
        }
      ],
      media: [],
      tips: { ja: [], en: [] },
      warnings: { ja: [], en: [] },
      relatedToolIds: [],
    };

    setLocalTools((prev) => [newTool, ...prev]);
    setQuickAddDropdownId(null);
    setQuickAddNameJa('');
    setQuickAddNameEn('');
    setQuickAddShortcut('');
    setQuickAddDescJa('');
  };

  // Create New Dropdown Group
  const handleCreateDropdownGroup = () => {
    if (!newDropdownNameJa.trim()) return;
    const gId = `dropdown-${Date.now()}`;

    // Create a starter tool for this dropdown group
    const starterTool: ToolItem = {
      id: `tool-${Date.now()}`,
      categoryId: selectedCatId,
      subgroup: { ja: newDropdownSubgroupJa.trim(), en: newDropdownSubgroupEn.trim() },
      name: { ja: `${newDropdownNameJa.trim()} (項目1)`, en: `${newDropdownNameEn.trim() || newDropdownNameJa.trim()} (Item 1)` },
      shortDesc: { ja: `${newDropdownNameJa.trim()}の配置コマンド`, en: 'Dropdown tool item' },
      fullDesc: { ja: 'GLOOBEドロップダウンメニューの操作手順です。', en: 'Dropdown tool procedure.' },
      iconType: 'wall',
      dropdownGroup: gId,
      dropdownGroupName: { 
        ja: newDropdownNameJa.trim().endsWith('▼') ? newDropdownNameJa.trim() : `${newDropdownNameJa.trim()} ▼`, 
        en: newDropdownNameEn.trim() || newDropdownNameJa.trim() 
      },
      isDropdownTrigger: true,
      steps: [
        {
          id: `s-${Date.now()}`,
          stepNumber: 1,
          title: { ja: 'コマンド実行', en: 'Run Command' },
          instruction: { ja: 'ドロップダウンから選択して配置します。', en: 'Select and place.' }
        }
      ],
      media: [],
      tips: { ja: [], en: [] },
      warnings: { ja: [], en: [] },
      relatedToolIds: []
    };

    setLocalTools((prev) => [starterTool, ...prev]);
    setIsCreatingDropdown(false);
    setNewDropdownNameJa('');
    setNewDropdownNameEn('');
  };

  // Group Management Handlers (Column tools, Beam tools, Slab tools, etc.)
  const handleRenameGroup = (oldJa: string, newJa: string, newEn: string) => {
    if (!newJa.trim()) return;
    setLocalTools((prev) =>
      prev.map((t) => {
        if (t.categoryId === selectedCatId && t.subgroup.ja === oldJa) {
          return {
            ...t,
            subgroup: { ja: newJa.trim(), en: newEn.trim() || newJa.trim() },
          };
        }
        return t;
      })
    );
    setEditingGroupJa(null);
  };

  const handleMoveToolToGroup = (toolId: string, targetJa: string, targetEn: string) => {
    setLocalTools((prev) =>
      prev.map((t) => {
        if (t.id === toolId) {
          return {
            ...t,
            subgroup: { ja: targetJa, en: targetEn },
          };
        }
        return t;
      })
    );
  };

  const handleDeleteGroup = (groupJa: string) => {
    const confirmMsg = lang === 'ja'
      ? `グループ「${groupJa}」を削除しますか？\n所属ツールは「一般ツール」グループに移動されます。`
      : `Delete group "${groupJa}"? Tools will be moved to General Tools.`;
    if (!window.confirm(confirmMsg)) return;

    setLocalTools((prev) =>
      prev.map((t) => {
        if (t.categoryId === selectedCatId && t.subgroup.ja === groupJa) {
          return {
            ...t,
            subgroup: { ja: '一般ツール', en: 'General Tools' },
          };
        }
        return t;
      })
    );
  };

  const handleCreateNewGroup = () => {
    if (!newGroupNameJa.trim()) return;
    const gJa = newGroupNameJa.trim();
    const gEn = newGroupNameEn.trim() || gJa;

    const newId = `tool-${Date.now()}`;
    const newTool: ToolItem = {
      id: newId,
      categoryId: selectedCatId,
      subgroup: { ja: gJa, en: gEn },
      name: { ja: `${gJa}配置`, en: `Place ${gEn}` },
      shortDesc: { ja: `${gJa}のBIMモデリングコマンドです。`, en: `BIM command for ${gEn}.` },
      fullDesc: { ja: `${gJa}の詳細な操作手順およびプロパティ設定ガイドです。`, en: `Operation guide and specifications for ${gEn}.` },
      iconType: 'wall',
      steps: [
        {
          id: `step-${Date.now()}`,
          stepNumber: 1,
          title: { ja: `${gJa}の起動`, en: `Activate ${gEn}` },
          instruction: { ja: 'リボンバーからコマンドを選択して実行します。', en: 'Select and execute command from ribbon.' },
        },
      ],
      media: [],
      tips: { ja: [], en: [] },
      warnings: { ja: [], en: [] },
      relatedToolIds: [],
    };

    setLocalTools((prev) => [newTool, ...prev]);
    setIsCreatingGroup(false);
    setNewGroupNameJa('');
    setNewGroupNameEn('');
  };

  // Dropdown Group Icon & Name Editing
  const handleStartEditDropdown = (gId: string) => {
    const groupTools = localTools.filter((t) => t.dropdownGroup === gId);
    const trigger = groupTools.find((t) => t.isDropdownTrigger) || groupTools[0];
    setEditingDropdownConfigId(gId);
    setTempDropdownNameJa(trigger?.dropdownGroupName?.ja || trigger?.name.ja || 'ドロップダウン');
    setTempDropdownNameEn(trigger?.dropdownGroupName?.en || trigger?.name.en || 'Dropdown');
    setTempDropdownIconType(trigger?.dropdownGroupIconType || trigger?.iconType || 'wall');
    setTempDropdownCustomUrl(trigger?.dropdownGroupCustomIconUrl || trigger?.customIconUrl || '');
  };

  const handleSaveDropdownConfig = (gId: string) => {
    setLocalTools((prev) =>
      prev.map((t) => {
        if (t.dropdownGroup === gId) {
          const isTrigger = t.isDropdownTrigger;
          return {
            ...t,
            dropdownGroupName: {
              ja: tempDropdownNameJa.trim() || t.dropdownGroupName?.ja || 'ドロップダウン',
              en: tempDropdownNameEn.trim() || t.dropdownGroupName?.en || 'Dropdown',
            },
            dropdownGroupIconType: tempDropdownIconType,
            dropdownGroupCustomIconUrl: tempDropdownCustomUrl.trim() || undefined,
            ...(isTrigger
              ? {
                  iconType: tempDropdownIconType,
                  customIconUrl: tempDropdownCustomUrl.trim() || undefined,
                }
              : {}),
          };
        }
        return t;
      })
    );
    setEditingDropdownConfigId(null);
  };

  // Supabase Integration Handlers
  const handleTestSupabase = async () => {
    setSupabaseTestStatus({ loading: true });
    const result = await testSupabaseConnection(supabaseConfig);
    setSupabaseTestStatus({
      loading: false,
      success: result.success,
      message: result.message,
      rowCount: result.rowCount,
    });
  };

  const handleCopySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_TABLE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Save All Changes
  const handleSaveAll = () => {
    // 1. Save categories
    onSaveCategories(localCategories);

    // 2. Save tools
    if (onSaveTools) {
      onSaveTools(localTools);
    }

    // 3. Save company and preview tool settings
    const updatedSettings: CompanySettings = {
      ...companySettings,
      nameJa: companyJa.trim() || '【 株式会社 ○○○○ 】',
      nameEn: companyEn.trim() || '[ Company Name Here ]',
      departmentJa: deptJa.trim(),
      departmentEn: deptEn.trim(),
      welcomeNoticeJa: welcomeJa.trim(),
      welcomeNoticeEn: welcomeEn.trim(),
      defaultPreviewBoxTitleJa: previewTitleJa.trim() || 'プレビューツール',
      defaultPreviewBoxTitleEn: previewTitleEn.trim() || 'Preview Tool',
    };
    onSaveCompanySettings(updatedSettings);

    onClose();
  };

  // Tools in currently selected category
  const categoryTools = localTools.filter((t) => t.categoryId === selectedCatId);

  // Groupings inside selected category (e.g. 柱ツール, 梁・大梁ツール, スラブツール, 壁ツール, etc.)
  const categoryGroups: { [key: string]: { ja: string; en: string; tools: ToolItem[] } } = {};
  categoryTools.forEach((tool) => {
    const key = tool.subgroup.ja;
    if (!categoryGroups[key]) {
      categoryGroups[key] = {
        ja: tool.subgroup.ja,
        en: tool.subgroup.en,
        tools: [],
      };
    }
    categoryGroups[key].tools.push(tool);
  });

  // Group into dropdown groups vs standalone tools
  const dropdownGroupIds = Array.from(
    new Set(categoryTools.map((t) => t.dropdownGroup).filter(Boolean))
  ) as string[];

  const standaloneTools = categoryTools.filter((t) => !t.dropdownGroup);

  // Tab definitions 1 to 7 for quick direct navigation
  const ADMIN_TABS = [
    {
      id: 'categories' as const,
      num: 1,
      labelJa: `1. メニューバー・カテゴリ (${localCategories.length})`,
      labelEn: `1. Menu Bar Tabs (${localCategories.length})`,
      shortJa: 'カテゴリ',
      shortEn: 'Tabs',
      icon: Layers,
    },
    {
      id: 'ribbon_groupings' as const,
      num: 2,
      labelJa: '2. グループ編成（柱・梁・スラブ等）',
      labelEn: '2. Tool Groupings (Column, Beam, Slab)',
      shortJa: 'グループ編成',
      shortEn: 'Groupings',
      icon: FolderPlus,
    },
    {
      id: 'ribbon_dropdowns' as const,
      num: 3,
      labelJa: '3. リボンボタン & ドロップダウン',
      labelEn: '3. Ribbon Buttons & Dropdowns',
      shortJa: 'ドロップダウン',
      shortEn: 'Dropdowns',
      icon: ChevronDown,
    },
    {
      id: 'preview_tool' as const,
      num: 4,
      labelJa: '4. プレビューツール設定',
      labelEn: '4. Preview Tool Defaults',
      shortJa: 'プレビュー',
      shortEn: 'Preview',
      icon: Film,
    },
    {
      id: 'company' as const,
      num: 5,
      labelJa: '5. 社名・通知設定',
      labelEn: '5. Company Branding',
      shortJa: '社名・通知',
      shortEn: 'Company',
      icon: Building2,
    },
    {
      id: 'backup' as const,
      num: 6,
      labelJa: '6. バックアップ & リセット',
      labelEn: '6. Backup & Reset',
      shortJa: 'バックアップ',
      shortEn: 'Backup',
      icon: RotateCcw,
    },
    {
      id: 'supabase' as const,
      num: 7,
      labelJa: '7. Supabase 連携 & SQLスキーマ',
      labelEn: '7. Supabase & SQL Schema',
      shortJa: 'Supabase & SQL',
      shortEn: 'Supabase',
      icon: Database,
      color: 'text-emerald-600',
    },
  ];

  const currentTabIndex = ADMIN_TABS.findIndex((t) => t.id === activeTab);
  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(ADMIN_TABS[currentTabIndex - 1].id);
    }
  };
  const handleNextTab = () => {
    if (currentTabIndex < ADMIN_TABS.length - 1) {
      setActiveTab(ADMIN_TABS[currentTabIndex + 1].id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {lang === 'ja' ? 'GLOOBE BIM 管理者パネル' : 'GLOOBE BIM Admin Panel'}
              </h2>
              <p className="text-xs text-orange-100">
                {lang === 'ja' 
                  ? 'リボンメニューバー（意匠・軸組、建具、構造等）の編集・ドロップダウンツールの追加と編成' 
                  : 'Customize menu bar categories, ribbon dropdown tools, and preview boxes'}
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

        {/* Quick Direct Jump Bar 1 to 7 */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mr-1 shrink-0">
              {lang === 'ja' ? 'タブ直接アクセス:' : 'Jump to:'}
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {ADMIN_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs scale-102 ring-2 ring-orange-400/40'
                        : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
                    }`}
                    title={lang === 'ja' ? tab.labelJa : tab.labelEn}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-orange-700' : 'bg-stone-200 text-stone-800'
                    }`}>
                      {tab.num}
                    </span>
                    <span className="text-[11px]">
                      {lang === 'ja' ? tab.shortJa : tab.shortEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prev / Next controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrevTab}
              disabled={currentTabIndex <= 0}
              className="px-2 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-30 text-stone-700 text-[11px] font-bold flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed transition"
              title={lang === 'ja' ? '前のタブへ' : 'Previous Tab'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ja' ? '前へ' : 'Prev'}</span>
            </button>
            <span className="text-[11px] font-mono font-bold text-stone-600 px-1">
              {currentTabIndex + 1} / {ADMIN_TABS.length}
            </span>
            <button
              type="button"
              onClick={handleNextTab}
              disabled={currentTabIndex >= ADMIN_TABS.length - 1}
              className="px-2 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-30 text-stone-700 text-[11px] font-bold flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed transition"
              title={lang === 'ja' ? '次のタブへ' : 'Next Tab'}
            >
              <span className="hidden sm:inline">{lang === 'ja' ? '次へ' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation with visible scroll bar */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2.5 pb-1 shrink-0 gap-1.5 text-xs font-semibold overflow-x-auto scrollbar-visible">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer rounded-t-lg ${
                  isActive
                    ? 'border-orange-600 text-orange-600 font-bold bg-white shadow-2xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {tab.num}
                </span>
                <Icon className={`w-3.5 h-3.5 ${tab.color && !isActive ? tab.color : ''}`} />
                <span>{lang === 'ja' ? tab.labelJa : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-stone-700">
          
          {/* TAB 1: MENU BAR CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              
              {/* Presets and Guidance */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-orange-950 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>{lang === 'ja' ? 'リボンメニューバー（カテゴリ）の一括設定・プリセット' : 'Menu Bar Category Presets'}</span>
                  </div>
                  <p className="text-xs text-orange-900 leading-relaxed">
                    {lang === 'ja'
                      ? '「意匠・躯体」「軸組・フレーム」「建具・窓・ドア」「構造・配筋」など、GLOOBEの実務構成に合わせたタブ名・順序を自由に変更できます。'
                      : 'Customize tabs like Architecture & Framing, Doors & Windows, Structure & Rebar.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={applyStandardPresets}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs shrink-0 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? '標準カテゴリ構成を一括適用' : 'Apply Standard Presets'}</span>
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800 pb-1 border-b border-stone-200">
                  <span>{lang === 'ja' ? '登録済みメニューバー項目' : 'Active Ribbon Tabs'}</span>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? '+ カテゴリを追加' : '+ Add Tab'}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {localCategories.map((cat, idx) => {
                    const toolCount = localTools.filter((t) => t.categoryId === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-orange-300 transition space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-mono text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-stone-900 text-xs">
                              {lang === 'ja' ? cat.name.ja : (cat.name.en || cat.name.ja)}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              ({lang === 'ja' ? cat.name.en : cat.name.ja})
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold">
                              {toolCount} {lang === 'ja' ? 'ツール' : 'tools'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveCategoryUp(idx)}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                              title={lang === 'ja' ? "上へ移動" : "Move Up"}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCategoryDown(idx)}
                              disabled={idx === localCategories.length - 1}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                              title={lang === 'ja' ? "下へ移動" : "Move Down"}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCategory(idx)}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-600 transition cursor-pointer"
                              title={lang === 'ja' ? "削除" : "Delete"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                          <div>
                            <label className="text-[10px] font-bold text-stone-600 mb-1 block">
                              {lang === 'ja' ? '日本語名（リボン表示）' : 'Japanese Name'}
                            </label>
                            <input
                              type="text"
                              value={cat.name.ja}
                              onChange={(e) => updateCategory(idx, 'nameJa', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:border-orange-500 outline-none bg-stone-50/50"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-stone-600 mb-1 block">
                              {lang === 'ja' ? '英語名' : 'English Name'}
                            </label>
                            <input
                              type="text"
                              value={cat.name.en}
                              onChange={(e) => updateCategory(idx, 'nameEn', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:border-orange-500 outline-none bg-stone-50/50"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIBBON GROUPINGS (USER REQUESTED: edit grouping like column tools, beam tools, slab tools, etc.) */}
          {activeTab === 'ribbon_groupings' && (
            <div className="space-y-6">
              {/* Guidance Banner */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-orange-950 flex items-center gap-1.5 text-sm">
                    <FolderPlus className="w-4 h-4 text-orange-600" />
                    <span>{lang === 'ja' ? 'リボングループ編成（柱ツール・梁ツール・スラブツール等）' : 'Ribbon Groupings (Column, Beam, Slab, etc.)'}</span>
                  </div>
                </div>
                <p className="text-xs text-orange-900 leading-relaxed">
                  {lang === 'ja'
                    ? 'リボンバー下部に表示されるグループ枠（柱ツール、梁・大梁ツール、スラブツール、壁ツール等）の名称変更や、ツールの所属グループ移動、新規グループの追加を行えます。変更はリボンバーおよびツール詳細に即時反映されます。'
                    : 'Edit ribbon groupings such as Column Tools, Beam Tools, Slab Tools, and Wall Tools. Rename groupings in Japanese and English, move tools between groups, or create custom groups.'}
                </p>
              </div>

              {/* Category Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-stone-500 shrink-0">
                  {lang === 'ja' ? 'カテゴリ選択:' : 'Category:'}
                </span>
                {localCategories.map((c) => {
                  const isSel = selectedCatId === c.id;
                  const cCount = localTools.filter((t) => t.categoryId === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCatId(c.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition whitespace-nowrap flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>{lang === 'ja' ? c.name.ja : c.name.en}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? 'bg-orange-700 text-white' : 'bg-stone-200 text-stone-600'}`}>
                        {cCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Bar & Quick Group Creation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
                <div className="text-xs font-bold text-stone-800">
                  <span>{localCategories.find((c) => c.id === selectedCatId)?.name.ja} 内のリボングループ一覧 ({Object.keys(categoryGroups).length} グループ):</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingGroup(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition text-xs shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? '+ 新規グループを作成' : '+ Create New Group'}</span>
                  </button>
                </div>
              </div>

              {/* Creation Modal / Inline Box */}
              {isCreatingGroup && (
                <div className="p-4 rounded-xl border-2 border-orange-300 bg-orange-50/40 space-y-3">
                  <div className="font-bold text-xs text-orange-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>{lang === 'ja' ? '新規リボングループの追加' : 'Add New Ribbon Group'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-stone-600 block mb-1">
                        {lang === 'ja' ? 'グループ名（日本語 / 例: 柱ツール、スラブツール）' : 'Group Name (Japanese)'} *
                      </label>
                      <input
                        type="text"
                        value={newGroupNameJa}
                        onChange={(e) => setNewGroupNameJa(e.target.value)}
                        placeholder="例: スラブツール / 柱ツール"
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 focus:border-orange-500 outline-none bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-600 block mb-1">
                        {lang === 'ja' ? 'グループ名（英語 / 例: Slab Tools, Column Tools）' : 'Group Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={newGroupNameEn}
                        onChange={(e) => setNewGroupNameEn(e.target.value)}
                        placeholder="e.g. Slab Tools / Column Tools"
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 focus:border-orange-500 outline-none bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Preset Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-500 font-semibold">{lang === 'ja' ? 'プリセット:' : 'Presets:'}</span>
                    {[
                      { ja: '柱ツール', en: 'Column Tools' },
                      { ja: '梁・大梁ツール', en: 'Beam Tools' },
                      { ja: 'スラブツール', en: 'Slab Tools' },
                      { ja: '壁ツール', en: 'Wall Tools' },
                      { ja: '仕上ツール', en: 'Finish Tools' },
                      { ja: '階段ツール', en: 'Stair Tools' },
                      { ja: '屋根ツール', en: 'Roof Tools' },
                      { ja: '基礎ツール', en: 'Foundation Tools' },
                    ].map((p) => (
                      <button
                        key={p.ja}
                        type="button"
                        onClick={() => {
                          setNewGroupNameJa(p.ja);
                          setNewGroupNameEn(p.en);
                        }}
                        className="px-2 py-0.5 rounded bg-white hover:bg-orange-100 border border-stone-200 text-[10px] text-stone-700 hover:text-orange-900 transition font-medium"
                      >
                        {lang === 'ja' ? p.ja : p.en}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingGroup(false);
                        setNewGroupNameJa('');
                        setNewGroupNameEn('');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs transition font-semibold"
                    >
                      {lang === 'ja' ? 'キャンセル' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewGroup}
                      className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'ja' ? 'グループを作成' : 'Create Group'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* List of Groupings in Selected Category */}
              <div className="space-y-4">
                {Object.keys(categoryGroups).length > 0 ? (
                  Object.entries(categoryGroups).map(([groupKey, groupObj]) => {
                    const gTools = groupObj.tools;
                    const isEditingThis = editingGroupJa === groupKey;

                    return (
                      <div
                        key={groupKey}
                        className="rounded-2xl border-2 border-stone-200 bg-stone-50/40 p-4 space-y-3 shadow-xs hover:border-orange-300 transition"
                      >
                        {/* Group Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-200">
                          {isEditingThis ? (
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={tempGroupNameJa}
                                onChange={(e) => setTempGroupNameJa(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-orange-400 bg-white font-bold text-xs outline-none"
                                placeholder="日本語グループ名"
                              />
                              <input
                                type="text"
                                value={tempGroupNameEn}
                                onChange={(e) => setTempGroupNameEn(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs outline-none"
                                placeholder="English Group Name"
                              />
                              <button
                                type="button"
                                onClick={() => handleRenameGroup(groupKey, tempGroupNameJa, tempGroupNameEn)}
                                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition"
                              >
                                {lang === 'ja' ? '名前更新' : 'Apply'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingGroupJa(null)}
                                className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs hover:bg-stone-100 transition"
                              >
                                {lang === 'ja' ? '戻す' : 'Cancel'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shadow-2xs border border-orange-200">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-stone-900 text-sm">
                                    {lang === 'ja' ? groupObj.ja : (groupObj.en || groupObj.ja)}
                                  </span>
                                  <span className="text-xs text-stone-400">
                                    ({lang === 'ja' ? groupObj.en : groupObj.ja})
                                  </span>
                                  <span className="px-2 py-0.2 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                                    {gTools.length} {lang === 'ja' ? 'ツール' : 'tools'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-stone-500">
                                  {lang === 'ja' ? 'リボンバー下部に表示されるグループラベル' : 'Ribbon bar bottom group label'}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            {!isEditingThis && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingGroupJa(groupKey);
                                  setTempGroupNameJa(groupObj.ja);
                                  setTempGroupNameEn(groupObj.en);
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-orange-500 hover:bg-orange-50 text-stone-600 hover:text-orange-700 font-semibold text-xs transition flex items-center gap-1 shadow-2xs"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{lang === 'ja' ? '名前を変更' : 'Rename'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteGroup(groupKey)}
                              className="p-1.5 rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-400 hover:text-red-600 transition"
                              title={lang === 'ja' ? 'グループを削除' : 'Delete Group'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Tools in this Group */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {gTools.map((t) => (
                            <div
                              key={t.id}
                              className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-2 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200">
                                  <CadIcon type={t.iconType} customIconUrl={t.customIconUrl} size={16} />
                                </div>
                                <div className="truncate">
                                  <div className="font-bold text-stone-900 truncate text-xs">
                                    {lang === 'ja' ? t.name.ja : (t.name.en || t.name.ja)}
                                  </div>
                                  {t.dropdownGroup && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-sky-100 text-sky-800 font-semibold">
                                      {lang === 'ja' ? 'ドロップダウン所属' : 'In Dropdown'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Move tool to another group selector */}
                              <select
                                value={t.subgroup.ja}
                                onChange={(e) => {
                                  const targetGroupKey = e.target.value;
                                  const targetObj = categoryGroups[targetGroupKey];
                                  if (targetObj) {
                                    handleMoveToolToGroup(t.id, targetObj.ja, targetObj.en);
                                  }
                                }}
                                className="text-[10px] px-2 py-1 rounded-lg bg-stone-50 border border-stone-300 text-stone-700 font-medium outline-none cursor-pointer hover:bg-stone-100"
                                title={lang === 'ja' ? "別のグループへ移動" : "Move to another group"}
                              >
                                {Object.entries(categoryGroups).map(([gk, gVal]) => (
                                  <option key={gk} value={gk}>
                                    → {lang === 'ja' ? gVal.ja : (gVal.en || gVal.ja)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-stone-300 text-center text-stone-400 text-xs">
                    {lang === 'ja'
                      ? 'このカテゴリにはまだグループがありません。「+ 新規グループを作成」から作成できます。'
                      : 'No groups in this category yet. Click "+ Create New Group" above.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RIBBON BUTTONS & DROPDOWNS */}
          {activeTab === 'ribbon_dropdowns' && (
            <div className="space-y-6">
              
              {/* Guidance Banner */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sky-950 flex items-center gap-1.5 text-sm">
                    <ChevronDown className="w-4 h-4 text-sky-600" />
                    <span>{lang === 'ja' ? 'リボンバーのドロップダウンボックス & 単独ボタンの編成' : 'Dropdown Boxes & Standalone Buttons'}</span>
                  </div>
                </div>
                <p className="text-xs text-sky-900 leading-relaxed">
                  {lang === 'ja'
                    ? '壁ツールなどで、「壁配置」を通常の単独ボタンとして置き、その横に「壁詳細 ▼」などのドロップダウンボタンを設けることができます。ドロップダウン内のツールはそれぞれアイコンやロゴ、ショートカットを持ち、通常ツールと同様に個別の専用マニュアルページが開きます。'
                    : 'Configure standalone normal buttons or dropdown buttons. Each tool inside a dropdown has its own logo and dedicated manual page.'}
                </p>
              </div>

              {/* Category Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-stone-500 shrink-0">
                  {lang === 'ja' ? 'カテゴリ選択:' : 'Category:'}
                </span>
                {localCategories.map((c) => {
                  const isSel = selectedCatId === c.id;
                  const cCount = localTools.filter((t) => t.categoryId === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCatId(c.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition whitespace-nowrap flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>{lang === 'ja' ? c.name.ja : c.name.en}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? 'bg-orange-700 text-white' : 'bg-stone-200 text-stone-600'}`}>
                        {cCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Bar for currently selected Category */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
                <div className="text-xs font-bold text-stone-800">
                  <span>
                    {lang === 'ja'
                      ? `${localCategories.find((c) => c.id === selectedCatId)?.name.ja} 内のツール構成:`
                      : `${localCategories.find((c) => c.id === selectedCatId)?.name.en || localCategories.find((c) => c.id === selectedCatId)?.name.ja} Tool Layout:`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingDropdown(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 font-bold transition text-xs shadow-2xs"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? '+ ドロップダウンボックス作成' : '+ Create Dropdown Box'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onAddNewTool) {
                        onClose();
                        onAddNewTool();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition text-xs shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? '+ 通常ボタンを追加' : '+ Add Standalone Tool'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Dropdown Boxes in this Category */}
              <div className="space-y-4">
                <div className="text-xs font-extrabold text-sky-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>{lang === 'ja' ? 'ドロップダウンボタン（プルダウン展開グループ）' : 'Dropdown Button Groups'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                    {lang === 'ja' ? `${dropdownGroupIds.length} 個のドロップダウン` : `${dropdownGroupIds.length} Dropdown Groups`}
                  </span>
                </div>

                {dropdownGroupIds.length > 0 ? (
                  dropdownGroupIds.map((gId) => {
                    const groupTools = categoryTools.filter((t) => t.dropdownGroup === gId);
                    const trigger = groupTools.find((t) => t.isDropdownTrigger) || groupTools[0];
                    const gNameJa = trigger?.dropdownGroupName?.ja || gId;
                    const gNameEn = trigger?.dropdownGroupName?.en || trigger?.dropdownGroupName?.ja || gId;
                    const gName = lang === 'ja' ? gNameJa : gNameEn;

                    return (
                      <div
                        key={gId}
                        className="rounded-2xl border-2 border-sky-300 bg-sky-50/30 p-4 space-y-3 shadow-xs"
                      >
                        {/* Group Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-sky-200">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-white border-2 border-sky-400 flex items-center justify-center text-sky-800 shadow-2xs font-bold shrink-0">
                              <CadIcon 
                                type={trigger.dropdownGroupIconType || trigger.iconType} 
                                customIconUrl={trigger.dropdownGroupCustomIconUrl || trigger.customIconUrl} 
                                size={20} 
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sky-950 text-sm">{gName}</span>
                                <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 text-[10px] font-bold">
                                  {lang === 'ja' ? `${groupTools.length} ツール登録` : `${groupTools.length} tools registered`}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-500">
                                {lang === 'ja' ? `サブグループ: ${trigger.subgroup.ja}` : `Subgroup: ${trigger.subgroup.en || trigger.subgroup.ja}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* USER REQUESTED: Edit icon and label for dropdown button group */}
                            <button
                              type="button"
                              onClick={() => {
                                if (editingDropdownConfigId === gId) {
                                  setEditingDropdownConfigId(null);
                                } else {
                                  handleStartEditDropdown(gId);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer ${
                                editingDropdownConfigId === gId
                                  ? 'bg-sky-700 text-white border-sky-700 font-bold'
                                  : 'bg-white border-sky-300 text-sky-800 hover:bg-sky-50'
                              }`}
                              title={lang === 'ja' ? 'ドロップダウンボタンのアイコンや表示名を変更' : 'Edit dropdown icon & label'}
                            >
                              <Palette className="w-3.5 h-3.5" />
                              <span>{lang === 'ja' ? 'アイコン & 名称編集' : 'Edit Icon & Name'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setQuickAddDropdownId(gId);
                                setQuickAddNameJa('');
                                setQuickAddNameEn('');
                                setQuickAddShortcut('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{lang === 'ja' ? 'ツール追加' : 'Add Tool'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Dropdown Group Icon & Name Editor Panel */}
                        {editingDropdownConfigId === gId && (
                          <div className="p-4 rounded-xl border-2 border-sky-400 bg-white shadow-md space-y-4 animate-in fade-in duration-100">
                            <div className="font-bold text-xs text-sky-950 flex items-center justify-between pb-2 border-b border-stone-100">
                              <div className="flex items-center gap-1.5">
                                <Palette className="w-4 h-4 text-sky-600" />
                                <span>{lang === 'ja' ? `ドロップダウン「${gName}」のアイコン・名称変更` : `Edit Icon & Label for "${gName}"`}</span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-normal">
                                {lang === 'ja' ? 'リボンバーに表示されるアイコンとラベルです' : 'Ribbon button icon and dropdown label'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-stone-600 block mb-1">
                                  {lang === 'ja' ? 'ドロップダウン表示名（日本語）' : 'Label (Japanese)'} *
                                </label>
                                <input
                                  type="text"
                                  value={tempDropdownNameJa}
                                  onChange={(e) => setTempDropdownNameJa(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:border-sky-500 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-stone-600 block mb-1">
                                  {lang === 'ja' ? 'ドロップダウン表示名（英語）' : 'Label (English)'}
                                </label>
                                <input
                                  type="text"
                                  value={tempDropdownNameEn}
                                  onChange={(e) => setTempDropdownNameEn(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:border-sky-500 outline-none"
                                />
                              </div>
                            </div>

                            {/* Icon Selection with Visual CAD Tiles */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-600 block">
                                {lang === 'ja' ? 'ドロップダウンのCADアイコンを選択:' : 'Select CAD Icon for Dropdown Button:'}
                              </label>

                              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
                                {[
                                  { type: 'wall', labelJa: '壁', labelEn: 'Wall' },
                                  { type: 'column', labelJa: '柱', labelEn: 'Column' },
                                  { type: 'beam', labelJa: '梁', labelEn: 'Beam' },
                                  { type: 'slab', labelJa: 'スラブ', labelEn: 'Slab' },
                                  { type: 'door', labelJa: 'ドア', labelEn: 'Door' },
                                  { type: 'window', labelJa: '窓', labelEn: 'Window' },
                                  { type: 'roof', labelJa: '屋根', labelEn: 'Roof' },
                                  { type: 'stair', labelJa: '階段', labelEn: 'Stair' },
                                  { type: 'finish', labelJa: '仕上', labelEn: 'Finish' },
                                  { type: 'parapet', labelJa: 'パラペット', labelEn: 'Parapet' },
                                  { type: 'molding', labelJa: '見切', labelEn: 'Molding' },
                                  { type: 'opening', labelJa: '開口', labelEn: 'Opening' },
                                  { type: 'ago', labelJa: '防水アゴ', labelEn: 'Water Drip' },
                                  { type: 'brace', labelJa: 'ブレース', labelEn: 'Brace' },
                                  { type: 'site', labelJa: '敷地', labelEn: 'Site' },
                                  { type: 'drawing', labelJa: '図面', labelEn: 'Drawing' },
                                  { type: 'camera', labelJa: '3D', labelEn: '3D View' },
                                  { type: 'shield', labelJa: '申請', labelEn: 'Permit' },
                                ].map((iconOpt) => {
                                  const isSel = tempDropdownIconType === iconOpt.type && !tempDropdownCustomUrl;
                                  return (
                                    <button
                                      key={iconOpt.type}
                                      type="button"
                                      onClick={() => {
                                        setTempDropdownIconType(iconOpt.type);
                                        setTempDropdownCustomUrl('');
                                      }}
                                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                                        isSel
                                          ? 'bg-sky-100 border-sky-600 ring-2 ring-sky-300 text-sky-950 font-bold'
                                          : 'bg-stone-50 border-stone-200 hover:bg-sky-50 hover:border-sky-300 text-stone-700'
                                      }`}
                                    >
                                      <CadIcon type={iconOpt.type} size={20} />
                                      <span className="text-[9px] truncate max-w-full">
                                        {lang === 'ja' ? iconOpt.labelJa : iconOpt.labelEn}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="pt-2">
                                <label className="text-[10px] font-bold text-stone-600 block mb-1">
                                  {lang === 'ja' ? 'またはカスタム画像 / Supabase アイコンURL:' : 'Or Custom Icon URL / Supabase Asset URL:'}
                                </label>
                                <input
                                  type="text"
                                  value={tempDropdownCustomUrl}
                                  onChange={(e) => setTempDropdownCustomUrl(e.target.value)}
                                  placeholder="https://.../icon.png または Supabase Storage の画像URL"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:border-sky-500 outline-none"
                                />
                              </div>
                            </div>

                            {/* Preview & Actions */}
                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-stone-400 font-semibold">{lang === 'ja' ? 'プレビュー:' : 'Preview:'}</span>
                                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-300 flex items-center justify-center text-sky-900 shadow-2xs">
                                  <CadIcon type={tempDropdownIconType} customIconUrl={tempDropdownCustomUrl || undefined} size={18} />
                                </div>
                                <span className="text-xs font-bold text-stone-900">{tempDropdownNameJa || gName}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingDropdownConfigId(null)}
                                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs transition"
                                >
                                  {lang === 'ja' ? 'キャンセル' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveDropdownConfig(gId)}
                                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition"
                                >
                                  {lang === 'ja' ? 'アイコンと名称を保存' : 'Save Changes'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* List of Tools inside this Dropdown */}
                        <div className="space-y-2">
                          {groupTools.map((gt, idx) => (
                            <div
                              key={gt.id}
                              className="p-3 rounded-xl bg-white border border-stone-200 hover:border-sky-400 flex items-center justify-between gap-3 transition shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-stone-400 w-4">
                                  #{idx + 1}
                                </span>

                                {/* Tool Logo / Icon Frame */}
                                <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                                  <CadIcon type={gt.iconType} customIconUrl={gt.customIconUrl} size={18} />
                                </div>

                                <div className="truncate">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-900 truncate">
                                      {lang === 'ja' ? gt.name.ja : (gt.name.en || gt.name.ja)}
                                    </span>
                                    {gt.isDropdownTrigger && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                        {lang === 'ja' ? '表紙アイコン' : 'Cover Icon'}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-stone-400 truncate block">
                                    {lang === 'ja' ? gt.shortDesc.ja : (gt.shortDesc.en || gt.shortDesc.ja)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {gt.shortcut && (
                                  <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-semibold">
                                    [{gt.shortcut}]
                                  </span>
                                )}

                                {!gt.isDropdownTrigger && (
                                  <button
                                    type="button"
                                    onClick={() => setAsDropdownTrigger(gt.id, gId)}
                                    className="px-2 py-1 rounded bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 text-[10px] font-medium transition cursor-pointer"
                                  >
                                    {lang === 'ja' ? '表紙にする' : 'Set as Cover'}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => moveToolToStandalone(gt.id)}
                                  className="px-2.5 py-1 rounded bg-stone-100 hover:bg-orange-50 text-stone-600 hover:text-orange-700 text-[10px] font-semibold border border-stone-200 transition cursor-pointer"
                                  title={lang === 'ja' ? 'ドロップダウンから外し、独立した通常ボタンにする' : 'Detach from dropdown and make standalone button'}
                                >
                                  {lang === 'ja' ? '単独ボタン化' : 'Make Standalone'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center text-stone-400 text-xs">
                    {lang === 'ja'
                      ? 'このカテゴリにはまだドロップダウンボックスがありません。「+ ドロップダウンボックス作成」ボタンから新規作成できます。'
                      : 'No dropdown groups in this category yet. Click "+ Create Dropdown Box" above.'}
                  </div>
                )}
              </div>

              {/* 2. Standalone Normal Buttons in this Category */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span>{lang === 'ja' ? '通常の単独ボタン（リボンに直接表示）' : 'Standalone Normal Buttons'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold">
                      {lang === 'ja' ? `${standaloneTools.length} 個` : `${standaloneTools.length} tools`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {standaloneTools.map((st) => (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-orange-300 flex items-center justify-between gap-3 shadow-2xs transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                          <CadIcon type={st.iconType} customIconUrl={st.customIconUrl} size={18} />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-stone-900 block truncate text-xs">
                            {lang === 'ja' ? st.name.ja : (st.name.en || st.name.ja)}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {lang === 'ja' ? st.subgroup.ja : (st.subgroup.en || st.subgroup.ja)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {st.shortcut && (
                          <span className="font-mono text-[10px] text-stone-400 font-semibold">
                            [{st.shortcut}]
                          </span>
                        )}

                        {/* Move into existing or new dropdown */}
                        {dropdownGroupIds.length > 0 ? (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const targetGId = e.target.value;
                                const targetSibling = categoryTools.find((t) => t.dropdownGroup === targetGId);
                                const name = targetSibling?.dropdownGroupName?.ja || '詳細 ▼';
                                moveToolToDropdown(st.id, targetGId, name);
                              }
                            }}
                            defaultValue=""
                            className="text-[10px] px-2 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 font-semibold outline-none cursor-pointer hover:bg-sky-100"
                          >
                            <option value="" disabled>
                              {lang === 'ja' ? '▼ ドロップダウンへ格納' : '▼ Move into Dropdown'}
                            </option>
                            {dropdownGroupIds.map((gId) => {
                              const s = categoryTools.find((t) => t.dropdownGroup === gId);
                              const groupLabel = lang === 'ja'
                                ? (s?.dropdownGroupName?.ja || gId)
                                : (s?.dropdownGroupName?.en || s?.dropdownGroupName?.ja || gId);
                              return (
                                <option key={gId} value={gId}>
                                  {groupLabel}
                                </option>
                              );
                            })}
                          </select>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREVIEW TOOL DEFAULTS */}
          {activeTab === 'preview_tool' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/60 space-y-2">
                <div className="font-bold text-orange-950 flex items-center gap-1.5 text-sm">
                  <Film className="w-4 h-4 text-orange-600" />
                  <span>{lang === 'ja' ? 'プレビューツール（リアルタイムGIF・手順デモ）の共通設定' : 'Preview Tool Global Defaults'}</span>
                </div>
                <p className="text-xs text-orange-900 leading-relaxed">
                  {lang === 'ja'
                    ? '各ツールのマニュアルに表示される「プレビューツール」の枠タイトルや標準名称を設定できます。ツール編集画面から複数ボックスの追加やロゴ・GIFの個別差し替えも可能です。'
                    : 'Customize the default titles and behavior for the real-time preview tool boxes.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? 'プレビューツール標準タイトル（日本語）' : 'Default Box Title (Japanese)'}
                  </label>
                  <input
                    type="text"
                    value={previewTitleJa}
                    onChange={(e) => setPreviewTitleJa(e.target.value)}
                    placeholder="プレビューツール"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? 'プレビューツール標準タイトル（英語）' : 'Default Box Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={previewTitleEn}
                    onChange={(e) => setPreviewTitleEn(e.target.value)}
                    placeholder="Preview Tool"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPANY BRANDING */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? '会社名・組織名（日本語）' : 'Company Name (JA)'}
                  </label>
                  <input
                    type="text"
                    value={companyJa}
                    onChange={(e) => setCompanyJa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? '会社名・組織名（英語）' : 'Company Name (EN)'}
                  </label>
                  <input
                    type="text"
                    value={companyEn}
                    onChange={(e) => setCompanyEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? '所属部署（日本語）' : 'Department (JA)'}
                  </label>
                  <input
                    type="text"
                    value={deptJa}
                    onChange={(e) => setDeptJa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? '所属部署（英語）' : 'Department (EN)'}
                  </label>
                  <input
                    type="text"
                    value={deptEn}
                    onChange={(e) => setDeptEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? '案内メッセージ（社内運用方針など）' : 'Welcome Notice'}
                  </label>
                  <textarea
                    rows={3}
                    value={welcomeJa}
                    onChange={(e) => setWelcomeJa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="font-bold text-stone-900 text-sm">
                  {lang === 'ja' ? 'JSON形式でのデータ書き出し / 読み込み' : 'Data Export & Import'}
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {lang === 'ja'
                    ? '編集したカテゴリ、ツール、ドロップダウン設定、プレビューツール構成を丸ごとファイルに保存したり、別のPCに移行できます。'
                    : 'Export all manual categories, tools, and dropdown layouts to a JSON file.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onExportJson}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? 'マニュアルをJSON書き出し' : 'Export JSON Backup'}</span>
                  </button>

                  <label className="cursor-pointer px-4 py-2 rounded-xl border border-stone-300 hover:border-orange-500 bg-white text-stone-700 hover:text-orange-600 font-bold text-xs flex items-center gap-2 shadow-2xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'ja' ? 'JSONから復元' : 'Import JSON'}</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImportJson(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-3">
                <div className="font-bold text-red-950 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-600" />
                  <span>{lang === 'ja' ? '初期標準テンプレートに戻す' : 'Reset to Default Template'}</span>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  {lang === 'ja'
                    ? '現在のすべての変更を破棄し、初期の標準建築BIMマニュアルデータに戻します。'
                    : 'Reset all customized data back to the default architectural template.'}
                </p>
                <button
                  type="button"
                  onClick={onResetDefault}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition"
                >
                  {lang === 'ja' ? '標準テンプレートにリセット' : 'Reset Default'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: SUPABASE INTEGRATION & SQL SCHEMA */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              
              {/* Guidance & Status Banner */}
              <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-950">
                        {lang === 'ja' ? 'Supabase クラウド連携 & メディア管理' : 'Supabase Cloud Media Integration'}
                      </h3>
                      <p className="text-xs text-emerald-800">
                        {lang === 'ja'
                          ? '各リボンタブやツール専用ページに表示するGIF、WebM動画、仕様図面をSupabaseから取得します。'
                          : 'Fetch animated GIFs, WebM procedure videos, and CAD diagrams directly from Supabase.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySqlSchema}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                      <span>{copiedSql ? (lang === 'ja' ? 'SQLをコピーしました！' : 'Copied SQL!') : (lang === 'ja' ? 'SQLスキーマをコピー' : 'Copy SQL Schema')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Security & .env Credentials Status Card (NO inputs, completely safe) */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ja' ? 'Supabase 接続設定 (環境変数 .env 保護)' : 'Supabase Environment Configuration'}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    {lang === 'ja' ? '.env ファイルで安全に保護' : 'Secured via .env'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                    <div className="text-xs text-stone-600 leading-relaxed">
                      <p className="font-bold text-stone-800 mb-0.5">
                        {lang === 'ja' ? '🔒 認証情報のセキュリティ保護' : '🔒 Secure Credential Management'}
                      </p>
                      <p>
                        {lang === 'ja'
                          ? 'セキュリティのため、SupabaseのプロジェクトURLおよびAPIキーは画面UI上には表示・入力させません。プロジェクト直下の .env ファイル（環境変数 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）から安全に読み込みます。'
                          : 'For security, Supabase credentials are not displayed or input on the UI. They are read securely from your project .env file.'}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="pt-2 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-stone-200 space-y-1">
                      <div className="text-[10px] font-bold text-stone-400 uppercase">
                        {lang === 'ja' ? '接続状態 (.env 検出状況)' : 'Connection Status'}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        {supabaseConfig.url && supabaseConfig.anonKey ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-emerald-700">
                              {lang === 'ja' ? '環境変数 (.env) から読み込み完了' : 'Configured via .env'}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-amber-700">
                              {lang === 'ja' ? '.env に環境変数の記述が必要です' : 'Pending .env configuration'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-stone-200 space-y-1">
                      <div className="text-[10px] font-bold text-stone-400 uppercase">
                        {lang === 'ja' ? '対象テーブル名 (Table)' : 'Table Name'}
                      </div>
                      <div className="font-mono font-bold text-stone-800">
                        {supabaseConfig.tableName || 'gloobe_media'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions on adding to .env when not set */}
                {(!supabaseConfig.url || !supabaseConfig.anonKey) && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
                    <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>{lang === 'ja' ? '.env ファイルの設定手順' : 'How to configure your .env file'}</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      {lang === 'ja'
                        ? 'プロジェクト直下の .env ファイルに以下の2行を記入してください（Supabaseダッシュボードの Project Settings → API から取得できます）：'
                        : 'Add the following lines to your project .env file (from Supabase Project Settings → API):'}
                    </p>
                    <pre className="p-3 rounded-lg bg-stone-900 text-amber-300 font-mono text-[11px] overflow-x-auto select-all scrollbar-visible">
{`VITE_SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`}
                    </pre>
                  </div>
                )}

                {/* Connection Test Actions & Result */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={supabaseTestStatus.loading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${supabaseTestStatus.loading ? 'animate-spin' : ''}`} />
                    <span>{supabaseTestStatus.loading ? (lang === 'ja' ? '接続確認中...' : 'Testing...') : (lang === 'ja' ? '接続テストを実行' : 'Test Connection')}</span>
                  </button>

                  {supabaseTestStatus.message && (
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      supabaseTestStatus.success
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-red-50 text-red-900 border border-red-300'
                    }`}>
                      {supabaseTestStatus.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{supabaseTestStatus.message}</span>
                      {typeof supabaseTestStatus.rowCount === 'number' && (
                        <span className="font-bold">({supabaseTestStatus.rowCount} 件のデータ)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Necessary Table Structure Reference */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-100">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-orange-600" />
                      <span>{lang === 'ja' ? '必要なSupabaseテーブル構造 (gloobe_preview_tools & gloobe_media)' : 'Required Supabase Table Structure'}</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {lang === 'ja' 
                        ? '1ツールに多数のプレビューツール、プレビューごとに2〜3件以上のGIF/WebM動画を格納可能なスキーマです。'
                        : 'Schema ready for multiple preview tools per tool and 2-3+ GIFs/WebMs per preview tool.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySqlSchema}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:border-emerald-500 bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSql ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? (lang === 'ja' ? 'コピー完了' : 'Copied!') : (lang === 'ja' ? 'SQL文をコピー' : 'Copy SQL')}</span>
                  </button>
                </div>

                {/* 1. gloobe_preview_tools table structure */}
                <div className="space-y-1.5">
                  <div className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-orange-600" />
                    <span>{lang === 'ja' ? 'テーブル 1: gloobe_preview_tools (プレビューツール複数件 & 2〜3件のGIF/動画対応)' : 'Table 1: gloobe_preview_tools (Multiple Previews & 2-3+ GIFs/WebMs)'}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                          <th className="p-2.5">カラム名 (Column)</th>
                          <th className="p-2.5">型 (Type)</th>
                          <th className="p-2.5">説明 & 例 (Description)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-[11px]">
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">id</td>
                          <td className="p-2.5 font-mono text-stone-500">UUID (PK)</td>
                          <td className="p-2.5 text-stone-600">主キー (gen_random_uuid())</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">tool_id</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT (NOT NULL)</td>
                          <td className="p-2.5 text-stone-600">対象ツールID (例: 'tool-wall', 'tool-column', 'tool-slab')</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">box_id</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT (NOT NULL)</td>
                          <td className="p-2.5 text-stone-600">プレビューボックスID (例: 'box-wall-1', 'box-wall-specs')</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">box_title</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT (NOT NULL)</td>
                          <td className="p-2.5 text-stone-600">プレビューツール名 (例: 'プレビューツール 1 (壁配置GIF集)')</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">media_items</td>
                          <td className="p-2.5 font-mono text-stone-500">JSONB (NOT NULL)</td>
                          <td className="p-2.5 text-stone-600">2〜3件以上のGIF/WebM動画オブジェクト配列 (url, type, title, caption)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">gif_urls</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT[]</td>
                          <td className="p-2.5 text-stone-600">GIF・WebM URLのテキスト配列</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">description</td>
                          <td className="p-2.5 font-mono text-stone-500">JSONB / TEXT</td>
                          <td className="p-2.5 text-stone-600">日英対応のツール説明 ({`ja: "...", en: "..."`})</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">logo_icon_url</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT</td>
                          <td className="p-2.5 text-stone-600">カスタムアイコン画像 (Base64データまたはストレージURL)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">steps</td>
                          <td className="p-2.5 font-mono text-stone-500">JSONB</td>
                          <td className="p-2.5 text-stone-600">1-2-3-4 矢印バーステップ手順配列</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">sort_order</td>
                          <td className="p-2.5 font-mono text-stone-500">INTEGER</td>
                          <td className="p-2.5 text-stone-600">表示順序 (0, 1, 2...)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. gloobe_media table structure */}
                <div className="space-y-1.5 pt-2 border-t border-stone-200">
                  <div className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-600" />
                    <span>{lang === 'ja' ? 'テーブル 2: gloobe_media (個別メディアアセット & プレビュー連携)' : 'Table 2: gloobe_media (Individual Media Assets)'}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                          <th className="p-2.5">カラム名 (Column)</th>
                          <th className="p-2.5">型 (Type)</th>
                          <th className="p-2.5">説明 & 例 (Description)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-[11px]">
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">id</td>
                          <td className="p-2.5 font-mono text-stone-500">UUID (PK)</td>
                          <td className="p-2.5 text-stone-600">主キー (自動生成 gen_random_uuid())</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">preview_box_id</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT</td>
                          <td className="p-2.5 text-stone-600">プレビューツールボックスIDへの外部連携キー</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">tool_id</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT</td>
                          <td className="p-2.5 text-stone-600">対象ツールID (例: 'tool-wall', 'tool-column')</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">media_url</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT (NOT NULL)</td>
                          <td className="p-2.5 text-stone-600">GIF、WebM動画、画像の公開URL (Supabase Storage または CDN)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-orange-700">media_type</td>
                          <td className="p-2.5 font-mono text-stone-500">TEXT</td>
                          <td className="p-2.5 text-stone-600">'gif' | 'webp' | 'webm' | 'image' | 'video'</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Storage Bucket Guidance */}
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>{lang === 'ja' ? 'Supabase Storage でのGIF・WebM保存方法' : 'How to host GIFs & WebM in Supabase Storage'}</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-sky-800">
                    <li>{lang === 'ja' ? 'Supabaseダッシュボードの「Storage」を開き、「New Bucket」で「gloobe-assets」という名前のバケットを作成（Public BucketをON）にします。' : 'In Supabase Dashboard → Storage, create a public bucket named "gloobe-assets" (Public Bucket: ON).'}</li>
                    <li>{lang === 'ja' ? 'GLOOBEのCAD操作画面を録画したGIFやWebMファイルをアップロードします。' : 'Upload your recorded GIF or WebM files.'}</li>
                    <li>{lang === 'ja' ? 'アップロードしたファイルの「Get URL」で公開URLをコピーし、上記の gloobe_media テーブルの media_url に登録します。' : 'Copy the public URL and insert into gloobe_media table media_url.'}</li>
                  </ol>
                </div>

                {/* SQL Code Preview Block */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    PostgreSQL DDL (Supabase SQL Editor):
                  </div>
                  <pre className="p-4 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[240px] select-all scrollbar-visible">
                    {SUPABASE_TABLE_SQL}
                  </pre>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500">
            {lang === 'ja' ? '※「設定を保存して反映」を押すと画面に即座に反映されます。' : 'Changes apply immediately upon saving.'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition"
            >
              {lang === 'ja' ? 'キャンセル' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'ja' ? '設定を保存して反映' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: Quick Add Tool to Dropdown */}
      {quickAddDropdownId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>{lang === 'ja' ? 'ドロップダウン内にツールを追加' : 'Add Tool to Dropdown'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setQuickAddDropdownId(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                  {lang === 'ja' ? 'ツール名（日本語）*' : 'Tool Name (JA)*'}
                </label>
                <input
                  type="text"
                  value={quickAddNameJa}
                  onChange={(e) => setQuickAddNameJa(e.target.value)}
                  placeholder="例: RC外壁・間仕切壁"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                  {lang === 'ja' ? 'ツール名（英語）' : 'Tool Name (EN)'}
                </label>
                <input
                  type="text"
                  value={quickAddNameEn}
                  onChange={(e) => setQuickAddNameEn(e.target.value)}
                  placeholder="e.g. RC Exterior Wall"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? 'ショートカットキー' : 'Shortcut'}
                  </label>
                  <input
                    type="text"
                    value={quickAddShortcut}
                    onChange={(e) => setQuickAddShortcut(e.target.value)}
                    placeholder="Shift+W"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                    {lang === 'ja' ? 'CADアイコン' : 'Icon Type'}
                  </label>
                  <select
                    value={quickAddIconType}
                    onChange={(e) => setQuickAddIconType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs bg-white"
                  >
                    <option value="wall">壁 (Wall)</option>
                    <option value="column">柱 (Column)</option>
                    <option value="beam">梁 (Beam)</option>
                    <option value="slab">床 (Slab)</option>
                    <option value="door">ドア (Door)</option>
                    <option value="window">窓 (Window)</option>
                    <option value="finish">仕上 (Finish)</option>
                    <option value="rebar">配筋 (Rebar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                  {lang === 'ja' ? '簡単な説明' : 'Short Description'}
                </label>
                <input
                  type="text"
                  value={quickAddDescJa}
                  onChange={(e) => setQuickAddDescJa(e.target.value)}
                  placeholder="例: 配筋連動のRC耐力壁を配置します"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setQuickAddDropdownId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium cursor-pointer"
              >
                {lang === 'ja' ? 'キャンセル' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleQuickAddToolToDropdown}
                disabled={!quickAddNameJa.trim()}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold disabled:opacity-40 shadow-xs cursor-pointer"
              >
                {lang === 'ja' ? '追加する' : 'Add Tool'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create New Dropdown Group */}
      {isCreatingDropdown && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-sky-600" />
                <span>{lang === 'ja' ? '新規ドロップダウンボックス作成' : 'Create Dropdown Box'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingDropdown(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                  {lang === 'ja' ? 'ドロップダウン表示名（日本語）*' : 'Dropdown Name (JA)*'}
                </label>
                <input
                  type="text"
                  value={newDropdownNameJa}
                  onChange={(e) => setNewDropdownNameJa(e.target.value)}
                  placeholder="例: 壁詳細 ▼ または 建具種類 ▼"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                  {lang === 'ja' ? 'ドロップダウン表示名（英語）' : 'Dropdown Name (EN)'}
                </label>
                <input
                  type="text"
                  value={newDropdownNameEn}
                  onChange={(e) => setNewDropdownNameEn(e.target.value)}
                  placeholder="e.g. Wall Options ▼"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 mb-1 block">
                  {lang === 'ja' ? '所属サブグループ名' : 'Subgroup Name'}
                </label>
                <input
                  type="text"
                  value={newDropdownSubgroupJa}
                  onChange={(e) => setNewDropdownSubgroupJa(e.target.value)}
                  placeholder="例: 壁ツール"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-sky-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingDropdown(false)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium cursor-pointer"
              >
                {lang === 'ja' ? 'キャンセル' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateDropdownGroup}
                disabled={!newDropdownNameJa.trim()}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold disabled:opacity-40 shadow-xs cursor-pointer"
              >
                {lang === 'ja' ? '作成する' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
