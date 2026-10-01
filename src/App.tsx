/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CategoryInfo, CompanySettings, Language, PreviewBoxItem, 
  RibbonCategoryId, SubOptionItem, ToolItem 
} from './types/manual';
import { 
  CATEGORIES, DEFAULT_COMPANY_SETTINGS, INITIAL_TOOLS 
} from './data/defaultManual';
import { Header } from './components/Header';
import { RibbonBar } from './components/RibbonBar';
import { MainMenuPage } from './components/MainMenuPage';
import { ToolDetailPage } from './components/ToolDetailPage';
import { SubOptionDetailPage } from './components/SubOptionDetailPage';
import { ToolEditorModal } from './components/ToolEditorModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { Plus, Search, Sparkles, Building2, HelpCircle } from 'lucide-react';

const STORAGE_KEY_TOOLS = 'gloobe_manual_tools_v1';
const STORAGE_KEY_COMPANY = 'gloobe_manual_company_v1';
const STORAGE_KEY_LANG = 'gloobe_manual_lang_v1';
const STORAGE_KEY_CATEGORIES = 'gloobe_manual_categories_v1';

export default function App() {
  // 1. Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return (saved === 'en' || saved === 'ja') ? saved : 'ja';
  });

  // 2. Categories state (USER REQUESTED: editable menu bar tabs like Architecture, Structure, etc.)
  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return saved ? JSON.parse(saved) : CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  });

  // 3. Company Settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPANY);
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_SETTINGS;
    } catch {
      return DEFAULT_COMPANY_SETTINGS;
    }
  });

  // 4. Tools state (Ensure tools with subOptions like tool-wall have subOptions & remove any legacy badges)
  const [tools, setTools] = useState<ToolItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOOLS);
      if (!saved) return INITIAL_TOOLS;
      const parsed: ToolItem[] = JSON.parse(saved);
      return parsed.map((tool) => {
        const initial = INITIAL_TOOLS.find((t) => t.id === tool.id);
        const cleanedTool = { ...tool };
        delete (cleanedTool as any).badge;
        if (initial && (!cleanedTool.subOptions || cleanedTool.subOptions.length === 0) && initial.subOptions && initial.subOptions.length > 0) {
          return { ...cleanedTool, subOptions: initial.subOptions };
        }
        return cleanedTool;
      });
    } catch {
      return INITIAL_TOOLS;
    }
  });

  // 5. UI / Navigation state
  const [activeRibbonCategory, setActiveRibbonCategory] = useState<RibbonCategoryId>('architecture');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  
  // USER REQUESTED: Dedicated separate page for sub-options
  const [selectedSubOption, setSelectedSubOption] = useState<{
    tool: ToolItem;
    subOption: SubOptionItem;
  } | null>(null);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'categories' | 'ribbon_groupings' | 'ribbon_dropdowns' | 'preview_tool' | 'company' | 'backup' | 'supabase'>('categories');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    caption?: string;
    isGif?: boolean;
  }>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOOLS, JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }, [lang]);

  // Handle URL hash on initial load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      if (hash.includes('__')) {
        const [toolId, subId] = hash.split('__');
        const matchedTool = tools.find((t) => t.id === toolId);
        if (matchedTool) {
          const matchedSub = matchedTool.subOptions?.find((s) => s.id === subId);
          if (matchedSub) {
            setSelectedTool(matchedTool);
            setSelectedSubOption({ tool: matchedTool, subOption: matchedSub });
            return;
          }
          setSelectedTool(matchedTool);
        }
      } else {
        const matched = tools.find((t) => t.id === hash);
        if (matched) {
          setSelectedTool(matched);
        }
      }
    }
  }, [tools]);

  // Handlers
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
  };

  const handleSelectTool = (tool: ToolItem) => {
    setSelectedTool(tool);
    setSelectedSubOption(null);
    window.location.hash = tool.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // USER REQUESTED: Sub-option navigation to its dedicated separate page
  const handleSelectSubOption = (tool: ToolItem, subOption: SubOptionItem) => {
    setSelectedTool(tool);
    setSelectedSubOption({ tool, subOption });
    window.location.hash = `${tool.id}__${subOption.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToParentTool = () => {
    setSelectedSubOption(null);
    if (selectedTool) {
      window.location.hash = selectedTool.id;
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedSubOption(null);
    setSelectedTool(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewTool = () => {
    setEditingTool(null);
    setIsEditorOpen(true);
  };

  const handleEditTool = (tool: ToolItem) => {
    setEditingTool(tool);
    setIsEditorOpen(true);
  };

  const handleSaveTool = (savedTool: ToolItem) => {
    const exists = tools.some((t) => t.id === savedTool.id);
    let updated: ToolItem[];
    if (exists) {
      updated = tools.map((t) => (t.id === savedTool.id ? savedTool : t));
    } else {
      updated = [savedTool, ...tools];
    }
    setTools(updated);

    // If currently viewing the saved tool, update view
    if (selectedTool && selectedTool.id === savedTool.id) {
      setSelectedTool(savedTool);
    }

    // If viewing sub-option of this tool, update parent reference
    if (selectedSubOption && selectedSubOption.tool.id === savedTool.id) {
      const updatedSub = savedTool.subOptions?.find((s) => s.id === selectedSubOption.subOption.id);
      setSelectedSubOption({
        tool: savedTool,
        subOption: updatedSub || selectedSubOption.subOption,
      });
    }
  };

  const handleSaveSubOption = (updatedSub: SubOptionItem) => {
    if (!selectedSubOption) return;
    const parent = selectedSubOption.tool;
    const updatedSubOptions = (parent.subOptions || []).map((s) => 
      s.id === updatedSub.id ? updatedSub : s
    );
    const updatedTool: ToolItem = {
      ...parent,
      subOptions: updatedSubOptions,
    };
    handleSaveTool(updatedTool);
    setSelectedSubOption({ tool: updatedTool, subOption: updatedSub });
  };

  const handleSaveCategories = (updatedCategories: CategoryInfo[]) => {
    setCategories(updatedCategories);
  };

  const handleSaveCompanySettings = (updated: CompanySettings) => {
    setCompanySettings(updated);
  };

  const handleOpenLightbox = (imageUrl: string, title: string, caption?: string, isGif?: boolean) => {
    setLightboxData({
      isOpen: true,
      url: imageUrl,
      title,
      caption,
      isGif,
    });
  };

  // Export & Import
  const handleExportJson = () => {
    const data = {
      version: '1.2',
      categories,
      companySettings,
      tools,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GLOOBE_Manual_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
        if (parsed.companySettings) setCompanySettings(parsed.companySettings);
        if (Array.isArray(parsed.tools)) setTools(parsed.tools);
        alert(lang === 'ja' ? 'マニュアルデータを正常に読み込みました。' : 'Manual imported successfully.');
      } catch (err) {
        alert(lang === 'ja' ? 'JSONファイルの解析に失敗しました。' : 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    const msg = lang === 'ja' 
      ? 'マニュアルを初期標準テンプレートに戻しますか？（現在の編集内容は上書きされます）' 
      : 'Reset manual to default template? Current custom edits will be replaced.';
    if (window.confirm(msg)) {
      setTools(INITIAL_TOOLS);
      setCategories(CATEGORIES);
      setCompanySettings(DEFAULT_COMPANY_SETTINGS);
      setSelectedSubOption(null);
      setSelectedTool(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. Global Header with Company Name & Controls */}
      <Header
        companySettings={companySettings}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenAdminPanel={() => {
          setAdminInitialTab('categories');
          setIsAdminModalOpen(true);
        }}
        onAddNewTool={handleAddNewTool}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetDefault={handleResetDefault}
        onNavigateHome={handleBackToList}
      />

      {/* 2. Interactive GLOOBE CAD Ribbon Simulator (Always On) */}
      <RibbonBar
        categories={categories}
        tools={tools}
        currentCategory={activeRibbonCategory}
        onSelectCategory={(catId) => {
          setActiveRibbonCategory(catId);
          if (selectedSubOption) setSelectedSubOption(null);
          if (selectedTool) setSelectedTool(null);
        }}
        onSelectTool={handleSelectTool}
        onSelectSubOption={handleSelectSubOption}
        onAddNewTool={handleAddNewTool}
        onSaveTools={(updatedTools) => {
          setTools(updatedTools);
          if (selectedTool) {
            const matched = updatedTools.find((t) => t.id === selectedTool.id);
            if (matched) setSelectedTool(matched);
          }
        }}
        onNavigateHome={handleBackToList}
        lang={lang}
      />

      {/* 3. Main Body Content */}
      <main className="flex-1 pb-16">
        {selectedSubOption ? (
          /* USER REQUESTED: DEDICATED SEPARATE PAGE FOR SUB-OPTION */
          <SubOptionDetailPage
            tool={selectedSubOption.tool}
            subOption={selectedSubOption.subOption}
            companySettings={companySettings}
            lang={lang}
            onBackToParent={handleBackToParentTool}
            onBackToList={handleBackToList}
            onSelectSubOption={(sub) => {
              handleSelectSubOption(selectedSubOption.tool, sub);
            }}
            onSaveSubOption={handleSaveSubOption}
            onSaveTool={handleSaveTool}
          />
        ) : selectedTool ? (
          /* DEDICATED TOOL PAGE VIEW */
          <ToolDetailPage
            tool={selectedTool}
            allTools={tools}
            companySettings={companySettings}
            lang={lang}
            onBack={handleBackToList}
            onSelectTool={handleSelectTool}
            onSelectSubOption={handleSelectSubOption}
            onEditTool={handleEditTool}
            onSaveTool={handleSaveTool}
            onOpenLightbox={handleOpenLightbox}
          />
        ) : (
          /* USER REQUESTED: MAIN MENU PAGE FOR SEARCH, CATEGORIES & STUFF */
          <MainMenuPage
            categories={categories}
            tools={tools}
            companySettings={companySettings}
            lang={lang}
            activeCategory={activeRibbonCategory}
            onSelectCategory={(catId) => {
              setActiveRibbonCategory(catId);
            }}
            onSelectTool={handleSelectTool}
            onSelectSubOption={handleSelectSubOption}
            onAddNewTool={handleAddNewTool}
            onEditTool={handleEditTool}
            onOpenAdminPanel={() => {
              setAdminInitialTab('categories');
              setIsAdminModalOpen(true);
            }}
            onOpenAdminSupabase={() => {
              setAdminInitialTab('supabase');
              setIsAdminModalOpen(true);
            }}
            onOpenLightbox={handleOpenLightbox}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-stone-200 text-stone-600 py-8 px-6 text-xs shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-orange-600">GLOOBE BIM MANUAL</span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-800 font-medium">{lang === 'ja' ? companySettings.nameJa : companySettings.nameEn}</span>
          </div>
          <div className="text-stone-500 text-center sm:text-right">
            {lang === 'ja' 
              ? '建築BIM設計・図面作成ガイドライン / 社内運用マニュアル' 
              : 'Architectural BIM Standard Manual / Internal Operations'}
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      {/* Tool Editor Modal (Create or Edit Tool, Steps, Preview Boxes, Sub-options, and GIFs) */}
      {isEditorOpen && (
        <ToolEditorModal
          key={editingTool ? `tool-${editingTool.id}` : 'new-tool'}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          tool={editingTool}
          onSave={handleSaveTool}
          lang={lang}
        />
      )}

      {/* Admin Panel Modal (Edit Ribbon Menu Tabs, Preview Tool Defaults, Company Branding, Data Backup, Supabase) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        tools={tools}
        onSaveTools={(updatedTools) => {
          setTools(updatedTools);
          if (selectedTool) {
            const found = updatedTools.find((t) => t.id === selectedTool.id);
            if (found) setSelectedTool(found);
          }
        }}
        onAddNewTool={handleAddNewTool}
        companySettings={companySettings}
        onSaveCompanySettings={handleSaveCompanySettings}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetDefault={handleResetDefault}
        initialTab={adminInitialTab}
        lang={lang}
      />

      {/* Company Name & Branding Settings Modal */}
      <CompanySettingsModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        settings={companySettings}
        onSave={handleSaveCompanySettings}
        lang={lang}
      />

      {/* High-Resolution Media / GIF Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
        imageUrl={lightboxData.url}
        title={lightboxData.title}
        caption={lightboxData.caption}
        isGif={lightboxData.isGif}
        lang={lang}
      />

    </div>
  );
}
