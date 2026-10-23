/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ToolItem } from '../types/manual';

/**
 * Returns the tool list without `toolId`, and tidies what pointed at it:
 *  - other tools' "related tools" links to it are removed
 *  - if it was the visible button of a dropdown, the next tool of that dropdown takes over
 */
export function removeToolFromList(tools: ToolItem[], toolId: string): ToolItem[] {
  const removed = tools.find((t) => t.id === toolId);
  if (!removed) return tools;
  let next = tools
    .filter((t) => t.id !== toolId)
    .map((t) =>
      t.relatedToolIds?.includes(toolId)
        ? { ...t, relatedToolIds: t.relatedToolIds.filter((id) => id !== toolId) }
        : t
    );
  if (removed.dropdownGroup && removed.isDropdownTrigger) {
    const heir = next.find(
      (t) => t.categoryId === removed.categoryId && t.dropdownGroup === removed.dropdownGroup
    );
    if (heir) next = next.map((t) => (t.id === heir.id ? { ...t, isDropdownTrigger: true } : t));
  }
  return next;
}
/**
 * Turns a tool that has sub-options into a ribbon DROPDOWN of separate tools:
 *
 *   before:  屋根  ── sub-options: 錐形屋根, ドーム屋根
 *   after:   [屋根 ▾]  ── tools in the dropdown: 屋根, 錐形屋根, ドーム屋根
 *
 *  - the dropdown button takes its label from the main tool, and stays in the same ribbon grouping
 *  - the main tool becomes the first item (and the visible button) of the dropdown
 *  - every sub-option becomes a full tool and keeps ALL its data
 *    (names, descriptions, shortcut, icon, steps, tips, warnings, preview boxes, video/image link)
 *  - if the main tool is already inside a dropdown, the new tools simply join that dropdown
 */
export function convertSubOptionsToDropdown(tools: ToolItem[], toolId: string): ToolItem[] {
  const index = tools.findIndex((t) => t.id === toolId);
  if (index < 0) return tools;
  const parent = tools[index];
  const subs = parent.subOptions ?? [];
  if (subs.length === 0) return tools;

  const alreadyInDropdown = !!parent.dropdownGroup;
  const groupId = parent.dropdownGroup ?? `dropdown-${Date.now()}`;
  const groupName = parent.dropdownGroupName ?? { ja: parent.name.ja, en: parent.name.en };
  const today = new Date().toISOString().slice(0, 10);

  const usedIds = new Set(tools.map((t) => t.id));
  const uniqueId = (base: string) => {
    let id = base;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    return id;
  };

  const newTools: ToolItem[] = subs.map((s) => {
    const ext = (s.mediaUrl ?? '').split('?')[0].split('.').pop()?.toLowerCase();
    const mediaType: 'gif' | 'image' | 'webp' = ext === 'gif' ? 'gif' : ext === 'webp' ? 'webp' : 'image';
    const hasSteps = !!s.steps && s.steps.length > 0;
    const steps =
      hasSteps
        ? s.steps!
        : s.instruction && (s.instruction.ja || s.instruction.en)
        ? [{
            id: `step-${s.id}`,
            stepNumber: 1,
            title: { ja: '操作', en: 'Operation' },
            instruction: s.instruction,
          }]
        : [];

    return {
      id: uniqueId(`${parent.id}-${s.id}`),
      categoryId: parent.categoryId,
      subgroup: parent.subgroup,
      name: s.name,
      shortDesc: s.desc ?? { ja: '', en: '' },
      fullDesc: s.fullDesc ?? { ja: '', en: '' },
      shortcut: s.shortcut || undefined,
      iconType: s.iconType ?? parent.iconType,
      customIconUrl: s.customIconUrl,
      dropdownGroup: groupId,
      dropdownGroupName: groupName,
      dropdownSection: parent.dropdownSection,
      previewBoxes: s.previewBoxes,
      steps,
      media: s.mediaUrl
        ? [{ id: `media-${s.id}`, url: s.mediaUrl, title: s.name, type: mediaType, isPrimary: true }]
        : [],
      tips: s.tips ?? { ja: [], en: [] },
      warnings: s.warnings ?? { ja: [], en: [] },
      relatedToolIds: [],
      isEssential: parent.isEssential,
      phase: parent.phase,
      custom: true,
      updatedAt: today,
    };
  });

  const { subOptions: _removed, ...parentWithoutSubs } = parent;
  const updatedParent: ToolItem = {
    ...parentWithoutSubs,
    dropdownGroup: groupId,
    dropdownGroupName: groupName,
    isDropdownTrigger: alreadyInDropdown ? parent.isDropdownTrigger : true,
    updatedAt: today,
  };

  // The new tools sit right behind the main tool, so the dropdown order is: main tool, sub 1, sub 2, ...
  return [...tools.slice(0, index), updatedParent, ...newTools, ...tools.slice(index + 1)];
}