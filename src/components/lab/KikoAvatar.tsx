import { useState } from 'react';
import { BRAND_CONFIG } from '../../config/brand';
import type { KikoMood } from '../../types/lab';

interface KikoAvatarProps {
  mood?: KikoMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<KikoAvatarProps['size']>, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

export function KikoAvatar({
  mood = 'idle',
  size = 'md',
  className = '',
}: KikoAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const customSrc = BRAND_CONFIG.kikoAvatars[mood];

  if (customSrc && !imgError) {
    return (
      <img
        src={customSrc}
        alt={`${BRAND_CONFIG.kikoName} (${mood})`}
        onError={() => setImgError(true)}
        className={`${SIZE_CLASSES[size]} shrink-0 rounded-xl object-contain ${className}`}
      />
    );
  }

  const eyeColor =
    mood === 'error'
      ? '#FB7185'
      : mood === 'thinking'
      ? '#38BDF8'
      : '#C6F64D';

  return (
    <div
      className={`${SIZE_CLASSES[size]} relative shrink-0 select-none ${className}`}
      title={`${BRAND_CONFIG.kikoName} — Mentor Kodie`}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-sm" fill="none">
        {/* Antena */}
        <line x1="32" y1="6" x2="32" y2="14" stroke="#1D4ED8" strokeWidth="3.5" strokeLinecap="round" />
        <circle
          cx="32"
          cy="6"
          r="4"
          fill={mood === 'celebrate' ? '#C6F64D' : mood === 'error' ? '#FB7185' : '#C6F64D'}
          stroke="#0F172A"
          strokeWidth="2"
        />

        {/* Telinga / Sensor samping */}
        <rect x="4" y="25" width="6" height="14" rx="3" fill="#1D4ED8" />
        <rect x="54" y="25" width="6" height="14" rx="3" fill="#1D4ED8" />

        {/* Kepala Robot Monitor */}
        <rect
          x="9"
          y="13"
          width="46"
          height="40"
          rx="12"
          fill="#1D4ED8"
          stroke="#0F172A"
          strokeWidth="2.5"
        />

        {/* Layar Wajah Dark Navy */}
        <rect x="14" y="19" width="36" height="27" rx="8" fill="#0F172A" />

        {/* Ekspresi Mata & Mulut */}
        {mood === 'celebrate' || mood === 'happy' ? (
          <>
            <path
              d="M21 31C22.5 27.5 26 27.5 27.5 31"
              stroke={eyeColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M36.5 31C38 27.5 41.5 27.5 43 31"
              stroke={eyeColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M25 36.5C28 40.5 36 40.5 39 36.5"
              stroke="#C6F64D"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'error' ? (
          <>
            <path d="M21 27L27 33M27 27L21 33" stroke="#FB7185" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M37 27L43 33M43 27L37 33" stroke="#FB7185" strokeWidth="2.6" strokeLinecap="round" />
            <path
              d="M26 40C29 37 35 37 38 40"
              stroke="#FB7185"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'thinking' ? (
          <>
            <circle cx="24" cy="30" r="3.4" fill="#38BDF8" />
            <rect x="36" y="28.5" width="7" height="3" rx="1.5" fill="#38BDF8" />
            <line x1="27" y1="38.5" x2="37" y2="38.5" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="24.5" cy="30" r="3.6" fill={eyeColor} />
            <circle cx="39.5" cy="30" r="3.6" fill={eyeColor} />
            <path
              d="M26.5 37.5C29 39.8 35 39.8 37.5 37.5"
              stroke="#C6F64D"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Leher kecil */}
        <rect x="26" y="53" width="12" height="5" rx="2.5" fill="#0F172A" />
      </svg>

      {mood === 'celebrate' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C6F64D] text-[10px] font-bold text-[#0F172A] shadow">
          ★
        </span>
      )}
    </div>
  );
}
