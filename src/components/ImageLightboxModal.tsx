import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';
import { Language } from '../types/manual';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  caption?: string;
  isGif?: boolean;
  lang: Language;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
  isGif,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-50 border-b border-stone-200 text-stone-800">
          <div className="flex items-center gap-2.5">
            {isGif && (
              <span className="px-2 py-0.5 rounded bg-orange-600 text-white text-xs font-bold shadow-xs">
                GIF 動態プレビュー
              </span>
            )}
            <h3 className="font-bold text-sm truncate max-w-md text-stone-900">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition"
              title={lang === 'ja' ? '新しいタブで開く' : 'Open in new tab'}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative flex-1 flex items-center justify-center p-4 bg-stone-100/70 overflow-hidden min-h-[350px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Footer Caption */}
        {caption && (
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span>{caption}</span>
            <span className="text-[11px] text-stone-400">
              {lang === 'ja' ? 'GLOOBE CAD マニュアル詳細ビュー' : 'GLOOBE CAD Manual Detail View'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
