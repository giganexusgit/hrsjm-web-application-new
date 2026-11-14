import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Scale,
  MessageSquare,
  Phone,
  ArrowRight,
  Globe,
  Heart,
  BookOpen,
  Smile,
  Megaphone,
  Briefcase,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Play,
  X,
  PlusCircle,
} from 'lucide-react';
import { SeekerHeroBanner } from '../components/SeekerHeroBanner';
import { SeekerTimelineStepper } from '../components/SeekerTimelineStepper';
import { useSeekerStore } from '../store/seekerStore';
import { eventsStore } from '@/features/admin/events/store/eventsStore';
import { isAdminCreatedEvent } from '@/features/admin/events/services/eventsService';
import { newsStore } from '@/features/admin/news/store/newsStore';
import { filterEventsForRole, filterNewsForRole } from '@/features/content';
import { assistanceService } from '@/features/admin/assistance/services/assistanceService';
import type { AssistanceRequest } from '@/features/admin/assistance/types/assistance.types';

// Exact APK Data Sets
const RIGHTS_CATEGORIES = [
  { id: 'fundamental-rights', title: 'Human\nRights', icon: Globe, link: '/seeker/rights/fundamental-rights' },
  { id: 'womens-rights', title: "Women's\nRights", icon: Heart, link: '/seeker/rights/womens-rights' },
  { id: 'right-to-education', title: 'Right to\nEducation', icon: BookOpen, link: '/seeker/rights/right-to-education' },
  { id: 'civil-rights', title: "Civil\nRights", icon: Smile, link: '/seeker/rights/civil-rights' },
];

const WHAT_WE_DO_ITEMS = [
  { id: 'awareness', title: 'Awareness\nCampaigns', icon: Megaphone },
  { id: 'workshops', title: 'Workshops\nand Training', icon: Briefcase },
  { id: 'research', title: 'Research and\nEducation', icon: GraduationCap },
  { id: 'community', title: 'Community\nActivities', icon: Users },
];

const IMPACT_STATS = {
  members: '10,000+',
  complaintsHandled: '2,500+',
  casesResolved: '1,850+',
};

export const SeekerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { requests, loadAll } = useSeekerStore();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const [approvedCauses, setApprovedCauses] = useState<AssistanceRequest[]>([]);

  useEffect(() => {
    loadAll().catch(() => {});
    eventsStore.fetchEvents().catch(() => {});
    newsStore.fetchNews().catch(() => {});
    assistanceService
      .listApproved({ limit: 4 })
      .then((items) => setApprovedCauses(items || []))
      .catch(() => setApprovedCauses([]));
  }, [loadAll]);

  const eventsSnapshot = useSyncExternalStore(eventsStore.subscribe, eventsStore.getSnapshot);
  const newsSnapshot = useSyncExternalStore(newsStore.subscribe, newsStore.getSnapshot);

  const seekerEvents = useMemo(() => {
    const authorized = filterEventsForRole(eventsSnapshot.events.filter(isAdminCreatedEvent), 'SEEKER');
    if (!authorized || authorized.length === 0) return [];
    return authorized.slice(0, 3).map((e) => {
      const dt = new Date(e.startAt || e.created_at || '');
      const day = !isNaN(dt.getTime()) ? String(dt.getDate()).padStart(2, '0') : '25';
      const month = !isNaN(dt.getTime())
        ? dt.toLocaleString('en-IN', { month: 'short' }).toUpperCase()
        : 'NOV';
      return {
        id: e.id,
        day,
        month,
        category: e.category || 'Relief Camp',
        title: e.title,
        location: e.location || 'HRSJM Community Center',
        image: e.coverImageUrl || '/assets/images/about-hero-community.png',
      };
    });
  }, [eventsSnapshot.events]);

  const seekerNews = useMemo(() => {
    const authorized = filterNewsForRole(newsSnapshot.news, 'SEEKER');
    if (!authorized || authorized.length === 0) return [];
    return authorized.slice(0, 2).map((n) => ({
      id: n.id,
      category: (n.category || 'RELIEF INITIATIVE').toUpperCase(),
      title: n.title,
      date: n.date || 'Recent',
      image: n.thumbnailUrl || '/assets/images/contact-hero-building.jpg',
    }));
  }, [newsSnapshot.news]);

  const activeAidRequest = requests.find((r) => Number(r.requested_amount) > 0);
  const latestRequest = activeAidRequest || (requests.length > 0 ? requests[0] : null);
  const isActualAid = Boolean(latestRequest && Number(latestRequest.requested_amount) > 0);

  const openWhatsAppHelpline = () => {
    const phone = '919888880004';
    const text = encodeURIComponent('Hello HRSJM, I need emergency social & legal assistance.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
            <CheckCircle2 size={12} />
            <span>Approved</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <AlertCircle size={12} />
            <span>Action Required</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF9E6] text-[#B45309] border border-[#FAD465]">
            <Clock size={12} />
            <span>Under Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 select-none">
      {/* 1. HERO BANNER (Exact APK HeroBanner replication: real photos, dark overlay, cursive quote, showCta={false}) */}
      <section>
        <SeekerHeroBanner showCta={false} />
      </section>

      {/* 2. ACTIVE AID STATUS CARD vs NEED AID PROMPT (Exact APK SeekerHomeScreen Parity) */}
      <section>
        {latestRequest ? (
          <div className="bg-white rounded-2xl border border-[#DCE4EC] p-5 shadow-xs space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#06294D] uppercase tracking-wider block mb-0.5">
                  {isActualAid ? 'ACTIVE ASSISTANCE REQUEST' : 'ACCOUNT VERIFICATION'}
                </span>
                <h3 className="text-base font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52]">
                  {latestRequest.reason}
                </h3>
                <div className="text-[11px] text-[#718096] mt-0.5">
                  ASST-{latestRequest.id.slice(0, 8).toUpperCase()} •{' '}
                  {new Date(latestRequest.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>{getStatusBadge(latestRequest.status)}</div>
            </div>

            {/* Requested Aid Amount Bar */}
            {isActualAid && (
              <div className="px-3.5 py-2.5 rounded-xl bg-[#EDF2F7] border-l-3 border-[#FAD465] flex items-center justify-between">
                <span className="text-xs text-[#34516D] font-medium">Requested Aid Amount:</span>
                <span className="text-base font-extrabold text-[#0B2F52]">
                  ₹{Number(latestRequest.requested_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* 4-Step Stepper */}
            <div className="pt-1 pb-1 border-t border-[#DBE5EE]">
              <SeekerTimelineStepper status={latestRequest.status || 'UNDER_REVIEW'} />
            </div>

            {/* Link to Full Status */}
            <div className="pt-2 border-t border-[#DBE5EE] text-center">
              <Link
                to={`/seeker/requests/${latestRequest.id}`}
                className="text-xs font-bold text-[#06294D] hover:text-[#174A78] hover:underline inline-flex items-center gap-1"
              >
                <span>View Full Status & Documents History</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#EDF2F7] rounded-2xl border border-[#DBE5EE] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-[#06294D] uppercase tracking-wider block mb-1">
                HUMANITARIAN ASSISTANCE
              </span>
              <h3 className="text-base font-bold text-[#0B2F52] leading-tight">
                Need Emergency Medical, Education, or Legal Relief?
              </h3>
              <p className="text-xs text-[#34516D] mt-1 max-w-xl leading-relaxed">
                HRSJM provides direct financial, legal, and welfare assistance for approved causes. Submit your request for rapid verification.
              </p>
            </div>
            <Link
              to="/seeker/apply"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#C9971A] text-[#011F39] text-xs font-bold rounded-xl shadow-xs transition self-start md:self-auto shrink-0"
            >
              <PlusCircle size={14} />
              <span>+ Apply for Assistance</span>
            </Link>
          </div>
        )}
      </section>

      {/* 3. QUICK ACTIONS ROW (Exact 4-Tile Row from APK QuickActionsRow.tsx) */}
      <section>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <Link
            to="/seeker/apply"
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#FAD465] hover:shadow-sm transition min-h-[84px] text-center group cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#06294D] group-hover:scale-105 transition">
              <FileText size={22} strokeWidth={1.8} />
            </div>
            <span className="text-[11px] font-semibold text-[#06294D] leading-[14px] mt-1.5">
              Apply for<br />Aid
            </span>
          </Link>

          <Link
            to="/seeker/requests"
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#FAD465] hover:shadow-sm transition min-h-[84px] text-center group cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#06294D] group-hover:scale-105 transition">
              <Clock size={22} strokeWidth={1.8} />
            </div>
            <span className="text-[11px] font-semibold text-[#06294D] leading-[14px] mt-1.5">
              Track Aid<br />Status
            </span>
          </Link>

          <Link
            to="/seeker/rights"
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#FAD465] hover:shadow-sm transition min-h-[84px] text-center group cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#06294D] group-hover:scale-105 transition">
              <Scale size={22} strokeWidth={1.8} />
            </div>
            <span className="text-[11px] font-semibold text-[#06294D] leading-[14px] mt-1.5">
              Know Your<br />Rights
            </span>
          </Link>

          <Link
            to="/seeker/complaint"
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#FAD465] hover:shadow-sm transition min-h-[84px] text-center group cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#06294D] group-hover:scale-105 transition">
              <MessageSquare size={22} strokeWidth={1.8} />
            </div>
            <span className="text-[11px] font-semibold text-[#06294D] leading-[14px] mt-1.5">
              File a<br />Complaint
            </span>
          </Link>
        </div>
      </section>

      {/* 3B. VERIFIED AID & RELIEF CAUSES (Live from Backend API) */}
      {approvedCauses.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52]">
              Verified Aid & Relief Causes
            </h2>
            <Link to="/seeker/causes" className="text-xs font-bold text-[#174A78] hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {approvedCauses.slice(0, 4).map((cause) => {
              const target = Number(cause.requested_amount || 0);
              const raised = Number(cause.raised_amount || 0);
              const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
              return (
                <Link
                  key={cause.id}
                  to={`/seeker/causes?search=${encodeURIComponent(cause.full_name || cause.reason || '')}`}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs hover:border-[#FAD465] transition flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Approved Cause
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {cause.reason}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0B2F52] line-clamp-1">
                      {cause.full_name}
                    </h3>
                    {cause.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {cause.description.replace(/\s*\[(Location|Urgency|Age):[^\]]+\]/gi, '').trim()}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>₹{raised.toLocaleString('en-IN')} raised</span>
                      <span>Goal: ₹{target.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#06294D] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. 24x7 EMERGENCY SOCIAL & LEGAL HELPLINE BANNER (Exact APK helplineBanner style) */}
      <section>
        <div
          onClick={openWhatsAppHelpline}
          className="rounded-2xl bg-[#FFF9E6] border border-[#FAD465] px-3.5 py-2.5 flex items-center gap-3 shadow-xs hover:shadow-sm transition cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#0D47A1]/10 flex items-center justify-center text-[#0D47A1] shrink-0">
            <Phone size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-[#718096] truncate">
              24x7 Emergency Social & Legal Helpline
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#06294D] leading-tight truncate">
              +91 98888 80004 / 1800-HRSJM-AID
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openWhatsAppHelpline();
            }}
            className="hidden sm:inline-flex px-3 py-1.5 bg-[#06294D] text-[#FAD465] font-bold text-xs rounded-xl shadow-xs hover:bg-[#123F68] transition shrink-0 cursor-pointer"
          >
            WhatsApp
          </button>
        </div>
      </section>

      {/* 5. KNOW YOUR RIGHTS & LEGAL AID (Exact 4 Category Icon Cards from CategoryIconRow.tsx) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52]">
            Know Your Rights & Legal Aid
          </h2>
          <Link to="/seeker/rights" className="text-xs font-bold text-[#174A78] hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {RIGHTS_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={cat.link}
                className="flex flex-col items-center justify-center py-3 px-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#FAD465] hover:shadow-sm transition min-h-[90px] text-center group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#FFF9E6] text-[#06294D] flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-semibold text-[#06294D] leading-[14px]">
                  {cat.title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. RELIEF & ASSISTANCE PROGRAMS ("What HRSJM Does" CategoryIconRow) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52]">
            Relief & Assistance Programs
          </h2>
          <Link
            to="/seeker/about"
            className="text-xs font-semibold text-[#0B2F52] hover:text-[#C9971A] flex items-center gap-1 transition cursor-pointer"
          >
            <span>Learn More</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {WHAT_WE_DO_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to="/seeker/about"
                className="flex flex-col items-center justify-center py-3 px-1 bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#0B2F52]/40 hover:shadow-xs transition min-h-[90px] text-center group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#EDF2F7] text-[#06294D] group-hover:bg-[#06294D] group-hover:text-white transition flex items-center justify-center mb-1.5">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-semibold text-[#06294D] leading-[14px]">
                  {item.title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 7. OUR IMPACT SECTION (Exact 3-Tile Executive Card from ImpactSection.tsx) */}
      <section>
        <div className="bg-[#072444] rounded-2xl border border-[#FAD465]/25 border-t-3 border-t-[#F59E0B] p-5 md:p-6 text-white shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#FAD465] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>Verified National Mission</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold font-['Playfair_Display',Georgia,serif] text-white mt-0.5">
                Our Impact
              </h2>
            </div>
            <Link
              to="/seeker/about"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FAD465] hover:text-amber-300 transition-colors cursor-pointer group"
              aria-label="View Details on Our Impact"
            >
              <span>View Details</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* 3 Metric Tiles (Exact APK Layout) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#FAD465] flex items-center justify-center mb-1.5">
                <Users size={16} />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {IMPACT_STATS.members}
              </div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 mt-0.5 leading-tight">
                Active Members
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#FAD465] flex items-center justify-center mb-1.5">
                <FileText size={16} />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {IMPACT_STATS.complaintsHandled}
              </div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 mt-0.5 leading-tight">
                Complaints Handled
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#10B981] flex items-center justify-center mb-1.5">
                <CheckCircle2 size={16} />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {IMPACT_STATS.casesResolved}
              </div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 mt-0.5 leading-tight">
                Cases Resolved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. UPCOMING RELIEF CAMPS & EVENTS (Exact HomeEventCard Carousel) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52]">
            Upcoming Relief Camps & Events
          </h2>
          <Link to="/seeker/events" className="text-xs font-bold text-[#174A78] hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {seekerEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => navigate('/seeker/events')}
              className="bg-white rounded-2xl border border-[#DCE4EC] overflow-hidden shadow-xs hover:border-[#FAD465] transition flex flex-col justify-between cursor-pointer group"
            >
              <div className="relative h-32 w-full overflow-hidden bg-slate-800">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/images/about-hero-community.png';
                  }}
                />
                <div className="absolute inset-0 bg-black/25" />

                {/* Overlaid Date Badge */}
                <div className="absolute top-2.5 left-2.5 bg-[#06294D] rounded-xl px-2.5 py-1 text-center shadow-md">
                  <div className="text-xs font-extrabold text-[#FAD465] leading-none">{evt.day}</div>
                  <div className="text-[9px] font-bold text-white uppercase leading-none mt-0.5">{evt.month}</div>
                </div>
              </div>

              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                <h4 className="text-xs font-bold text-[#0B2F52] leading-snug line-clamp-2">
                  {evt.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-[#718096] pt-2 border-t border-[#DBE5EE]">
                  <div className="flex items-center gap-1 truncate pr-1">
                    <MapPin size={11} className="shrink-0 text-[#06294D]" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#FAD465] text-[#011F39] flex items-center justify-center shrink-0">
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. STORIES OF HOPE & NEWS (Exact NewsCard component from APK) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:lg font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52]">
            Stories of Hope & News
          </h2>
          <Link
            to="/seeker/news"
            className="text-xs font-semibold text-[#0B2F52] hover:text-[#C9971A] flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {seekerNews.map((news) => (
            <Link
              key={news.id}
              to="/seeker/news"
              className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs flex items-center justify-between gap-3 hover:border-[#FAD465] transition group cursor-pointer"
            >
              <img
                src={news.image}
                alt={news.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-200"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/images/contact-hero-building.jpg';
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold tracking-wider text-[#C9971A] uppercase">
                  {news.category}
                </div>
                <h4 className="text-xs font-bold text-[#0B2F52] leading-snug line-clamp-2 mt-0.5 group-hover:text-[#C9971A] transition">
                  {news.title}
                </h4>
                <div className="text-[10px] text-[#718096] mt-1">{news.date}</div>
              </div>

              <div className="w-7 h-7 rounded-full bg-[#EDF2F7] text-[#06294D] group-hover:bg-[#06294D] group-hover:text-white transition flex items-center justify-center shrink-0">
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. ABOUT HRSJM SECTION (Exact AboutSection replication with media play card) */}
      <section className="bg-white rounded-2xl border border-[#DCE4EC] p-4.5 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52]">
            About HRSJM
          </h2>
          <Link
            to="/seeker/about"
            className="text-xs font-semibold text-[#0B2F52] hover:text-[#C9971A] flex items-center gap-1 transition cursor-pointer"
          >
            <span>View More</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <p className="flex-1 text-xs text-[#475569] leading-relaxed">
            Human Rights and Social Justice Mission (HRSJM) is a national registered non-governmental organization working steadfastly for human dignity, constitutional liberties, gender equality, and rapid emergency aid for the underprivileged across India.
          </p>

          <div
            onClick={() => setVideoModalOpen(true)}
            className="w-24 h-18 rounded-xl overflow-hidden relative shadow-md shrink-0 cursor-pointer group"
          >
            <img
              src="/assets/images/about-hero-rally.jpg"
              alt="HRSJM Video"
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[#FAD465] text-[#011F39] flex items-center justify-center shadow-md">
                <Play size={10} fill="#011F39" />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[8px] font-bold text-white leading-none">
              3:45
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="font-bold text-base text-[#0B2F52] mb-3">
              HRSJM Mission & Work Overview
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                title="HRSJM Overview"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#06294D] text-xs font-bold rounded-lg cursor-pointer"
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
