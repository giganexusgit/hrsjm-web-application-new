import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import {
  memberVerificationService,
  type MemberVerificationData,
  type CardValidityStatus,
} from '@/services/memberVerificationService';
import { BarcodeSvg } from '@/components/common/BarcodeSvg';
import hrsjmLogo from '@/assets/hrsjm_logo.png';

export const MemberVerificationPublicPage: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(token || '');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MemberVerificationData | null>(null);

  const performVerification = async (queryToken: string) => {
    if (!queryToken || !queryToken.trim()) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    try {
      const result = await memberVerificationService.verifyMember(queryToken);
      setData(result);
    } catch {
      setData({
        memberId: queryToken,
        memberName: 'Unknown Member',
        membershipType: 'N/A',
        membershipStatus: 'INVALID',
        renewalStatus: 'N/A',
        cardValidity: 'INVALID',
        expiryDate: 'N/A',
        verified: false,
        message: 'Unable to connect to verification server. Please verify network connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      setSearchInput(token);
      performVerification(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (clean) {
      navigate(`/verify/member/${encodeURIComponent(clean)}`);
    }
  };

  const validity = data?.cardValidity || 'INVALID';

  const getStatusBadge = (status: CardValidityStatus) => {
    switch (status) {
      case 'VALID':
        return (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-sm sm:text-base tracking-wide shadow-xs">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>OFFICIALLY VALID &amp; ACTIVE</span>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-sm sm:text-base tracking-wide shadow-xs">
            <AlertTriangle size={18} className="text-amber-600" />
            <span>MEMBERSHIP EXPIRED</span>
          </div>
        );
      case 'SUSPENDED':
        return (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-100 text-red-900 border border-red-300 font-extrabold text-sm sm:text-base tracking-wide shadow-xs">
            <ShieldX size={18} className="text-red-600" />
            <span>MEMBERSHIP SUSPENDED</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-extrabold text-sm sm:text-base tracking-wide shadow-xs">
            <ShieldAlert size={18} className="text-rose-600" />
            <span>INVALID OR REVOKED CARD</span>
          </div>
        );
    }
  };

  const getStatusCardStyle = (status: CardValidityStatus) => {
    switch (status) {
      case 'VALID':
        return 'border-emerald-500/40 bg-gradient-to-b from-white to-emerald-50/30';
      case 'EXPIRED':
        return 'border-amber-500/40 bg-gradient-to-b from-white to-amber-50/30';
      case 'SUSPENDED':
        return 'border-red-500/40 bg-gradient-to-b from-white to-red-50/30';
      default:
        return 'border-rose-400/40 bg-gradient-to-b from-white to-rose-50/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#06294D] font-sans flex flex-col justify-between">
      {/* 1. Header Bar */}
      <header className="bg-[#031735] text-white border-b-2 border-[#CAA048] shadow-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={hrsjmLogo}
              alt="HRSJM Seal"
              className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="font-serif font-black text-base sm:text-lg tracking-wide text-white leading-tight">
                HRSJM
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#FAD465] font-extrabold tracking-wider uppercase">
                Central Member Registry &amp; Verification
              </div>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck size={16} className="text-[#FAD465]" />
            <span>Official Credential Portal</span>
          </div>
        </div>
      </header>

      {/* 2. Main Verification Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Verification Search Bar (For handheld scanners or typing Member ID) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Scan barcode, enter Member ID or token (e.g. HRSJM-00053)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-[#031735] focus:ring-2 focus:ring-[#031735]/15 transition"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#031735] hover:bg-[#06294D] text-[#FAD465] font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer shrink-0"
            >
              <span>Verify Card</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-md border border-slate-200/80 space-y-4">
            <RefreshCw size={36} className="text-[#CAA048] animate-spin mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#06294D]">
              Querying Central Verification Registry...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Authenticating QR token and barcode hash against live database records.
            </p>
          </div>
        )}

        {/* Verification Result Card */}
        {!loading && data && (
          <div
            className={`rounded-3xl p-5 sm:p-8 shadow-xl border-2 transition-all space-y-6 ${getStatusCardStyle(
              validity
            )}`}
          >
            {/* Status Header */}
            <div className="text-center space-y-3 pb-5 border-b border-slate-200">
              <div className="flex justify-center">{getStatusBadge(validity)}</div>

              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#031735]">
                {data.memberName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                {validity === 'VALID' &&
                  'This membership credential is confirmed authentic and verified in real-time against the HRSJM national registry database.'}
                {validity === 'EXPIRED' &&
                  'This membership validity period has elapsed. Renewal must be completed through the member portal or administrative office.'}
                {validity === 'SUSPENDED' &&
                  'This membership has been placed under administrative suspension. This card is not currently authorized for official activities.'}
                {validity === 'INVALID' &&
                  'No authentic record matches this verification token. The card is unrecognized, altered, or revoked.'}
              </p>
            </div>

            {/* Credential Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Member ID / Number
                </span>
                <span className="font-mono font-extrabold text-base text-[#031735] block">
                  {data.memberId}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Membership Category / Tier
                </span>
                <span className="font-extrabold text-base text-[#B45309] block">
                  {data.membershipType}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Membership Status
                </span>
                <span className="font-bold text-slate-800 block">
                  {data.membershipStatus}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Renewal Status
                </span>
                <span className="font-bold text-slate-800 block">
                  {data.renewalStatus}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Card Validity
                </span>
                <span
                  className={`font-black text-base block ${
                    validity === 'VALID'
                      ? 'text-emerald-700'
                      : validity === 'EXPIRED'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {data.cardValidity}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Card Expiry Date
                </span>
                <span className="font-extrabold text-slate-800 block">
                  {data.expiryDate}
                </span>
              </div>
            </div>

            {/* Embedded Barcode & Verification Seals */}
            {validity !== 'INVALID' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 text-center space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Accredited Code 128 Machine-Scannable Barcode
                </div>
                <div className="flex justify-center overflow-x-auto py-1">
                  <BarcodeSvg
                    value={data.memberId}
                    format="CODE128"
                    width={1.6}
                    height={40}
                    fontSize={11}
                    displayValue={true}
                    lineColor="#031735"
                    textColor="#031735"
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Unique Code 128 barcode corresponds 1:1 with QR code verification hash.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no token searched */}
        {!loading && !data && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xs border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EA] border-2 border-[#CAA048]/40 flex items-center justify-center mx-auto text-[#031735]">
              <QrCode size={30} />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#031735]">
              Scan or Enter a Member Credential
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Use a smartphone camera or handheld barcode reader on any official HRSJM Member ID
              card to inspect live accreditation and validity status.
            </p>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-[#031735] text-white py-6 border-t border-[#CAA048]/40 text-center text-xs">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-medium text-slate-300">
            Human Rights &amp; Social Justice Mission (HRSJM)
          </p>
        </div>
      </footer>
    </div>
  );
};
