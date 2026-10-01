import React from 'react';

interface CadIconProps {
  type: string;
  customIconUrl?: string;
  className?: string;
  size?: number;
}

export const CadIcon: React.FC<CadIconProps> = ({ 
  type, 
  customIconUrl, 
  className = "w-5 h-5", 
  size = 20 
}) => {
  // If user uploaded a custom icon image/graphic, render that!
  if (customIconUrl) {
    return (
      <img
        src={customIconUrl}
        alt={type}
        style={{ width: size, height: size }}
        className={`object-contain rounded-xs select-none ${className}`}
      />
    );
  }

  // Predefined authentic GLOOBE CAD SVG icons
  switch (type.toLowerCase()) {
    case 'finish':
    case 'finishes':
    case 'ceiling':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Ceiling/Wall corner finish section matching GLOOBE UI */}
          <path d="M 4 20 L 4 5 L 20 5" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 7 20 L 7 8 L 20 8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
          <path d="M 4 5 L 8 9 L 20 9" fill="currentColor" fillOpacity="0.25" />
          <rect x="7" y="10" width="10" height="7" rx="0.5" fill="currentColor" fillOpacity="0.1" />
        </svg>
      );

    case 'exterior-ceiling':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Exterior soffit/eaves finish */}
          <path d="M 3 6 L 21 6 L 18 10 L 3 10 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <rect x="8" y="10" width="5" height="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <line x1="3" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );

    case 'molding':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Decorative molding profile */}
          <path d="M 4 4 L 14 4 C 18 4, 18 12, 14 12 L 20 20 L 4 20 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" />
          <line x1="7" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );

    case 'wall':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="none" stroke="currentColor">
          {/* Authentic GLOOBE 3D Isometric Wall Icon */}
          <path d="M 8 26 L 8 13 L 13 8 L 22 8 L 22 21 L 8 26 Z" fill="white" stroke="#334155" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 13 8 L 13 21 L 8 26" stroke="#475569" strokeWidth="1.2" />
          <path d="M 13 8 L 22 8 L 17 13 L 8 13 Z" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
          <path d="M 17 13 L 17 26 L 22 21" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <rect x="7" y="12" width="10" height="14" fill="#ffffff" fillOpacity="0.9" stroke="#1e293b" strokeWidth="1.8" />
          <path d="M 17 12 L 23 7 L 23 20 L 17 26" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 7 12 L 13 7 L 23 7 L 17 12 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );

    case 'parapet':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="none" stroke="currentColor">
          {/* Authentic GLOOBE Parapet (パラペット) 3D detail */}
          <path d="M 6 10 L 18 10 L 18 16 L 26 16 L 26 26 L 6 26 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 6 10 L 11 5 L 23 5 L 18 10 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 18 10 L 23 5 L 23 11 L 18 16 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M 23 11 L 30 11 L 30 21 L 26 26" fill="#64748b" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M 6 10 L 18 10 L 18 26 L 6 26 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.6" />
          <line x1="6" y1="14" x2="18" y2="14" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
      );

    case 'wall-opening':
    case 'opening':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="none" stroke="currentColor">
          {/* Authentic GLOOBE Wall Opening (壁開口) */}
          <rect x="7" y="12" width="16" height="14" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
          <path d="M 23 12 L 28 8 L 28 21 L 23 26" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 7 12 L 12 8 L 28 8 L 23 12 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          {/* Punched opening cut out */}
          <rect x="11" y="16" width="7" height="6" fill="#e2e8f0" stroke="#0284c7" strokeWidth="1.6" strokeDasharray="1.5 1.5" />
          <line x1="11" y1="16" x2="18" y2="22" stroke="#0284c7" strokeWidth="1" />
        </svg>
      );

    case 'waterproof-ago':
    case 'ago':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="none" stroke="currentColor">
          {/* Authentic GLOOBE Waterproof Ago (防水アゴ) */}
          <rect x="7" y="6" width="10" height="22" fill="#64748b" stroke="#1e293b" strokeWidth="1.8" />
          <path d="M 17 6 L 22 2 L 22 23 L 17 28" fill="#475569" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
          {/* Projecting concrete drip shelf / ago */}
          <rect x="12" y="17" width="12" height="5" rx="0.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
          <path d="M 24 17 L 27 14 L 27 18 L 24 22" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M 12 17 L 15 14 L 27 14 L 24 17 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );

    case 'roof':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="none" stroke="currentColor">
          {/* Authentic GLOOBE Roof (屋根) */}
          <path d="M 16 5 L 28 14 L 28 17 L 16 10 L 4 17 L 4 14 Z" fill="#ea580c" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 16 10 L 28 17 L 24 25 L 8 25 L 4 17 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="16" y1="10" x2="16" y2="25" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
      );

    case 'brace':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="none" stroke="currentColor">
          {/* Authentic GLOOBE Brace (ブレース) */}
          <line x1="6" y1="6" x2="26" y2="26" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <line x1="26" y1="6" x2="6" y2="26" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="6" cy="6" r="2" fill="#ea580c" />
          <circle cx="26" cy="26" r="2" fill="#ea580c" />
        </svg>
      );

    case 'column':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="5" width="14" height="14" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" stroke="currentColor" strokeWidth="1.2" />
          <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'beam':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="3.5" rx="0.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <rect x="10" y="7.5" width="4" height="9" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <rect x="3" y="16.5" width="18" height="3.5" rx="0.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        </svg>
      );

    case 'door':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="20" x2="3" y2="16" stroke="currentColor" strokeWidth="3" />
          <line x1="21" y1="20" x2="21" y2="16" stroke="currentColor" strokeWidth="3" />
          <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
          <path d="M 5 5 A 14 14 0 0 1 19 19" stroke="currentColor" strokeDasharray="2 2" />
          <circle cx="5" cy="19" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'window':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08" />
          <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.8" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.8" />
          <line x1="5" y1="8" x2="7" y2="6" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          <line x1="14" y1="8" x2="16" y2="6" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        </svg>
      );

    case 'slab':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 L21 8 L12 13 L3 8 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <path d="M3 8 L3 13 L12 18 L21 13 L21 8" stroke="currentColor" />
          <path d="M12 13 L12 18" stroke="currentColor" />
          <line x1="7.5" y1="10.5" x2="7.5" y2="15.5" strokeDasharray="1.5 1.5" opacity="0.7" />
          <line x1="16.5" y1="10.5" x2="16.5" y2="15.5" strokeDasharray="1.5 1.5" opacity="0.7" />
        </svg>
      );

    case 'stair':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20 L8 20 L8 16 L12 16 L12 12 L16 12 L16 8 L20 8 L20 4" stroke="currentColor" strokeWidth="2" />
          <line x1="4" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <path d="M7 11 L14 5 M14 5 L10 5 M14 5 L14 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'site':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17 C 8 13, 14 20, 21 15" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 11 C 7 8, 16 14, 21 9" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="7" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 10 L12 15" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'shield':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" />
          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'sun':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );

    case 'drawing':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="currentColor" fillOpacity="0.08" />
          <line x1="7" y1="7" x2="17" y2="7" />
          <line x1="7" y1="11" x2="14" y2="11" />
          <line x1="7" y1="15" x2="11" y2="15" />
          <rect x="14" y="13" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );

    case 'camera':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" />
          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'share':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <circle cx="6" cy="12" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <circle cx="18" cy="19" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" fill="currentColor" fillOpacity="0.1" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" />
        </svg>
      );
  }
};
