import React, { useState, useEffect } from 'react';
import { Language, PreviewMediaItem, StepItem } from '../types/manual';
import { 
  Play, Pause, ChevronLeft, ChevronRight, Film, Edit3, Trash2, Eye,
  Video, Image as ImageIcon, Sparkles, Layers, Maximize2, Minimize2
} from 'lucide-react';
import { CadIcon } from './CadIcon';

interface InteractiveCadCanvasProps {
  toolType: string;
  lang: Language;
  boxTitle?: { ja: string; en: string };
  toolName?: { ja: string; en: string };
  boxDescription?: { ja: string; en: string };
  logoIconUrl?: string;
  simulatorGifUrl?: string;
  gifUrls?: string[];
  mediaList?: PreviewMediaItem[];
  steps?: StepItem[];
  onEditBox?: () => void;
  onDeleteBox?: () => void;
  canDelete?: boolean;
}

export const InteractiveCadCanvas: React.FC<InteractiveCadCanvasProps> = ({
  toolType,
  lang,
  boxTitle,
  toolName,
  boxDescription,
  logoIconUrl,
  simulatorGifUrl,
  gifUrls,
  mediaList,
  steps = [],
  onEditBox,
  onDeleteBox,
  canDelete = false,
}) => {
  const totalSteps = steps.length > 0 ? steps.length : 4;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);

  // Consolidate media files list (supports 2, 3, or more GIFs/WebMs)
  const consolidatedMedia: PreviewMediaItem[] = React.useMemo(() => {
    if (mediaList && mediaList.length > 0) return mediaList;
    if (gifUrls && gifUrls.length > 0) {
      return gifUrls.map((url, idx) => ({
        id: `media-url-${idx}`,
        url,
        type: url.includes('.webm') || url.includes('.mp4') ? 'webm' : 'gif',
        title: {
          ja: `GIF / 動画 ${idx + 1}`,
          en: `Demo ${idx + 1}`,
        },
      }));
    }
    if (simulatorGifUrl) {
      return [{
        id: 'media-url-primary',
        url: simulatorGifUrl,
        type: simulatorGifUrl.includes('.webm') || simulatorGifUrl.includes('.mp4') ? 'webm' : 'gif',
        title: {
          ja: 'GIF 1: 操作デモ',
          en: 'Demo GIF 1',
        },
      }];
    }
    return [];
  }, [mediaList, gifUrls, simulatorGifUrl]);

  // Active media index state (switches between the 2, 3, or more GIFs/videos)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Reset activeMediaIndex if consolidatedMedia changes
  useEffect(() => {
    if (activeMediaIndex >= consolidatedMedia.length && consolidatedMedia.length > 0) {
      setActiveMediaIndex(0);
    }
  }, [consolidatedMedia.length, activeMediaIndex]);

  // Link a clicked step to its chosen GIF/WebM. Older steps without a media
  // id continue to work by URL or matching the media item in the same position.
  useEffect(() => {
    const step = steps[currentStepIndex];
    if (!step || consolidatedMedia.length === 0) return;
    const mediaIndex = step.mediaId
      ? consolidatedMedia.findIndex((media) => media.id === step.mediaId)
      : step.mediaUrl
        ? consolidatedMedia.findIndex((media) => media.url === step.mediaUrl)
        : currentStepIndex < consolidatedMedia.length ? currentStepIndex : -1;
    if (mediaIndex >= 0) setActiveMediaIndex(mediaIndex);
  }, [consolidatedMedia, currentStepIndex, steps]);

  // Auto-play timer when play is active
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % totalSteps);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

  // Navigation handlers
  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : totalSteps - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev < totalSteps - 1 ? prev + 1 : 0));
  };

  const handleStepClick = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
  };

  // Media navigation
  // Current active step information
  const activeStep = steps[currentStepIndex];

  // Active media item
  const currentMedia = consolidatedMedia[activeMediaIndex];
  const activeMediaUrl = currentMedia?.url || activeStep?.mediaUrl;
  const isVideo = currentMedia?.type === 'webm' || currentMedia?.type === 'video' || (activeMediaUrl && (activeMediaUrl.endsWith('.webm') || activeMediaUrl.endsWith('.mp4')));

  // Title fallback
  const displayTitle = boxTitle 
    ? (lang === 'ja' ? boxTitle.ja : boxTitle.en)
    : (lang === 'ja' ? 'プレビューツール' : 'Preview Tool');

  const displayToolName = toolName
    ? (lang === 'ja' ? toolName.ja : toolName.en)
    : undefined;

  // Render SVG animation simulation fallback based on tool & currentStepIndex if no GIF yet
  const renderFallbackPreview = () => {
    switch (toolType) {
      case 'finish':
      case 'finishes':
      case 'ceiling':
        return (
          <svg viewBox="0 0 400 240" className="w-full h-full select-none bg-stone-50/90 rounded-xl border border-stone-200 shadow-inner">
            <defs>
              <pattern id="cadGridFin" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <circle cx="40" cy="40" r="1.5" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cadGridFin)" />
            <rect x="50" y="40" width="300" height="160" fill="none" stroke="#64748b" strokeWidth="4" />
            
            {currentStepIndex >= 0 && (
              <>
                <rect x="60" y="50" width="100" height="30" rx="4" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
                <text x="110" y="70" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="bold">
                  {lang === 'ja' ? '内部天井仕上 ▼' : 'Ceiling Finish ▼'}
                </text>
              </>
            )}

            {currentStepIndex >= 1 && (
              <>
                <line x1="200" y1="40" x2="200" y2="200" stroke="#f97316" strokeDasharray="3 3" />
                <rect x="150" y="105" width="100" height="24" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
                <text x="200" y="121" textAnchor="middle" fill="#0284c7" fontSize="11" fontWeight="bold">CH = 2,500 mm</text>
              </>
            )}

            {currentStepIndex >= 2 && (
              <>
                <rect x="54" y="44" width="292" height="152" fill="#ea580c" fillOpacity="0.12" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="200" cy="120" r="10" fill="none" stroke="#ea580c" strokeWidth="2" className="animate-ping" />
                <text x="200" y="160" textAnchor="middle" fill="#ea580c" fontSize="12" fontWeight="bold">
                  {lang === 'ja' ? '部屋領域をピック' : 'Pick Room Boundary'}
                </text>
              </>
            )}

            {currentStepIndex >= 3 && (
              <>
                <line x1="54" y1="80" x2="346" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="54" y1="120" x2="346" y2="120" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="54" y1="160" x2="346" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="120" y1="44" x2="120" y2="196" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="200" y1="44" x2="200" y2="196" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="280" y1="44" x2="280" y2="196" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="250" y="165" width="85" height="24" rx="4" fill="#16a34a" />
                <text x="292" y="181" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  {lang === 'ja' ? '天井仕上 生成完了' : 'Ceiling Generated'}
                </text>
              </>
            )}
          </svg>
        );

      case 'wall':
        return (
          <svg viewBox="0 0 400 240" className="w-full h-full select-none bg-stone-50/90 rounded-xl border border-stone-200 shadow-inner">
            <defs>
              <pattern id="cadGridW" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <circle cx="40" cy="40" r="1.5" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cadGridW)" />

            <line x1="60" y1="20" x2="60" y2="220" stroke="#f97316" strokeWidth="1.2" strokeDasharray="6 3" />
            <line x1="340" y1="20" x2="340" y2="220" stroke="#f97316" strokeWidth="1.2" strokeDasharray="6 3" />
            <line x1="20" y1="120" x2="380" y2="120" stroke="#f97316" strokeWidth="1.2" strokeDasharray="6 3" />

            <circle cx="60" cy="20" r="10" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="60" y="24" textAnchor="middle" fill="#ea580c" fontSize="10" fontWeight="bold">X1</text>
            <circle cx="340" cy="20" r="10" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="340" y="24" textAnchor="middle" fill="#ea580c" fontSize="10" fontWeight="bold">X2</text>

            {currentStepIndex >= 0 && (
              <>
                <circle cx="60" cy="120" r="5" fill="#0284c7" />
                <circle cx="60" cy="120" r="10" fill="none" stroke="#0284c7" strokeWidth="1.5" className="animate-ping" />
                <text x="75" y="105" fill="#0369a1" fontSize="11" fontWeight="bold">
                  {lang === 'ja' ? '① 始点クリック' : '1. Start Point'}
                </text>
              </>
            )}

            {currentStepIndex >= 1 && (
              <>
                <line x1="60" y1="120" x2="200" y2="120" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
                <rect x="110" y="85" width="84" height="22" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                <text x="152" y="100" textAnchor="middle" fill="#0369a1" fontSize="10" fontWeight="bold">L = 3,500 mm</text>
              </>
            )}

            {currentStepIndex >= 2 && (
              <>
                <rect x="60" y="106" width="280" height="28" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                <line x1="60" y1="120" x2="340" y2="120" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="340" cy="120" r="5" fill="#16a34a" />
                <text x="310" y="155" fill="#15803d" fontSize="11" fontWeight="bold">
                  {lang === 'ja' ? '② 終点確定' : '2. End Point'}
                </text>
              </>
            )}

            {currentStepIndex >= 3 && (
              <>
                <rect x="326" y="40" width="28" height="94" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                <line x1="340" y1="40" x2="340" y2="120" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="340" cy="120" r="18" fill="none" stroke="#16a34a" strokeWidth="2" strokeDasharray="3 3" />
                <text x="260" y="70" fill="#15803d" fontSize="11" fontWeight="bold">
                  {lang === 'ja' ? '③ 自動包絡接合' : '3. Auto Miter'}
                </text>
              </>
            )}
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 400 240" className="w-full h-full select-none bg-stone-50/90 rounded-xl border border-stone-200 shadow-inner">
            <line x1="200" y1="120" x2="340" y2="70" stroke="#f43f5e" strokeWidth="2" />
            <line x1="200" y1="120" x2="60" y2="70" stroke="#10b981" strokeWidth="2" />
            <line x1="200" y1="120" x2="200" y2="220" stroke="#3b82f6" strokeWidth="2" />
            
            <circle cx="200" cy="120" r="6" fill="#ea580c" />
            <rect x="130" y="40" width="140" height="70" rx="8" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="200" y="70" textAnchor="middle" fill="#ea580c" fontSize="13" fontWeight="bold">GLOOBE BIM</text>
            <text x="200" y="90" textAnchor="middle" fill="#64748b" fontSize="10">
              {lang === 'ja' ? `Step ${currentStepIndex + 1} プレビュー` : `Step ${currentStepIndex + 1} Preview`}
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-200/90 bg-gradient-to-b from-orange-50/20 via-white to-white p-4 sm:p-5 shadow-xs space-y-3">
      
      {/* Top Header: Box Title, Tool Logo, Tool Name, Play/Pause, Edit */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-orange-100 text-xs">
        <div className="flex items-center gap-2.5">
          {/* Tool Logo / Icon (Customizable) */}
          <div className="w-8 h-8 rounded-lg bg-orange-100/80 border border-orange-200 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-2xs">
            <CadIcon 
              type={toolType} 
              customIconUrl={logoIconUrl} 
              size={20} 
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 text-sm">
                {displayTitle}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                <Film className="w-3 h-3 text-orange-600" />
                <span>GIF DEMO</span>
              </div>
            </div>

            {displayToolName && (
              <span className="text-[11px] text-stone-500 font-medium">
                {displayToolName}
              </span>
            )}

            {boxDescription && (
              <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                {lang === 'ja' ? boxDescription.ja : boxDescription.en}
              </p>
            )}
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {onEditBox && (
            <button
              onClick={onEditBox}
              className="p-1.5 rounded-lg border border-stone-200 hover:border-orange-500 bg-white text-stone-600 hover:text-orange-600 transition shadow-2xs text-xs flex items-center gap-1"
              title={lang === 'ja' ? 'このボックスを編集' : 'Edit Box'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ja' ? '設定' : 'Edit'}</span>
            </button>
          )}

          {canDelete && onDeleteBox && (
            <button
              onClick={onDeleteBox}
              className="p-1.5 rounded-lg border border-stone-200 hover:border-red-500 bg-white text-stone-400 hover:text-red-600 transition shadow-2xs"
              title={lang === 'ja' ? 'このボックスを削除' : 'Delete Box'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-orange-500 text-stone-700 text-xs font-semibold shadow-2xs transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-orange-600" /> : <Play className="w-3.5 h-3.5 text-orange-600" />}
            <span>{isPlaying ? (lang === 'ja' ? '一時停止' : 'Pause') : (lang === 'ja' ? '自動再生' : 'Auto Play')}</span>
          </button>
        </div>
      </div>

      {/* Media Canvas Stage (Shows GIF Demo, WebM Video, or Fallback) */}
      <div className="group/stage relative aspect-[16/10] sm:aspect-[16/9] max-h-[340px] w-full rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200 shadow-2xs">
        {activeMediaUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-stone-900">
            {isVideo ? (
              <video
                key={activeMediaUrl}
                src={activeMediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={activeMediaUrl}
                alt={displayTitle}
                className="w-full h-full object-contain"
              />
            )}

            {/* Media Type & Index Badge */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <div className="px-2 py-0.5 rounded bg-orange-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                {isVideo ? (
                  <Video className="w-3 h-3" />
                ) : (currentMedia?.type === 'webp' || activeMediaUrl?.toLowerCase().includes('.webp')) ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <Film className="w-3 h-3" />
                )}
                <span>
                  {isVideo
                    ? 'WEBM VIDEO'
                    : (currentMedia?.type === 'webp' || activeMediaUrl?.toLowerCase().includes('.webp'))
                    ? 'WEBP DEMO'
                    : 'GIF DEMO'}
                </span>
              </div>
              {consolidatedMedia.length > 1 && (
                <div className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                  {activeMediaIndex + 1} / {consolidatedMedia.length}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMediaExpanded(true)}
              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg bg-black/65 hover:bg-orange-600 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-md transition"
              title={lang === 'ja' ? 'メディアを拡大' : 'Enlarge media'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{lang === 'ja' ? '拡大' : 'Enlarge'}</span>
            </button>

            {/* Media Caption / Title Overlay Bar */}
            {currentMedia?.title && (
              <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-xs flex items-center justify-between pointer-events-none">
                <span className="font-semibold truncate">
                  {lang === 'ja' ? currentMedia.title.ja : currentMedia.title.en}
                </span>
                {currentMedia.caption && (
                  <span className="text-[10px] text-stone-300 ml-2 hidden sm:inline truncate">
                    {lang === 'ja' ? currentMedia.caption.ja : currentMedia.caption.en}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          renderFallbackPreview()
        )}
      </div>

            {isMediaExpanded && activeMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-sm"
          onClick={() => setIsMediaExpanded(false)}
        >
          <div
            className="flex h-full w-full max-w-[1600px] flex-col overflow-hidden rounded-2xl bg-stone-950 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">
                  {currentMedia?.title
                    ? (lang === 'ja'
                        ? currentMedia.title.ja
                        : currentMedia.title.en)
                    : displayTitle}
                </div>
                {activeStep?.title && (
                  <div className="mt-1 truncate text-xs text-stone-400">
                    {lang === 'ja'
                      ? activeStep.title.ja
                      : activeStep.title.en}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMediaExpanded(false)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-orange-600"
                title={lang === 'ja' ? '縮小' : 'Minimize'}
              >
                <Minimize2 className="h-4 w-4" />
                <span>{lang === 'ja' ? '縮小' : 'Minimize'}</span>
              </button>
            </div>

            {/* Main content: media on the left, linked description on the right */}
            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
              {/* Left: video / GIF */}
              <div className="flex min-h-[35vh] items-center justify-center overflow-hidden border-b border-white/10 bg-black p-3 sm:p-5 lg:min-h-0 lg:border-b-0 lg:border-r">
                {isVideo ? (
                  <video
                    key={activeMediaUrl}
                    src={activeMediaUrl}
                    autoPlay
                    loop
                    muted
                    controls
                    playsInline
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <img
                    key={activeMediaUrl}
                    src={activeMediaUrl}
                    alt={
                      currentMedia?.title
                        ? (lang === 'ja'
                            ? currentMedia.title.ja
                            : currentMedia.title.en)
                        : displayTitle
                    }
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                )}
              </div>

              {/* Right: description linked to the selected step */}
              <div className="flex min-h-0 flex-col overflow-y-auto bg-stone-900">
                <div className="flex-1 p-5 sm:p-6">
                  {activeStep?.title && (
                    <h3 className="mb-4 text-lg font-bold leading-relaxed text-white">
                      {lang === 'ja'
                        ? activeStep.title.ja
                        : activeStep.title.en}
                    </h3>
                  )}

                  {activeStep?.instruction ? (
                    <div className="whitespace-pre-wrap text-sm leading-7 text-stone-300">
                      {lang === 'ja'
                        ? activeStep.instruction.ja
                        : activeStep.instruction.en}
                    </div>
                  ) : (
                    <p className="text-sm leading-7 text-stone-400">
                      {lang === 'ja'
                        ? 'この項目にはまだ説明が登録されていません。'
                        : 'No description has been added for this item yet.'}
                    </p>
                  )}
                </div>

                {/* Previous / Next buttons use the adjacent item titles */}
                {steps.length > 1 && (
                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex min-w-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-3 text-left transition hover:border-orange-500 hover:bg-orange-600/15"
                      title={
                        lang === 'ja'
                          ? '前の項目'
                          : 'Previous item'
                      }
                    >
                      <ChevronLeft className="h-5 w-5 shrink-0 text-orange-400" />
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                          {lang === 'ja' ? '前へ' : 'PREVIOUS'}
                        </span>
                        <span className="mt-1 block break-words text-xs font-semibold leading-relaxed text-white">
                          {steps[
                            (currentStepIndex - 1 + steps.length) % steps.length
                          ]?.title
                            ? (lang === 'ja'
                                ? steps[
                                    (currentStepIndex - 1 + steps.length) % steps.length
                                  ].title.ja
                                : steps[
                                    (currentStepIndex - 1 + steps.length) % steps.length
                                  ].title.en)
                            : (lang === 'ja' ? '前の項目' : 'Previous item')}
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex min-w-0 items-center justify-end gap-2 rounded-xl border border-white/15 bg-white/5 p-3 text-right transition hover:border-orange-500 hover:bg-orange-600/15"
                      title={
                        lang === 'ja'
                          ? '次の項目'
                          : 'Next item'
                      }
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                          {lang === 'ja' ? '次へ' : 'NEXT'}
                        </span>
                        <span className="mt-1 block break-words text-xs font-semibold leading-relaxed text-white">
                          {steps[(currentStepIndex + 1) % steps.length]?.title
                            ? (lang === 'ja'
                                ? steps[(currentStepIndex + 1) % steps.length].title.ja
                                : steps[(currentStepIndex + 1) % steps.length].title.en)
                            : (lang === 'ja' ? '次の項目' : 'Next item')}
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-orange-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER REQUESTED: Arrow Bar to move 1, 2, 3, 4 manually */}
      <div className="pt-2 border-t border-orange-100 space-y-2.5">
        
        {/* Step Progression Bar with Previous/Next Arrows and Clickable Step Buttons */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Left Arrow Button */}
          <button
            onClick={handlePrevStep}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-orange-500 hover:bg-orange-50 text-stone-700 hover:text-orange-700 font-semibold text-xs shadow-2xs transition active:scale-95 shrink-0"
            title={lang === 'ja' ? '前のステップへ' : 'Previous Step'}
          >
            <ChevronLeft className="w-4 h-4 text-orange-600" />
            <span className="hidden sm:inline">{lang === 'ja' ? '前へ' : 'Prev'}</span>
          </button>

          {/* Clickable 1, 2, 3, 4 Step Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isCurrent = currentStepIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleStepClick(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs ${
                    isCurrent
                      ? 'bg-orange-600 text-white shadow-md scale-105 ring-2 ring-orange-300'
                      : 'bg-white border border-stone-200 text-stone-600 hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isCurrent ? 'bg-white text-orange-600' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="hidden md:inline text-[11px] whitespace-nowrap">
                    {steps[idx]?.title ? (lang === 'ja' ? steps[idx].title.ja : steps[idx].title.en) : `Step ${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNextStep}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-orange-500 hover:bg-orange-50 text-stone-700 hover:text-orange-700 font-semibold text-xs shadow-2xs transition active:scale-95 shrink-0"
            title={lang === 'ja' ? '次のステップへ' : 'Next Step'}
          >
            <span className="hidden sm:inline">{lang === 'ja' ? '次へ' : 'Next'}</span>
            <ChevronRight className="w-4 h-4 text-orange-600" />
          </button>
        </div>

        {/* Current Active Step Instruction Description */}
                <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200 flex items-start gap-2.5 text-xs text-stone-700">
          <div className="flex-1 leading-relaxed">
            <span className="font-bold text-stone-900 mr-2">
              {activeStep?.title
                ? (lang === 'ja' ? activeStep.title.ja : activeStep.title.en)
                : (lang === 'ja' ? `操作項目 ${currentStepIndex + 1}` : `Operation ${currentStepIndex + 1}`)}:
            </span>
            <span>
              {activeStep?.instruction
                ? (lang === 'ja' ? activeStep.instruction.ja : activeStep.instruction.en)
                : (lang === 'ja'
                    ? '矢印ボタンで項目を前後に移動しながら操作方法を確認できます。'
                    : 'Use the arrow buttons to navigate between instructions.')}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};