/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, SupabaseMediaItem } from '../types/manual';

export const STORAGE_KEY_SUPABASE = 'gloobe_supabase_config_v1';
export const STORAGE_KEY_SUPABASE_MEDIA_CACHE = 'gloobe_supabase_media_cache_v1';

// Default / Initial configuration
export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
  tableName: 'gloobe_media',
  autoSync: true,
  isConnected: false,
};

// SQL Schema Definition for the Supabase Tables
export const SUPABASE_TABLE_SQL = `-- =========================================================================
-- GLOOBE BIM Manual & Tool Guide - Supabase Database Schema
-- Ready for Multiple Preview Tools per Tool & Multiple GIFs/WebMs per Preview Tool
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Table: gloobe_preview_tools
-- Purpose: Supports adding many preview tools per BIM tool, with 2-3+ animated
--          GIFs or WebM video files per preview tool box.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gloobe_preview_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id TEXT NOT NULL,                        -- e.g. 'tool-wall', 'tool-column', 'tool-slab'
    category_id TEXT DEFAULT 'architecture',      -- e.g. 'architecture', 'structure', 'openings'
    box_id TEXT NOT NULL,                         -- Client preview box identifier (e.g. 'box-wall-1')
    box_title TEXT NOT NULL,                     -- Title e.g. 'プレビューツール (外壁配置)'
    tool_name TEXT,                              -- e.g. 'GLOOBE 壁配置'
    description JSONB DEFAULT '{}'::jsonb,       -- English & Japanese description { "ja": "...", "en": "..." }
    logo_icon_url TEXT,                          -- Custom icon or logo image URL (Base64 data URL or Storage URL)
    icon_type TEXT DEFAULT 'wall',               -- CAD icon identifier
    media_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of 2-3+ GIFs/WebMs: [{ "id": "m1", "url": "...", "type": "gif"|"webm", "title": "GIF 1: 基本配置" }]
    gif_urls TEXT[] DEFAULT ARRAY[]::TEXT[],     -- Direct text array of animated GIF/WebM URLs
    steps JSONB DEFAULT '[]'::jsonb,             -- 1-2-3-4 step scrubber data
    sort_order INTEGER DEFAULT 0,                -- Display order in the tool preview list
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning-fast lookups by BIM tool
CREATE INDEX IF NOT EXISTS idx_gloobe_preview_tool_id ON public.gloobe_preview_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_gloobe_preview_box_id ON public.gloobe_preview_tools(box_id);
CREATE INDEX IF NOT EXISTS idx_gloobe_preview_sort ON public.gloobe_preview_tools(sort_order ASC, created_at ASC);

-- Row Level Security (RLS) for gloobe_preview_tools
ALTER TABLE public.gloobe_preview_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on preview tools" 
ON public.gloobe_preview_tools FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update on preview tools" 
ON public.gloobe_preview_tools FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 2. Table: gloobe_media
-- Purpose: Individual media assets (GIFs, WebM videos, CAD drawings)
--          linked to tools, tabs, or preview boxes.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gloobe_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id TEXT,                                 -- e.g. 'tool-wall', 'tool-column'
    category_id TEXT NOT NULL,                    -- e.g. 'architecture', 'structure'
    sub_option_id TEXT,                           -- Optional sub-option ID
    preview_box_id TEXT,                          -- Links media to a specific preview tool box
    preview_box_title TEXT,                       -- Name of the preview tool
    title TEXT NOT NULL,                          -- Headline e.g. 'GIF 1: 壁配置の連続入力'
    description TEXT,                             -- CAD instruction or explanation
    media_url TEXT NOT NULL,                      -- Direct URL to GIF, WebM video, or Image
    media_type TEXT NOT NULL CHECK (media_type IN ('gif', 'image', 'webm', 'video', 'webp')),
    caption TEXT,                                 -- Parameter note or tip
    thumbnail_url TEXT,                           -- Poster/thumbnail for videos
    sort_order INTEGER DEFAULT 0,                 -- Sort order within tool/preview box
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Backward compatibility: add columns if table already existed, and update CHECK constraint for webp
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gloobe_media' AND column_name = 'preview_box_id') THEN
        ALTER TABLE public.gloobe_media ADD COLUMN preview_box_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gloobe_media' AND column_name = 'preview_box_title') THEN
        ALTER TABLE public.gloobe_media ADD COLUMN preview_box_title TEXT;
    END IF;

    -- Update CHECK constraint on gloobe_media to include 'webp'
    ALTER TABLE public.gloobe_media DROP CONSTRAINT IF EXISTS gloobe_media_media_type_check;
    ALTER TABLE public.gloobe_media ADD CONSTRAINT gloobe_media_media_type_check 
        CHECK (media_type IN ('gif', 'image', 'webm', 'video', 'webp'));
END $$;

CREATE INDEX IF NOT EXISTS idx_gloobe_media_category ON public.gloobe_media(category_id);
CREATE INDEX IF NOT EXISTS idx_gloobe_media_tool ON public.gloobe_media(tool_id);
CREATE INDEX IF NOT EXISTS idx_gloobe_media_preview_box ON public.gloobe_media(preview_box_id);
CREATE INDEX IF NOT EXISTS idx_gloobe_media_sort ON public.gloobe_media(sort_order ASC, created_at DESC);

ALTER TABLE public.gloobe_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on gloobe_media" 
ON public.gloobe_media FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update on gloobe_media" 
ON public.gloobe_media FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 3. Sample Seed Data: Preview Tool with 3 GIFs / WebMs Demonstrations
-- -------------------------------------------------------------------------
INSERT INTO public.gloobe_preview_tools (
    tool_id, category_id, box_id, box_title, tool_name, icon_type, media_items, gif_urls, sort_order
) VALUES
(
    'tool-wall',
    'architecture',
    'box-wall-multi-gif',
    'プレビューツール 1 (壁配置・包絡・3D連動 GIF集)',
    'GLOOBE 壁配置 (連続入力・交差包絡)',
    'wall',
    '[
      {
        "id": "gif-wall-1",
        "url": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
        "type": "gif",
        "title": "GIF 1: 通り芯クリックによる壁の連続入力",
        "caption": "通り芯を連続クリックするだけで壁線が自動生成されます"
      },
      {
        "id": "gif-wall-2",
        "url": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
        "type": "gif",
        "title": "GIF 2: 壁コーナー交差部のリアルタイム自動包絡",
        "caption": "T字・十字・L字の接合部が瞬時に包絡処理されます"
      },
      {
        "id": "webm-wall-3",
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "type": "webm",
        "title": "WebM 3: 階高連動と3Dビューリアルタイム同期",
        "caption": "平面図の入力が瞬時に3D躯体モデルへ反映されます"
      }
    ]'::jsonb,
    ARRAY[
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    1
),
(
    'tool-wall',
    'architecture',
    'box-wall-specs',
    'プレビューツール 2 (躯体仕様・断熱複合壁)',
    'GLOOBE 壁仕様設定',
    'wall',
    '[
      {
        "id": "gif-wall-spec-1",
        "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "type": "gif",
        "title": "GIF 1: RC外壁・断熱層複合壁のパラメータ入力",
        "caption": "壁厚・仕上オフセットの即時プレビュー"
      },
      {
        "id": "gif-wall-spec-2",
        "url": "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80",
        "type": "gif",
        "title": "GIF 2: 断面詳細図と配筋クリアランスの確認",
        "caption": "意匠設計と構造設計の整合性を確保"
      }
    ]'::jsonb,
    ARRAY[
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80'
    ],
    2
);
`;

// Built-in high quality demonstration media (used when Supabase is connecting or before data is added)
export const DEFAULT_SAMPLE_MEDIA: SupabaseMediaItem[] = [
  {
    id: 'demo-media-1',
    tool_id: 'tool-wall',
    category_id: 'architecture',
    title: '壁配置とコーナー自動包絡（リアルタイムCADシミュレーション）',
    description: '通り芯をクリックして外壁・内壁を入力すると、交差部が即座に包絡処理され3Dモデルと連動します。',
    media_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    caption: 'GLOOBE 意匠・躯体モデリング基準',
    sort_order: 1,
  },
  {
    id: 'demo-media-2',
    tool_id: 'tool-wall',
    category_id: 'architecture',
    title: 'RC外壁・断熱層複合壁の仕様確認',
    description: '外壁構成層（RC躯体 + 押出ポリスチレンフォーム断熱 + 通気胴縁 + サイディング）のプロパティ設定ガイドです。',
    media_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    caption: '壁厚200mm + 外断熱50mm',
    sort_order: 2,
  },
  {
    id: 'demo-media-3',
    tool_id: 'tool-column',
    category_id: 'architecture',
    title: '柱配置・通り芯交点スナップモデリング',
    description: 'グリッド交点への高速配置と、階高連動による天端レベル自動追従機能の検証です。',
    media_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    caption: 'RC柱 800x800 / 階高 FL+4000',
    sort_order: 3,
  },
  {
    id: 'demo-media-4',
    tool_id: 'tool-slab',
    category_id: 'architecture',
    title: 'スラブ・床伏モデリングと境界自動検知',
    description: '壁で囲まれた閉空間の内側をクリックするだけで、スラブ領域が瞬時に生成されます。',
    media_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    caption: '床天端レベル: 1FL + 0mm (天端基準)',
    sort_order: 4,
  },
  {
    id: 'demo-media-5',
    tool_id: 'tool-door',
    category_id: 'openings',
    title: '建具（ドア・サッシ）の壁開口連動モデリング',
    description: '壁上への配置と同時に開口が自動穿孔され、建具表との連携・集計が行われます。',
    media_url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    caption: '片開きスチール枠ドア W:850 x H:2100',
    sort_order: 1,
  },
  {
    id: 'demo-media-6',
    tool_id: 'tool-beam',
    category_id: 'structure',
    title: '構造大梁・小梁の架設と構造伏図連動',
    description: '柱間スパンへの大梁架設および床荷重を支持する小梁均等配置の操作ガイドです。',
    media_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    caption: '梁せい・梁幅指定 / 梁天端レベル拘束',
    sort_order: 1,
  },
  {
    id: 'demo-media-7',
    tool_id: 'tool-finish-wall',
    category_id: 'finishes',
    title: '内装仕上材・部屋境界自動展開',
    description: '部屋ゾーンの用途（居室・廊下・水回り）に応じた仕上コードを一括展開します。',
    media_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    caption: 'ビニルクロス貼 / プラスターボード12.5mm下地',
    sort_order: 1,
  }
];

// Helper to get configuration securely from environment variables (.env)
export function getSupabaseConfig(): SupabaseConfig {
  const url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  return {
    url,
    anonKey,
    tableName: 'gloobe_media',
    autoSync: true,
    isConnected: Boolean(url && anonKey),
  };
}

// Dummy helper for backwards compatibility
export function saveSupabaseConfig(_config: SupabaseConfig): void {
  // Credentials are kept secure in .env only
}

// Singleton client cache
let supabaseClientInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const currentConfig = config || getSupabaseConfig();
  if (!currentConfig.url || !currentConfig.anonKey) {
    return null;
  }

  const key = `${currentConfig.url}___${currentConfig.anonKey}`;
  if (supabaseClientInstance && currentConfigKey === key) {
    return supabaseClientInstance;
  }

  try {
    supabaseClientInstance = createClient(currentConfig.url, currentConfig.anonKey, {
      auth: {
        persistSession: false,
      },
    });
    currentConfigKey = key;
    return supabaseClientInstance;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

// Test Supabase Connection
export async function testSupabaseConnection(
  config?: SupabaseConfig
): Promise<{ success: boolean; message: string; rowCount?: number }> {
  const conf = config || getSupabaseConfig();
  if (!conf.url || !conf.anonKey) {
    return {
      success: false,
      message: 'Supabase URL または Anon Key が未設定です。',
    };
  }

  const client = getSupabaseClient(conf);
  if (!client) {
    return {
      success: false,
      message: 'Supabase クライアントの初期化に失敗しました。URLの形式を確認してください。',
    };
  }

  try {
    const tableName = conf.tableName || 'gloobe_media';
    const { data, error, count } = await client
      .from(tableName)
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      const isMissingTable = error.code === 'PGRST205' || error.message.includes('schema cache');
      const friendlyMsg = isMissingTable
        ? `Supabase接続は正常ですが、テーブル「${tableName}」が未作成です。下の「SQLスキーマをコピー」を押してSupabaseのSQL EditorでRUNしてください。`
        : `エラー: ${error.message} (コード: ${error.code})。`;
      return {
        success: false,
        message: friendlyMsg,
      };
    }

    return {
      success: true,
      message: `接続成功！ テーブル「${tableName}」から正常にデータを取得できます。`,
      rowCount: count ?? (data?.length || 0),
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `ネットワーク接続エラー: ${errMsg}`,
    };
  }
}

// Fetch media from Supabase with fallback to cache/defaults
export async function fetchSupabaseMedia(options?: {
  categoryId?: string;
  toolId?: string;
  mediaType?: 'gif' | 'image' | 'webm' | 'video' | 'webp';
}): Promise<{ media: SupabaseMediaItem[]; fromSupabase: boolean; error?: string }> {
  const conf = getSupabaseConfig();
  const client = getSupabaseClient(conf);

  if (!client) {
    // Return sample media filtered by options
    const filtered = filterSampleMedia(DEFAULT_SAMPLE_MEDIA, options);
    return { media: filtered, fromSupabase: false };
  }

  try {
    const tableName = conf.tableName || 'gloobe_media';
    let query = client.from(tableName).select('*').order('sort_order', { ascending: true });

    if (options?.categoryId && options.categoryId !== 'all') {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.toolId) {
      query = query.eq('tool_id', options.toolId);
    }
    if (options?.mediaType) {
      query = query.eq('media_type', options.mediaType);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[Supabase] Query error:', error.message);
      const filtered = filterSampleMedia(DEFAULT_SAMPLE_MEDIA, options);
      return { media: filtered, fromSupabase: false, error: error.message };
    }

    if (data && data.length > 0) {
      // Map and format rows
      const items: SupabaseMediaItem[] = data.map((row) => ({
        id: String(row.id),
        tool_id: row.tool_id || null,
        category_id: row.category_id,
        sub_option_id: row.sub_option_id || null,
        title: row.title || 'GLOOBE BIM Media',
        description: row.description || null,
        media_url: row.media_url,
        media_type: row.media_type || 'image',
        caption: row.caption || null,
        thumbnail_url: row.thumbnail_url || null,
        sort_order: row.sort_order ?? 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      // Cache locally
      try {
        localStorage.setItem(STORAGE_KEY_SUPABASE_MEDIA_CACHE, JSON.stringify(items));
      } catch {
        // ignore cache write error
      }

      return { media: items, fromSupabase: true };
    }

    // If table is empty, return default sample items
    const filtered = filterSampleMedia(DEFAULT_SAMPLE_MEDIA, options);
    return { media: filtered, fromSupabase: true };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[Supabase] Network exception:', errMsg);
    const filtered = filterSampleMedia(DEFAULT_SAMPLE_MEDIA, options);
    return { media: filtered, fromSupabase: false, error: errMsg };
  }
}

// Add or update a media item in Supabase
export async function saveMediaItemToSupabase(
  item: Omit<SupabaseMediaItem, 'id'> & { id?: string }
): Promise<{ success: boolean; item?: SupabaseMediaItem; message: string }> {
  const conf = getSupabaseConfig();
  const client = getSupabaseClient(conf);

  if (!client) {
    return {
      success: false,
      message: 'Supabaseが設定されていません。管理者パネルからURLとAnon Keyを設定してください。',
    };
  }

  try {
    const tableName = conf.tableName || 'gloobe_media';
    const payload = {
      ...(item.id ? { id: item.id } : {}),
      tool_id: item.tool_id || null,
      category_id: item.category_id || 'architecture',
      sub_option_id: item.sub_option_id || null,
      title: item.title,
      description: item.description || null,
      media_url: item.media_url,
      media_type: item.media_type,
      caption: item.caption || null,
      thumbnail_url: item.thumbnail_url || null,
      sort_order: item.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from(tableName)
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return { success: false, message: `保存失敗: ${error.message}` };
    }

    return {
      success: true,
      item: data as SupabaseMediaItem,
      message: 'Supabaseにメディアを正常に保存しました！',
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `保存例外: ${errMsg}` };
  }
}

// Helper to filter sample media
function filterSampleMedia(
  items: SupabaseMediaItem[],
  options?: {
    categoryId?: string;
    toolId?: string;
    mediaType?: 'gif' | 'image' | 'webm' | 'video' | 'webp';
  }
): SupabaseMediaItem[] {
  return items.filter((item) => {
    if (options?.categoryId && options.categoryId !== 'all' && item.category_id !== options.categoryId) {
      return false;
    }
    if (options?.toolId && item.tool_id !== options.toolId) {
      return false;
    }
    if (options?.mediaType && item.media_type !== options.mediaType) {
      return false;
    }
    return true;
  });
}

// -----------------------------------------------------------------------------
// Preview Tools (Multiple Preview Tools per Tool, 2-3+ GIFs / WebMs per Preview)
// -----------------------------------------------------------------------------

import { PreviewBoxItem, PreviewMediaItem } from '../types/manual';

export async function fetchPreviewToolsFromSupabase(
  toolId: string
): Promise<{ previewBoxes: PreviewBoxItem[]; fromSupabase: boolean; error?: string }> {
  const conf = getSupabaseConfig();
  const client = getSupabaseClient(conf);

  if (!client || !toolId) {
    return { previewBoxes: [], fromSupabase: false };
  }

  try {
    const { data, error } = await client
      .from('gloobe_preview_tools')
      .select('*')
      .eq('tool_id', toolId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('[Supabase] fetchPreviewTools error:', error.message);
      return { previewBoxes: [], fromSupabase: false, error: error.message };
    }

    if (data && data.length > 0) {
      const boxes: PreviewBoxItem[] = data.map((row) => {
        let mediaItems: PreviewMediaItem[] = [];
        try {
          if (Array.isArray(row.media_items)) {
            mediaItems = row.media_items;
          } else if (typeof row.media_items === 'string') {
            mediaItems = JSON.parse(row.media_items);
          }
        } catch {
          mediaItems = [];
        }

        const gifUrls: string[] = Array.isArray(row.gif_urls)
          ? row.gif_urls
          : mediaItems.map((m) => m.url).filter(Boolean);

        return {
          id: row.box_id || row.id,
          boxTitle: {
            ja: row.box_title || 'プレビューツール',
            en: row.box_title || 'Preview Tool',
          },
          toolName: row.tool_name ? { ja: row.tool_name, en: row.tool_name } : undefined,
          description: row.description || undefined,
          logoIconUrl: row.logo_icon_url || undefined,
          iconType: row.icon_type || 'wall',
          gifUrl: gifUrls[0] || (mediaItems[0]?.url) || undefined,
          gifUrls,
          mediaList: mediaItems,
          steps: Array.isArray(row.steps) ? row.steps : undefined,
        };
      });

      return { previewBoxes: boxes, fromSupabase: true };
    }

    return { previewBoxes: [], fromSupabase: true };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { previewBoxes: [], fromSupabase: false, error: errMsg };
  }
}

export async function savePreviewToolToSupabase(
  box: PreviewBoxItem,
  toolId: string,
  categoryId: string = 'architecture',
  sortOrder: number = 0
): Promise<{ success: boolean; message: string }> {
  const conf = getSupabaseConfig();
  const client = getSupabaseClient(conf);

  if (!client) {
    return { success: false, message: 'Supabaseが設定されていません。' };
  }

  try {
    // Consolidate mediaList and gifUrls
    let mediaItems: PreviewMediaItem[] = box.mediaList && box.mediaList.length > 0
      ? box.mediaList
      : [];

    if (mediaItems.length === 0) {
      if (box.gifUrls && box.gifUrls.length > 0) {
        mediaItems = box.gifUrls.map((url, idx) => ({
          id: `media-${Date.now()}-${idx}`,
          url,
          type: url.includes('.webm') || url.includes('.mp4') ? 'webm' : (url.includes('.webp') ? 'webp' : 'gif'),
          title: { ja: `GIF / 動画 / WebP ${idx + 1}`, en: `Media ${idx + 1}` },
        }));
      } else if (box.gifUrl) {
        mediaItems = [{
          id: `media-${Date.now()}-0`,
          url: box.gifUrl,
          type: box.gifUrl.includes('.webm') || box.gifUrl.includes('.mp4') ? 'webm' : (box.gifUrl.includes('.webp') ? 'webp' : 'gif'),
          title: { ja: 'デモ 1 (GIF/WebP)', en: 'Demo 1' },
        }];
      }
    }

    const gifUrls = mediaItems.map((m) => m.url).filter(Boolean);

    const payload = {
      tool_id: toolId,
      category_id: categoryId,
      box_id: box.id,
      box_title: box.boxTitle?.ja || 'プレビューツール',
      tool_name: box.toolName?.ja || undefined,
      description: box.description || null,
      logo_icon_url: box.logoIconUrl || null,
      icon_type: box.iconType || 'wall',
      media_items: mediaItems,
      gif_urls: gifUrls,
      steps: box.steps || [],
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('gloobe_preview_tools')
      .upsert(payload, { onConflict: 'box_id' });

    if (error) {
      // If no unique constraint on box_id, fallback to insert or update by box_id
      const { error: insertErr } = await client
        .from('gloobe_preview_tools')
        .insert(payload);

      if (insertErr) {
        return { success: false, message: `保存失敗: ${insertErr.message}` };
      }
    }

    return { success: true, message: 'プレビューツールをSupabaseに保存しました！' };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `保存例外: ${errMsg}` };
  }
}

export async function saveAllPreviewToolsToSupabase(
  previewBoxes: PreviewBoxItem[],
  toolId: string,
  categoryId: string = 'architecture'
): Promise<{ success: boolean; count: number; message: string }> {
  let count = 0;
  for (let i = 0; i < previewBoxes.length; i++) {
    const res = await savePreviewToolToSupabase(previewBoxes[i], toolId, categoryId, i);
    if (res.success) count++;
  }
  return {
    success: count > 0,
    count,
    message: `${count}件のプレビューツールをSupabaseに同期しました。`,
  };
}
