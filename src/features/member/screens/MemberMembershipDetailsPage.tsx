import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  IdCard,
  Calendar,
  CreditCard,
  Users,
  FileText,
  RefreshCw,
  BookOpen,
  Share2,
  Megaphone,
  Award,
  Download,
  Eye,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCurrentMember } from '../store/memberStore';
import { useAuth } from '@/features/auth/store/authStore';
import heroBannerImg from '@/assets/images/membership_details_hero.png';
import memberHeroRally from '@/assets/images/member-hero-rally.jpg';
import {
  downloadMemberCertificatePdf,
  downloadMemberCardPdf,
  downloadMemberGuidelinesPdf,
} from '../utils/memberDocumentGenerator';
import { MemberFlipCard } from '../components/MemberFlipCard';

export const MemberMembershipDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { member, fetchMember } = useCurrentMember();
  const { user } = useAuth();

  const [activeModal, setActiveModal] = useState<'idcard' | 'guidelines' | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  useEffect(() => {
    fetchMember();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [fetchMember]);

  // Priority fallback chain: auth user -> member store -> local profile -> APK defaults
  const effectiveName = user?.full_name || member.fullName || 'SAHIL Test Member';
  const effectiveType = member.categoryTitle || (user as any)?.membership_type || 'User Member';
  const effectiveId =
    (user as any)?.member_id ||
    (user as any)?.membership_number ||
    member.membershipNumber ||
    'HRSJM-47611';
  const effectiveDob =
    (user as any)?.date_of_birth ||
    (user as any)?.dob ||
    member.dob ||
    'Not provided';

  const formatDisplayDate = (dateVal?: string, fallback = '10 Nov 2027') => {
    if (!dateVal) return fallback;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return fallback;
    }
  };

  const calculateDaysRemaining = (validUptoStr?: string): number => {
    if (!validUptoStr) return 352;
    try {
      const target = new Date(validUptoStr).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 352;
    }
  };

  const effectiveJoinDate = formatDisplayDate(member.joiningDate || member.validFrom, '11 Sept 2026');
  const effectiveValidTill = formatDisplayDate(member.validUpto, '10 Nov 2027');
  const daysRemaining = calculateDaysRemaining(member.validUpto);
  const effectiveStatus = member.status === 'ACTIVE' || !member.status ? 'Active' : member.status;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadCertificate = () => {
    setDownloadingDocId('certificate');
    try {
      downloadMemberCertificatePdf(member);
    } finally {
      setTimeout(() => setDownloadingDocId(null), 1000);
    }
  };

  const handleDownloadCard = () => {
    setDownloadingDocId('idcard');
    try {
      downloadMemberCardPdf(member);
    } finally {
      setTimeout(() => setDownloadingDocId(null), 1000);
    }
  };

  const handleDownloadGuidelines = () => {
    setDownloadingDocId('guidelines');
    try {
      downloadMemberGuidelinesPdf(member);
    } finally {
      setTimeout(() => setDownloadingDocId(null), 1000);
    }
  };

  const benefitsList = [
    {
      id: 'events',
      title: 'Access to Events',
      description: 'Exclusive invites to workshops, seminars and campaigns.',
      icon: Users,
    },
    {
      id: 'learning',
      title: 'Learning Resources',
      description: 'Educational materials, research papers and guides.',
      icon: BookOpen,
    },
    {
      id: 'network',
      title: 'Community Network',
      description: 'Connect with like-minded members and experts.',
      icon: Share2,
    },
    {
      id: 'volunteer',
      title: 'Volunteer Opportunities',
      description: 'Be part of on-ground initiatives and social programs.',
      icon: Megaphone,
    },
    {
      id: 'updates',
      title: 'Special Updates',
      description: 'Get the latest news, policy updates and success stories.',
      icon: ShieldCheck,
    },
    {
      id: 'discounts',
      title: 'Member Discounts',
      description: 'Priority access and discounts on select events and programs.',
      icon: Award,
    },
  ];

  return (
    <div className="w-full text-slate-800 font-sans pb-16">
      {/* ════════════════════════════════════════════════════════════
          MAIN FULL-WIDTH CONTAINER
      ════════════════════════════════════════════════════════════ */}
      <div className="w-full space-y-6">
        {/* ════════════════════════════════════════════════════════════
            1. HERO SECTION (Full-width Parity with APK Design)
        ════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-[#071A3C] shadow-md border border-[#06294D]/50 text-white min-h-[190px] sm:min-h-[220px] md:min-h-[240px] flex items-center w-full">
          {/* Hero Background Image */}
          <img
            src={heroBannerImg || memberHeroRally}
            alt="Membership Details Rally"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
            onError={(e) => {
              // Fallback to memberHeroRally if heroBannerImg fails
              (e.currentTarget as HTMLImageElement).src = memberHeroRally;
            }}
          />

          {/* Navy Gradient Overlay matching APK */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071A3C]/95 via-[#071A3C]/80 to-transparent max-w-2xl" />

          {/* Hero Text Content */}
          <div className="relative z-10 px-6 sm:px-8 lg:px-10 py-6 sm:py-8 max-w-2xl space-y-2">
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl leading-[1.15] tracking-tight drop-shadow-sm">
              <span className="text-white block">Membership</span>
              <span className="text-[#FAD465]">Details</span>
            </h1>

            <p className="text-white/95 text-xs sm:text-sm md:text-base leading-relaxed font-normal pt-1 drop-shadow-xs max-w-lg">
              Your membership connects you with a stronger community, greater opportunities and a more just society.
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            2. FOUR QUICK ACTION CARDS (Full-width Responsive Grid)
        ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full">
          {/* Action 1: Member Card */}
          <button
            type="button"
            onClick={() => setActiveModal('idcard')}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#FAD465] p-3 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] group-hover:scale-105 transition-transform mb-1.5 sm:mb-2 shadow-xs">
              <CreditCard size={20} className="stroke-[2.2]" />
            </div>
            <span className="text-[#06294D] text-xs sm:text-sm font-black leading-tight block truncate w-full">
              Member Card
            </span>
            <span className="text-slate-500 text-[10px] sm:text-xs font-medium leading-tight mt-0.5 hidden xs:block truncate w-full">
              View Digital Card
            </span>
          </button>

          {/* Action 2: Benefits */}
          <button
            type="button"
            onClick={() => scrollToSection('section-benefits')}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#FAD465] p-3 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] group-hover:scale-105 transition-transform mb-1.5 sm:mb-2 shadow-xs">
              <Users size={20} className="stroke-[2.2]" />
            </div>
            <span className="text-[#06294D] text-xs sm:text-sm font-black leading-tight block truncate w-full">
              Benefits
            </span>
            <span className="text-slate-500 text-[10px] sm:text-xs font-medium leading-tight mt-0.5 hidden xs:block truncate w-full">
              What You Get
            </span>
          </button>

          {/* Action 3: Documents */}
          <button
            type="button"
            onClick={() => scrollToSection('section-documents')}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#FAD465] p-3 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] group-hover:scale-105 transition-transform mb-1.5 sm:mb-2 shadow-xs">
              <FileText size={20} className="stroke-[2.2]" />
            </div>
            <span className="text-[#06294D] text-xs sm:text-sm font-black leading-tight block truncate w-full">
              Documents
            </span>
            <span className="text-slate-500 text-[10px] sm:text-xs font-medium leading-tight mt-0.5 hidden xs:block truncate w-full">
              View &amp; Download
            </span>
          </button>

          {/* Action 4: Renew */}
          <button
            type="button"
            onClick={() => navigate('/member/renew')}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#FAD465] p-3 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] group-hover:scale-105 transition-transform mb-1.5 sm:mb-2 shadow-xs">
              <RefreshCw size={20} className="stroke-[2.2]" />
            </div>
            <span className="text-[#06294D] text-xs sm:text-sm font-black leading-tight block truncate w-full">
              Renew
            </span>
            <span className="text-slate-500 text-[10px] sm:text-xs font-medium leading-tight mt-0.5 hidden xs:block truncate w-full">
              Manage Membership
            </span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════
            3. MEMBERSHIP INFORMATION SECTION (1:1 Parity with Image 2)
        ════════════════════════════════════════════════════════════ */}
        <section id="section-member-info" className="space-y-3 w-full">
          <h2 className="font-serif font-black text-[#011F39] text-xl sm:text-2xl px-1">
            Membership Information
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden w-full">
            {/* 1. Full Name */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#06294D] shrink-0">
                  <User size={18} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                  Full Name
                </span>
              </div>
              <span className="font-serif font-black text-sm sm:text-base text-[#011F39] text-right truncate">
                {effectiveName}
              </span>
            </div>

            {/* 2. Membership Type */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#06294D] shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                  Membership Type
                </span>
              </div>
              <span className="font-serif font-black text-sm sm:text-base text-[#011F39] text-right truncate">
                {effectiveType}
              </span>
            </div>

            {/* 3. Member ID */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#06294D] shrink-0">
                  <IdCard size={18} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                  Member ID
                </span>
              </div>
              <span className="font-serif font-black text-sm sm:text-base text-[#011F39] text-right tracking-tight truncate">
                {effectiveId}
              </span>
            </div>

            {/* 4. Date of Birth */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#06294D] shrink-0">
                  <Calendar size={18} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                  Date of Birth
                </span>
              </div>
              <span className="font-serif font-black text-sm sm:text-base text-[#011F39] text-right truncate">
                {effectiveDob}
              </span>
            </div>

            {/* 5. Join Date */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#06294D] shrink-0">
                  <Calendar size={18} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                  Join Date
                </span>
              </div>
              <span className="font-serif font-black text-sm sm:text-base text-[#011F39] text-right truncate">
                {effectiveJoinDate}
              </span>
            </div>

            {/* 6. Valid Till */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#06294D] shrink-0">
                  <Calendar size={18} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                  Valid Till
                </span>
              </div>
              <span className="font-serif font-black text-sm sm:text-base text-[#011F39] text-right truncate">
                {effectiveValidTill}
              </span>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. MEMBERSHIP BENEFITS SECTION (From APK MembershipBenefitsSection)
        ════════════════════════════════════════════════════════════ */}
        <section id="section-benefits" className="space-y-3 pt-2 w-full">
          <h2 className="font-serif font-black text-[#011F39] text-xl sm:text-2xl px-1">
            Membership Benefits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-33 gap-3 sm:gap-4 w-full">
            {benefitsList.map((b) => {
              const IconComp = b.icon;
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs hover:border-[#FAD465] transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] shrink-0 mt-0.5">
                    <IconComp size={20} className="stroke-[2.2]" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#011F39] leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            5 & 6. VALIDITY & WELCOME KIT (Responsive 2-column on desktop)
        ════════════════════════════════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════════════
            5. MEMBERSHIP VALIDITY CARD (1:1 Parity with APK Image 2)
        ════════════════════════════════════════════════════════════ */}
        <section id="section-validity" className="space-y-3 pt-2 w-full">
          <h2 className="font-serif font-black text-[#011F39] text-xl sm:text-2xl px-1">
            Membership Validity
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden w-full">
            {/* Top Row: Icon, Valid Till, Status */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Calendar Icon Box matching APK Image 2 */}
                <div className="w-12 h-12 rounded-2xl bg-[#EBF3FC] flex items-center justify-center shrink-0">
                  <div className="w-7 h-7 bg-white rounded-lg shadow-2xs border border-slate-200 overflow-hidden flex flex-col">
                    <div className="h-2 bg-[#E68A00] w-full" />
                    <div className="flex-1 grid grid-cols-3 gap-0.5 p-1 items-center justify-items-center">
                      <div className="w-1 h-1 rounded-full bg-[#06294D]/70" />
                      <div className="w-1 h-1 rounded-full bg-[#06294D]/70" />
                      <div className="w-1 h-1 rounded-full bg-[#06294D]/70" />
                      <div className="w-1 h-1 rounded-full bg-[#06294D]/70" />
                      <div className="w-1 h-1 rounded-full bg-[#06294D]/70" />
                      <div className="w-1 h-1 rounded-full bg-[#06294D]/70" />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs sm:text-sm text-slate-500 font-medium block">
                    Valid Till
                  </span>
                  <span className="text-[#011F39] font-black text-base sm:text-lg tracking-tight">
                    {effectiveValidTill}
                  </span>
                </div>
              </div>

              {/* Status Badge matching APK Image 2: clean soft green pill with "Active" */}
              <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#DCFCE7] text-[#15803D]">
                {effectiveStatus}
              </span>
            </div>

            {/* Bottom Panel: Soft green tint, left & right alignment matching APK Image 2 */}
            <div className="grid grid-cols-2 divide-x divide-[#DCF3E4] bg-[#EAF8F0] border-t border-[#DCF3E4] px-5 py-3.5">
              <div className="text-left pr-3">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">
                  Total Duration
                </span>
                <span className="font-black text-sm sm:text-base text-[#011F39]">
                  {(member as any)?.totalDuration || '1 Year'}
                </span>
              </div>
              <div className="text-right pl-3">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">
                  Days Remaining
                </span>
                <span className="font-black text-sm sm:text-base text-[#011F39]">
                  {daysRemaining} Days
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            7. MEMBERSHIP DOCUMENTS SECTION (From APK MembershipDocumentsSection)
        ════════════════════════════════════════════════════════════ */}
        <section id="section-documents" className="space-y-3 pt-2 w-full">
          <h2 className="font-serif font-black text-[#011F39] text-xl sm:text-2xl px-1">
            Membership Documents
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden w-full">
            {/* Doc 1: Membership Certificate */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] shrink-0">
                  <Award size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#011F39] truncate">
                    Membership Certificate
                  </h4>
                  <p className="text-slate-500 text-xs truncate">
                    Download your official certificate
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/member/certificate')}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  disabled={downloadingDocId === 'certificate'}
                  className="px-3.5 py-1.5 rounded-full bg-[#06294D] hover:bg-[#0C2340] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Doc 2: Membership Card PDF */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] shrink-0">
                  <IdCard size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#011F39] truncate">
                    Membership Card (PDF)
                  </h4>
                  <p className="text-slate-500 text-xs truncate">
                    Download printable card
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal('idcard')}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  disabled={downloadingDocId === 'idcard'}
                  className="px-3.5 py-1.5 rounded-full bg-[#06294D] hover:bg-[#0C2340] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Doc 3: Membership Guidelines */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] flex items-center justify-center text-[#06294D] shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#011F39] truncate">
                    Membership Guidelines
                  </h4>
                  <p className="text-slate-500 text-xs truncate">
                    Read terms and benefits
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal('guidelines')}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadGuidelines}
                  disabled={downloadingDocId === 'guidelines'}
                  className="px-3.5 py-1.5 rounded-full bg-[#06294D] hover:bg-[#0C2340] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            8. RENEW MEMBERSHIP CTA BUTTON (From APK MembershipRenewCtaButton)
        ════════════════════════════════════════════════════════════ */}
        <section id="section-renew" className="pt-2 pb-6 w-full">
          <button
            type="button"
            onClick={() => navigate('/member/renew')}
            className="w-full py-4 px-6 rounded-2xl bg-[#EAA224] hover:bg-[#DA931B] text-[#011F39] font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <RefreshCw size={20} className="stroke-[2.5]" />
            <span>Renew Membership</span>
            <ArrowRight size={18} className="stroke-[2.5]" />
          </button>
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MODAL: DIGITAL ID CARD PREVIEW
      ════════════════════════════════════════════════════════════ */}
      {activeModal === 'idcard' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-[#06294D]">
                <CreditCard size={18} />
                <span>Digital Member Identity Card</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex flex-col items-center">
              <MemberFlipCard member={member} />

              <div className="w-full flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  className="px-5 py-2.5 rounded-xl bg-[#06294D] hover:bg-[#0C2340] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Download size={15} />
                  <span>Download Card PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/member/id-card')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={15} />
                  <span>Open Full Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL: MEMBERSHIP GUIDELINES
      ════════════════════════════════════════════════════════════ */}
      {activeModal === 'guidelines' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-[#06294D]">
                <BookOpen size={18} />
                <span>Membership Guidelines &amp; Charter</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-semibold text-xs">
                Official Charter of Human Rights &amp; Social Justice Mission (Registered under Societies Registration Act XXI of 1860).
              </div>
              <h4 className="font-bold text-[#06294D]">1. Code of Conduct &amp; Ethics</h4>
              <p>
                Every member is expected to uphold the Constitution of India and advocate for human rights, gender equality, and rule of law with integrity.
              </p>
              <h4 className="font-bold text-[#06294D]">2. Use of Digital &amp; Physical ID</h4>
              <p>
                The membership card is strictly non-transferable and remains the official property of HRSJM. Misuse of the seal or title for unlawful activities will lead to immediate cancellation.
              </p>
              <h4 className="font-bold text-[#06294D]">3. Renewal &amp; Continuity</h4>
              <p>
                Membership validity is typically 1 Year from approval date. Members can renew during the renewal window to maintain uninterrupted credentials and volunteer status.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-[#06294D] text-white text-xs font-bold hover:bg-[#0C2340] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
