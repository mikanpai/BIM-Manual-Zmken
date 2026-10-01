import React, { useState } from 'react';
import { CategoryInfo, CompanySettings, Language } from '../types/manual';
import { 
  X, Check, Plus, Trash2, ArrowUp, ArrowDown, 
  Settings, Shield, Layers, Layout, Building2, Sliders, Palette 
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  onSaveCategories: (updatedCategories: CategoryInfo[]) => void;
  companySettings: CompanySettings;
  onSaveCompanySettings: (updatedSettings: CompanySettings) => void;
  lang: Language;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  companySettings,
  onSaveCompanySettings,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'preview_settings' | 'company'>('categories');
  const [categoryList, setCategoryList] = useState<CategoryInfo[]>(categories);
  const [settingsData, setSettingsData] = useState<CompanySettings>(companySettings);

  if (!isOpen) return null;

  // Category handlers
  const handleCategoryNameChange = (id: string, field: 'ja' | 'en', value: string) => {
    setCategoryList(categoryList.map(c => 
      c.id === id ? { ...c, name: { ...c.name, [field]: value } } : c
    ));
  };

  const handleCategoryDescChange = (id: string, field: 'ja' | 'en', value: string) => {
    setCategoryList(categoryList.map(c => 
      c.id === id ? { ...c, desc: { ...c.desc, [field]: value } } : c
    ));
  };

  const handleCategoryColorChange = (id: string, color: string) => {
    setCategoryList(categoryList.map(c => 
      c.id === id ? { ...c, accentColor: color } : c
    ));
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoryList.length) return;
    const updated = [...categoryList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCategoryList(updated);
  };

  const addCategory = () => {
    const nextId = `cat-custom-${Date.now()}`;
    const newCat: CategoryInfo = {
      id: nextId,
      name: { ja: '新規カテゴリタブ', en: 'New Category Tab' },
      desc: { ja: '新しいツール分類', en: 'New tool category' },
      iconName: 'Building2',
      accentColor: '#EA580C'
    };
    setCategoryList([...categoryList, newCat]);
  };

  const removeCategory = (id: string) => {
    if (categoryList.length <= 1) {
      alert(lang === 'ja' ? '最低1つのカテゴリが必要です。' : 'At least one category is required.');
      return;
    }
    if (confirm(lang === 'ja' ? 'このカテゴリタブを削除しますか？' : 'Delete this category tab?')) {
      setCategoryList(categoryList.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
    onSaveCategories(categoryList);
    onSaveCompanySettings(settingsData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {lang === 'ja' ? '管理者設定 & メニューバー管理' : 'Admin Panel & Menu Bar Settings'}
              </h2>
              <p className="text-xs text-orange-100">
                {lang === 'ja' 
                  ? 'リボンメニュータブ名（意匠・躯体、建具、構造など）の変更、プレビューツールの名称や設定を管理します' 
                  : 'Customize menu bar tabs (Architecture, Doors, Structure, etc.) and preview tool settings'}
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
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 shrink-0 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lang === 'ja' ? `リボンメニュータブ編集 (${categoryList.length}項目)` : `Ribbon Tabs (${categoryList.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview_settings')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'preview_settings'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>{lang === 'ja' ? 'プレビューツール基本設定' : 'Preview Tool Settings'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'company'
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'ja' ? '会社・規程情報' : 'Company & Rules'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: RIBBON CATEGORIES EDITOR (USER REQUESTED) */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-800">
                    {lang === 'ja' ? 'GLOOBE リボンメニューバーのタブ一覧' : 'Ribbon Menu Bar Tabs'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {lang === 'ja' 
                      ? 'タブの名称（日本語・英語）を自由に変更できます。並び替えや新規タブ追加も可能です。' 
                      : 'Rename any tab (Architecture, Doors, Structure, etc.), reorder, or add custom tabs.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCategory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? '新規タブを追加' : 'Add Tab'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {categoryList.map((cat, idx) => (
                  <div 
                    key={cat.id} 
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cat.accentColor || '#EA580C' }} 
                        />
                        <span className="text-xs font-bold text-stone-900">
                          {cat.name.ja}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveCategory(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 transition"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCategory(idx, 'down')}
                          disabled={idx === categoryList.length - 1}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 transition"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategory(cat.id)}
                          className="p-1 rounded text-stone-400 hover:text-red-600 transition ml-1"
                          title="Delete Tab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          {lang === 'ja' ? 'タブ名（日本語）' : 'Tab Name (JA)'}
                        </label>
                        <input
                          type="text"
                          value={cat.name.ja}
                          onChange={(e) => handleCategoryNameChange(cat.id, 'ja', e.target.value)}
                          placeholder="例: 意匠・躯体"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          {lang === 'ja' ? 'タブ名（英語 / English）' : 'Tab Name (EN)'}
                        </label>
                        <input
                          type="text"
                          value={cat.name.en}
                          onChange={(e) => handleCategoryNameChange(cat.id, 'en', e.target.value)}
                          placeholder="e.g. Architecture & Framing"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          {lang === 'ja' ? 'タブの説明' : 'Description'}
                        </label>
                        <input
                          type="text"
                          value={cat.desc.ja}
                          onChange={(e) => handleCategoryDescChange(cat.id, 'ja', e.target.value)}
                          placeholder="壁、柱、梁、スラブなどの躯体モデリング"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          {lang === 'ja' ? 'アクセントカラー' : 'Accent Color'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={cat.accentColor || '#EA580C'}
                            onChange={(e) => handleCategoryColorChange(cat.id, e.target.value)}
                            className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={cat.accentColor || '#EA580C'}
                            onChange={(e) => handleCategoryColorChange(cat.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-stone-300 rounded-lg outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PREVIEW TOOL SETTINGS (USER REQUESTED: Rename CAD Action Simulator to Preview Tool, set logos) */}
          {activeTab === 'preview_settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-orange-600" />
                  <span>{lang === 'ja' ? 'プレビューツール基本名称・表示設定' : 'Preview Tool Defaults'}</span>
                </h4>
                <p className="text-[11px] text-orange-900 leading-relaxed">
                  {lang === 'ja' 
                    ? '「CAD動作シミュレータ」の標準名称を「プレビューツール」や任意のカスタム名に変更できます。各ツールの編集画面で個別のロゴや複数のプレビューボックスを追加可能です。'
                    : 'Configure default title for the Preview Tool box. Individual tool logos and multiple preview boxes can be configured in each tool edit panel.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    {lang === 'ja' ? 'ボックス標準名称（日本語）' : 'Default Box Title (JA)'}
                  </label>
                  <input
                    type="text"
                    value={settingsData.defaultPreviewBoxTitleJa || 'プレビューツール'}
                    onChange={(e) => setSettingsData({ ...settingsData, defaultPreviewBoxTitleJa: e.target.value })}
                    placeholder="プレビューツール"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    {lang === 'ja' ? 'ボックス標準名称（英語）' : 'Default Box Title (EN)'}
                  </label>
                  <input
                    type="text"
                    value={settingsData.defaultPreviewBoxTitleEn || 'Preview Tool'}
                    onChange={(e) => setSettingsData({ ...settingsData, defaultPreviewBoxTitleEn: e.target.value })}
                    placeholder="Preview Tool"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPANY SETTINGS */}
          {activeTab === 'company' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  {lang === 'ja' ? '会社名（日本語）' : 'Company Name (JA)'}
                </label>
                <input
                  type="text"
                  value={settingsData.nameJa}
                  onChange={(e) => setSettingsData({ ...settingsData, nameJa: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  {lang === 'ja' ? '会社名（英語）' : 'Company Name (EN)'}
                </label>
                <input
                  type="text"
                  value={settingsData.nameEn}
                  onChange={(e) => setSettingsData({ ...settingsData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    {lang === 'ja' ? '部署名（日本語）' : 'Department (JA)'}
                  </label>
                  <input
                    type="text"
                    value={settingsData.departmentJa}
                    onChange={(e) => setSettingsData({ ...settingsData, departmentJa: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    {lang === 'ja' ? '部署名（英語）' : 'Department (EN)'}
                  </label>
                  <input
                    type="text"
                    value={settingsData.departmentEn}
                    onChange={(e) => setSettingsData({ ...settingsData, departmentEn: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-stone-200 bg-stone-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 transition"
          >
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'ja' ? '設定を保存して反映' : 'Save & Apply'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
