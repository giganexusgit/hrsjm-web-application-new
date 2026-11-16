import React, { useState } from 'react';
import type { MemberProfile } from '../types/member.types';
import { generateQrMatrix } from '@/features/admin/profile/utils/qrGenerator';
import { BarcodeSvg } from '@/components/common/BarcodeSvg';
import { getPublicVerificationUrl } from '@/utils/verificationUrl';
import idCardBg from '@/assets/id_card_bg.png';
import hrsjmLogo from '@/assets/hrsjm_logo.png';
import { Phone, X, ExternalLink, ShieldCheck } from 'lucide-react';

export interface ApkMemberIdCardProps {
  member: Partial<MemberProfile>;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  allowFlip?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
  onQrClick?: () => void;
}

function formatCardDate(dateStr?: string, fallback = '07 Nov 2027'): string {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export const ApkMemberIdCard: React.FC<ApkMemberIdCardProps> = ({
  member,
  interactive = false,
  onClick,
  className = '',
  allowFlip = false,
  isFlipped: controlledFlipped,
  onFlip,
  onQrClick,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const effectiveId = member.membershipNumber || 'HRSJM-47611';
  const verificationUrl = getPublicVerificationUrl(effectiveId);
  const rawQr = member.qrVerificationUrl?.trim();
  const qrPayload = (rawQr && !rawQr.includes('localhost') && !rawQr.includes('127.0.0.1'))
    ? rawQr
    : verificationUrl;
  const qrMatrix = React.useMemo(() => generateQrMatrix(qrPayload, 25), [qrPayload]);

  const validTill = formatCardDate(member.validUpto, '07 Nov 2027');
  const joinedOn = formatCardDate(member.validFrom || member.joiningDate, '11 Sept 2026');
  const membershipType = member.categoryTitle || 'Individual Member';
  const fullName = member.fullName || 'SAHIL Test Member';
  const status = member.status === 'ACTIVE' || !member.status ? 'Active' : member.status;

  const handleClick = (e: React.MouseEvent) => {
    if (onFlip) {
      e.stopPropagation();
      onFlip();
    } else if (allowFlip) {
      e.stopPropagation();
      setInternalFlipped((prev) => !prev);
    } else if (onClick) {
      onClick();
    }
  };

  const handleQrClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQrClick) {
      onQrClick();
    } else {
      setShowQrModal(true);
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
        maxWidth: '430px',
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
            width="120"
            height="75"
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

          {/* 4. Card Body: Avatar, Member Info, QR Code */}
          <div className="absolute bottom-0 left-0 right-0 h-[67%] px-3.5 sm:px-4 pb-3 sm:pb-3.5 flex items-center justify-between gap-2.5 sm:gap-3 z-10">
            {/* Left: Member Portrait Photo Frame */}
            <div className="w-[64px] h-[78px] sm:w-[72px] sm:h-[86px] rounded-lg overflow-hidden border-[1.5px] border-[#CAA048] bg-[#0A2550] shrink-0 shadow-md">
              <img
                src={
                  member.avatarUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
                }
                alt={fullName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Middle: Member Name, Category, Key-Value Info Rows */}
            <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
              <h3 className="text-white font-extrabold text-[14px] sm:text-[16px] tracking-tight leading-tight truncate">
                {fullName}
              </h3>
              <div className="text-[#E5B842] font-bold text-[10px] sm:text-[11px] tracking-wide mt-0.5 mb-1.5 truncate">
                {membershipType}
              </div>

              {/* Exact APK Spec: Aligned Info Rows with Colons */}
              <div className="space-y-0.5 text-[8.5px] sm:text-[9.5px] text-white leading-tight">
                <div className="flex items-center">
                  <span className="text-white/85 font-normal w-[56px] sm:w-[62px] shrink-0">Member ID</span>
                  <span className="text-white/85 mr-1.5">:</span>
                  <span className="text-white font-semibold font-mono tracking-tight truncate">
                    {effectiveId}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-white/85 font-normal w-[56px] sm:w-[62px] shrink-0">Valid Till</span>
                  <span className="text-white/85 mr-1.5">:</span>
                  <span className="text-white font-semibold tracking-tight truncate">
                    {validTill}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-white/85 font-normal w-[56px] sm:w-[62px] shrink-0">Joined On</span>
                  <span className="text-white/85 mr-1.5">:</span>
                  <span className="text-white font-semibold tracking-tight truncate">
                    {joinedOn}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Scannable QR Code Matrix + Tap to View */}
            <div
              onClick={handleQrClick}
              className="flex flex-col items-center shrink-0 cursor-pointer group"
              title="Click or tap to view/enlarge QR Code"
            >
              <div className="bg-white p-1 rounded-lg shadow-md w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${qrMatrix.length || 21} ${qrMatrix.length || 21}`}
                  className="block"
                >
                  <rect width={qrMatrix.length || 21} height={qrMatrix.length || 21} fill="#FFFFFF" />
                  {qrMatrix.map((row: boolean[], r: number) =>
                    row.map((filled: boolean, c: number) =>
                      filled ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width="1"
                          height="1"
                          fill="#000000"
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
                <li>Certifies official membership in HRSJM.</li>
                <li>Authorized to champion civic advocacy &amp; relief.</li>
                <li>Non-transferable; subject to annual re-validation.</li>
              </ul>
              <div className="pt-1 flex items-center gap-2 text-[7.5px] text-[#FAD465]">
                <Phone size={9} />
                <span>Helpline: +91 11 2345 6789</span>
              </div>
            </div>

            {/* Verification QR */}
            <div
              onClick={handleQrClick}
              className="flex flex-col items-center justify-center cursor-pointer group"
              title="Click or tap to view/enlarge QR Code"
            >
              <div className="bg-white p-1 rounded-md shadow-sm w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${qrMatrix.length || 21} ${qrMatrix.length || 21}`}
                  className="block"
                >
                  <rect width={qrMatrix.length || 21} height={qrMatrix.length || 21} fill="#FFFFFF" />
                  {qrMatrix.map((row: boolean[], r: number) =>
                    row.map((filled: boolean, c: number) =>
                      filled ? (
                        <rect
                          key={`b-${r}-${c}`}
                          x={c}
                          y={r}
                          width="1"
                          height="1"
                          fill="#000000"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>
              <span className="text-[7px] text-slate-300 mt-1 group-hover:text-[#FAD465] transition">Official Scan</span>
            </div>
          </div>

          {/* Machine-Scannable Code 128 Barcode Strip */}
          <div className="bg-white/95 rounded-md px-2 py-0.5 flex flex-col items-center justify-center my-0.5 border border-[#CAA048]/35 shadow-2xs">
            <BarcodeSvg
              value={effectiveId}
              format="CODE128"
              width={1.15}
              height={18}
              fontSize={7}
              displayValue={true}
              lineColor="#000000"
              textColor="#000000"
              className="max-h-[26px]"
            />
          </div>

          {/* Signatory Footer */}
          <div className="border-t border-[#CAA048]/30 pt-1 flex items-center justify-between text-[8px]">
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

      {/* Enlarged QR Code & Barcode Modal for Instant Phone Camera / Scanner Device Scanning */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowQrModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 text-center space-y-3.5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="text-left">
                <h3 className="text-base font-bold text-[#0C2340]">
                  Official Member Verification Pass
                </h3>
                <p className="text-xs text-slate-500">Scan QR or Barcode to verify</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Code */}
            <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-slate-200/80 flex items-center justify-center">
              <div className="bg-white p-2.5 rounded-2xl shadow-md w-48 h-48 flex items-center justify-center">
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${qrMatrix.length || 21} ${qrMatrix.length || 21}`}
                  className="block"
                >
                  <rect width={qrMatrix.length || 21} height={qrMatrix.length || 21} fill="#FFFFFF" />
                  {qrMatrix.map((row: boolean[], r: number) =>
                    row.map((filled: boolean, c: number) =>
                      filled ? (
                        <rect
                          key={`m-${r}-${c}`}
                          x={c}
                          y={r}
                          width="1"
                          height="1"
                          fill="#000000"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>
            </div>

            {/* Code 128 Barcode */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Code 128 Barcode
              </div>
              <div className="flex justify-center overflow-x-auto py-1">
                <BarcodeSvg
                  value={effectiveId}
                  format="CODE128"
                  width={1.4}
                  height={32}
                  fontSize={10}
                  displayValue={true}
                  lineColor="#0C2340"
                  textColor="#0C2340"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EA] border border-[#CAA048]/40 text-[#855B14] font-mono font-bold text-xs">
                <ShieldCheck size={13} className="text-[#855B14]" />
                <span>{effectiveId}</span>
              </div>
              <div className="font-bold text-sm text-[#0C2340]">{fullName}</div>
              <div className="text-xs text-slate-500">{membershipType}</div>
            </div>

            <div className="flex gap-2 pt-1">
              <a
                href={`/verify/member/${encodeURIComponent(effectiveId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#FAF5EA] hover:bg-[#F3E8CD] border border-[#CAA048] text-[#855B14] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Verify Online</span>
                <ExternalLink size={13} />
              </a>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#06294D] text-white text-xs font-bold hover:bg-[#083563] transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
