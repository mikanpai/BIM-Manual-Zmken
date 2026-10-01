/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SupabaseMediaItem, Language } from '../types/manual';
import { fetchSupabaseMedia, getSupabaseConfig } from '../lib/supabase';
import { 
  Film, Image as ImageIcon, Sparkles, RefreshCw, 
  ExternalLink, Play, CheckCircle2, AlertCircle, Database
} from 'lucide-react';

interface SupabaseMediaGalleryProps {
  categoryId?: string;
  categoryName?: { ja: string; en: string };
  toolId?: string;
  toolName?: { ja: string; en: string };
  lang: Language;
  onOpenLightbox?: (url: string, title: string, caption?: string, isGif?: boolean) => void;
  onOpenAdminSupabase?: () => void;
  title?: { ja: string; en: string };
  compact?: boolean;
}

export const SupabaseMediaGallery: React.FC<SupabaseMediaGalleryProps> = ({
  categoryId,
  categoryName,
  toolId,
  toolName,
  lang,
  onOpenLightbox,
  onOpenAdminSupabase,
  title,
  compact = false,
}) => {
  const [mediaList, setMediaList] = useState<SupabaseMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFromSupabase, setIsFromSupabase] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'gif' | 'webm' | 'image'>('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const config = getSupabaseConfig();
  const isConfigured = Boolean(config.url && config.anonKey);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetchSupabaseMedia({
        categoryId: categoryId || 'all',
        toolId: toolId,
        mediaType: activeFilter !== 'all' ? activeFilter : undefined,
      });
      setMediaList(res.media);
      setIsFromSupabase(res.fromSupabase && isConfigured);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [categoryId, toolId, activeFilter]);

  const filteredMedia = mediaList.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.media_type === activeFilter;
  });

  return (
    <div className={`rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs ${compact ? 'p-3' : 'p-5'}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shadow-2xs">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-stone-900">
                {title 
                  ? (lang === 'ja' ? title.ja : title.en)
                  : (categoryName 
                      ? `${lang === 'ja' ? categoryName.ja : categoryName.en} ${lang === 'ja' ? 'のGIF・動画 (WebM)・施工図' : 'Media & WebM Guides'}`
                      : (lang === 'ja' ? 'GLOOBE BIM メディアライブラリ (GIF / WebM / 画像)' : 'BIM Media Library (GIF / WebM / Images)'))
                }
              </h3>

              {/* Supabase Status Badge */}
              <div 
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isFromSupabase
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
                title={isFromSupabase ? 'Supabase Database Connected' : 'Demo Sample Media Active'}
              >
                <Database className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{isFromSupabase ? 'Supabase Live' : (lang === 'ja' ? 'サンプル連動' : 'Sample Data')}</span>
              </div>
            </div>
            
            <p className="text-[11px] text-stone-500 mt-0.5">
              {lang === 'ja'
                ? 'Supabaseテーブル「gloobe_media」から取得したGIFアニメーション、WebM操作動画、仕様図面を表示中'
                : 'Showing GIFs, WebM videos, and CAD graphics fetched from Supabase'}
            </p>
          </div>
        </div>

        {/* Action Controls & Media Type Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Media Type Filter Buttons */}
          <div className="flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200 text-[10px] font-semibold">
            {(['all', 'gif', 'webm', 'image'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeFilter === filterKey
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {filterKey === 'all' && (lang === 'ja' ? 'すべて' : 'All')}
                {filterKey === 'gif' && 'GIF'}
                {filterKey === 'webm' && 'WebM 動画'}
                {filterKey === 'image' && (lang === 'ja' ? '画像・図面' : 'Images')}
              </button>
            ))}
          </div>

          <button
            onClick={loadMedia}
            disabled={loading}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-orange-600 transition"
            title={lang === 'ja' ? '再読み込み' : 'Refresh from Supabase'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>

          {onOpenAdminSupabase && (
            <button
              onClick={onOpenAdminSupabase}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-700 border border-stone-200 text-[10px] font-semibold transition"
              title={lang === 'ja' ? 'Supabase設定とSQLスキーマを確認' : 'Supabase Config & Schema'}
            >
              <Database className="w-3 h-3 text-orange-600" />
              <span>{lang === 'ja' ? 'テーブル設定' : 'Supabase Table'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Cards Grid */}
      <div className="pt-4">
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((media) => {
              const isWebM = media.media_type === 'webm' || media.media_type === 'video' || media.media_url.endsWith('.webm') || media.media_url.endsWith('.mp4');
              const isGif = media.media_type === 'gif' || media.media_url.endsWith('.gif');

              return (
                <div
                  key={media.id}
                  className="group rounded-xl border border-stone-200 bg-stone-50/50 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Media Viewport */}
                  <div className="relative aspect-video bg-stone-900 overflow-hidden flex items-center justify-center">
                    {isWebM ? (
                      <video
                        src={media.media_url}
                        poster={media.thumbnail_url || undefined}
                        controls
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                        onPlay={() => setPlayingVideoId(media.id)}
                      />
                    ) : (
                      <img
                        src={media.media_url}
                        alt={media.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => {
                          if (onOpenLightbox) {
                            onOpenLightbox(media.media_url, media.title, media.caption || undefined, isGif);
                          }
                        }}
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2 left-2 pointer-events-none">
                      {isWebM ? (
                        <span className="px-2 py-0.5 rounded bg-sky-600/90 backdrop-blur-xs text-white text-[9px] font-bold shadow-xs flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-white" />
                          WebM
                        </span>
                      ) : isGif ? (
                        <span className="px-2 py-0.5 rounded bg-orange-600/90 backdrop-blur-xs text-white text-[9px] font-extrabold shadow-xs">
                          GIF
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-stone-800/80 backdrop-blur-xs text-white text-[9px] font-medium shadow-xs flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          IMAGE
                        </span>
                      )}
                    </div>

                    {/* Zoom / Lightbox Trigger Button */}
                    {!isWebM && onOpenLightbox && (
                      <button
                        onClick={() => onOpenLightbox(media.media_url, media.title, media.caption || undefined, isGif)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition shadow-xs flex items-center gap-1"
                        title={lang === 'ja' ? '拡大表示' : 'Expand Image'}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Caption & Metadata */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5 bg-white">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 line-clamp-1 group-hover:text-orange-600 transition">
                        {media.title}
                      </h4>
                      {media.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {media.description}
                        </p>
                      )}
                    </div>

                    {media.caption && (
                      <div className="pt-1.5 border-t border-stone-100 flex items-center gap-1 text-[10px] text-orange-700 font-semibold truncate">
                        <Sparkles className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{media.caption}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-stone-300 text-center space-y-2 bg-stone-50/50">
            <Film className="w-6 h-6 text-stone-400 mx-auto" />
            <div className="text-xs font-bold text-stone-700">
              {lang === 'ja' ? '該当するメディアデータがありません' : 'No media items found'}
            </div>
            <p className="text-[11px] text-stone-500 max-w-md mx-auto">
              {lang === 'ja'
                ? 'Supabaseテーブル「gloobe_media」にデータを追加するか、管理者設定からSupabase連携を行ってください。'
                : 'Add rows to your Supabase "gloobe_media" table or configure your connection in Admin Panel.'}
            </p>
            {onOpenAdminSupabase && (
              <button
                onClick={onOpenAdminSupabase}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white font-bold text-xs shadow-xs hover:bg-orange-700 transition"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{lang === 'ja' ? 'Supabase設定 & SQLスキーマを開く' : 'Open Supabase Settings'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
