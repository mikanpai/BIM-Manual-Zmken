/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Row-per-item cloud storage for the manual.
 *
 *   gloobe_categories : one row per ribbon tab
 *   gloobe_tools      : one row per tool (its sub-options / preview boxes / media live in `data`)
 *   gloobe_settings   : key 'company' -> company branding
 *
 * Only rows that actually changed are written, and only rows this browser
 * previously synced can be deleted. A stale tab therefore can no longer wipe
 * out tools another person added.
 */

import type { CategoryInfo, CompanySettings, ToolItem } from '../types/manual';
import { getSupabaseClient } from './supabase';

export interface ManualSnapshot {
  categories: CategoryInfo[];
  tools: ToolItem[];
  company: CompanySettings | null;
}

export const EMPTY_SNAPSHOT: ManualSnapshot = { categories: [], tools: [], company: null };

export const snapshotsEqual = (a: ManualSnapshot, b: ManualSnapshot) =>
  JSON.stringify(a) === JSON.stringify(b);

export type FetchResult =
  | { ok: true; snapshot: ManualSnapshot; empty: boolean }
  | { ok: false; error: string; notConfigured?: boolean };

export function isCloudConfigured(): boolean {
  return !!getSupabaseClient();
}

export async function fetchManual(): Promise<FetchResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase is not configured', notConfigured: true };

  const [cats, tools, settings] = await Promise.all([
    client.from('gloobe_categories').select('id,data').order('sort_order', { ascending: true }).order('id'),
    client.from('gloobe_tools').select('id,data').order('sort_order', { ascending: true }).order('id').limit(5000),
    client.from('gloobe_settings').select('key,data').eq('key', 'company').maybeSingle(),
  ]);

  const error = cats.error || tools.error || settings.error;
  if (error) return { ok: false, error: error.message };

  const categories = (cats.data || []).map((r) => r.data as CategoryInfo);
  const toolList = (tools.data || []).map((r) => r.data as ToolItem);
  return {
    ok: true,
    empty: categories.length === 0 && toolList.length === 0,
    snapshot: {
      categories,
      tools: toolList,
      company: (settings.data?.data as CompanySettings | undefined) ?? null,
    },
  };
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/** Writes the difference between what this browser last synced (prev) and now (next). */
export async function pushChanges(prev: ManualSnapshot, next: ManualSnapshot): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  const now = new Date().toISOString();

  // ---- categories ----
  const prevCats = new Map(prev.categories.map((c, i) => [c.id, JSON.stringify([c, i])]));
  const catRows = next.categories
    .map((c, i) => ({ id: c.id, data: c, sort_order: i, updated_at: now, sig: JSON.stringify([c, i]) }))
    .filter((r) => prevCats.get(r.id) !== r.sig)
    .map(({ sig, ...row }) => row);
  const nextCatIds = new Set(next.categories.map((c) => c.id));
  const removedCats = prev.categories.map((c) => c.id).filter((id) => !nextCatIds.has(id));

  // ---- tools ----
  const prevTools = new Map(prev.tools.map((t, i) => [t.id, JSON.stringify([t, i])]));
  const toolRows = next.tools
    .map((t, i) => ({
      id: t.id,
      category_id: t.categoryId,
      data: t,
      sort_order: i,
      updated_at: now,
      sig: JSON.stringify([t, i]),
    }))
    .filter((r) => prevTools.get(r.id) !== r.sig)
    .map(({ sig, ...row }) => row);
  const nextToolIds = new Set(next.tools.map((t) => t.id));
  const removedTools = prev.tools.map((t) => t.id).filter((id) => !nextToolIds.has(id));

  // Upserts first, deletes last: if something fails half-way nothing is lost.
  for (const part of chunk(catRows, 100)) {
    const { error } = await client.from('gloobe_categories').upsert(part);
    if (error) throw new Error(error.message);
  }
  for (const part of chunk(toolRows, 50)) {
    const { error } = await client.from('gloobe_tools').upsert(part);
    if (error) throw new Error(error.message);
  }
  if (JSON.stringify(prev.company) !== JSON.stringify(next.company) && next.company) {
    const { error } = await client
      .from('gloobe_settings')
      .upsert({ key: 'company', data: next.company, updated_at: now });
    if (error) throw new Error(error.message);
  }
  if (removedTools.length) {
    const { error } = await client.from('gloobe_tools').delete().in('id', removedTools);
    if (error) throw new Error(error.message);
  }
  if (removedCats.length) {
    const { error } = await client.from('gloobe_categories').delete().in('id', removedCats);
    if (error) throw new Error(error.message);
  }
}
