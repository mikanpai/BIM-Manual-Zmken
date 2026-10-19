/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { SubOptionEditorModal } from './components/SubOptionEditorModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { Plus, Search, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { loadSharedManualState } from './lib/supabase';
import {
  EMPTY_SNAPSHOT, ManualSnapshot, fetchManual, fetchPreviousJsonStore, isCloudConfigured, pushChanges, snapshotsEqual,
} from './lib/cloudStore';

type SyncState = { status: 'loading' | 'saved' | 'saving' | 'error' | 'local'; message?: string };
const STORAGE_KEY_LOCAL_BACKUP = 'gloobe_local_backup_v1';

const STORAGE_KEY_TOOLS = 'gloobe_manual_tools_v1';
const STORAGE_KEY_COMPANY = 'gloobe_manual_company_v1';
const STORAGE_KEY_LANG = 'gloobe_manual_lang_v1';
const STORAGE_KEY_CATEGORIES = 'gloobe_manual_categories_v1';

/** Tools cannot exist in the ribbon once their category has been removed. */
const keepToolsInCategories = (toolList: ToolItem[], categoryList: CategoryInfo[]) => {
  const categoryIds = new Set(categoryList.map((category) => category.id));
  return toolList.filter((tool) => categoryIds.has(tool.categoryId));
};

export default function App() {
  const [sharedStateReady, setSharedStateReady] = useState(false);
  const [sharedStateAvailable, setSharedStateAvailable] = useState(false);
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
      return keepToolsInCategories(parsed.map((tool) => {
        const initial = INITIAL_TOOLS.find((t) => t.id === tool.id);
        const cleanedTool = { ...tool };
        delete (cleanedTool as any).badge;
        if (initial && (!cleanedTool.subOptions || cleanedTool.subOptions.length === 0) && initial.subOptions && initial.subOptions.length > 0) {
          return { ...cleanedTool, subOptions: initial.subOptions };
        }
        return cleanedTool;
      }), categories);
    } catch {
      return INITIAL_TOOLS;
    }
  });

  // 5. UI / Navigation state
  const [activeRibbonCategory, setActiveRibbonCategory] = useState<RibbonCategoryId>(() => categories[0]?.id || '');
  const [isRibbonPaletteVisible, setIsRibbonPaletteVisible] = useState(false);
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

  // ---------------------------------------------------------------------
  // Cloud sync (row-per-item). See src/lib/cloudStore.ts
  // ---------------------------------------------------------------------
  const [syncState, setSyncState] = useState<SyncState>({ status: 'loading' });
  const latestRef = useRef<ManualSnapshot>({ categories, tools, company: companySettings });
  latestRef.current = { categories, tools, company: companySettings };
  const lastSyncedRef = useRef<ManualSnapshot | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const uiBusyRef = useRef(false);
  uiBusyRef.current = isEditorOpen || isAdminModalOpen || isCompanyModalOpen;

  // Apply a cloud snapshot to the screen and remember it as "synced".
  const applySnapshot = useCallback((remote: ManualSnapshot) => {
    const nextCategories = remote.categories.length > 0 ? remote.categories : latestRef.current.categories;
    const nextTools = keepToolsInCategories(remote.tools, nextCategories);
    setCategories(nextCategories);
    setTools(nextTools);
    if (remote.company) setCompanySettings(remote.company);
    lastSyncedRef.current = { categories: nextCategories, tools: nextTools, company: remote.company };
    // keep an open detail page pointing at the fresh data
    setSelectedTool((prev) => (prev ? nextTools.find((t) => t.id === prev.id) ?? prev : prev));
    setSelectedSubOption((prev) => {
      if (!prev) return prev;
      const tool = nextTools.find((t) => t.id === prev.tool.id);
      if (!tool) return prev;
      return { tool, subOption: tool.subOptions?.find((s) => s.id === prev.subOption.id) ?? prev.subOption };
    });
  }, []);

  // Before the cloud version replaces what this browser has, keep a copy of the
  // browser's own data so nothing can be silently lost.
  const backupLocalIfDifferent = (remote: ManualSnapshot) => {
    try {
      const local = latestRef.current;
      if (JSON.stringify(local.tools) === JSON.stringify(remote.tools)) return;
      localStorage.setItem(STORAGE_KEY_LOCAL_BACKUP, JSON.stringify({
        savedAt: new Date().toISOString(),
        categories: local.categories,
        tools: local.tools,
        companySettings: local.company,
      }));
    } catch { /* storage full or unavailable */ }
  };

  // Initial load (and one-time migration from the old single-row table)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isCloudConfigured()) {
        setSyncState({ status: 'local' });
        setSharedStateReady(true);
        return;
      }
      const res = await fetchManual();
      if (cancelled) return;
      if (!res.ok) {
        setSyncState({ status: 'error', message: res.error });
        setSharedStateAvailable(false);
        setSharedStateReady(true);
        return;
      }
      let remote = res.snapshot;
      if (res.empty) {
        // First run on the new tables: fill them from the earlier cloud data
        // (JSON-blob tables, then the old single-row table), else from this browser.
        const previous = await fetchPreviousJsonStore();
        const legacy = previous ? null : await loadSharedManualState();
        if (cancelled) return;
        const old = previous
          ? { categories: previous.categories, tools: previous.tools, companySettings: previous.company }
          : legacy?.state;
        const local = latestRef.current;
        remote = {
          categories: Array.isArray(old?.categories) ? (old!.categories as CategoryInfo[]) : local.categories,
          tools: Array.isArray(old?.tools) ? (old!.tools as ToolItem[]) : local.tools,
          company: (old?.companySettings as CompanySettings | undefined) ?? local.company,
        };
        // Keep custom tools that exist only in this browser (never re-add deleted built-in defaults).
        if (Array.isArray(old?.tools)) {
          const knownIds = new Set(remote.tools.map((t) => t.id));
          const defaultIds = new Set(INITIAL_TOOLS.map((t) => t.id));
          remote.tools = [
            ...remote.tools,
            ...local.tools.filter((t) => !knownIds.has(t.id) && !defaultIds.has(t.id)),
          ];
        }
        backupLocalIfDifferent(remote);
        try {
          await pushChanges(EMPTY_SNAPSHOT, remote);
        } catch (error) {
          setSyncState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
          setSharedStateAvailable(false);
          setSharedStateReady(true);
          return;
        }
      } else {
        backupLocalIfDifferent(remote);
      }
      if (cancelled) return;
      applySnapshot(remote);
      setSyncState({ status: 'saved' });
      setSharedStateAvailable(true);
      setSharedStateReady(true);
    })();
    return () => { cancelled = true; };
  }, [applySnapshot]);

  // Send only what changed since the last successful sync (one save at a time).
  const flushSync = useCallback(() => {
    queueRef.current = queueRef.current.then(async () => {
      const prev = lastSyncedRef.current;
      const next = latestRef.current;
      if (!prev || snapshotsEqual(prev, next)) return;
      setSyncState({ status: 'saving' });
      try {
        await pushChanges(prev, next);
        lastSyncedRef.current = next;
        setSyncState({ status: snapshotsEqual(next, latestRef.current) ? 'saved' : 'saving' });
      } catch (error) {
        console.warn('[Supabase] Sync failed:', error);
        setSyncState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      }
    });
  }, []);

  useEffect(() => {
    if (!sharedStateReady || !sharedStateAvailable) return;
    const timeout = window.setTimeout(flushSync, 750);
    return () => window.clearTimeout(timeout);
  }, [categories, companySettings, tools, sharedStateAvailable, sharedStateReady, flushSync]);

  // Pull in changes other people made (only when this browser has nothing unsaved).
  const refreshFromCloud = useCallback(async () => {
    const last = lastSyncedRef.current;
    if (!last || uiBusyRef.current || !snapshotsEqual(last, latestRef.current)) return;
    const res = await fetchManual();
    if (!res.ok || res.empty) return;
    const current = lastSyncedRef.current;
    if (!current || uiBusyRef.current || !snapshotsEqual(current, latestRef.current)) return;
    const remoteTools = keepToolsInCategories(res.snapshot.tools, res.snapshot.categories);
    const remote: ManualSnapshot = { ...res.snapshot, tools: remoteTools, company: res.snapshot.company ?? current.company };
    if (snapshotsEqual({ ...current, company: current.company }, remote)) return;
    applySnapshot(res.snapshot);
  }, [applySnapshot]);

  useEffect(() => {
    if (!sharedStateReady || !sharedStateAvailable) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushSync();
      else refreshFromCloud();
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const last = lastSyncedRef.current;
      if (last && !snapshotsEqual(last, latestRef.current)) {
        flushSync();
        event.preventDefault();
        event.returnValue = '';
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', refreshFromCloud);
    window.addEventListener('beforeunload', onBeforeUnload);
    const interval = window.setInterval(refreshFromCloud, 45000);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', refreshFromCloud);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.clearInterval(interval);
    };
  }, [sharedStateReady, sharedStateAvailable, flushSync, refreshFromCloud]);

  // Never keep a deleted/default ribbon category selected after local or cloud state loads.
  useEffect(() => {
    if (!categories.some((category) => category.id === activeRibbonCategory)) {
      setActiveRibbonCategory(categories[0]?.id || '');
    }
  }, [activeRibbonCategory, categories]);

  // Always start on the home page: a leftover #tool-link in the address bar is cleared on load
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Handlers
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
  };

  const handleSelectTool = (tool: ToolItem) => {
    setIsRibbonPaletteVisible(true);
    setSelectedTool(tool);
    setSelectedSubOption(null);
    window.location.hash = tool.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // USER REQUESTED: Sub-option navigation to its dedicated separate page
  const handleSelectSubOption = (tool: ToolItem, subOption: SubOptionItem) => {
    setIsRibbonPaletteVisible(true);
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
    setIsRibbonPaletteVisible(false);
    setSelectedSubOption(null);
    setSelectedTool(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // "Add Sub-Option" from the ribbon dropdown of a specific tool
  const [newSubOptionDraft, setNewSubOptionDraft] = useState<{ toolId: string; sub: SubOptionItem } | null>(null);

  const handleStartAddSubOption = (tool: ToolItem) => {
    const current = tools.find((t) => t.id === tool.id) ?? tool;
    const nextNum = (current.subOptions?.length ?? 0) + 1;
    setNewSubOptionDraft({
      toolId: current.id,
      sub: {
        id: `sub-${Date.now()}-${nextNum}`,
        name: { ja: `サブ機能 ${nextNum}`, en: `Sub-option ${nextNum}` },
        desc: { ja: 'サブコマンドの説明', en: 'Sub-command description' },
        iconType: current.iconType,
        shortcut: '',
      },
    });
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
    setTools((currentTools) => keepToolsInCategories(currentTools, updatedCategories));
    if (!updatedCategories.some((category) => category.id === activeRibbonCategory)) {
      setActiveRibbonCategory(updatedCategories[0]?.id || '');
    }
    if (selectedTool && !updatedCategories.some((category) => category.id === selectedTool.categoryId)) {
      handleBackToList();
    }
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
        const parsed = JSON.parse(e.target?.result as string);
        const fileCategories: CategoryInfo[] = Array.isArray(parsed.categories) ? parsed.categories : [];
        const fileTools: ToolItem[] = Array.isArray(parsed.tools) ? parsed.tools : [];

        const mergeMsg = lang === 'ja'
          ? `バックアップに ${fileTools.length} 件のツールがあります。\n\n「OK」: 今のデータはそのまま残し、足りないものだけを追加（おすすめ）\n「キャンセル」: 次の画面で全置換するか選びます`
          : `The backup contains ${fileTools.length} tools.\n\nOK: keep current data and only ADD what is missing (recommended)\nCancel: choose to replace everything on the next screen`;

        if (window.confirm(mergeMsg)) {
          const current = latestRef.current;
          const knownCategoryIds = new Set(current.categories.map((c) => c.id));
          const knownToolIds = new Set(current.tools.map((t) => t.id));
          const newCategories = fileCategories.filter((c) => !knownCategoryIds.has(c.id));
          const newTools = fileTools.filter((t) => !knownToolIds.has(t.id));
          const mergedCategories = [...current.categories, ...newCategories];
          setCategories(mergedCategories);
          setTools(keepToolsInCategories([...current.tools, ...newTools], mergedCategories));
          alert(lang === 'ja'
            ? `追加しました: ツール ${newTools.length} 件 / タブ ${newCategories.length} 件\n（すでに存在する ${fileTools.length - newTools.length} 件は変更していません）`
            : `Added ${newTools.length} tools and ${newCategories.length} tabs.\n(${fileTools.length - newTools.length} tools already existed and were not changed.)`);
          return;
        }

        const replaceMsg = lang === 'ja'
          ? '現在のデータをすべて削除して、バックアップの内容に置き換えますか？\n（クラウドのデータも置き換わります）'
          : 'Replace ALL current data with the backup file?\n(The cloud data will be replaced too.)';
        if (!window.confirm(replaceMsg)) return;
        if (fileCategories.length > 0) setCategories(fileCategories);
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
          // Only switch the tab and show its toolbar. The page you are on stays as it is.
          setActiveRibbonCategory(catId);
          setIsRibbonPaletteVisible(true);
        }}
        onSelectTool={handleSelectTool}
        onSelectSubOption={handleSelectSubOption}
        onAddNewTool={handleAddNewTool}
        onAddSubOption={handleStartAddSubOption}
        onSaveTools={(updatedTools) => {
          setTools(updatedTools);
          if (selectedTool) {
            const matched = updatedTools.find((t) => t.id === selectedTool.id);
            if (matched) setSelectedTool(matched);
          }
        }}
        onNavigateHome={handleBackToList}
        isPaletteVisible={isRibbonPaletteVisible}
        lang={lang}
      />

      {/* 3. Main Body Content */}
      <main className="flex-1 pb-16">
        {selectedSubOption ? (
          /* USER REQUESTED: DEDICATED SEPARATE PAGE FOR SUB-OPTION */
          <SubOptionDetailPage
            tool={selectedSubOption.tool}
            subOption={selectedSubOption.subOption}
            categories={categories}
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
            categories={categories}
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
              setIsRibbonPaletteVisible(true);
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
      {/* New sub-option for the tool whose dropdown "Add Sub-Option" was clicked */}
      {newSubOptionDraft && (() => {
        const parent = tools.find((t) => t.id === newSubOptionDraft.toolId);
        if (!parent) return null;
        return (
          <SubOptionEditorModal
            key={newSubOptionDraft.sub.id}
            isOpen
            onClose={() => setNewSubOptionDraft(null)}
            subOption={newSubOptionDraft.sub}
            parentToolName={parent.name}
            defaultIconType={parent.iconType}
            onSave={(created) => {
              handleSaveTool({ ...parent, subOptions: [...(parent.subOptions || []), created] });
              setNewSubOptionDraft(null);
            }}
            lang={lang}
          />
        );
      })()}

      {/* Tool Editor Modal (Create or Edit Tool, Steps, Preview Boxes, Sub-options, and GIFs) */}
      {isEditorOpen && (
        <ToolEditorModal
          key={editingTool ? `tool-${editingTool.id}` : 'new-tool'}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          tool={editingTool}
          categories={categories}
          allTools={tools}
          defaultCategoryId={activeRibbonCategory}
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

      {/* Cloud save status (so a failed save is never silent) */}
      {syncState.status !== 'loading' && (
        <div
          className={`fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-md ${
            syncState.status === 'error'
              ? 'bg-red-50 border-red-300 text-red-700'
              : syncState.status === 'saving'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : syncState.status === 'local'
              ? 'bg-stone-100 border-stone-300 text-stone-600'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          }`}
          title={syncState.message || ''}
        >
          <span>
            {syncState.status === 'saved' && (lang === 'ja' ? '☁ クラウド保存済み' : '☁ Saved to cloud')}
            {syncState.status === 'saving' && (lang === 'ja' ? '☁ 保存中…' : '☁ Saving…')}
            {syncState.status === 'local' && (lang === 'ja' ? 'このブラウザのみに保存（Supabase未接続）' : 'Saved in this browser only (Supabase not connected)')}
            {syncState.status === 'error' && (lang === 'ja' ? '⚠ クラウド保存に失敗しました' : '⚠ Cloud save failed')}
          </span>
          {syncState.status === 'error' && (
            <>
              <span className="max-w-[260px] truncate font-normal">{syncState.message}</span>
              <button type="button" onClick={flushSync} className="rounded bg-red-600 px-2 py-0.5 text-white hover:bg-red-700">
                {lang === 'ja' ? '再試行' : 'Retry'}
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
}