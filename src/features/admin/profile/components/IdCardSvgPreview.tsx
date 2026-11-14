import React, { useState } from 'react';
import { RefreshCw, Printer, Phone, MapPin } from 'lucide-react';
import type { AdminProfile } from '../types/profile.types';
import { generateQrMatrix } from '../utils/qrGenerator';
import { profileService } from '../services/profileService';
import idCardBg from '@/assets/id_card_bg.png';
import hrsjmLogo from '@/assets/hrsjm_logo.png';

interface IdCardSvgPreviewProps {
  profile: AdminProfile;
  interactive?: boolean;
}

export const IdCardSvgPreview: React.FC<IdCardSvgPreviewProps> = ({
  profile,
  interactive = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const effectiveId = profile.memberId || 'HRSJM-00013';
  const qrMatrix = React.useMemo(() => generateQrMatrix(effectiveId, 25), [effectiveId]);

  const rawStatus = profile.accountStatus || 'Active';
  const statusLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
  const isActive = statusLabel.toLowerCase() === 'active';

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    profileService.printIdCard(profile);
  };

  return (
    <div className="flex flex-col items-center w-full min-w-0">
      {/* Action Bar */}
      {interactive && (
        <div className="flex items-center justify-between flex-wrap gap-2.5 w-full max-w-[440px] mb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06294D] bg-[#EEF2F6] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{isFlipped ? 'Back Side: Terms & Seal' : 'Front Side: Identification'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFlipped((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-300 text-[#06294D] hover:bg-slate-50 transition-colors cursor-pointer"
              title="Flip Card"
            >
              <RefreshCw size={14} className="text-[#06294D]" />
              <span>Flip Card ({isFlipped ? 'Show Front' : 'Show Back'})</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#06294D] border border-[#06294D] text-white hover:bg-[#083563] transition-colors cursor-pointer"
              title="Print or Save PDF"
            >
              <Printer size={14} className="text-[#FAD465]" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Landscape 3D Flip Perspective Container (1:1 Reference ID Card Ratio) */}
      <div
        onClick={() => interactive && setIsFlipped((prev) => !prev)}
        title={interactive ? 'Click to flip card' : undefined}
        className={`relative select-none transition-all duration-300 ${
          interactive ? 'cursor-pointer hover:scale-[1.01]' : ''
        }`}
        style={{
          width: '100%',
          maxWidth: '440px',
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
          {/* ════════════════ FRONT SIDE (Reference Design) ════════════════ */}
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
            {/* 1. Header Cream Banner with Gold Curved Border */}
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
                  <div className="font-extrabold text-[#082046] text-[6.5px] sm:text-[8px] uppercase tracking-wider leading-tight mt-0.5 whitespace-nowrap">
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

            {/* 2. Status Pill (Top Right over Navy Area) */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <span
                className={`inline-flex items-center justify-center px-3.5 py-0.5 rounded-full text-white text-[9.5px] sm:text-[10.5px] font-bold tracking-wide shadow-xs ${
                  isActive ? 'bg-[#1E6539]' : 'bg-amber-600'
                }`}
              >
                {statusLabel}
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

            {/* 4. Card Body: Officer Info & Scannable QR Code */}
            <div className="absolute bottom-0 left-0 right-0 h-[67%] px-4 sm:px-5 pb-3 sm:pb-3.5 flex items-center justify-between gap-3 z-10">
              {/* Left Column: Full Name, Role/Designation, Key-Value Rows */}
              <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                <h3 className="text-white font-extrabold text-[15px] sm:text-[18px] tracking-tight leading-tight truncate">
                  {profile.fullName}
                </h3>
                <div className="text-[#E5B842] font-bold text-[10px] sm:text-[11.5px] tracking-wide mt-0.5 mb-2 truncate">
                  {profile.designation || profile.role}
                </div>

                {/* Aligned Info Rows with Colons */}
                <div className="space-y-0.5 text-[9px] sm:text-[10px] text-white leading-tight">
                  <div className="flex items-center">
                    <span className="text-white/85 font-normal w-[60px] sm:w-[66px] shrink-0">Member ID</span>
                    <span className="text-white/85 mr-1.5">:</span>
                    <span className="text-white font-semibold font-mono tracking-tight truncate">
                      {effectiveId}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white/85 font-normal w-[60px] sm:w-[66px] shrink-0">Valid Till</span>
                    <span className="text-white/85 mr-1.5">:</span>
                    <span className="text-white font-semibold tracking-tight truncate">
                      {profile.validTill || '31 Dec 2027'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white/85 font-normal w-[60px] sm:w-[66px] shrink-0">Joined On</span>
                    <span className="text-white/85 mr-1.5">:</span>
                    <span className="text-white font-semibold tracking-tight truncate">
                      {profile.issueDate || '12 Oct 2024'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Scannable QR Code Matrix + Tap to View */}
              <div className="flex flex-col items-center shrink-0">
                <div className="bg-white p-1.5 rounded-xl shadow-md w-[64px] h-[64px] sm:w-[74px] sm:h-[74px] flex items-center justify-center">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    className="block"
                  >
                    <rect width={qrMatrix.length} height={qrMatrix.length} fill="#FFFFFF" />
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
                <span className="text-white text-[8px] sm:text-[9px] font-medium tracking-tight mt-1 text-center opacity-90">
                  Tap to View
                </span>
              </div>
            </div>
          </div>

          {/* ════════════════ BACK SIDE (Regulatory & Admin Details) ════════════════ */}
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
                Human Rights &amp; Social Justice Mission • Regd No. HR/0092/2019
              </div>
            </div>

            {/* Back Body: Officer Metadata, Address & Verification QR */}
            <div className="grid grid-cols-3 gap-2 my-auto py-1 items-center">
              <div className="col-span-2 text-[8px] text-slate-200 space-y-1">
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[8.5px]">
                  <span>
                    <strong className="text-[#E5B842]">Admin ID:</strong> {profile.adminId || 'ADMIN001'}
                  </span>
                  <span>
                    <strong className="text-[#E5B842]">Blood:</strong>{' '}
                    <span className="text-rose-300 font-bold">{profile.bloodGroup || 'O+'}</span>
                  </span>
                  <span>
                    <strong className="text-[#E5B842]">DOB:</strong> {profile.dateOfBirth || '15 Aug 1988'}
                  </span>
                </div>

                <div className="flex items-start gap-1 text-[7.5px] text-slate-300 leading-snug">
                  <MapPin size={9} className="text-[#FAD465] shrink-0 mt-0.5" />
                  <span>
                    {profile.address || 'Human Rights Bhavan, Lodhi Road'},{' '}
                    {profile.city || 'New Delhi'} - {profile.pincode || '110003'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[7.5px] text-[#FAD465]">
                  <Phone size={9} className="shrink-0" />
                  <span>
                    Emergency: {profile.emergencyContact || '+91 98765 43211'} • Helpline: +91 11 2345 6789
                  </span>
                </div>
              </div>

              {/* Verification QR */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-1 rounded-md shadow-sm w-12 h-12 flex items-center justify-center">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    className="block"
                  >
                    <rect width={qrMatrix.length} height={qrMatrix.length} fill="#FFFFFF" />
                    {qrMatrix.map((row: boolean[], r: number) =>
                      row.map((filled: boolean, c: number) =>
                        filled ? (
                          <rect
                            key={`b-${r}-${c}`}
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
                <span className="text-[7px] text-slate-300 mt-1">Official Scan</span>
              </div>
            </div>

            {/* Signatory Footer */}
            <div className="border-t border-[#CAA048]/30 pt-1.5 flex items-center justify-between text-[8px]">
              <div>
                <div className="w-20 border-b border-[#CAA048]/50 mb-0.5" />
                <div className="font-bold text-white">National Registrar</div>
                <div className="text-slate-400 text-[7px]">HRSJM Central Governing Council</div>
              </div>

              <div className="px-2 py-0.5 rounded bg-[#CAA048]/20 border border-[#CAA048]/40 text-[#FAD465] text-[7.5px] font-bold tracking-wider">
                ★ OFFICIAL ACCREDITED ★
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
