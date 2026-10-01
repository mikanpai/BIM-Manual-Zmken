import React, { useState, useEffect } from 'react';
import { CompanySettings, Language } from '../types/manual';
import { Building2, X, Check, Info } from 'lucide-react';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSave: (updated: CompanySettings) => void;
  lang: Language;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  lang,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/15 backdrop-blur-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {lang === 'ja' ? '会社名・マニュアル設定' : 'Company & Manual Settings'}
              </h2>
              <p className="text-xs text-orange-100">
                {lang === 'ja' ? 'マニュアルヘッダーに表示される会社名をいつでも変更できます' : 'Customize the company name displayed in the manual'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 text-xs text-orange-900 leading-relaxed">
            <Info className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
            <div>
              {lang === 'ja' 
                ? '「??? company」の会社名をここで登録・更新できます。変更内容はブラウザに自動保存され、マニュアル上部や印刷画面に反映されます。'
                : 'Enter your company name here. It will automatically be displayed across the manual header, navigation, and export documents.'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {lang === 'ja' ? '会社名（日本語表記）' : 'Company Name (Japanese)'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nameJa}
              onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
              placeholder="例: 株式会社 ○○建築設計事務所"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {lang === 'ja' ? '会社名（英語表記 / 欧文）' : 'Company Name (English)'}
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Architect & Associates Co., Ltd."
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                {lang === 'ja' ? '部署名・グループ（日本語）' : 'Department (Japanese)'}
              </label>
              <input
                type="text"
                value={formData.departmentJa}
                onChange={(e) => setFormData({ ...formData, departmentJa: e.target.value })}
                placeholder="設計部 / BIM推進課"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                {lang === 'ja' ? '部署名・グループ（英語）' : 'Department (English)'}
              </label>
              <input
                type="text"
                value={formData.departmentEn}
                onChange={(e) => setFormData({ ...formData, departmentEn: e.target.value })}
                placeholder="BIM Design Dept."
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {lang === 'ja' ? 'マニュアル運用指針・告知メモ（日本語）' : 'Welcome Note / Policy (Japanese)'}
            </label>
            <textarea
              rows={3}
              value={formData.welcomeNoticeJa}
              onChange={(e) => setFormData({ ...formData, welcomeNoticeJa: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {lang === 'ja' ? 'マニュアル運用指針・告知メモ（英語）' : 'Welcome Note / Policy (English)'}
            </label>
            <textarea
              rows={2}
              value={formData.welcomeNoticeEn}
              onChange={(e) => setFormData({ ...formData, welcomeNoticeEn: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition"
            >
              {lang === 'ja' ? 'キャンセル' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'ja' ? '設定を保存' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
