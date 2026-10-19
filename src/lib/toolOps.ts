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
