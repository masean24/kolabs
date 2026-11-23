import { useState } from 'react';
import { BRAND_CONFIG } from '../../config/brand';

interface BrandLogoProps {
  theme: 'light' | 'dark';
  compact?: boolean;
  showLabPill?: boolean;
}

export function BrandLogo({
  theme,
  compact = false,
  showLabPill = false,
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);
  const customSrc =
    theme === 'dark' ? BRAND_CONFIG.logoDarkSrc : BRAND_CONFIG.logoLightSrc;

  if (customSrc && !imgError) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <img
          src={customSrc}
          alt={BRAND_CONFIG.appName}
          onError={() => setImgError(true)}
          className={compact ? 'h-7 w-auto object-contain' : 'h-8 w-auto object-contain'}
        />
        {showLabPill && (
          <span className="rounded-full bg-[#D9F952] px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[#0F172A]">
            {BRAND_CONFIG.labLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2.5 shrink-0 select-none">
      {/* Logo Kodie Resmi (Identik dengan Landing Page) */}
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] transition-transform group-hover:scale-105 dark:bg-[#1E4ED8]/20">
        <svg
          width="26"
          height="22"
          viewBox="0 0 36 28"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 5L3 14L9 23"
            stroke="#1E4ED8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 5L33 14L27 23"
            stroke="#1E4ED8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="11" r="1.8" fill="#1E4ED8" />
          <circle cx="22" cy="11" r="1.8" fill="#1E4ED8" />
          <path
            d="M13.5 16.5C15 19 21 19 22.5 16.5"
            stroke="#A3E635"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!compact && (
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[21px] font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            {BRAND_CONFIG.appName}
          </span>
          {showLabPill && (
            <span className="rounded-full bg-[#D9F952] px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[#0F172A]">
              {BRAND_CONFIG.labLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
