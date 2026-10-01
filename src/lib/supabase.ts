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

// SQL Schema Definition for the Supabase Table
export const SUPABASE_TABLE_SQL = `-- =========================================================================
-- GLOOBE BIM Manual & Tool Guide - Supabase Table Schema
-- Table: gloobe_media (Stores GIFs, Images, WebM Videos for manual tabs)
-- =========================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.gloobe_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id TEXT,                        -- e.g. 'tool-wall', 'tool-column', 'tool-slab', 'tool-door'
    category_id TEXT NOT NULL,           -- e.g. 'architecture', 'structure', 'openings', 'finishes', 'drawing'
    sub_option_id TEXT,                  -- Optional: sub-option ID like 'sub-wall-rc', 'sub-door-single'
    title TEXT NOT NULL,                 -- Media title / step headline
    description TEXT,                    -- Guidance, CAD instruction, or description
    media_url TEXT NOT NULL,             -- Direct URL to GIF, WebM video, or Image
    media_type TEXT NOT NULL CHECK (media_type IN ('gif', 'image', 'webm', 'video')),
    caption TEXT,                        -- CAD tip, parameter note, or shortcut reminder
    thumbnail_url TEXT,                  -- Optional thumbnail/poster image (especially for webm)
    sort_order INTEGER DEFAULT 0,        -- Display sort order in tab
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes for high-speed queries by tab / category and tool
CREATE INDEX IF NOT EXISTS idx_gloobe_media_category ON public.gloobe_media(category_id);
CREATE INDEX IF NOT EXISTS idx_gloobe_media_tool ON public.gloobe_media(tool_id);
CREATE INDEX IF NOT EXISTS idx_gloobe_media_sort ON public.gloobe_media(sort_order ASC, created_at DESC);

-- 3. Enable Row Level Security (RLS) and grant read access to anyone
ALTER TABLE public.gloobe_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" 
ON public.gloobe_media 
FOR SELECT 
USING (true);

-- Optional: Allow public insert/update (or restrict with authenticated users in production)
CREATE POLICY "Allow anonymous insert/update for manual editors" 
ON public.gloobe_media 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 4. Sample Seed Data (GLOOBE BIM Architectural GIFs, WebM & Diagrams)
INSERT INTO public.gloobe_media (
    tool_id, category_id, sub_option_id, title, description, media_url, media_type, caption, sort_order
) VALUES
(
    'tool-wall',
    'architecture',
    NULL,
    '壁配置の連続入力と自動包絡シミュレーション',
    '通り芯を連続クリックするだけで、外壁・内壁のコーナー交差部がリアルタイムにT字・十字・L字包絡されます。',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    'image',
    '基準高さ: FL+0 〜 天端SL自動拘束',
    1
),
(
    'tool-wall',
    'architecture',
    'sub-wall-rc',
    'RC外壁・断熱複合壁の断面構成と配筋クリアランス',
    'GLOOBEの躯体プロパティで仕上層厚と躯体芯オフセットを事前定義します。',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    'image',
    '壁厚200mm + 外断熱50mm + 通気層',
    2
),
(
    'tool-column',
    'architecture',
    NULL,
    'RC・S造 柱配置と階層自動延伸デモ',
    '通り芯交点スナップにより、多層階の柱を一括配置・天端レベル拘束を行います。',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'image',
    '柱芯自動スナップ [F3] 有効',
    3
),
(
    'tool-slab',
    'architecture',
    NULL,
    'スラブ・土間床の境界自動検知モデリング',
    '壁で囲まれた閉空間の内側をクリックするだけで、スラブ領域が瞬時に生成されます。',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'image',
    '床レベル設定: 1FL + 0mm (天端基準)',
    4
),
(
    'tool-door',
    'openings',
    NULL,
    '建具（片開きドア・引戸）の壁開口自動連動',
    '壁部材上に建具を配置すると、開口部の穿孔と建具枠・沓摺が自動生成され建具表に集計されます。',
    'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80',
    'image',
    '内法寸法: W:850 x H:2100',
    1
),
(
    'tool-window',
    'openings',
    NULL,
    'アルミサッシ・カーテンウォールの配置・割付',
    '腰壁高さ（CH/FL）と開口枠の見込み寸法を指定し、壁芯・内法へ位置決めします。',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'image',
    '引違いサッシ2枚建 窓台FL+800',
    2
),
(
    'tool-beam',
    'structure',
    NULL,
    '大梁・小梁の配置および梁伏図連動',
    '柱間スパンへの大梁架設および床荷重を支持する小梁均等配置。構造図面へ自動反映されます。',
    'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80',
    'image',
    '梁せい・梁幅指定 / 梁天端レベル拘束',
    1
),
(
    'tool-finish-wall',
    'finishes',
    NULL,
    '内装壁・天井仕上材の部屋境界自動割り付け',
    '部屋ゾーンの用途（居室・廊下・水回り）に応じた仕上コードを一括展開します。',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'image',
    'クロス貼 / プラスターボード12.5mm下地',
    1
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
  mediaType?: 'gif' | 'image' | 'webm' | 'video';
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
    mediaType?: 'gif' | 'image' | 'webm' | 'video';
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
