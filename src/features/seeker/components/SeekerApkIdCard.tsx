import React, { useState } from 'react';
import { generateQrMatrix } from '@/features/admin/profile/utils/qrGenerator';
import idCardBg from '@/assets/id_card_bg.png';
import hrsjmLogo from '@/assets/hrsjm_logo.png';
import { QrCode, Phone } from 'lucide-react';

export interface SeekerApkIdCardProps {
  fullName?: string;
  roleSubtitle?: string;
  seekerId?: string;
  validTill?: string;
  joinedOn?: string;
  status?: string;
  interactive?: boolean;
  allowFlip?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
  onQrClick?: () => void;
  className?: string;
}

export const SeekerApkIdCard: React.FC<SeekerApkIdCardProps> = ({
  fullName = 'HRSJM Test Seeker',
  roleSubtitle = 'User',
  seekerId = '',
  validTill = '10 Nov 2027',
  joinedOn = '12 Sept 2026',
  status = 'Active',
  interactive = false,
  allowFlip = false,
  isFlipped: controlledFlipped,
  onFlip,
  onQrClick,
  className = '',
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const effectiveId = seekerId || 'HRSJM-SEK-F1B7';
  const qrMatrix = React.useMemo(() => generateQrMatrix(effectiveId, 25), [effectiveId]);

  const handleClick = (e: React.MouseEvent) => {
    if (onFlip) {
      e.stopPropagation();
      onFlip();
    } else if (allowFlip) {
      e.stopPropagation();
      setInternalFlipped((prev) => !prev);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative select-none transition-all duration-300 ${
        interactive || allowFlip || onFlip ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.01]' : ''
      } ${className}`}
      style={{
        width: '100%',
        maxWidth: '460px',
        aspectRatio: '85.6 / 54',
        perspective: '1200px',
      }}
    >
      <div
        className="w-full h-full relative transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ════════════════════════════════════════════════════════════
            FRONT FACE: 1:1 Parity with APK Mobile ID Card
        ════════════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-[#CAA048]/45 flex flex-col justify-between"
          style={{
            backgroundColor: '#031735',
            backgroundImage: `url(${idCardBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* 1. Header Cream Shape with Gold Curved Border */}
          <div
            className="absolute top-0 left-0 bg-[#FAF5EA] border-b-[1.5px] border-r-[1.5px] border-[#CAA048] flex items-center px-3.5 sm:px-4 z-10 shadow-xs"
            style={{
              width: '71%',
              height: '33%',
              borderBottomRightRadius: '24px',
            }}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 w-full">
              {/* Official Seal Logo */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center">
                <img
                  src={hrsjmLogo}
                  alt="HRSJM Seal"
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              </div>

              {/* Identity Typography */}
              <div className="flex flex-col justify-center min-w-0">
                <div className="font-serif font-black text-[#082046] text-sm sm:text-[16px] tracking-wide leading-none">
                  HRSJM
                </div>
                <div className="font-extrabold text-[#082046] text-[7px] sm:text-[8px] uppercase tracking-wider leading-tight mt-0.5 whitespace-nowrap">
                  HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
                </div>
                <div className="font-bold text-[#082046] text-[8px] sm:text-[9.5px] leading-tight mt-0.5 flex items-center gap-1">
                  <span>मानव अधिकार</span>
                  <span className="text-[#CAA048] font-black">•</span>
                  <span>सामाजिक न्याय</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Status Badge (Active) over Navy Area */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full bg-[#1E6539] text-white text-[9.5px] sm:text-[10.5px] font-bold tracking-wide shadow-xs">
              {status}
            </span>
          </div>

          {/* 3. Golden Swoosh Accent Line (Bottom Right Corner) */}
          <svg
            className="absolute right-0 bottom-0 pointer-events-none z-10"
            width="130"
            height="80"
            viewBox="0 0 120 75"
            fill="none"
          >
            <path
              d="M 5 75 Q 65 62 120 18"
              stroke="#CAA048"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>

          {/* 4. Card Body: User Info & QR Code Matrix (1:1 APK layout without photo) */}
          <div className="absolute bottom-0 left-0 right-0 h-[67%] px-4 sm:px-5 pb-3 sm:pb-3.5 flex items-center justify-between gap-2.5 sm:gap-3 z-10">
            {/* Left Column: Full Name, Role, Key-Value Info Rows */}
            <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
              <h3 className="text-white font-extrabold text-[15px] sm:text-[18px] tracking-tight leading-tight truncate">
                {fullName}
              </h3>
              <div className="text-[#E5B842] font-bold text-[10px] sm:text-[11.5px] tracking-wide mt-0.5 mb-1.5 truncate">
                {roleSubtitle}
              </div>

              {/* Exact APK Spec: Aligned Info Rows with Colons */}
              <div className="space-y-0.5 text-[8.5px] sm:text-[9.5px] text-white leading-tight">
                <div className="flex items-center">
                  <span className="text-white/85 font-normal w-[58px] sm:w-[64px] shrink-0">Member ID</span>
                  <span className="text-white/85 mr-1.5">:</span>
                  <span className="text-white font-semibold font-mono tracking-tight truncate">
                    {seekerId}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-white/85 font-normal w-[58px] sm:w-[64px] shrink-0">Valid Till</span>
                  <span className="text-white/85 mr-1.5">:</span>
                  <span className="text-white font-semibold tracking-tight truncate">
                    {validTill}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-white/85 font-normal w-[58px] sm:w-[64px] shrink-0">Joined On</span>
                  <span className="text-white/85 mr-1.5">:</span>
                  <span className="text-white font-semibold tracking-tight truncate">
                    {joinedOn}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Scannable QR Code Matrix + Tap to View */}
            <div
              onClick={(e) => {
                if (onQrClick) {
                  e.stopPropagation();
                  onQrClick();
                }
              }}
              className="flex flex-col items-center shrink-0 cursor-pointer group"
              title="Click to enlarge QR Code"
            >
              <div className="bg-white p-1 rounded-xl shadow-md w-[62px] h-[62px] sm:w-[70px] sm:h-[70px] flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 25 25"
                  className="block"
                >
                  <rect width="25" height="25" fill="#FFFFFF" />
                  {qrMatrix.map((row: boolean[], r: number) =>
                    row.map((filled: boolean, c: number) =>
                      filled ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width="1"
                          height="1"
                          fill="#06294D"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>
              <span className="text-white text-[7.5px] sm:text-[8.5px] font-medium tracking-tight mt-1 text-center opacity-90 group-hover:opacity-100 group-hover:text-[#FAD465] transition">
                Tap to View
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            BACK FACE: Reverse Side with Regulatory Info & Verification
        ════════════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-[#CAA048]/45 flex flex-col justify-between bg-[#06214A] p-4 text-white"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Back Header */}
          <div className="border-b border-[#CAA048]/30 pb-1.5 text-center">
            <div className="text-[10px] font-extrabold tracking-wider text-[#FAD465] uppercase">
              Central Registry &amp; Verification
            </div>
            <div className="text-[8px] text-slate-300">
              National Secretariat, New Delhi, India • Regd. Act XXI of 1860
            </div>
          </div>

          {/* Back Body: Authorization Terms & Emergency */}
          <div className="grid grid-cols-3 gap-2 my-auto py-1">
            <div className="col-span-2 text-[8px] text-slate-200 space-y-1">
              <div className="font-bold text-[#E5B842] uppercase text-[8.5px]">Terms &amp; Mandate</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li>Certifies official humanitarian pass in HRSJM.</li>
                <li>Authorized for verified civic advocacy and relief aid.</li>
                <li>Non-transferable; subject to periodic re-validation.</li>
              </ul>
              <div className="pt-1 flex items-center gap-2 text-[7.5px] text-[#FAD465]">
                <Phone size={9} />
                <span>Helpline: +91 11 2345 6789</span>
              </div>
            </div>

            {/* Verification QR */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-1 rounded-md shadow-sm w-12 h-12 flex items-center justify-center">
                <QrCode size={36} className="text-[#06294D]" />
              </div>
              <span className="text-[7px] text-slate-300 mt-1">Official Scan</span>
            </div>
          </div>

          {/* Signatory Footer */}
          <div className="border-t border-[#CAA048]/30 pt-1.5 flex items-center justify-between text-[8px]">
            <div>
              <div className="w-20 border-b border-[#CAA048]/50 mb-0.5" />
              <div className="font-bold text-white">National President</div>
              <div className="text-slate-400 text-[7px]">HRSJM Governing Council</div>
            </div>

            <div className="px-2 py-0.5 rounded bg-[#CAA048]/20 border border-[#CAA048]/40 text-[#FAD465] text-[7.5px] font-bold tracking-wider">
              ★ OFFICIAL ACCREDITED ★
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

