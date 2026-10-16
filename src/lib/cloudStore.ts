/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Real relational storage for the manual (one column per field, one row per item).
 *
 *   manual_categories     ribbon tabs
 *   manual_tools          one row per tool  (id, category_id, grouping_ja, name_ja, ...)
 *   manual_sub_options    one row per sub-option           (tool_id -> manual_tools.id)
 *   manual_preview_boxes  one row per preview box          (owner_kind + owner_key)
 *   manual_steps          one row per step                 (owner_kind + owner_key)
 *   manual_tool_media     one row per media item of a tool
 *   manual_preview_media  one row per GIF/WebM of a preview box
 *   manual_company        company branding (single row, id = 'default')
 *
 * Only rows that actually changed are written, and only rows this browser
 * previously synced can be deleted, so a stale tab can't wipe other people's work.
 */

import type {
  CategoryInfo, CompanySettings, MediaItem, PreviewBoxItem, PreviewMediaItem,
  StepItem, SubOptionItem, ToolItem,
} from '../types/manual';
import { getSupabaseClient } from './supabase';

export interface ManualSnapshot {
  categories: CategoryInfo[];
  tools: ToolItem[];
  company: CompanySettings | null;
}

export const EMPTY_SNAPSHOT: ManualSnapshot = { categories: [], tools: [], company: null };

type Row = Record<string, any>;

// Parents first (upserts run in this order, deletes in reverse).
const TABLES = [
  'manual_categories',
  'manual_tools',
  'manual_sub_options',
  'manual_preview_boxes',
  'manual_steps',
  'manual_tool_media',
  'manual_preview_media',
  'manual_company',
] as const;
type TableName = (typeof TABLES)[number];
type RowSets = Record<TableName, Row[]>;

const PK: Record<TableName, string> = {
  manual_categories: 'id',
  manual_tools: 'id',
  manual_sub_options: 'key',
  manual_preview_boxes: 'key',
  manual_steps: 'key',
  manual_tool_media: 'key',
  manual_preview_media: 'key',
  manual_company: 'id',
};

const emptyRowSets = (): RowSets =>
  Object.fromEntries(TABLES.map((t) => [t, [] as Row[]])) as unknown as RowSets;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
type Bi = { ja: string; en: string };
const nul = <T,>(v: T | undefined | null): T | null => (v === undefined ? null : v);
const biCols = (prefix: string, v?: Bi | null): Row => ({
  [`${prefix}_ja`]: v ? v.ja ?? '' : null,
  [`${prefix}_en`]: v ? v.en ?? '' : null,
});
const biReq = (row: Row, prefix: string): Bi => ({
  ja: row[`${prefix}_ja`] ?? '',
  en: row[`${prefix}_en`] ?? '',
});
const biOpt = (row: Row, prefix: string): Bi | undefined =>
  row[`${prefix}_ja`] == null && row[`${prefix}_en`] == null ? undefined : biReq(row, prefix);
const compact = <T extends Record<string, any>>(obj: T): T => {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
};
const bySort = (a: Row, b: Row) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

class KeyBag {
  private seen = new Set<string>();
  make(base: string): string {
    let key = base;
    let i = 2;
    while (this.seen.has(key)) key = `${base}~${i++}`;
    this.seen.add(key);
    return key;
  }
}

// ---------------------------------------------------------------------------
// App objects -> table rows
// ---------------------------------------------------------------------------
export function toRows(snapshot: ManualSnapshot): RowSets {
  const rows = emptyRowSets();
  const bag = new KeyBag();

  const addSteps = (kind: string, ownerKey: string, toolId: string, steps?: StepItem[]) => {
    steps?.forEach((st, i) => {
      rows.manual_steps.push({
        key: bag.make(`${ownerKey}/step/${st.id}`),
        item_id: st.id,
        owner_kind: kind,
        owner_key: ownerKey,
        tool_id: toolId,
        step_number: st.stepNumber ?? i + 1,
        ...biCols('title', st.title ?? { ja: '', en: '' }),
        ...biCols('instruction', st.instruction ?? { ja: '', en: '' }),
        media_url: nul(st.mediaUrl),
        media_id: nul(st.mediaId),
        ...biCols('media_caption', st.mediaCaption),
        sort_order: i,
      });
    });
  };

  const addBoxes = (kind: 'tool' | 'sub_option', ownerKey: string, toolId: string, boxes?: PreviewBoxItem[]) => {
    boxes?.forEach((b, i) => {
      const key = bag.make(`${ownerKey}/box/${b.id}`);
      rows.manual_preview_boxes.push({
        key,
        item_id: b.id,
        owner_kind: kind,
        owner_key: ownerKey,
        tool_id: toolId,
        ...biCols('box_title', b.boxTitle ?? { ja: '', en: '' }),
        ...biCols('tool_name', b.toolName),
        ...biCols('description', b.description),
        logo_icon_url: nul(b.logoIconUrl),
        icon_type: nul(b.iconType),
        gif_url: nul(b.gifUrl),
        gif_urls: nul(b.gifUrls),
        sort_order: i,
      });
      b.mediaList?.forEach((m, j) => {
        rows.manual_preview_media.push({
          key: bag.make(`${key}/pm/${m.id}`),
          item_id: m.id,
          box_key: key,
          tool_id: toolId,
          url: m.url,
          ...biCols('title', m.title),
          ...biCols('caption', m.caption),
          media_type: m.type,
          sort_order: j,
        });
      });
      addSteps('preview_box', key, toolId, b.steps);
    });
  };

  snapshot.categories.forEach((c, i) => {
    rows.manual_categories.push({
      id: c.id,
      ...biCols('name', c.name ?? { ja: '', en: '' }),
      ...biCols('description', c.desc ?? { ja: '', en: '' }),
      icon_name: nul(c.iconName),
      accent_color: nul(c.accentColor),
      cat_order: nul(c.order),
      sort_order: i,
    });
  });

  snapshot.tools.forEach((t, i) => {
    rows.manual_tools.push({
      id: t.id,
      category_id: t.categoryId,
      ...biCols('grouping', t.subgroup ?? { ja: '', en: '' }),
      ...biCols('name', t.name ?? { ja: '', en: '' }),
      ...biCols('short_desc', t.shortDesc ?? { ja: '', en: '' }),
      ...biCols('full_desc', t.fullDesc ?? { ja: '', en: '' }),
      shortcut: nul(t.shortcut),
      icon_type: t.iconType ?? '',
      custom_icon_url: nul(t.customIconUrl),
      simulator_gif_url: nul(t.simulatorGifUrl),
      dropdown_group: nul(t.dropdownGroup),
      ...biCols('dropdown_group_name', t.dropdownGroupName),
      ...biCols('dropdown_section', t.dropdownSection),
      is_dropdown_trigger: nul(t.isDropdownTrigger),
      dropdown_group_icon_type: nul(t.dropdownGroupIconType),
      dropdown_group_custom_icon_url: nul(t.dropdownGroupCustomIconUrl),
      tips_ja: t.tips?.ja ?? [],
      tips_en: t.tips?.en ?? [],
      warnings_ja: t.warnings?.ja ?? [],
      warnings_en: t.warnings?.en ?? [],
      related_tool_ids: t.relatedToolIds ?? [],
      is_essential: nul(t.isEssential),
      phase: nul(t.phase),
      is_custom: nul(t.custom),
      tool_updated_at: nul(t.updatedAt),
      sort_order: i,
    });

    addSteps('tool', t.id, t.id, t.steps);

    t.media?.forEach((m: MediaItem, j) => {
      rows.manual_tool_media.push({
        key: bag.make(`${t.id}/media/${m.id}`),
        item_id: m.id,
        tool_id: t.id,
        url: m.url,
        ...biCols('title', m.title ?? { ja: '', en: '' }),
        ...biCols('caption', m.caption),
        media_type: m.type,
        is_primary: nul(m.isPrimary),
        sort_order: j,
      });
    });

    t.subOptions?.forEach((so: SubOptionItem, j) => {
      const key = bag.make(`${t.id}/sub/${so.id}`);
      rows.manual_sub_options.push({
        key,
        item_id: so.id,
        tool_id: t.id,
        ...biCols('name', so.name ?? { ja: '', en: '' }),
        ...biCols('short_desc', so.desc),
        ...biCols('full_desc', so.fullDesc),
        ...biCols('instruction', so.instruction),
        icon_type: nul(so.iconType),
        custom_icon_url: nul(so.customIconUrl),
        shortcut: nul(so.shortcut),
        media_url: nul(so.mediaUrl),
        tips_ja: nul(so.tips?.ja),
        tips_en: nul(so.tips?.en),
        warnings_ja: nul(so.warnings?.ja),
        warnings_en: nul(so.warnings?.en),
        sort_order: j,
      });
      addSteps('sub_option', key, t.id, so.steps);
      addBoxes('sub_option', key, t.id, so.previewBoxes);
    });

    addBoxes('tool', t.id, t.id, t.previewBoxes);
  });

  if (snapshot.company) {
    const c = snapshot.company;
    rows.manual_company.push({
      id: 'default',
      name_ja: c.nameJa ?? '',
      name_en: c.nameEn ?? '',
      department_ja: c.departmentJa ?? '',
      department_en: c.departmentEn ?? '',
      welcome_notice_ja: c.welcomeNoticeJa ?? '',
      welcome_notice_en: c.welcomeNoticeEn ?? '',
      default_preview_box_title_ja: nul(c.defaultPreviewBoxTitleJa),
      default_preview_box_title_en: nul(c.defaultPreviewBoxTitleEn),
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Table rows -> app objects
// ---------------------------------------------------------------------------
const groupBy = (rows: Row[], field: string, filter?: (r: Row) => boolean) => {
  const map = new Map<string, Row[]>();
  rows.forEach((r) => {
    if (filter && !filter(r)) return;
    const k = r[field];
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  });
  map.forEach((list) => list.sort(bySort));
  return map;
};

export function fromRows(rows: RowSets): ManualSnapshot {
  const stepsByOwner = groupBy(rows.manual_steps, 'owner_key');
  const boxMedia = groupBy(rows.manual_preview_media, 'box_key');
  const boxesByOwner = groupBy(rows.manual_preview_boxes, 'owner_key');
  const subsByTool = groupBy(rows.manual_sub_options, 'tool_id');
  const mediaByTool = groupBy(rows.manual_tool_media, 'tool_id');

  const buildSteps = (ownerKey: string): StepItem[] | undefined => {
    const list = stepsByOwner.get(ownerKey);
    if (!list || list.length === 0) return undefined;
    return list.map((r) => compact({
      id: r.item_id,
      stepNumber: r.step_number,
      title: biReq(r, 'title'),
      instruction: biReq(r, 'instruction'),
      mediaUrl: r.media_url ?? undefined,
      mediaId: r.media_id ?? undefined,
      mediaCaption: biOpt(r, 'media_caption'),
    }));
  };

  const buildBoxes = (ownerKey: string): PreviewBoxItem[] | undefined => {
    const list = boxesByOwner.get(ownerKey);
    if (!list || list.length === 0) return undefined;
    return list.map((r) => {
      const media = boxMedia.get(r.key);
      return compact({
        id: r.item_id,
        boxTitle: biReq(r, 'box_title'),
        toolName: biOpt(r, 'tool_name'),
        description: biOpt(r, 'description'),
        logoIconUrl: r.logo_icon_url ?? undefined,
        iconType: r.icon_type ?? undefined,
        gifUrl: r.gif_url ?? undefined,
        gifUrls: r.gif_urls ?? undefined,
        mediaList: media && media.length
          ? media.map((m) => compact({
              id: m.item_id,
              url: m.url,
              title: biOpt(m, 'title'),
              type: m.media_type as PreviewMediaItem['type'],
              caption: biOpt(m, 'caption'),
            }) as PreviewMediaItem)
          : undefined,
        steps: buildSteps(r.key),
      }) as PreviewBoxItem;
    });
  };

  const categories: CategoryInfo[] = [...rows.manual_categories].sort(bySort).map((r) => compact({
    id: r.id,
    name: biReq(r, 'name'),
    desc: biReq(r, 'description'),
    iconName: r.icon_name ?? '',
    accentColor: r.accent_color ?? '',
    order: r.cat_order ?? undefined,
  }) as CategoryInfo);

  const tools: ToolItem[] = [...rows.manual_tools].sort(bySort).map((r) => {
    const subs = subsByTool.get(r.id);
    const tool = compact({
      id: r.id,
      categoryId: r.category_id,
      subgroup: biReq(r, 'grouping'),
      name: biReq(r, 'name'),
      shortDesc: biReq(r, 'short_desc'),
      fullDesc: biReq(r, 'full_desc'),
      shortcut: r.shortcut ?? undefined,
      iconType: r.icon_type ?? '',
      customIconUrl: r.custom_icon_url ?? undefined,
      dropdownGroupIconType: r.dropdown_group_icon_type ?? undefined,
      dropdownGroupCustomIconUrl: r.dropdown_group_custom_icon_url ?? undefined,
      simulatorGifUrl: r.simulator_gif_url ?? undefined,
      dropdownGroup: r.dropdown_group ?? undefined,
      dropdownGroupName: biOpt(r, 'dropdown_group_name'),
      dropdownSection: biOpt(r, 'dropdown_section'),
      isDropdownTrigger: r.is_dropdown_trigger ?? undefined,
      subOptions: subs && subs.length
        ? subs.map((s) => compact({
            id: s.item_id,
            name: biReq(s, 'name'),
            desc: biOpt(s, 'short_desc'),
            fullDesc: biOpt(s, 'full_desc'),
            iconType: s.icon_type ?? undefined,
            customIconUrl: s.custom_icon_url ?? undefined,
            shortcut: s.shortcut ?? undefined,
            mediaUrl: s.media_url ?? undefined,
            steps: buildSteps(s.key),
            tips: s.tips_ja == null && s.tips_en == null ? undefined : { ja: s.tips_ja ?? [], en: s.tips_en ?? [] },
            warnings: s.warnings_ja == null && s.warnings_en == null ? undefined : { ja: s.warnings_ja ?? [], en: s.warnings_en ?? [] },
            previewBoxes: buildBoxes(s.key),
            instruction: biOpt(s, 'instruction'),
          }) as SubOptionItem)
        : undefined,
      previewBoxes: buildBoxes(r.id),
      steps: buildSteps(r.id) ?? [],
      media: (mediaByTool.get(r.id) ?? []).map((m) => compact({
        id: m.item_id,
        url: m.url,
        title: biReq(m, 'title'),
        caption: biOpt(m, 'caption'),
        type: m.media_type as MediaItem['type'],
        isPrimary: m.is_primary ?? undefined,
      }) as MediaItem),
      tips: { ja: r.tips_ja ?? [], en: r.tips_en ?? [] },
      warnings: { ja: r.warnings_ja ?? [], en: r.warnings_en ?? [] },
      relatedToolIds: r.related_tool_ids ?? [],
      isEssential: r.is_essential ?? undefined,
      phase: r.phase ?? undefined,
      custom: r.is_custom ?? undefined,
      updatedAt: r.tool_updated_at ?? undefined,
    });
    return tool as unknown as ToolItem;
  });

  const c = rows.manual_company[0];
  const company: CompanySettings | null = c
    ? compact({
        nameJa: c.name_ja,
        nameEn: c.name_en,
        departmentJa: c.department_ja,
        departmentEn: c.department_en,
        welcomeNoticeJa: c.welcome_notice_ja,
        welcomeNoticeEn: c.welcome_notice_en,
        defaultPreviewBoxTitleJa: c.default_preview_box_title_ja ?? undefined,
        defaultPreviewBoxTitleEn: c.default_preview_box_title_en ?? undefined,
      }) as CompanySettings
    : null;

  return { categories, tools, company };
}

/** Two snapshots are equal when they would produce exactly the same table rows. */
export const snapshotsEqual = (a: ManualSnapshot, b: ManualSnapshot) =>
  JSON.stringify(toRows(a)) === JSON.stringify(toRows(b));

// ---------------------------------------------------------------------------
// Supabase I/O
// ---------------------------------------------------------------------------
export type FetchResult =
  | { ok: true; snapshot: ManualSnapshot; empty: boolean }
  | { ok: false; error: string; notConfigured?: boolean };

export function isCloudConfigured(): boolean {
  return !!getSupabaseClient();
}

const PAGE = 1000;

async function fetchAllRows(table: TableName): Promise<Row[]> {
  const client = getSupabaseClient()!;
  const out: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .order(PK[table])
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

export async function fetchManual(): Promise<FetchResult> {
  if (!getSupabaseClient()) return { ok: false, error: 'Supabase is not configured', notConfigured: true };
  try {
    const results = await Promise.all(TABLES.map((t) => fetchAllRows(t)));
    const rows = Object.fromEntries(TABLES.map((t, i) => [t, results[i]])) as unknown as RowSets;
    const snapshot = fromRows(rows);
    return { ok: true, snapshot, empty: snapshot.categories.length === 0 && snapshot.tools.length === 0 };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/** Writes only the rows that differ between what this browser last synced (prev) and now (next). */
export async function pushChanges(prev: ManualSnapshot, next: ManualSnapshot): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  const before = toRows(prev);
  const after = toRows(next);
  const now = new Date().toISOString();

  const upserts: Partial<Record<TableName, Row[]>> = {};
  const deletes: Partial<Record<TableName, string[]>> = {};

  for (const table of TABLES) {
    const pk = PK[table];
    const oldMap = new Map(before[table].map((r) => [r[pk] as string, JSON.stringify(r)]));
    const newKeys = new Set(after[table].map((r) => r[pk] as string));
    upserts[table] = after[table].filter((r) => oldMap.get(r[pk]) !== JSON.stringify(r));
    deletes[table] = [...oldMap.keys()].filter((k) => !newKeys.has(k));
  }

  // Upserts first (parents -> children), deletes last (children -> parents):
  // if anything fails half-way, nothing is lost.
  for (const table of TABLES) {
    for (const part of chunk(upserts[table] ?? [], 200)) {
      const { error } = await client.from(table).upsert(part.map((r) => ({ ...r, updated_at: now })));
      if (error) throw new Error(`${table}: ${error.message}`);
    }
  }
  for (const table of [...TABLES].reverse()) {
    for (const part of chunk(deletes[table] ?? [], 100)) {
      const { error } = await client.from(table).delete().in(PK[table], part);
      if (error) throw new Error(`${table}: ${error.message}`);
    }
  }
}

/**
 * One-time migration helper: the earlier JSON-blob tables (gloobe_categories /
 * gloobe_tools with a `data` column), if they exist and contain data.
 */
export async function fetchPreviousJsonStore(): Promise<ManualSnapshot | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const [cats, tools, settings] = await Promise.all([
      client.from('gloobe_categories').select('data').order('sort_order', { ascending: true }),
      client.from('gloobe_tools').select('data').order('sort_order', { ascending: true }).limit(5000),
      client.from('gloobe_settings').select('data').eq('key', 'company').maybeSingle(),
    ]);
    if (cats.error || tools.error || !tools.data || tools.data.length === 0) return null;
    return {
      categories: (cats.data || []).map((r: any) => r.data as CategoryInfo),
      tools: tools.data.map((r: any) => r.data as ToolItem),
      company: (settings.data as any)?.data ?? null,
    };
  } catch {
    return null;
  }
}