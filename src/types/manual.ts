export type Language = 'ja' | 'en';

export type RibbonCategoryId = string;

export interface CategoryInfo {
  id: RibbonCategoryId;
  name: {
    ja: string;
    en: string;
  };
  desc: {
    ja: string;
    en: string;
  };
  iconName: string;
  accentColor: string;
  order?: number;
}

export interface StepItem {
  id: string;
  stepNumber: number;
  title: {
    ja: string;
    en: string;
  };
  instruction: {
    ja: string;
    en: string;
  };
  mediaUrl?: string; // Image or GIF URL / Base64
  mediaCaption?: {
    ja: string;
    en: string;
  };
}

export interface MediaItem {
  id: string;
  url: string; // can be data URL or external URL
  title: {
    ja: string;
    en: string;
  };
  caption?: {
    ja: string;
    en: string;
  };
  type: 'gif' | 'image';
  isPrimary?: boolean;
}

export interface PreviewBoxItem {
  id: string;
  boxTitle: {
    ja: string;
    en: string;
  }; // default "プレビューツール" / "Preview Tool"
  toolName?: {
    ja: string;
    en: string;
  }; // e.g. "GLOOBE 壁配置" or "仕上配置"
  logoIconUrl?: string; // custom logo / icon image
  iconType?: string; // fallback CAD icon type
  gifUrl?: string; // animated GIF for this box
  steps?: StepItem[]; // custom steps for 1, 2, 3, 4 manual arrow bar
}

export interface SubOptionItem {
  id: string;
  name: {
    ja: string;
    en: string;
  };
  desc?: {
    ja: string;
    en: string;
  };
  fullDesc?: {
    ja: string;
    en: string;
  };
  iconType?: string;
  customIconUrl?: string;
  shortcut?: string;
  mediaUrl?: string;
  steps?: StepItem[];
  tips?: {
    ja: string[];
    en: string[];
  };
  warnings?: {
    ja: string[];
    en: string[];
  };
  previewBoxes?: PreviewBoxItem[];
  instruction?: {
    ja: string;
    en: string;
  };
}

export interface SupabaseMediaItem {
  id: string;
  tool_id?: string | null;
  category_id?: string | null;
  sub_option_id?: string | null;
  title: string;
  description?: string | null;
  media_url: string;
  media_type: 'gif' | 'image' | 'webm' | 'video';
  caption?: string | null;
  thumbnail_url?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  autoSync: boolean;
  isConnected?: boolean;
  lastSyncAt?: string;
}

export interface ToolItem {
  id: string;
  categoryId: RibbonCategoryId;
  subgroup: {
    ja: string;
    en: string;
  };
  name: {
    ja: string;
    en: string;
  };
  shortDesc: {
    ja: string;
    en: string;
  };
  fullDesc: {
    ja: string;
    en: string;
  };
  shortcut?: string;
  iconType: string;
  customIconUrl?: string; // User-uploaded custom icon image (base64 or URL)
  dropdownGroupIconType?: string; // Custom icon for the dropdown button group
  dropdownGroupCustomIconUrl?: string; // Custom image URL for the dropdown group
  simulatorGifUrl?: string; // Dedicated GIF animation for the simulator
  dropdownGroup?: string; // ID of dropdown group (e.g. 'wall', 'slab', 'roof')
  dropdownGroupName?: {
    ja: string;
    en: string;
  }; // Label on the ribbon button (e.g. { ja: '壁', en: 'Place Wall' })
  dropdownSection?: {
    ja: string;
    en: string;
  }; // Section header in the dropdown popup (e.g. { ja: '部材', en: 'Elements' }, { ja: 'アタッチメント', en: 'Attachments' })
  isDropdownTrigger?: boolean; // If true, this tool is the default displayed item/trigger for the dropdown button
  subOptions?: SubOptionItem[]; // Legacy sub-options support
  previewBoxes?: PreviewBoxItem[]; // Multiple Preview Tool boxes per tool
  badge?: {
    ja: string;
    en: string;
  };
  steps: StepItem[];
  media: MediaItem[];
  tips: {
    ja: string[];
    en: string[];
  };
  warnings: {
    ja: string[];
    en: string[];
  };
  relatedToolIds: string[];
  isEssential?: boolean;
  phase?: 'schematic' | 'detailed' | 'permits' | 'construction' | 'all';
  custom?: boolean;
  updatedAt?: string;
}

export interface CompanySettings {
  nameJa: string;
  nameEn: string;
  departmentJa: string;
  departmentEn: string;
  welcomeNoticeJa: string;
  welcomeNoticeEn: string;
  defaultPreviewBoxTitleJa?: string;
  defaultPreviewBoxTitleEn?: string;
}
