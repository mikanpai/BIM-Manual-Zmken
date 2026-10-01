import React, { useRef } from 'react';
import { CompanySettings, Language } from '../types/manual';
import { 
  Building2, Globe, Plus, Download, Upload, RotateCcw, 
  Search, Sliders, ChevronDown, Layers, LayoutGrid, ShieldCheck, Settings
} from 'lucide-react';

interface HeaderProps {
  companySettings: CompanySettings;
  lang: Language;
  onToggleLang: () => void;
  onOpenCompanyModal: () => void;
  onOpenAdminPanel: () => void;
  onAddNewTool: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetDefault: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  companySettings,
  lang,
  onToggleLang,
  onOpenCompanyModal,
  onOpenAdminPanel,
  onAddNewTool,
  onExportJson,
  onImportJson,
  onResetDefault,
  onNavigateHome,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand & Company Name (Click takes to Main Menu / Home) */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group shrink-0 cursor-pointer"
              title={lang === 'ja' ? 'メインメニュー（ホーム）へ' : 'Main Menu (Home)'}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black tracking-wider text-sm shadow-md group-hover:bg-orange-700 transition">
                GB
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-stone-900 tracking-tight group-hover:text-orange-600 transition">
                    GLOOBE
                  </span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                    MANUAL
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  {lang === 'ja' ? '建築BIM操作マニュアル' : 'Architectural BIM Guide'}
                </div>
              </div>
            </button>

            {/* Editable Company Name Pill */}
            <div className="flex items-center">
              <span className="text-stone-300 mx-1 hidden sm:inline">|</span>
              <button
                onClick={onOpenCompanyModal}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100/80 border border-orange-200/70 text-orange-900 text-xs font-bold transition shadow-2xs truncate max-w-[200px] sm:max-w-xs cursor-pointer"
                title={lang === 'ja' ? '社名を変更する' : 'Edit Company Name'}
              >
                <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="truncate">
                  {lang === 'ja' ? companySettings.nameJa : companySettings.nameEn}
                </span>
                <span className="text-[10px] text-orange-600 underline font-normal hidden md:inline ml-0.5">
                  {lang === 'ja' ? '変更' : 'Edit'}
                </span>
              </button>
            </div>
          </div>

          {/* Right: Actions, Language Toggle, Admin Panel (Ribbon always on) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-orange-500 bg-white hover:bg-orange-50/70 text-xs font-semibold text-stone-700 hover:text-orange-700 transition shadow-2xs cursor-pointer"
              title={lang === 'ja' ? '管理者パネル (メニューバーやカテゴリ編集)' : 'Admin Panel (Edit Menu Tabs)'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">{lang === 'ja' ? '管理者設定' : 'Admin'}</span>
            </button>

            {/* Add New Tool Button */}
            <button
              onClick={onAddNewTool}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs hover:shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ja' ? 'ツール追加' : 'Add Tool'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 hover:border-orange-500 bg-white text-xs font-semibold text-stone-700 hover:text-orange-600 transition shadow-2xs"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-orange-600" />
              <span>{lang === 'ja' ? 'EN' : '日本語'}</span>
            </button>

            {/* More Menu (Backup/Restore/Reset) */}
            <div className="relative group">
              <button 
                className="p-1.5 rounded-lg border border-stone-300 hover:border-orange-500 bg-white text-stone-600 hover:text-stone-900 transition text-xs shadow-2xs flex items-center gap-1"
                title="Options"
              >
                <Sliders className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 hidden group-hover:block hover:block z-50 animate-in fade-in duration-100">
                <button
                  onClick={onOpenAdminPanel}
                  className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2 font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>{lang === 'ja' ? '管理者パネル (メニュー編集)' : 'Admin Panel (Tabs & Prefs)'}</span>
                </button>

                <button
                  onClick={onOpenCompanyModal}
                  className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>{lang === 'ja' ? '会社名・規程の編集' : 'Edit Company & Header'}</span>
                </button>

                <button
                  onClick={onExportJson}
                  className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-stone-400" />
                  <span>{lang === 'ja' ? 'マニュアルを保存 (JSON)' : 'Export Manual (JSON)'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-400" />
                  <span>{lang === 'ja' ? 'マニュアルを読込 (JSON)' : 'Import Manual (JSON)'}</span>
                </button>

                <div className="my-1 border-t border-stone-100"></div>

                <button
                  onClick={onResetDefault}
                  className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? '初期テンプレートに戻す' : 'Reset to Default'}</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
