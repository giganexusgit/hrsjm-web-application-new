import type React from 'react';
import { useState } from 'react';
import hrsjmLogo from '@/assets/hrsjm_logo.png';
import { HRSJM_LOGO_DATA_URI } from '@/assets/logoBase64';

export interface HrsjmLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'light' | 'dark'; // 'light' on navy backgrounds, 'dark' on light backgrounds
  showWordmark?: boolean;
  showSubtitle?: boolean;
  showIcon?: boolean; // Controls rendering of the circular seal/icon emblem
  title?: string;
  subtitle?: string;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
}

const SIZES = {
  xs: 28,
  sm: 34,
  md: 44,
  lg: 56,
  xl: 72,
} as const;

export const HrsjmLogo: React.FC<HrsjmLogoProps> = ({
  size = 'md',
  variant = 'light',
  showWordmark = true,
  showSubtitle = true,
  showIcon = false,
  title = 'HRSJM',
  subtitle,
  layout = 'horizontal',
  className = '',
  imgClassName = '',
  style,
}) => {
  const dim = typeof size === 'number' ? size : SIZES[size] || 44;
  const isLight = variant === 'light';
  const isVertical = layout === 'vertical';

  // Fallback cascade: imported asset -> public static file -> WebP -> Base64 URI -> inline SVG emblem
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = [
    hrsjmLogo,
    '/logo.png',
    '/assets/logo/logo.png',
    '/logo.webp',
    HRSJM_LOGO_DATA_URI,
  ];

  const currentSrc = sources[sourceIndex];
  const allImagesFailed = sourceIndex >= sources.length;

  const handleImgError = () => {
    setSourceIndex((prev) => prev + 1);
  };

  if (!showIcon && !showWordmark) {
    return null;
  }

  return (
    <div
      style={style}
      className={`flex ${
        isVertical ? 'flex-col text-center' : 'flex-row text-left'
      } items-center gap-2.5 ${className}`}
    >
      {showIcon && (
        allImagesFailed ? (
          <svg
            width={dim}
            height={dim}
            viewBox="0 0 100 100"
            className={`shrink-0 drop-shadow-sm ${imgClassName}`}
            aria-label="HRSJM Official Seal"
          >
            <circle cx="50" cy="50" r="48" fill="#06294D" stroke="#E9B82E" strokeWidth="3" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#E9B82E" strokeWidth="1" strokeDasharray="2 2" />
            {/* Scales of Justice Icon */}
            <path
              d="M50 22 v38 M36 28 h28 M36 28 l-8 16 h16 z M64 28 l-8 16 h16 z M42 60 h16"
              fill="none"
              stroke="#FAD465"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="serif">
              HRSJM
            </text>
            <text x="50" y="88" textAnchor="middle" fill="#FAD465" fontSize="7" fontWeight="bold">
              मानव अधिकार
            </text>
          </svg>
        ) : (
          <img
            src={currentSrc}
            alt="HRSJM Logo"
            width={dim}
            height={Math.round(dim * (825 / 813))}
            className={`object-contain shrink-0 drop-shadow-sm ${imgClassName}`}
            style={{ width: `${dim}px`, height: 'auto' }}
            onError={handleImgError}
          />
        )
      )}

      {showWordmark && (
        <div
          className={`flex flex-col ${
            isVertical ? 'items-center mt-2' : ''
          } leading-tight select-none`}
        >
          <span
            className={`font-serif font-black tracking-wider ${
              isLight ? 'text-white' : 'text-[#011F39]'
            }`}
            style={{ fontSize: `${Math.max(13, dim * 0.42)}px` }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              className={`font-semibold tracking-wider mt-0.5 ${
                isLight ? 'text-[#FAD465]' : 'text-[#174A78]'
              }`}
              style={{ fontSize: `${Math.max(10, dim * 0.22)}px` }}
            >
              {subtitle}
            </span>
          ) : (
            showSubtitle && (
              <>
                <span
                  className={`font-bold uppercase tracking-widest mt-0.5 ${
                    isLight ? 'text-[#FAD465]' : 'text-[#06294D]'
                  }`}
                  style={{ fontSize: `${Math.max(8.5, dim * 0.2)}px` }}
                >
                  HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
                </span>
                <span
                  className={`tracking-wide font-medium mt-0.5 ${
                    isLight ? 'text-slate-300' : 'text-slate-500'
                  }`}
                  style={{ fontSize: `${Math.max(8, dim * 0.18)}px` }}
                >
                  मानव अधिकार • सामाजिक न्याय
                </span>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
};
