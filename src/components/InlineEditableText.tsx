import React, { useEffect, useState } from 'react';
import { Check, Edit3, X } from 'lucide-react';
import { Language } from '../types/manual';

interface InlineEditableTextProps {
  /** Text currently shown (in the active language). */
  value: string;
  lang: Language;
  /** Called with the new text for the active language. Omit to make the text read-only. */
  onSave?: (text: string) => void;
  className?: string;
}

/** Text with a small pencil button: click it to edit in place (Ctrl+Enter = save, Esc = cancel). */
export const InlineEditableText: React.FC<InlineEditableTextProps> = ({ value, lang, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // Leave edit mode when the language or the underlying text changes (e.g. another page).
  useEffect(() => { setIsEditing(false); }, [lang, value]);

  const startEdit = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const save = () => {
    if (draft !== value) onSave?.(draft);
    setIsEditing(false);
  };

  if (isEditing && onSave) {
    return (
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsEditing(false);
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
          }}
          rows={Math.max(4, draft.split('\n').length + 1)}
          autoFocus
          placeholder={lang === 'ja' ? '機能概要を入力' : 'Enter the overview'}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm leading-relaxed text-stone-700 focus:border-orange-500 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            className="flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
          >
            <Check className="h-3.5 w-3.5" />
            {lang === 'ja' ? '保存' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-600 transition hover:border-stone-400"
          >
            <X className="h-3.5 w-3.5" />
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>
          <span className="hidden text-[10px] text-stone-400 sm:inline">
            Ctrl+Enter = {lang === 'ja' ? '保存' : 'Save'} / Esc = {lang === 'ja' ? '取消' : 'Cancel'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <p className={`flex-1 ${className ?? ''}`}>{value}</p>
      {onSave && (
        <button
          type="button"
          onClick={startEdit}
          className="shrink-0 rounded-lg border border-stone-200 bg-white p-1.5 text-stone-500 transition hover:border-orange-500 hover:text-orange-600"
          title={lang === 'ja' ? 'このテキストだけ編集' : 'Edit this text only'}
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
