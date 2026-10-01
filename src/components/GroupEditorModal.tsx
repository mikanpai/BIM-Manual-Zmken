import React, { useState } from 'react';
import { CategoryInfo, Language, RibbonCategoryId, ToolItem } from '../types/manual';
import { CadIcon } from './CadIcon';
import { 
  X, Check, Plus, Trash2, Edit3, Folder, Layers, ArrowRight, 
  HelpCircle, Sparkles, FolderPlus, ArrowLeftRight
} from 'lucide-react';

interface GroupEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryInfo;
  categories: CategoryInfo[];
  groupNameJa: string;
  groupNameEn: string;
  isNewGroup?: boolean;
  allTools: ToolItem[];
  onSaveGroup: (params: {
    oldGroupJa: string;
    newGroupJa: string;
    newGroupEn: string;
    categoryId: RibbonCategoryId;
    toolIdsInGroup: string[];
  }) => void;
  onDeleteGroup?: (groupJa: string, reassignToGroupJa?: string) => void;
  onAddNewToolToGroup?: (categoryId: RibbonCategoryId, groupJa: string, groupEn: string) => void;
  lang: Language;
}

export const GroupEditorModal: React.FC<GroupEditorModalProps> = ({
  isOpen,
  onClose,
  category,
  categories,
  groupNameJa,
  groupNameEn,
  isNewGroup = false,
  allTools,
  onSaveGroup,
  onDeleteGroup,
  onAddNewToolToGroup,
  lang,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<RibbonCategoryId>(category.id);
  const [nameJa, setNameJa] = useState(groupNameJa);
  const [nameEn, setNameEn] = useState(groupNameEn);

  // Tools currently in this category
  const categoryTools = allTools.filter((t) => t.categoryId === selectedCatId);

  // Initial tools in this group
  const [toolIdsInGroup, setToolIdsInGroup] = useState<string[]>(() => {
    if (isNewGroup) return [];
    return categoryTools
      .filter((t) => t.subgroup.ja === groupNameJa)
      .map((t) => t.id);
  });

  if (!isOpen) return null;

  const currentCategoryObj = categories.find((c) => c.id === selectedCatId) || category;

  // Tools in this group
  const toolsInGroup = allTools.filter((t) => toolIdsInGroup.includes(t.id));

  // Available tools in the same category not in this group
  const availableTools = categoryTools.filter((t) => !toolIdsInGroup.includes(t.id));

  // Add tool to this group
  const handleAddToolToGroup = (toolId: string) => {
    if (!toolIdsInGroup.includes(toolId)) {
      setToolIdsInGroup([...toolIdsInGroup, toolId]);
    }
  };

  // Remove tool from this group
  const handleRemoveToolFromGroup = (toolId: string) => {
    setToolIdsInGroup(toolIdsInGroup.filter((id) => id !== toolId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameJa.trim()) {
      alert(lang === 'ja' ? 'グループ名（日本語）を入力してください' : 'Please provide a group name');
      return;
    }

    onSaveGroup({
      oldGroupJa: groupNameJa,
      newGroupJa: nameJa.trim(),
      newGroupEn: nameEn.trim() || nameJa.trim(),
      categoryId: selectedCatId,
      toolIdsInGroup,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!onDeleteGroup) return;
    const confirmMsg = lang === 'ja'
      ? `グループ「${groupNameJa}」を削除しますか？\n所属ツールは「一般ツール」グループに移動されます。`
      : `Delete group "${groupNameEn || groupNameJa}"? Assigned tools will be moved to General group.`;
    
    if (window.confirm(confirmMsg)) {
      onDeleteGroup(groupNameJa, '一般ツール');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-xs">
              {isNewGroup ? <FolderPlus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isNewGroup
                  ? (lang === 'ja' ? '新規リボングループの作成' : 'Create New Ribbon Group')
                  : (lang === 'ja' ? `リボングループの編集: ${groupNameJa}` : `Edit Ribbon Group: ${groupNameEn || groupNameJa}`)}
              </h2>
              <p className="text-xs text-stone-400">
                {lang === 'ja'
                  ? '柱ツール、梁ツール、スラブツールなどのグループ名や所属ツールを編集できます。'
                  : 'Customize tool groupings like Column Tools, Beam Tools, Slab Tools, etc.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Preset Buttons for Quick Renaming */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>{lang === 'ja' ? '建築BIM標準グループ名プリセット' : 'Standard BIM Group Presets'}</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { ja: '壁ツール', en: 'Wall Tools' },
                { ja: '柱ツール', en: 'Column Tools' },
                { ja: '梁・大梁ツール', en: 'Beam Tools' },
                { ja: 'スラブ・床ツール', en: 'Slab Tools' },
                { ja: '仕上ツール', en: 'Finish Tools' },
                { ja: '階段ツール', en: 'Stair Tools' },
                { ja: '屋根・天井ツール', en: 'Roof & Ceiling Tools' },
                { ja: '基礎ツール', en: 'Foundation Tools' },
                { ja: '開口・建具ツール', en: 'Door & Window Tools' },
              ].map((preset) => (
                <button
                  key={preset.ja}
                  type="button"
                  onClick={() => {
                    setNameJa(preset.ja);
                    setNameEn(preset.en);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-orange-500 hover:bg-orange-50 text-[11px] font-medium text-stone-700 hover:text-orange-700 transition shadow-2xs"
                >
                  {lang === 'ja' ? preset.ja : preset.en}
                </button>
              ))}
            </div>
          </div>

          {/* Group Names (JA & EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {lang === 'ja' ? 'グループ名（日本語 / リボン下部表示）' : 'Group Name (Japanese / Ribbon Label)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameJa}
                onChange={(e) => setNameJa(e.target.value)}
                placeholder="例: 柱ツール、スラブツール、梁ツール"
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-stone-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {lang === 'ja' ? 'グループ名（英語）' : 'Group Name (English)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Column Tools, Slab Tools, Beam Tools"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-stone-900 font-medium"
              />
            </div>
          </div>

          {/* Target Ribbon Category Selector */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">
              {lang === 'ja' ? '所属リボンカテゴリ（タブ）' : 'Belonging Ribbon Category (Tab)'}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedCatId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span>{lang === 'ja' ? cat.name.ja : cat.name.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tools inside this Group */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 flex items-center gap-2">
                <span>{lang === 'ja' ? 'このグループに含まれるツール' : 'Tools in this Group'}</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                  {toolsInGroup.length} 件
                </span>
              </label>

              {onAddNewToolToGroup && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddNewToolToGroup(selectedCatId, nameJa, nameEn);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-700 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? '新規ツールを作成してこのグループに追加' : 'Add New Tool to Group'}</span>
                </button>
              )}
            </div>

            {toolsInGroup.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 rounded-xl bg-stone-50/60">
                {toolsInGroup.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-2.5 rounded-lg bg-white border border-stone-200/90 shadow-2xs flex items-center justify-between gap-2 hover:border-orange-300 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200">
                        <CadIcon type={tool.iconType} customIconUrl={tool.customIconUrl} size={15} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-stone-900 truncate">
                          {lang === 'ja' ? tool.name.ja : tool.name.en}
                        </div>
                        {tool.dropdownGroup && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-sky-100 text-sky-800 font-medium">
                            {lang === 'ja' ? 'ドロップダウン内' : 'In Dropdown'}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveToolFromGroup(tool.id)}
                      className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                      title={lang === 'ja' ? 'グループから外す' : 'Remove from group'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 border border-dashed border-stone-300 rounded-xl bg-stone-50/50 text-stone-500">
                <Folder className="w-7 h-7 mx-auto text-stone-400 mb-1 opacity-60" />
                <p>{lang === 'ja' ? 'まだこのグループにツールが追加されていません。下の候補から追加してください。' : 'No tools in this group yet. Pick from available tools below.'}</p>
              </div>
            )}
          </div>

          {/* Add Available Tools from this Category */}
          {availableTools.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="font-bold text-stone-700 flex items-center justify-between">
                <span>{lang === 'ja' ? 'このカテゴリの他のツールを追加:' : 'Add other tools from this category:'}</span>
                <span className="text-[10px] text-stone-500 font-normal">
                  {lang === 'ja' ? 'クリックするとこのグループに移動します' : 'Click to move tool into this group'}
                </span>
              </label>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {availableTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleAddToolToGroup(tool.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-orange-500 hover:bg-orange-50/70 text-stone-700 hover:text-orange-800 transition text-[11px] shadow-2xs group"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-600" />
                    <span className="font-medium truncate max-w-[140px]">
                      {lang === 'ja' ? tool.name.ja : tool.name.en}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      ({lang === 'ja' ? tool.subgroup.ja : tool.subgroup.en})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-200 shrink-0">
            <div>
              {!isNewGroup && onDeleteGroup && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3.5 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ja' ? 'グループを削除' : 'Delete Group'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold transition"
              >
                {lang === 'ja' ? 'キャンセル' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ja' ? 'グループ設定を保存' : 'Save Group'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
