import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Star,
  BookOpen,
  FileText,
  Users,
  Heart,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useCurrentMember } from '../store/memberStore';
import memberHeroRally from '../../../assets/images/member-hero-rally.jpg';
import eventLegalAwareness from '../../../assets/images/event-legal-awareness.jpg';

function formatCardDate(dateVal?: string | Date | null, fallback = '15 Sep 2026'): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return typeof dateVal === 'string' ? dateVal : fallback;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fallback;
  }
}

export const MemberDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { member, fetchMember } = useCurrentMember();

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const memberSinceStr = formatCardDate(
    member.joiningDate || member.validFrom,
    '15 Sep 2026'
  );

  console.log({ member })

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* ════════════════════════════════════════════════════════════
          1. HERO BANNER: 1:1 Parity with Causes page width & APK design
      ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl bg-[#011F39] text-white p-6 md:p-8 shadow-md border border-[#FAD465]/30">
        {/* Rally Background Texture with Dark Multi-layer Overlay */}
        <img
          src={memberHeroRally}
          alt="HRSJM Member Rally"
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter contrast-125 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#011F39]/95 via-[#031B31]/75 to-[#011F39]/90" />

        <div className="relative z-10 w-full space-y-2.5">
          <div className="text-white text-base sm:text-lg font-semibold tracking-wide">
            Welcome,
          </div>
          <h1 className="text-[#FAD465] font-serif font-black text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight">
            {member.fullName || 'SAHIL Test Member'}
          </h1>
          <p className="text-white/95 text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
            Thank you for being a valued member of HRSJM. Together, we work for a fairer,
            more just and equal society.
          </p>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/95 pt-2">
            <Calendar size={14} className="text-white shrink-0" />
            <span className="font-medium">
              Member Since &nbsp;|&nbsp; {memberSinceStr}
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. MAIN CONTENT: Full-width cards with 1:1 APK Parity
      ════════════════════════════════════════════════════════════ */}
      <main className="w-full space-y-5 sm:space-y-6">
        {/* Active Member Status Card */}
        <div
          onClick={() => navigate('/member/details')}
          className="bg-white rounded-2xl sm:rounded-3xl border border-[#DCE4EC] p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-[#FAD465] hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAD465] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Star size={20} className="fill-white text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[#011F39] font-bold text-sm sm:text-base leading-tight">
                {member.status === 'ACTIVE' || !member.status ? 'Active Member' : member.status}
              </div>
              <div className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5 truncate">
                {member.categoryTitle || 'Individual Member'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/member/details');
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-[#DCE4EC] bg-[#EDF2F7] hover:bg-slate-200 text-[#011F39] text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer"
          >
            <span>View Membership</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Quick Actions – 3 Equal Cards in a Row */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* Action 1: Know Your Rights */}
          <div
            onClick={() => navigate('/member/rights')}
            className="bg-white rounded-2xl border border-[#DCE4EC] p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#FAD465] hover:shadow-md transition cursor-pointer min-h-[96px] sm:min-h-[110px]"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF9E6] border-[1.5px] border-[#C9971A] flex items-center justify-center text-[#06294D] mb-2 sm:mb-2.5 shadow-xs">
              <BookOpen size={20} />
            </div>
            <span className="text-[#06294D] text-xs sm:text-sm font-bold text-center leading-tight">
              Know Your Rights
            </span>
          </div>

          {/* Action 2: File a Complaint */}
          <div
            onClick={() => navigate('/member/support')}
            className="bg-white rounded-2xl border border-[#DCE4EC] p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#FAD465] hover:shadow-md transition cursor-pointer min-h-[96px] sm:min-h-[110px]"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF9E6] border-[1.5px] border-[#C9971A] flex items-center justify-center text-[#06294D] mb-2 sm:mb-2.5 shadow-xs">
              <FileText size={20} />
            </div>
            <span className="text-[#06294D] text-xs sm:text-sm font-bold text-center leading-tight">
              File a Complaint
            </span>
          </div>

          {/* Action 3: Events */}
          <div
            onClick={() => navigate('/member/events')}
            className="bg-white rounded-2xl border border-[#DCE4EC] p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#FAD465] hover:shadow-md transition cursor-pointer min-h-[96px] sm:min-h-[110px]"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF9E6] border-[1.5px] border-[#C9971A] flex items-center justify-center text-[#06294D] mb-2 sm:mb-2.5 shadow-xs">
              <Calendar size={20} />
            </div>
            <span className="text-[#06294D] text-xs sm:text-sm font-bold text-center leading-tight">
              Events
            </span>
          </div>
        </div>

        {/* Your Impact Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#DCE4EC] p-4 sm:p-6 shadow-sm">
          <h2 className="font-serif font-black text-[#011F39] text-lg sm:text-xl mb-4 sm:mb-5">
            Your Impact
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {/* Metric 1 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF9E6] border-[1.5px] border-[#C9971A] flex items-center justify-center text-[#06294D] mb-1.5 shadow-xs">
                <Users size={18} />
              </div>
              <span className="text-[#011F39] font-black text-lg sm:text-xl">
                {member.stats?.eventsAttended ?? 5}
              </span>
              <span className="text-slate-500 text-[10.5px] sm:text-xs font-medium leading-tight mt-0.5">
                Events Attended
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF9E6] border-[1.5px] border-[#C9971A] flex items-center justify-center text-[#06294D] mb-1.5 shadow-xs">
                <Heart size={18} />
              </div>
              <span className="text-[#011F39] font-black text-lg sm:text-xl">
                {member.stats?.donationCount ?? 0}
              </span>
              <span className="text-slate-500 text-[10.5px] sm:text-xs font-medium leading-tight mt-0.5">
                Causes Supported
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF9E6] border-[1.5px] border-[#C9971A] flex items-center justify-center text-[#06294D] mb-1.5 shadow-xs">
                <FileText size={18} />
              </div>
              <span className="text-[#011F39] font-black text-lg sm:text-xl">
                {member.stats?.ticketsCount ?? 3}
              </span>
              <span className="text-slate-500 text-[10.5px] sm:text-xs font-medium leading-tight mt-0.5">
                Complaint Submitted
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-black text-[#011F39] text-lg sm:text-xl">
              Upcoming Events
            </h2>
            <button
              type="button"
              onClick={() => navigate('/member/events')}
              className="text-xs sm:text-sm font-bold text-[#06294D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div
            onClick={() => navigate('/member/events')}
            className="bg-white rounded-2xl border border-[#DCE4EC] p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 hover:shadow-md transition cursor-pointer"
          >
            {/* Event Media with Date Badge */}
            <div className="w-full sm:w-36 h-32 sm:h-28 rounded-xl overflow-hidden relative shrink-0 bg-[#011F39]">
              <img
                src={eventLegalAwareness}
                alt="Human Rights Awareness Seminar"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-white rounded-lg px-2 py-1 text-center shadow-md min-w-[42px]">
                <div className="text-[#06294D] font-bold text-base leading-none">15</div>
                <div className="text-slate-500 text-[10px] font-bold uppercase leading-none mt-0.5">
                  Nov
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="flex-1 flex flex-col justify-between min-h-[96px]">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full text-[10.5px] font-bold">
                    Seminar
                  </span>
                  <span className="bg-[#E0F2FE] text-[#0284C7] px-2.5 py-0.5 rounded-full text-[10.5px] font-bold">
                    In Person
                  </span>
                </div>
                <h3 className="text-[#0A2540] font-bold text-sm sm:text-base leading-snug line-clamp-2">
                  Human Rights Awareness Seminar
                </h3>
                <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>Kurla, Mumbai</span>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/member/events');
                  }}
                  className="bg-[#EAA532] hover:bg-[#d49124] text-[#011F39] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Register Now</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Row (2 cards side by side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Promo Card 1: Upcoming Events */}
          <div
            onClick={() => navigate('/member/events')}
            className="bg-white rounded-2xl border border-[#DCE4EC] p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer min-h-[110px]"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFF9E6] border border-[#FAD465] text-[#06294D] flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <h4 className="font-bold text-[#06294D] text-sm">Upcoming Events</h4>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                5 events available to join.
              </p>
            </div>
            <div className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-3">
              <span>Browse Events</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Promo Card 2: Make a Difference */}
          <div
            onClick={() => navigate('/donations')}
            className="bg-white rounded-2xl border border-[#DCE4EC] p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer min-h-[110px]"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFF9E6] border border-[#FAD465] text-[#06294D] flex items-center justify-center shrink-0">
                  <Heart size={16} />
                </div>
                <h4 className="font-bold text-[#06294D] text-sm">Make a Difference</h4>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                3 tickets tracked. Keep supporting.
              </p>
            </div>
            <div className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-3">
              <span>Donate Now</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
