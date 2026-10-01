import { CategoryInfo, CompanySettings, ToolItem } from '../types/manual';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  nameJa: '【 株式会社 ○○○○ 】',
  nameEn: '[ Company Name Here ]',
  departmentJa: '設計部 / BIM推進課 社内標準運用規程',
  departmentEn: 'Design Department / BIM Standard Operation Guide',
  welcomeNoticeJa: 'GLOOBE（グルーベ）建築BIM操作マニュアルへようこそ。社内ルールに準拠したコマンドの使い方、プロパティ設定、図面自動生成手順を整理しています。',
  welcomeNoticeEn: 'Welcome to the GLOOBE Architectural BIM Operation Manual. Standardized internal rules, command procedures, property setups, and automated drawing workflows.',
  defaultPreviewBoxTitleJa: 'プレビューツール',
  defaultPreviewBoxTitleEn: 'Preview Tool'
};

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'architecture',
    name: { ja: '意匠・躯体', en: 'Architecture & Framing' },
    desc: { ja: '壁、柱、梁、スラブ、天井などの基本躯体モデリング', en: 'Basic BIM elements: walls, columns, beams, slabs, ceilings' },
    iconName: 'Building2',
    accentColor: '#EA580C' // Orange
  },
  {
    id: 'openings',
    name: { ja: '建具・窓・ドア', en: 'Doors & Windows' },
    desc: { ja: '壁配置建具、カーテンウォール、建具表自動連動', en: 'Wall-hosted doors, windows, curtain walls, schedules' },
    iconName: 'DoorOpen',
    accentColor: '#F97316'
  },
  {
    id: 'structure',
    name: { ja: '構造・配筋', en: 'Structure & Rebar' },
    desc: { ja: '基礎、小梁、ブレース、構造伏図の作成・連動', en: 'Foundations, secondary beams, structural plans' },
    iconName: 'Boxes',
    accentColor: '#D97706'
  },
  {
    id: 'site',
    name: { ja: '敷地・外構', en: 'Site & Exterior' },
    desc: { ja: '敷地境界、高低差、造成、道路、外構マテリアル', en: 'Property boundary, elevation contours, topography, roads' },
    iconName: 'Trees',
    accentColor: '#059669'
  },
  {
    id: 'drawing',
    name: { ja: '図面・集計', en: 'Drawings & Schedules' },
    desc: { ja: '平面図、立面図、断面図、求積図、数量拾い出し', en: 'Floor plans, elevations, sections, area calculation, takeoff' },
    iconName: 'FileSpreadsheet',
    accentColor: '#2563EB'
  },
  {
    id: 'regulations',
    name: { ja: '法規・申請', en: 'Code & Legal Check' },
    desc: { ja: '斜線制限、日影規制シミュレーション、採光換気、防火', en: 'Setback lines, shadow study, lighting/ventilation, fire codes' },
    iconName: 'ShieldAlert',
    accentColor: '#DC2626'
  },
  {
    id: 'presentation',
    name: { ja: '3D・プレゼン', en: '3D & Presentation' },
    desc: { ja: '高品質レンダリング、ウォークスルー、日照、パース', en: 'High-res rendering, walkthroughs, daylight studies, VR' },
    iconName: 'Camera',
    accentColor: '#7C3AED'
  },
  {
    id: 'edit',
    name: { ja: '編集・補助線', en: 'Edit & Assist Tools' },
    desc: { ja: '移動、複写、トリム、ストレッチ、通り芯、寸法線', en: 'Move, copy, trim, stretch, grid axes, smart dimensions' },
    iconName: 'Wrench',
    accentColor: '#475569'
  },
  {
    id: 'collaboration',
    name: { ja: 'BIM連携・IFC', en: 'IFC & Data Exchange' },
    desc: { ja: 'IFC入出力、DWG/DXF連携、確認申請BIM対応', en: 'IFC 2x3/4 export, DWG/DXF bridge, BIM submission data' },
    iconName: 'Share2',
    accentColor: '#0891B2'
  }
];

export const INITIAL_TOOLS: ToolItem[] = [
  // 1. PLACE WALL (STANDALONE NORMAL BUTTON)
  {
    id: 'tool-wall',
    categoryId: 'architecture',
    subgroup: { ja: '壁ツール', en: 'Wall Tools' },
    name: { ja: '壁配置（外壁・内壁）', en: 'Place Wall (Exterior / Interior)' },
    shortDesc: { 
      ja: '通り芯や補助線に沿ってRC壁、間仕切壁を自動包絡で配置します。', 
      en: 'Places structural exterior and interior walls with automatic corner cleanups along grid lines.' 
    },
    fullDesc: {
      ja: 'GLOOBEの壁入力コマンドは、日本の建築図面規格（壁芯・内法・仕上芯）に完全準拠した壁部材をモデリングします。配置と同時にコーナー包絡処理、T字接合、十字交差が自動で行われ、平面図と3Dモデルが完全リアルタイム同期します。基準高さ（FL基準・天端SL拘束）を事前設定することで、階数変更時の自動追従が有効になります。',
      en: 'The GLOOBE Wall command generates architectural and structural walls adhering to Japanese drafting standards. Automatic corner miter and T-junction cleanups happen in real time, synchronizing 2D floor plans with 3D BIM geometry. Floor-to-floor level constraints keep heights accurate when project elevations change.'
    },
    shortcut: 'W',
    iconType: 'wall',
    badge: { ja: '常用必須', en: 'Essential' },
    isEssential: true,
    phase: 'schematic',
    previewBoxes: [
      {
        id: 'pb-wall-1',
        boxTitle: { ja: 'プレビューツール（基本壁配置）', en: 'Preview Tool (Wall Placement)' },
        toolName: { ja: 'GLOOBE 壁配置ツール', en: 'GLOOBE Place Wall' },
        iconType: 'wall',
        gifUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        steps: [
          {
            id: 'pb-w-s1',
            stepNumber: 1,
            title: { ja: '通り芯交点スナップ', en: 'Snap Grid Intersection' },
            instruction: { ja: '始点となる交点をクリックし、直交モードを有効にします。', en: 'Click start node with orthogonal lock.' }
          },
          {
            id: 'pb-w-s2',
            stepNumber: 2,
            title: { ja: '寸法直接入力', en: 'Type Dimension' },
            instruction: { ja: '壁長さ（例：3,500mm）を入力してEnterキーを押します。', en: 'Type 3,500mm and press Enter.' }
          },
          {
            id: 'pb-w-s3',
            stepNumber: 3,
            title: { ja: '自動包絡接合の確認', en: 'Confirm Auto Miter' },
            instruction: { ja: '交差壁と自動で包絡され、仕上ラインが連続します。', en: 'Wall miter finishes cleanly automatically.' }
          }
        ]
      }
    ],
    steps: [
      {
        id: 's-w-1',
        stepNumber: 1,
        title: { ja: '壁ツール起動 & 仕様選定', en: 'Activate Wall Tool & Choose Spec' },
        instruction: { 
          ja: 'リボンメニューの「壁配置」をクリックし、プロパティで壁タイプ（RC造外壁 200mm、ALC 100mm、LGS間仕切等）を選択します。',
          en: 'Click "Place Wall" in the ribbon and choose wall construction spec in the properties palette.'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        mediaCaption: { ja: 'GLOOBE壁プロパティパレットと通り芯スナップ', en: 'Wall properties setup in GLOOBE' }
      },
      {
        id: 's-w-2',
        stepNumber: 2,
        title: { ja: '基準線芯振分け（左・中・右）', en: 'Set Justification (Left/Center/Right)' },
        instruction: { 
          ja: '通り芯に対して「中心振分」「左寄せ」「右寄せ」を指定します。外壁では躯体面揃えをワンクリックで切り替え可能です。',
          en: 'Specify alignment relative to grid axis: center, left face, or right face.'
        }
      },
      {
        id: 's-w-3',
        stepNumber: 3,
        title: { ja: '始点・終点の連続指示', en: 'Click Start & End Nodes' },
        instruction: { 
          ja: '通り芯交点を連続クリックまたはテンキーで長さ（mm）を直接入力します。スペースキーで反転できます。',
          en: 'Snap intersections consecutively or type length directly in millimeters. Press Space to flip orientation.'
        }
      },
      {
        id: 's-w-4',
        stepNumber: 4,
        title: { ja: '自動包絡接合（T字・十字・L字）', en: 'Auto Corner Cleanup & Miter' },
        instruction: { 
          ja: '既存壁に接続すると自動で仕上材・構造芯が包絡されます。右クリックまたはEscキーで配置を完了します。',
          en: 'Connecting to existing walls triggers instant miter joint cleanup. Right click or Esc to finish.'
        }
      }
    ],
    media: [
      {
        id: 'm-w-1',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '外壁モデルと通り芯連動', en: 'Exterior Wall Grid Snapping' },
        caption: { ja: '3Dリアルタイム連動表示', en: 'Real-time 2D/3D synchronization' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: [
        'Shiftキーを押しながら描画すると45度・90度の直交スナップがロックされます。',
        '壁高さを「上階SL拘束」にしておくと、階高変更時に全フロアの壁高が連動更新されます。'
      ],
      en: [
        'Holding Shift locks cursor orthogonal snapping to 45° and 90° angles.',
        'Constraining top level to upper slab ensures auto-height updating when floor levels change.'
      ]
    },
    warnings: {
      ja: [
        '耐力壁と雑壁が交差する場合、構造計算連動属性が意図通りかプロパティで確認してください。'
      ],
      en: [
        'Verify structural shear wall attributes when intersecting with non-structural partition walls.'
      ]
    },
    relatedToolIds: ['tool-wall-rc', 'tool-wall-alc', 'tool-wall-lgs', 'tool-slab'],
    updatedAt: '2026-09-29'
  },

  // 2. WALL DROPDOWN TOOLS: RC WALL
  {
    id: 'tool-wall-rc',
    categoryId: 'architecture',
    subgroup: { ja: '壁ツール', en: 'Wall Tools' },
    name: { ja: 'RC外壁・構造耐力壁', en: 'RC Exterior Structural Wall' },
    shortDesc: { 
      ja: '配筋・かぶり厚連動のRC耐力壁。基準線芯振り分けを設定して配置します。', 
      en: 'Places reinforced concrete shear walls with structural rebar and cover depth alignment.' 
    },
    fullDesc: {
      ja: 'GLOOBEの「RC外壁・構造耐力壁」コマンドは、RC造建築の構造耐力壁および外壁をモデリングします。壁厚（t=180, 200, 250等）と縦横配筋仕様（D10@200複筋など）を設定でき、構造伏図や配筋詳細図とのリアルタイム連携に対応します。ドロップダウンメニューから即座に呼び出せます。',
      en: 'Models reinforced concrete shear and perimeter walls with exact bar layout specifications. Integrates seamlessly into structural schedules and cross-sections.'
    },
    shortcut: 'Shift+W1',
    iconType: 'wall',
    dropdownGroup: 'wall-dropdown',
    dropdownGroupName: { ja: '壁詳細 ▼', en: 'Wall Types ▼' },
    isDropdownTrigger: true,
    badge: { ja: 'ドロップダウン', en: 'Dropdown' },
    isEssential: true,
    phase: 'schematic',
    previewBoxes: [
      {
        id: 'pb-wall-rc-1',
        boxTitle: { ja: 'プレビューツール（RC外壁）', en: 'Preview Tool (RC Shear Wall)' },
        toolName: { ja: 'GLOOBE RC耐力壁', en: 'GLOOBE RC Structural Wall' },
        iconType: 'wall',
        gifUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        steps: [
          {
            id: 'pb-rc-s1',
            stepNumber: 1,
            title: { ja: '通り芯交点スナップ', en: 'Snap Grid Intersection' },
            instruction: { ja: '通り芯交点を指示してRC壁の始点を決定します。', en: 'Snap start node on grid axis.' }
          },
          {
            id: 'pb-rc-s2',
            stepNumber: 2,
            title: { ja: '壁厚・配筋選定', en: 'Select Wall Thickness & Rebar' },
            instruction: { ja: '壁厚 t=200、D13@200ダブル配筋を指定します。', en: 'Set thickness t=200 and double rebar grid.' }
          },
          {
            id: 'pb-rc-s3',
            stepNumber: 3,
            title: { ja: '柱・梁包絡処理', en: 'Column/Beam Auto Clean' },
            instruction: { ja: 'RC柱・大梁と交差する箇所が自動で構造包絡されます。', en: 'Intersections with RC columns automatically clean.' }
          }
        ]
      }
    ],
    steps: [
      {
        id: 's-wrc-1',
        stepNumber: 1,
        title: { ja: 'RC壁仕様と壁厚設定', en: 'Set RC Wall Properties' },
        instruction: { 
          ja: 'プロパティ画面で壁厚（t=200等）、コンクリート設計基準強度（Fc=24）、配筋仕様を選択します。',
          en: 'Select concrete strength (Fc=24) and wall thickness in the properties palette.'
        }
      },
      {
        id: 's-wrc-2',
        stepNumber: 2,
        title: { ja: '通り芯基準線クリック', en: 'Click Grid Line' },
        instruction: { 
          ja: '通り芯の交点をクリックして壁の始点・終点を指示します。柱面との接合部が自動認識されます。',
          en: 'Click grid nodes to draw wall segments with automatic column join.'
        }
      }
    ],
    media: [],
    tips: {
      ja: ['耐力壁判定属性を有効にすると、構造計算連動時に自動で耐力壁として出力されます。'],
      en: ['Enabling shear wall property exports this element to structural calculation software.']
    },
    warnings: {
      ja: ['開口部寸法が壁幅の1/3を超える場合、開口補強筋の設定が必要です。'],
      en: ['Openings larger than 1/3 wall span require structural rebar collar reinforcements.']
    },
    relatedToolIds: ['tool-wall', 'tool-wall-alc', 'tool-wall-lgs'],
    updatedAt: '2026-09-29'
  },

  // 3. WALL DROPDOWN TOOLS: ALC WALL
  {
    id: 'tool-wall-alc',
    categoryId: 'architecture',
    subgroup: { ja: '壁ツール', en: 'Wall Tools' },
    name: { ja: 'ALC耐火壁・乾式外壁', en: 'ALC Fire-Rated Exterior Wall' },
    shortDesc: { 
      ja: 'ALCパネル割付・縦張り・横張りの乾式耐火外壁を配置します。', 
      en: 'Places precast autoclaved aerated concrete (ALC) panel fire-rated walls.' 
    },
    fullDesc: {
      ja: 'GLOOBEの「ALC耐火壁・乾式外壁」コマンドは、鉄骨造（S造）等の外壁として多用されるALCパネルをモデリングします。定尺幅（600mm）の自動パネル割付、開口周辺の役物配置、金物留め位置のシミュレーションに対応します。',
      en: 'Models precast autoclaved aerated concrete (ALC) panel systems with automatic 600mm panel module layouts, fire-resistance ratings, and attachment clips.'
    },
    shortcut: 'Shift+W2',
    iconType: 'wall',
    dropdownGroup: 'wall-dropdown',
    dropdownGroupName: { ja: '壁詳細 ▼', en: 'Wall Types ▼' },
    badge: { ja: 'ドロップダウン', en: 'Dropdown' },
    isEssential: false,
    phase: 'detailed',
    previewBoxes: [
      {
        id: 'pb-wall-alc-1',
        boxTitle: { ja: 'プレビューツール（ALCパネル外壁）', en: 'Preview Tool (ALC Wall)' },
        toolName: { ja: 'GLOOBE ALC耐火壁', en: 'GLOOBE ALC Panel Wall' },
        iconType: 'wall',
        steps: [
          {
            id: 'pb-alc-s1',
            stepNumber: 1,
            title: { ja: '割付基準点指示', en: 'Pick Layout Origin' },
            instruction: { ja: '通り芯交点を基準に縦張りパネルの割付基準点を指示します。', en: 'Pick origin for 600mm vertical panels.' }
          },
          {
            id: 'pb-alc-s2',
            stepNumber: 2,
            title: { ja: '胴縁・アングル留め連動', en: 'Girt & Clip Snapping' },
            instruction: { ja: '鉄骨胴縁に合わせてパネル留め付けが自動生成されます。', en: 'Clips generate automatically along steel girts.' }
          }
        ]
      }
    ],
    steps: [
      {
        id: 's-walc-1',
        stepNumber: 1,
        title: { ja: 'ALC厚み（t=100/125）の選定', en: 'Select ALC Thickness' },
        instruction: { 
          ja: '防火仕様（耐火1時間など）に応じた厚み（t=100mmまたはt=125mm）を選びます。',
          en: 'Select panel thickness (100mm or 125mm) based on fire separation codes.'
        }
      },
      {
        id: 's-walc-2',
        stepNumber: 2,
        title: { ja: '割付方向と基準線の指示', en: 'Set Layout Direction' },
        instruction: { 
          ja: '縦張り・横張りを指定し、鉄骨梁芯から持ち出し寸法を設定して配置します。',
          en: 'Select vertical or horizontal orientation and offset from steel beam axis.'
        }
      }
    ],
    media: [],
    tips: {
      ja: ['サッシ開口部周辺では、端数パネル（切り欠き加工）が自動で最小300mm以上になるよう割付調整されます。'],
      en: ['GLOOBE auto-adjusts modules to avoid panel fragments narrower than 300mm around windows.']
    },
    warnings: {
      ja: ['層間変形追従構造（ロッキング構法）のクリアランス（天端スリット幅）を確認してください。'],
      en: ['Verify deflection joint clearances at top of wall under seismic sway.']
    },
    relatedToolIds: ['tool-wall', 'tool-wall-rc', 'tool-wall-lgs'],
    updatedAt: '2026-09-29'
  },

  // 4. WALL DROPDOWN TOOLS: PARTITION WALL
  {
    id: 'tool-wall-lgs',
    categoryId: 'architecture',
    subgroup: { ja: '壁ツール', en: 'Wall Tools' },
    name: { ja: '間仕切壁（LGSスタッド・木造）', en: 'Interior Stud Partition Wall' },
    shortDesc: { 
      ja: 'PB両面張り、グラスウール遮音材入りの軽量間仕切壁です。', 
      en: 'Places interior non-bearing drywall and light-gauge steel stud partition walls.' 
    },
    fullDesc: {
      ja: 'GLOOBEの「間仕切壁（LGSスタッド・木造）」コマンドは、内部空間の区分けを行う乾式間仕切り壁をモデリングします。石膏ボード仕様（t=9.5/12.5mm）、遮音等級（TLD-40/50等）、グラスウール充填を制御でき、部屋面積計算の内法寸法を正確に反映します。',
      en: 'Models interior non-structural stud partitions with gypsum drywall specifications, acoustic insulation bats, and automated net room area calculations.'
    },
    shortcut: 'Shift+W3',
    iconType: 'wall',
    dropdownGroup: 'wall-dropdown',
    dropdownGroupName: { ja: '壁詳細 ▼', en: 'Wall Types ▼' },
    badge: { ja: 'ドロップダウン', en: 'Dropdown' },
    isEssential: true,
    phase: 'schematic',
    previewBoxes: [
      {
        id: 'pb-wall-lgs-1',
        boxTitle: { ja: 'プレビューツール（軽量間仕切壁）', en: 'Preview Tool (Drywall Partition)' },
        toolName: { ja: 'GLOOBE LGS間仕切', en: 'GLOOBE Stud Partition' },
        iconType: 'wall',
        steps: [
          {
            id: 'pb-lgs-s1',
            stepNumber: 1,
            title: { ja: '部屋分割ライン指示', en: 'Draw Partition Line' },
            instruction: { ja: '外壁または既存間仕切から寸法を指定して内壁を引きます。', en: 'Snap and offset from perimeter wall.' }
          }
        ]
      }
    ],
    steps: [
      {
        id: 's-wlgs-1',
        stepNumber: 1,
        title: { ja: 'ボード仕様と壁厚設定', en: 'Set Board Specs & Thickness' },
        instruction: { 
          ja: 'PB12.5mm両面二重張り（壁厚100mm等）や片面強化ボード仕様を選択します。',
          en: 'Pick double-layer 12.5mm drywall or standard single layer board spec.'
        }
      },
      {
        id: 's-wlgs-2',
        stepNumber: 2,
        title: { ja: '内法ラインへのスナップ配置', en: 'Snap to Interior Boundary' },
        instruction: { 
          ja: '柱や外壁の内法面にスナップさせ、部屋境界を閉じるように描画します。',
          en: 'Draw connecting walls to form closed room boundaries.'
        }
      }
    ],
    media: [],
    tips: {
      ja: ['間仕切壁で閉領域を形成すると、自動で「室」オブジェクトの検出準備が完了します。'],
      en: ['Enclosing spaces with partitions immediately readies them for room tag placement.']
    },
    warnings: {
      ja: ['防火区画壁の場合は「耐火遮音認定番号」プロパティを必ず指定してください。'],
      en: ['Fire-rated barrier partitions require official code certification numbers in BIM data.']
    },
    relatedToolIds: ['tool-wall', 'tool-wall-rc', 'tool-wall-alc'],
    updatedAt: '2026-09-29'
  },

  // 5. FINISH DROPDOWN TOOLS: INTERIOR CEILING
  {
    id: 'tool-finish-interior',
    categoryId: 'architecture',
    subgroup: { ja: '仕上ツール', en: 'Finish Tools' },
    name: { ja: '内部天井仕上', en: 'Interior Ceiling Finish' },
    shortDesc: { 
      ja: '部屋領域をクリックして天井ボードと見切りを配置します。', 
      en: 'Places interior ceiling boards, grids, and moldings with automatic room bounding.' 
    },
    fullDesc: {
      ja: 'GLOOBEの「内部天井仕上」コマンドは、部屋プロパティと連動して天井仕上材（化粧吸音板、ジプトーン、岩綿吸音板、PB+クロスなど）をモデリングします。天井高（CH=2400等）の設定と見切り縁の自動生成をサポートし、展開図や天井伏図とリアルタイム連動します。',
      en: 'Models interior ceilings linked to room bounds. Automatically handles ceiling heights (CH) and perimeter trim in GLOOBE.'
    },
    shortcut: 'Shift+F1',
    iconType: 'finish',
    dropdownGroup: 'finish-dropdown',
    dropdownGroupName: { ja: '仕上 ▼', en: 'Finishes ▼' },
    isDropdownTrigger: true,
    badge: { ja: 'ドロップダウン', en: 'Dropdown' },
    isEssential: true,
    phase: 'detailed',
    previewBoxes: [
      {
        id: 'pb-finish-1',
        boxTitle: { ja: 'プレビューツール（天井仕上配置）', en: 'Preview Tool (Ceiling Finish)' },
        toolName: { ja: 'GLOOBE 内部天井仕上', en: 'GLOOBE Interior Ceiling' },
        iconType: 'finish',
        gifUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        steps: [
          {
            id: 'pb-f-s1',
            stepNumber: 1,
            title: { ja: '部屋領域ピック', en: 'Pick Room Area' },
            instruction: { ja: '閉じた部屋領域をクリックして天井高 CH=2,500mm を設定します。', en: 'Click inside room to set CH=2500mm.' }
          },
          {
            id: 'pb-f-s2',
            stepNumber: 2,
            title: { ja: '廻り縁自動配置', en: 'Auto Crown Molding' },
            instruction: { ja: '壁境界に沿って見切り材・廻り縁が自動生成されます。', en: 'Crown molding automatically forms along boundaries.' }
          }
        ]
      }
    ],
    steps: [
      {
        id: 's-f-1',
        stepNumber: 1,
        title: { ja: '仕上メニューの選択', en: 'Select Finish Command' },
        instruction: { 
          ja: 'リボンメニューの「仕上 ▼」から「内部天井仕上」を選択します。',
          en: 'Select "Interior Ceiling Finish" from the Finishes dropdown in the ribbon.'
        }
      },
      {
        id: 's-f-2',
        stepNumber: 2,
        title: { ja: '天井高（CH）と仕様設定', en: 'Set Ceiling Height & Spec' },
        instruction: { 
          ja: 'プロパティ画面で「天井高 CH=2,500mm」を入力し、仕様（ロックウール吸音板 t=9+9 など）を選びます。',
          en: 'Enter ceiling height (CH) and acoustic board spec in the properties palette.'
        }
      },
      {
        id: 's-f-3',
        stepNumber: 3,
        title: { ja: '部屋領域ピック配置', en: 'Pick Room Boundary' },
        instruction: { 
          ja: '部屋の内側をクリックすると、壁芯の内法に合わせて天井面および廻り縁が自動生成されます。',
          en: 'Click inside room; ceiling surface and crown trim auto-generate along interior faces.'
        }
      }
    ],
    media: [
      {
        id: 'm-f-1',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '内部天井仕上モデル', en: 'Interior Ceiling Finish Model' },
        caption: { ja: '天井高と化粧材が自動適用された室内モデル', en: 'Interior ceiling model in GLOOBE.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['室名を配置した後に天井仕上を配置すると、室名プロパティに天井高CHが自動フィードバックされます。'],
      en: ['Placing ceilings after room tags auto-syncs the ceiling height (CH) back into the room schedule.']
    },
    warnings: {
      ja: ['天井高CHが上階スラブ高さを超えている場合、スラブ貫通警告が表示されます。'],
      en: ['If CH exceeds the upper slab elevation, a slab clash alert will be triggered.']
    },
    relatedToolIds: ['tool-finish-exterior', 'tool-finish-molding', 'tool-wall'],
    updatedAt: '2026-09-29'
  },

  // 6. FINISH DROPDOWN TOOLS: EXTERIOR CEILING
  {
    id: 'tool-finish-exterior',
    categoryId: 'architecture',
    subgroup: { ja: '仕上ツール', en: 'Finish Tools' },
    name: { ja: '外部天井仕上（軒天・庇）', en: 'Exterior Ceiling Finish (Soffit)' },
    shortDesc: { 
      ja: '外部ポーチ、バルコニー下端、軒天の仕上材を配置します。', 
      en: 'Applies exterior soffit finishes beneath balconies, overhangs, and porches.' 
    },
    fullDesc: {
      ja: 'GLOOBEの「外部天井仕上」コマンドは、屋外の庇下端、バルコニー下端、エントランスポーチの軒天仕上（耐火ボード・フレキ板・有孔板等）をモデリングします。スラブ下端や梁下端への自動吸着に対応します。',
      en: 'Models outdoor soffits beneath eaves, balconies, and entrance canopies with automatic slab snapping.'
    },
    shortcut: 'Shift+F2',
    iconType: 'exterior-ceiling',
    dropdownGroup: 'finish-dropdown',
    dropdownGroupName: { ja: '仕上 ▼', en: 'Finishes ▼' },
    badge: { ja: 'ドロップダウン', en: 'Dropdown' },
    isEssential: false,
    phase: 'detailed',
    steps: [
      {
        id: 's-fe-1',
        stepNumber: 1,
        title: { ja: '軒天領域の指示', en: 'Pick Soffit Boundary' },
        instruction: { 
          ja: 'スラブ下端または梁下端を指示し、軒天仕様（フレキ板・耐火ボード）を指定して領域をピックします。',
          en: 'Select slab bottom or beam soffit, designate fire-rated board, and pick the perimeter.'
        }
      }
    ],
    media: [],
    tips: {
      ja: ['外壁との取り合い部に自動で見切り目地棒が配置されます。'],
      en: ['Expansion reveal trim automatically snaps along exterior wall joints.']
    },
    warnings: {
      ja: ['防火地域・準防火地域では、延焼ライン内の軒裏30分耐火仕様に適合しているか確認してください。'],
      en: ['Verify 30-minute fire separation rating for eaves within designated fire zones.']
    },
    relatedToolIds: ['tool-finish-interior', 'tool-finish-molding'],
    updatedAt: '2026-09-29'
  },

  // 7. FINISH DROPDOWN TOOLS: MOLDING
  {
    id: 'tool-finish-molding',
    categoryId: 'architecture',
    subgroup: { ja: '仕上ツール', en: 'Finish Tools' },
    name: { ja: '化粧材・モールディング', en: 'Decorative Molding / Trim' },
    shortDesc: { 
      ja: '巾木、廻り縁、笠木などの化粧部材を壁面に沿って走らせます。', 
      en: 'Extrudes baseboards, crown moldings, and wall copings along wall perimeters.' 
    },
    fullDesc: {
      ja: 'GLOOBEの「化粧材・モールディング」コマンドは、室内外の巾木、廻り縁、パラペット笠木、手摺などの線状化粧部材をモデリングします。壁面や床スラブのエッジを追従し、角部の留め継ぎ（45度カット）を自動生成します。',
      en: 'Models continuous architectural trims such as baseboards, crown trims, and parapet copings with automated 45° corner mitering.'
    },
    shortcut: 'Shift+F3',
    iconType: 'molding',
    dropdownGroup: 'finish-dropdown',
    dropdownGroupName: { ja: '仕上 ▼', en: 'Finishes ▼' },
    badge: { ja: 'ドロップダウン', en: 'Dropdown' },
    isEssential: false,
    phase: 'detailed',
    steps: [
      {
        id: 's-fm-1',
        stepNumber: 1,
        title: { ja: 'プロファイル断面の選定', en: 'Select Cross Section' },
        instruction: { 
          ja: '化粧材の断面プロファイル（木製巾木 H=60、アルミ笠木 W=200等）を選び、基準線を指示します。',
          en: 'Pick decorative cross-section profile and click base wall line.'
        }
      }
    ],
    media: [],
    tips: {
      ja: ['開口部（ドア枠・サッシ）と交差すると、枠見切り面で自動カットされます。'],
      en: ['Trim automatically stops at door frames and window architraves.']
    },
    warnings: {
      ja: ['巾木の出幅が建具枠の見込み寸法と干渉しないか納まりを確認してください。'],
      en: ['Ensure baseboard projection does not interfere with door casing jambs.']
    },
    relatedToolIds: ['tool-finish-interior', 'tool-finish-exterior'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-column',
    categoryId: 'architecture',
    subgroup: { ja: '柱ツール', en: 'Column Tools' },
    name: { ja: '柱配置（RC柱・S造鉄骨柱）', en: 'Place Column (RC / Steel)' },
    shortDesc: { 
      ja: '通り芯交点に部材符号（C1, C2）と連動した柱をワンクリック一括配置します。', 
      en: 'Places structural columns at grid intersections linked to component marks (C1, C2).' 
    },
    fullDesc: {
      ja: 'GLOOBEの柱配置機能は、構造設計連動と意匠図表現を兼ね備えています。RC造の角柱・丸柱、S造のH形鋼・角形鋼管（コラム）など多様な断面プロファイルに対応。通り芯の交差点を範囲選択することで、全グリッドに一括で指定符号の柱を瞬時に配棟可能です。',
      en: 'The GLOOBE Column command facilitates both structural consistency and architectural drawing fidelity. Supports rectangular, circular, H-beam, and box steel profiles with batch placement across grid intersections.'
    },
    shortcut: 'C',
    iconType: 'column',
    badge: { ja: '常用必須', en: 'Essential' },
    isEssential: true,
    phase: 'schematic',
    steps: [
      {
        id: 's-c-1',
        stepNumber: 1,
        title: { ja: '柱符号と断面サイズの選択', en: 'Select Column Mark & Section' },
        instruction: { 
          ja: '「柱部材リスト」から配置する符号（例：C1 800×800 RC、または コラム□-400×400×16）を選択します。',
          en: 'Select the column symbol (e.g. C1 800x800 RC or Box 400x400x16) from the component library.'
        }
      },
      {
        id: 's-c-2',
        stepNumber: 2,
        title: { ja: '交点指示 または 範囲一括配置', en: 'Click Grid Point or Box Select' },
        instruction: { 
          ja: '単体配置の場合は通り芯の交点をクリック。階全体に配置する場合は「矩形範囲選択」で複数の交点を一網打尽に選択します。',
          en: 'Click a single intersection, or use Marquee Selection across multiple grids to place columns at all nodes at once.'
        }
      },
      {
        id: 's-c-3',
        stepNumber: 3,
        title: { ja: '基準レベルと取り付き設定', en: 'Level Constraints & Join Conditions' },
        instruction: { 
          ja: '柱頭・柱脚のレベル拘束（FL±0 〜 上階SLまで）を確認します。外壁とのチリ寸法（寄り寸法）がある場合はオフセット値を入力します。',
          en: 'Verify top/bottom constraints and specify eccentric offsets for boundary columns along property walls.'
        }
      }
    ],
    media: [
      {
        id: 'm-c-1',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '通り芯交点への柱一括配置画面', en: 'Batch Column Grid Placement' },
        caption: { ja: '通り芯の交点に対して一括配置された角柱モデル', en: 'Columns placed simultaneously across all structural grid intersections.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: [
        '外周部の柱で壁芯から逃げを取りたい時は、配置後の「柱寄り寸法」プロパティで数値を変更できます。',
        '柱リストで符号寸法を更新すると、配置済みの全柱モデルが自動で新サイズに再計算されます。'
      ],
      en: [
        'For perimeter columns, adjust the eccentricity offset in properties after placement to set building face clearance.',
        'Modifying the master schedule updates every placed instance of that mark across the whole project.'
      ]
    },
    warnings: {
      ja: [
        '通り芯のない任意座標に配置すると、構造伏図や軸組図の自動作成時に通り名が抜け落ちます。'
      ],
      en: [
        'Placing columns without reference grids causes them to be omitted from automated structural elevation views.'
      ]
    },
    relatedToolIds: ['tool-wall', 'tool-beam'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-beam',
    categoryId: 'architecture',
    subgroup: { ja: '梁・大梁ツール', en: 'Beam Tools' },
    name: { ja: '大梁・小梁配置', en: 'Place Girder & Beam' },
    shortDesc: { 
      ja: '柱間をスナップして大梁を架設し、スラブ天端と自動連動させます。', 
      en: 'Bridges structural columns with girders and secondary beams synchronized to slab levels.' 
    },
    fullDesc: {
      ja: '柱心または壁芯を結ぶことで、大梁（G1, G2）を瞬時に架け渡します。階高レベルに基づき梁天端（SL）が自動設定され、スラブや段差スラブとの一体化包絡が作動します。小梁の等分割配置機能も備えています。',
      en: 'Connects column nodes with structural girders. Automatically maintains top-of-concrete elevation linked with slabs and offers one-click equal division for secondary joists.'
    },
    shortcut: 'B',
    iconType: 'beam',
    badge: { ja: '構造連動', en: 'Structural' },
    isEssential: true,
    phase: 'schematic',
    steps: [
      {
        id: 's-b-1',
        stepNumber: 1,
        title: { ja: '大梁符号の選択', en: 'Select Beam Mark' },
        instruction: { 
          ja: '「梁部材プロパティ」で符号（例：2G1 400×800）と配筋仕様を選択します。',
          en: 'Choose beam mark (e.g. 2G1 400x800) and material definition in the beam palette.'
        }
      },
      {
        id: 's-b-2',
        stepNumber: 2,
        title: { ja: '柱間クリック架設', en: 'Click Columns to Span' },
        instruction: { 
          ja: '始点柱をクリックし、終点柱をクリックすると自動的に柱芯間に梁が架設されます。通り芯一括選択も可能です。',
          en: 'Click origin column and destination column. GLOOBE calculates clear span and end connections automatically.'
        }
      }
    ],
    media: [
      {
        id: 'm-b-1',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '3D構造フレームと梁架設モデル', en: 'Structural Framing & Girder Layout' },
        caption: { ja: '大梁と柱の接合ディテールと3D配筋表示', en: 'Beam-to-column node connections in 3D BIM workspace.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['小梁を入力する際は「スパン等分割（2等分・3等分）」を選ぶと、通り芯間の寸法を測る必要がありません。'],
      en: ['When adding secondary beams, use the "Equal Divide" preset to snap directly to halves or thirds of the bay span.']
    },
    warnings: {
      ja: ['梁天端のレベルオフセットがスラブとずれていると、断面詳細図で隙間が生じます。'],
      en: ['Mismatched level offsets between top of beam and slab will cause unwanted gaps in section drawings.']
    },
    relatedToolIds: ['tool-column', 'tool-slab'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-door',
    categoryId: 'openings',
    subgroup: { ja: '開口・建具', en: 'Doors' },
    name: { ja: 'ドア・扉配置', en: 'Place Architectural Door' },
    shortDesc: { 
      ja: '壁上にクリックするだけで壁を自動開口し、開き勝手や枠寸法を反映します。', 
      en: 'Embeds doors into host walls with automatic openings, swing directions, and jamb settings.' 
    },
    fullDesc: {
      ja: '片開きドア、両開きドア、引戸、親子ドア、防火戸（特定防火設備・遮煙性能）などを壁面にダイレクト配置。配置時に壁が自動で開口カットされ、建具記号（SD-1, WD-1）が自動付番されます。建具表集計へそのまま直結します。',
      en: 'Inserts single, double, sliding, or fire-rated doors into walls. Walls automatically receive cutouts and door symbols (SD-1, WD-1) auto-increment, linked directly to schedules.'
    },
    shortcut: 'D',
    iconType: 'door',
    badge: { ja: '建具表連動', en: 'Schedule Linked' },
    isEssential: true,
    phase: 'detailed',
    steps: [
      {
        id: 's-d-1',
        stepNumber: 1,
        title: { ja: '建具カタログからタイプ選択', en: 'Select Door Type from Catalog' },
        instruction: { 
          ja: '建具ライブラリより「片開きスチールドア SD」「木製引戸 WD」などのメーカー規格品または社内標準品を選びます。',
          en: 'Browse the door library and choose steel doors (SD), wooden sliders (WD), or standard company prototypes.'
        }
      },
      {
        id: 's-d-2',
        stepNumber: 2,
        title: { ja: '壁の指示と開き勝手（右吊元/左吊元）決定', en: 'Pick Wall & Define Swing Direction' },
        instruction: { 
          ja: '設置したい壁をクリック。マウスを動かすと「内開き/外開き」「左吊元/右吊元」が切り替わるので、所望の向きで確定クリックします。',
          en: 'Click on the host wall. Move cursor across 4 quadrants to flip swing interior/exterior and left/right hinge, then click to confirm.'
        }
      },
      {
        id: 's-d-3',
        stepNumber: 3,
        title: { ja: '壁端部からの離れ寸法入力', en: 'Set Clearance from Corner' },
        instruction: { 
          ja: '柱面または壁入隅からの離れ寸法（通常100mm〜150mmの額縁逃げ）を確定します。',
          en: 'Lock in the clearance dimension (typically 100-150mm from column corner) using the dynamic dimension input.'
        }
      }
    ],
    media: [
      {
        id: 'm-d-1',
        url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '建具配置と開き勝手シミュレーション', en: 'Door Swing Placement Preview' },
        caption: { ja: '開き戸の軌跡表示と平面図・立面図自動連動', en: 'Door arc trajectory and synchronized plan/elevation display.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: [
        '配置後でも、建具をクリックした際に表示される青い矢印アイコン（フリップ記号）で、内外・左右勝手をいつでも反転できます。',
        '「特定防火設備」のフラグを立てておくと、防火区画図を作成する際に自動で特防記号が色分けされます。'
      ],
      en: [
        'Flip arrows appear upon selecting any placed door, allowing instant swing adjustments without deleting.',
        'Flagging as "Special Fire-Rated Door" automatically applies proper color-coded hatch in fire defense drawings.'
      ]
    },
    warnings: {
      ja: [
        '壁厚より大きい見込み寸法の枠を配置すると、3Dパースで枠が壁から飛び出して表現されます。'
      ],
      en: [
        'Using frame depth wider than the host wall causes frames to protrude in 3D views.'
      ]
    },
    relatedToolIds: ['tool-wall', 'tool-window'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-window',
    categoryId: 'openings',
    subgroup: { ja: '開口・建具', en: 'Windows' },
    name: { ja: '窓・サッシ配置', en: 'Place Window / Curtain Wall' },
    shortDesc: { 
      ja: '引き違い窓、FIX窓、スリット窓、連窓を窓台高さ（FL+）指定で配置します。', 
      en: 'Places sliding, fixed, and ribbon windows with exact sill height control from finished floor.' 
    },
    fullDesc: {
      ja: '引違いサッシ、FIX、縦すべり出し窓、掃き出しテラス窓など、サッシ形状と窓台高（FL+）を設定して壁に配置。採光面積・有効換気面積・排煙面積が自動算出され、建築確認申請の法規チェックシートにそのまま出力されます。',
      en: 'Places windows with configurable sill height. GLOOBE automatically calculates effective day-lighting, ventilation, and smoke extraction ratios required for Japanese building code permits.'
    },
    shortcut: 'Shift+W',
    iconType: 'window',
    badge: { ja: '法規連動', en: 'Legal Code' },
    isEssential: true,
    phase: 'detailed',
    steps: [
      {
        id: 's-wn-1',
        stepNumber: 1,
        title: { ja: 'サッシ種別と窓台高（FL+）の設定', en: 'Set Window Type & Sill Height' },
        instruction: { 
          ja: '窓ライブラリより符号（例：AW-1 引違い窓 W1650×H1100）を選び、窓台高さ「FL+900」等を指定します。',
          en: 'Choose window mark (e.g. AW-1 W1650xH1100) and designate sill elevation (e.g. FL+900mm).'
        }
      },
      {
        id: 's-wn-2',
        stepNumber: 2,
        title: { ja: '壁への配置と芯振分', en: 'Place on Wall & Center Alignment' },
        instruction: { 
          ja: '配置したい壁をクリック。通り芯間の中央に自動センタリングする「中間スナップ」が有効です。',
          en: 'Click target wall. Use Midpoint Snap to center the window automatically between bay columns.'
        }
      }
    ],
    media: [
      {
        id: 'm-wn-1',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '外観立面図でのサッシ納まり確認', en: 'Window Elevations in BIM Model' },
        caption: { ja: '配置した窓は立面図および展開図に自動展開されます', en: 'Placed windows automatically propagate to exterior elevations and interior elevations.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['居室情報を登録しておくと、採光補正係数（D/H）を自動計算し採光有効面積を算出します。'],
      en: ['Linking windows to registered room spaces auto-computes the required daylight calculation ratio (D/H).']
    },
    warnings: {
      ja: ['梁と干渉する高さに窓を配置した場合、GLOOBEの干渉警告が出ますので梁下端クリアランスを確認してください。'],
      en: ['Verify beam bottom clearance; GLOOBE will trigger clash warnings if windows intersect structural girders.']
    },
    relatedToolIds: ['tool-door', 'tool-reg-light'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-slab',
    categoryId: 'architecture',
    subgroup: { ja: 'スラブツール', en: 'Slab Tools' },
    name: { ja: 'スラブ・床配置（段差・勾配対応）', en: 'Place Floor Slab (Steps & Slopes)' },
    shortDesc: { 
      ja: '梁や通り芯で囲まれた領域をワンクリックで床スラブとして自動認識・生成します。', 
      en: 'Generates concrete slabs and interior floors by automatically detecting boundary loops.' 
    },
    fullDesc: {
      ja: 'GLOOBEの閉領域自動検出により、大梁や外壁で囲まれたグリッドをクリックするだけでスラブが生成されます。バルコニーや水回りの段差下げ（SL-50など）、ルーフバルコニーの水勾配スラブもパラメータ入力だけで簡単に作図できます。',
      en: 'Click inside beam enclosures to auto-detect slab boundaries. Easily configure level depressions (e.g. SL-50 for wet areas) or sloped drainage slabs for roof decks.'
    },
    shortcut: 'S',
    iconType: 'slab',
    badge: { ja: '領域自動検出', en: 'Auto Detect' },
    isEssential: true,
    phase: 'schematic',
    steps: [
      {
        id: 's-sl-1',
        stepNumber: 1,
        title: { ja: '床構造仕様の選定', en: 'Choose Slab Assembly' },
        instruction: { 
          ja: 'RCスラブ厚（t=150, 200）、仕上種別（フローリング / タイル / 防塵塗装）を設定します。',
          en: 'Set RC thickness (e.g. t=200) and finish assembly (timber flooring, tile, or waterproof coating).'
        }
      },
      {
        id: 's-sl-2',
        stepNumber: 2,
        title: { ja: '領域ピックまたは多角形描画', en: 'Pick Region or Draw Polygon' },
        instruction: { 
          ja: '通り芯で囲まれた区画の内側をクリック。「領域自動認識」で一瞬でスラブが配置されます。異形形状は多角形入力で行います。',
          en: 'Click inside any closed bay. Auto-Boundary identifies perimeters instantaneously, or draw custom polygons.'
        }
      }
    ],
    media: [
      {
        id: 'm-sl-1',
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '床スラブと段差納まり', en: 'Floor Slab & Depression Details' },
        caption: { ja: 'バルコニー段差および吹抜開口の立体モデル', en: 'Balcony drop and void penetration modeled accurately.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['吹抜や階段室の開口は「床開口ツール」で穴を開けると、スラブ厚が自動で小口処理されます。'],
      en: ['Use the Floor Void tool to cut stairwell openings so perimeter edges wrap properly.']
    },
    warnings: {
      ja: ['段差スラブを設定した際は、接続する梁の天端レベルも追従しているか断面図で必ず目視確認してください。'],
      en: ['Inspect section views when adjusting depressed slabs to make sure supporting beam tops also drop.']
    },
    relatedToolIds: ['tool-beam', 'tool-stair'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-stair',
    categoryId: 'architecture',
    subgroup: { ja: '階段ツール', en: 'Stairs' },
    name: { ja: '階段作成（直階段・折返し・螺旋）', en: 'Stair Generator (Straight / U-Turn)' },
    shortDesc: { 
      ja: '階高から蹴上・踏面を建築基準法クリア値で自動計算し、手摺付きで一括生成します。', 
      en: 'Computes riser & tread conforming to Japanese safety laws, automatically generating handrails.' 
    },
    fullDesc: {
      ja: '直階段、Uターン折返し階段、L字階段などを配置。階高（1FL〜2FL）の数値を読み取り、建築基準法（法第23条：蹴上23cm以下・踏面15cm以上など）を満たす段数を自動計算サジェストします。踊り場や側桁、手摺もワンタッチで作成されます。',
      en: 'Creates straight, dog-leg, or spiral stairs. Reads floor-to-floor heights and suggests step counts meeting Japanese Building Standard Law Article 23. Handrails and stringers are created simultaneously.'
    },
    shortcut: 'Shift+S',
    iconType: 'stair',
    badge: { ja: '法規適合計算', en: 'Legal Compliant' },
    isEssential: false,
    phase: 'schematic',
    steps: [
      {
        id: 's-st-1',
        stepNumber: 1,
        title: { ja: '階段形状と階高の確認', en: 'Select Stair Type & Height' },
        instruction: { 
          ja: '「折返し階段」などのテンプレートを選び、下階・上階の基準レベルを確認します。',
          en: 'Pick dog-leg or straight stair template and check bottom and top level bounds.'
        }
      },
      {
        id: 's-st-2',
        stepNumber: 2,
        title: { ja: '段数・蹴上・踏面寸法の自動決定', en: 'Auto-Compute Risers & Treads' },
        instruction: { 
          ja: '段数を入力すると蹴上寸法が自動計算されます（例：階高3000mm ÷ 15段 = 蹴上200mm、踏面240mm）。',
          en: 'Enter step count; riser height calculates automatically (e.g. 3000mm / 15 = 200mm riser).'
        }
      },
      {
        id: 's-st-3',
        stepNumber: 3,
        title: { ja: '配置と上り方向（UP/DN）矢印配置', en: 'Place & Generate UP/DN Arrows' },
        instruction: { 
          ja: '配置基準点をクリック。平面図に「UP」矢印記号が自動描画され、上階フロアには「DN」として自動反映画されます。',
          en: 'Click base location point. UP arrows appear on the lower floor plan while DN reflects upstairs.'
        }
      }
    ],
    media: [
      {
        id: 'm-st-1',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '折返し階段の3Dビューと平面表示', en: 'Stair 3D and 2D Synchronization' },
        caption: { ja: '自動計算された段数と手摺付き階段モデル', en: 'Stairway modeled with automatic handrails and code-compliant treads.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['階段下を「階段下収納」や「トイレ」にする場合、有効天井高（クリアランス）チェックが3Dで視覚化できます。'],
      en: ['Clearance height visualization shows whether headroom below stairs is sufficient for storage or restrooms.']
    },
    warnings: {
      ja: ['上階スラブに開口（吹抜）がないと、上階スラブに階段が突入して衝突します。「スラブ開口自動連動」にチェックを入れてください。'],
      en: ['Enable "Auto Floor Void" so the stair cuts an opening through the upper concrete slab cleanly.']
    },
    relatedToolIds: ['tool-slab', 'tool-wall'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-site-boundary',
    categoryId: 'site',
    subgroup: { ja: '敷地境界', en: 'Site Boundary' },
    name: { ja: '敷地境界線・公図取込', en: 'Site Boundary & DXF Cadastral Import' },
    shortDesc: { 
      ja: '公図DXFや測量座標（三斜・三辺）から敷地境界線と求積表を生成します。', 
      en: 'Generates property boundary lines and parcel area calculations from survey data or DXF.' 
    },
    fullDesc: {
      ja: '測量図（SIMAデータやDXF）をインポートするか、境界点間の三斜求積寸法をキー入力して敷地ポリゴンを作成。道路境界線・隣地境界線を属性分けすることで、斜線制限や日影計算の判定ラインとして後工程で全自動リンクします。',
      en: 'Imports DXF/SIMA survey data or constructs boundary polygons via boundary coordinate entry. Designating road edges and neighbor lot edges prepares lines for automated setback envelopes.'
    },
    shortcut: 'Shift+P',
    iconType: 'site',
    badge: { ja: '法規基準線', en: 'Site Master' },
    isEssential: true,
    phase: 'schematic',
    steps: [
      {
        id: 's-sb-1',
        stepNumber: 1,
        title: { ja: '公図または測量データのインポート', en: 'Import Survey Cadastral' },
        instruction: { 
          ja: '「外部データ読込」から測量図DXFを取り込むか、境界点座標を入力します。',
          en: 'Import survey DXF or manually input corner vertex coordinates.'
        }
      },
      {
        id: 's-sb-2',
        stepNumber: 2,
        title: { ja: '境界線種別（道路 / 隣地）の割り当て', en: 'Assign Edge Types (Road / Neighbor)' },
        instruction: { 
          ja: '各辺をクリックして「道路境界（幅員m入力）」「隣地境界」「水路境界」を割り当てます。真北方位角を設定します。',
          en: 'Click each boundary segment and assign Road (enter road width), Neighbor, or Waterway. Set True North angle.'
        }
      }
    ],
    media: [
      {
        id: 'm-sb-1',
        url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '敷地求積図と道路幅員設定', en: 'Site Boundary & Road Width Definition' },
        caption: { ja: '道路境界線と隣地境界線の色分けおよび三斜求積', en: 'Visualizing road vs neighbor boundary lines and parcel calculation.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['「真北」を正確に設定しないと、日影規制計算や天空率計算がすべて不適合になってしまいます。現地測量図の真北角を必ず照合してください。'],
      en: ['Always confirm True North angle against official survey drawings before performing shadow studies.']
    },
    warnings: {
      ja: ['2面道路や隅切りがある敷地では、特定行政庁の取り扱い基準を確認して道路境界線を設定してください。'],
      en: ['Corner plots with road truncations must follow local municipal building authority guidelines.']
    },
    relatedToolIds: ['tool-reg-shadow', 'tool-reg-setback'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-reg-setback',
    categoryId: 'regulations',
    subgroup: { ja: '集団規定・斜線', en: 'Height Envelopes' },
    name: { ja: '斜線制限3D判定（道路・隣地・北側）', en: 'Setback Envelopes (Road, Neighbor, North)' },
    shortDesc: { 
      ja: '道路斜線・隣地斜線・北側斜線の3DコーンをワンクリックでBIMモデルに投影・干渉判定します。', 
      en: 'Projects 3D setback envelope surfaces onto the building model to detect height violations.' 
    },
    fullDesc: {
      ja: '建築基準法第56条に基づく斜線制限（用途地域・容積率に応じた適用勾配 1.25 / 1.5）を立体サーフェスとして可視化。建物ボリュームが斜線制限を超過している場合、該当する屋根や外壁が赤色でハイライトされ、斜線検討図面（断面斜線図）が即座に出力されます。',
      en: 'Visualizes 3D setback planes for Road, Neighbor, and North-side restrictions based on Japanese zoning parameters. Building portions exceeding legal envelopes highlight in bright red.'
    },
    shortcut: 'Alt+H',
    iconType: 'shield',
    badge: { ja: '自動判定', en: 'Auto Check' },
    isEssential: true,
    phase: 'schematic',
    steps: [
      {
        id: 's-rs-1',
        stepNumber: 1,
        title: { ja: '用途地域・法規パラメータの入力', en: 'Set Zoning & Slopes' },
        instruction: { 
          ja: '法規設定パレットで「住居系（1.25勾配 / 北側斜線適用）」または「商業系（1.5勾配）」を指定します。',
          en: 'Set zoning district to Residential (1:1.25 slope with North-side setback) or Commercial (1:1.5 slope).'
        }
      },
      {
        id: 's-rs-2',
        stepNumber: 2,
        title: { ja: '斜線サーフェス表示と超過チェック', en: 'Display 3D Envelopes' },
        instruction: { 
          ja: '「3D斜線面生成」を実行。透視図上で斜線制限面が表示され、建物との接触・離れが数値表示されます。',
          en: 'Run "Generate 3D Envelope". Transparent planes visualize boundaries with clearance distances.'
        }
      }
    ],
    media: [
      {
        id: 'm-rs-1',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '3D空間における道路・隣地斜線制限面の投影', en: '3D Setback Planes Intersecting Building Volume' },
        caption: { ja: '法規適合状況をクライアントや確認審査機関に直感的に説明可能です', en: 'Clear proof of zoning compliance for permit examiners and clients.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['斜線を超えてしまった場合は、「天空率計算」モジュールに切り替えることで適合判定を受けられるケースが多いです。'],
      en: ['If height limits are breached, switch to the Sky Factor (天空率) module to verify alternative compliance.']
    },
    warnings: {
      ja: ['セットバック緩和（道路境界線からの後退距離）が正しく適用されているか、敷地境界線のオフセット設定を確認してください。'],
      en: ['Ensure setback mitigation distance from road boundary is accurately configured in property properties.']
    },
    relatedToolIds: ['tool-site-boundary', 'tool-reg-shadow'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-reg-shadow',
    categoryId: 'regulations',
    subgroup: { ja: '日影規制', en: 'Shadow Study' },
    name: { ja: '日影規制シミュレーション（冬至日）', en: 'Shadow Study Simulation (Winter Solstice)' },
    shortDesc: { 
      ja: '冬至日の真太陽時における等時間日影図（5m・10mライン）を瞬時に作成・判定します。', 
      en: 'Simulates winter solstice isochronous shadow curves (5m / 10m lines) for permit approval.' 
    },
    fullDesc: {
      ja: '建築基準法第56条の2に基づく日影規制計算を行います。冬至日の午前8時から午後4時（北海道等では午前9時から午後3時）までの日影を、緯度経度・真北角に基づき高精度レイトレーシングで計算。敷地境界線から5m・10m規制ラインにおける規制時間（例：3時間-2時間）のクリア合否を自動判定します。',
      en: 'Performs solar shadow simulations on the winter solstice between 8:00 AM and 4:00 PM true solar time. Computes 5m and 10m regulatory offset boundaries with automated pass/fail results.'
    },
    shortcut: 'Alt+S',
    iconType: 'sun',
    badge: { ja: '確認申請必須', en: 'Permit Crucial' },
    isEssential: true,
    phase: 'permits',
    steps: [
      {
        id: 's-rsh-1',
        stepNumber: 1,
        title: { ja: '建設地緯度経度と規制基準の選択', en: 'Set Geographic Latitude & Rules' },
        instruction: { 
          ja: '行政区（都道府県・市区町村）を選択して緯度経度を自動取得し、条例指定の規制時間（例：4h-2.5h）を設定します。',
          en: 'Select municipal location to load latitude/longitude and regulatory duration caps (e.g. 4h-2.5h).'
        }
      },
      {
        id: 's-rsh-2',
        stepNumber: 2,
        title: { ja: '日影計算実行と等時間線プロット', en: 'Run Shadow Computation' },
        instruction: { 
          ja: '「日影解析実行」をクリック。数秒で等時間日影図がカラーグラデーションで平面図上に描画されます。',
          en: 'Click "Execute Shadow Analysis". Isochronous shadow contour bands plot onto the site plan.'
        }
      }
    ],
    media: [
      {
        id: 'm-rsh-1',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '冬至日影シミュレーション解析図', en: 'Winter Solstice Shadow Contours' },
        caption: { ja: '5mラインおよび10mラインでの日影時間クリア判定結果', en: 'Automated verification along 5m and 10m regulatory measurement lines.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['パラペットの高さやペントハウス（階段室等）の位置を調整しながら、リアルタイム差分解析が可能です。'],
      en: ['Live re-calculation allows fine-tuning parapet heights and penthouse positions with instant feedback.']
    },
    warnings: {
      ja: ['平均地盤面（GL）の算定が完了していない場合、測定面の高さ設定（H=1.5mまたは4.0m）に誤差が生じます。'],
      en: ['Calculate average ground level first, otherwise the regulatory measurement elevation will be offset.']
    },
    relatedToolIds: ['tool-reg-setback', 'tool-site-boundary'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-drawing-auto',
    categoryId: 'drawing',
    subgroup: { ja: '図面作成', en: 'Drawings' },
    name: { ja: '意匠図・構造図自動切り出し', en: 'Auto 2D Drawings Generation' },
    shortDesc: { 
      ja: 'BIMモデルから平面図・立面図・断面図・矩計図を寸法線付きで一括切り出しします。', 
      en: 'Extracts dimensioned floor plans, elevations, sections, and detail sheets directly from BIM.' 
    },
    fullDesc: {
      ja: '一度作成した3D BIMモデルから、確認申請・実施設計レベルの2D意匠図・構造図を自動切り出し。切断位置（フロアFL+1200mm）や視線方向を指定するだけで、通り芯寸法、部材符号、室名、床高注記が自動で配置されます。モデル修正時は図面もワンクリックで全自動更新されます。',
      en: 'Converts 3D BIM models into working drawings and municipal permit sheets. Generates elevations, cross-sections, and detail wall sections with automatic dimension chains and room tags.'
    },
    shortcut: 'Ctrl+D',
    iconType: 'drawing',
    badge: { ja: 'BIM自動製図', en: 'Auto CAD' },
    isEssential: true,
    phase: 'detailed',
    steps: [
      {
        id: 's-da-1',
        stepNumber: 1,
        title: { ja: '切り出し図面種類の選択', en: 'Select Sheet Target' },
        instruction: { 
          ja: '図面マネージャより「1階平面詳細図（1/50）」「南立面図（1/100）」「X1通り断面図」などをチェックします。',
          en: 'Check target sheets in the Drawing Manager: 1F Plan (1:50), South Elevation (1:100), or Section X1.'
        }
      },
      {
        id: 's-da-2',
        stepNumber: 2,
        title: { ja: '自動注記・寸法付加オプション設定', en: 'Configure Auto Annotations' },
        instruction: { 
          ja: '「通り芯寸法線」「開口幅寸法」「建具符号」「天井高CH」の自動表記フラグをONにします。',
          en: 'Turn on auto-dimension chains, opening widths, door marks, and ceiling heights.'
        }
      },
      {
        id: 's-da-3',
        stepNumber: 3,
        title: { ja: '図面シートへのレイアウト出力', en: 'Publish to Sheet Layout' },
        instruction: { 
          ja: '図郭（社内標準A1/A3図枠）を選択してレイアウト。PDFまたはJWW/DWG形式へ一括書き出し可能です。',
          en: 'Place drawings onto company titleblock sheets and batch export to PDF or DWG/JWW.'
        }
      }
    ],
    media: [
      {
        id: 'm-da-1',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        title: { ja: '自動生成されたA1平面詳細図面', en: 'Auto-Generated Working Drawing' },
        caption: { ja: '3Dモデルから寸法線・建具符号・仕上げ注記が自動連動して配置されます', en: 'Dimensions, tags, and annotations populated directly from the BIM database.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['切り出した図面に手動で書き加えた注記文字や寸法も、モデル再切り出し時に保持される「ハイブリッド図面機能」が活用できます。'],
      en: ['Hybrid Drawing feature preserves manual annotations and 2D detail edits when regenerating sheets from BIM.']
    },
    warnings: {
      ja: ['レイヤ（画層）の表示・非表示設定が図面種別ごとに固定されているか、図面ビュー設定を確認してください。'],
      en: ['Check view templates so architectural vs structural layer visibility rules are maintained consistently.']
    },
    relatedToolIds: ['tool-wall', 'tool-door', 'tool-window'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-presentation-3d',
    categoryId: 'presentation',
    subgroup: { ja: 'パース・CG', en: 'Visual' },
    name: { ja: '3Dパース・ウォークスルー', en: '3D Perspective & Walkthrough' },
    shortDesc: { 
      ja: 'ワンクリックでフォトリアルなCGパースや室内ウォークスルー動画を生成します。', 
      en: 'Creates photorealistic architectural renderings and interior animated walkthroughs.' 
    },
    fullDesc: {
      ja: 'GLOOBEに内蔵されたレンダリングエンジンにより、マテリアル（木目、打ち放しコンクリート、ガラス、植栽）の質感や太陽光・照明器具の光条を高品質に再現。施主プレゼンテーション用の鳥瞰図・アイレベルパース、リアルタイムウォークスルーを短時間で出力します。',
      en: 'High-speed GPU rendering engine produces realistic material textures (wood grain, fair-faced concrete, glass, foliage) and physical sunlight/artificial lighting for client presentations.'
    },
    shortcut: 'F9',
    iconType: 'camera',
    badge: { ja: 'リアルタイムCG', en: 'Photoreal' },
    isEssential: false,
    phase: 'schematic',
    steps: [
      {
        id: 's-p3-1',
        stepNumber: 1,
        title: { ja: 'カメラ視点（アイレベル）の登録', en: 'Position Eye-Level Camera' },
        instruction: { 
          ja: '視点位置（FL+1500mm）と注視点をドラッグしてアングルを決定し、カメラブックマークに保存します。',
          en: 'Set camera viewpoint (FL+1500mm human eye-level) and target point, then save to Bookmarks.'
        }
      },
      {
        id: 's-p3-2',
        stepNumber: 2,
        title: { ja: '太陽光（日時・季節）と照明の調光', en: 'Tune Sunlight & Fixtures' },
        instruction: { 
          ja: '「日時設定（例：5月10日 午後2時）」で太陽高度を決め、室内のダウンライトや間接照明を点灯します。',
          en: 'Set solar date/time for realistic shadows, and turn on interior downlights and cove accents.'
        }
      },
      {
        id: 's-p3-3',
        stepNumber: 3,
        title: { ja: 'レンダリング出力またはVR動画保存', en: 'Render & Export High-Res Image' },
        instruction: { 
          ja: '出力解像度（4K / A3プレゼン用300dpi）を選び、「レンダリング開始」をクリックします。',
          en: 'Select output resolution (4K / 300dpi A3 print) and execute rendering.'
        }
      }
    ],
    media: [
      {
        id: 'm-p3-1',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        title: { ja: 'GLOOBEリアルタイム3Dパースレンダリング', en: 'GLOOBE Realtime Architectural Render' },
        caption: { ja: '木造・RC造のマテリアルや自然光の差し込みを忠実に表現', en: 'Faithful reproduction of materials and natural light for client buy-in.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['背景に周辺環境写真（現地パノラマ写真）を合成することで、近隣への説明会や景観シミュレーションに極めて有効です。'],
      en: ['Synthesizing a 360-degree panorama of the actual construction site behind the model enhances realism for municipal hearings.']
    },
    warnings: {
      ja: ['高解像度レンダリング時はグラフィックボードのVRAM使用量が増加するため、他のCADソフトを閉じておくことを推奨します。'],
      en: ['Close heavy background applications during 4K render runs to free up GPU VRAM.']
    },
    relatedToolIds: ['tool-wall', 'tool-window'],
    updatedAt: '2026-09-29'
  },
  {
    id: 'tool-ifc-collab',
    categoryId: 'collaboration',
    subgroup: { ja: 'BIM連携', en: 'IFC Interop' },
    name: { ja: 'IFC入出力・建築BIMデータ連携', en: 'IFC Import/Export & OpenBIM' },
    shortDesc: { 
      ja: '国土交通省建築BIMガイドラインに準拠したIFC形式で構造・設備ソフトと連携します。', 
      en: 'Exchanges OpenBIM IFC models with structural and MEP software per MLIT guidelines.' 
    },
    fullDesc: {
      ja: 'Revit、ArchiCAD、構造計算ソフト（BUS、SUPER BUILD）、建築設備CAD（Tfas、Rebro）とのOpenBIM連携を実現。IFC2x3およびIFC4形式での出力に対応し、部材属性（プロパティセット、Pset_WallCommonなど）や部材符号情報を欠落なく相互変換します。',
      en: 'Enables OpenBIM collaboration with structural analysis (BUS, SEIN) and MEP software (Tfas, Rebro, Revit). Supports IFC2x3 and IFC4 with rich property sets (Psets) intact.'
    },
    shortcut: 'Ctrl+Shift+E',
    iconType: 'share',
    badge: { ja: '国交省BIM基準', en: 'OpenBIM' },
    isEssential: true,
    phase: 'construction',
    steps: [
      {
        id: 's-if-1',
        stepNumber: 1,
        title: { ja: 'エクスポート対象フロアと部材のフィルタ', en: 'Filter Floors & Elements' },
        instruction: { 
          ja: '「IFCエクスポート」画面で、出力対象階（1F〜R階）および部材種別（躯体のみ / 内装建具含む）をチェックします。',
          en: 'In the IFC Export dialogue, select active levels and element categories (structure only vs complete architectural).'
        }
      },
      {
        id: 's-if-2',
        stepNumber: 2,
        title: { ja: 'IFCスキーマ（IFC4 / IFC2x3）の指定', en: 'Select IFC Schema' },
        instruction: { 
          ja: '連携先ソフトウェアの対応バージョンに合わせてスキーマ（通常はIFC4 Design Transfer View）を選択します。',
          en: 'Choose schema version (IFC4 Design Transfer View or IFC 2x3 Coordination View 2.0).'
        }
      }
    ],
    media: [
      {
        id: 'm-if-1',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        title: { ja: 'BIM連携と構造・設備モデル干渉統合ビュー', en: 'BIM Clash Detection and MEP Coordination' },
        caption: { ja: 'IFC経由で設備配管と建築躯体の干渉を事前検証可能', en: 'Checking clashes between MEP pipes and structural beams using imported IFC.' },
        type: 'image',
        isPrimary: true
      }
    ],
    tips: {
      ja: ['日本国内の建築BIM基準に準拠するため、「国交省Pset付与」オプションにチェックを入れて出力してください。'],
      en: ['Check the "MLIT Property Set" option to embed standardized Japanese BIM metadata into exports.']
    },
    warnings: {
      ja: ['座標原点（世界測地系・プロジェクト基点）が他社モデルとずれていると、重ね合わせた際に位置が離れて表示されます。原点ピン留めを確認してください。'],
      en: ['Always confirm shared survey coordinates and origin points so multi-disciplinary models align seamlessly.']
    },
    relatedToolIds: ['tool-drawing-auto', 'tool-reg-setback'],
    updatedAt: '2026-09-29'
  }
];
