import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  MapPin,
  Users,
  Heart,
  Target,
  Banknote,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useCurrentMember } from '../store/memberStore';
import { useUserAuth } from '../../user/store/userAuthStore';
import { GlobalPaymentModal } from '../../payments';
import { assistanceService } from '../../admin/assistance/services/assistanceService';

export type CauseCategoryKey =
  | 'all'
  | 'active'
  | 'education'
  | 'healthcare'
  | 'relief'
  | 'women'
  | 'human_rights'
  | 'environment';

export interface MemberCause {
  id: string;
  title: string;
  category: string;
  categoryKey: CauseCategoryKey;
  categoryIcon: string;
  location: string;
  imageUrl: string;
  description: string;
  aboutStory: string;
  targetAmount: number;
  raisedAmount: number;
  status: 'active' | 'closed';
  beneficiariesCount: number;
  targetBeneficiaries: string;
  donorCount: number;
  daysLeft?: number;
  isVerified: boolean;
  createdAt: string;
}

interface FilterTabItem {
  key: CauseCategoryKey;
  label: string;
  icon?: string;
}

const CATEGORY_TABS: FilterTabItem[] = [
  { key: 'all', label: 'All Causes' },
  { key: 'active', label: 'Active', icon: '✨' },
  { key: 'education', label: 'Education', icon: '📚' },
  { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { key: 'relief', label: 'Relief', icon: '🍲' },
  { key: 'women', label: 'Women', icon: '👩‍🏫' },
  { key: 'human_rights', label: 'Legal Aid', icon: '⚖️' },
  { key: 'environment', label: 'Environment', icon: '🌱' },
];

export const MemberCausesPage: React.FC = () => {
  const { member, processDonation } = useCurrentMember();
  const { user } = useUserAuth();
  const [searchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') as CauseCategoryKey | null;
  const urlCause = searchParams.get('cause') || searchParams.get('search') || '';

  const [causes, setCauses] = useState<MemberCause[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(urlCause);
  const [activeTab, setActiveTab] = useState<CauseCategoryKey>(urlCategory || 'all');
  const [selectedCauseForDonation, setSelectedCauseForDonation] = useState<MemberCause | null>(null);
  const [selectedCauseForDetails, setSelectedCauseForDetails] = useState<MemberCause | null>(null);

  useEffect(() => {
    const causeParam = searchParams.get('cause') || searchParams.get('search');
    if (causeParam !== null) {
      setSearchQuery(causeParam);
    }
    const catParam = searchParams.get('category') as CauseCategoryKey | null;
    if (catParam) {
      setActiveTab(catParam);
    }
  }, [searchParams]);

  // Fetch live approved requests from backend
  useEffect(() => {
    const loadApprovedCauses = async () => {
      setLoading(true);
      try {
        const approved = await assistanceService.listApproved({ limit: 100 });
        const mappedFromBackend: MemberCause[] = (approved || []).map((item: any, idx: number) => {
            const reasonLower = (item.reason || item.title || '').toLowerCase();
            const descLower = (item.description || item.reason_for_aid || '').toLowerCase();
            const nameLower = (item.full_name || '').toLowerCase();
            const combinedText = `${reasonLower} ${descLower} ${nameLower}`;

            let categoryKey: CauseCategoryKey = 'education';
            let category = 'Education';
            let categoryIcon = '📚';
            let defaultImg = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80';

            if (
              combinedText.includes('med') ||
              combinedText.includes('hosp') ||
              combinedText.includes('surg') ||
              combinedText.includes('health') ||
              combinedText.includes('cataract') ||
              combinedText.includes('doctor')
            ) {
              categoryKey = 'healthcare';
              category = 'Healthcare';
              categoryIcon = '🏥';
              defaultImg = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80';
            } else if (
              combinedText.includes('food') ||
              combinedText.includes('ration') ||
              combinedText.includes('relief') ||
              combinedText.includes('flood') ||
              combinedText.includes('disaster') ||
              combinedText.includes('hunger')
            ) {
              categoryKey = 'relief';
              category = 'Relief';
              categoryIcon = '🍲';
              defaultImg = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80';
            } else if (
              combinedText.includes('wom') ||
              combinedText.includes('girl') ||
              combinedText.includes('mother') ||
              combinedText.includes('widow') ||
              combinedText.includes('sew')
            ) {
              categoryKey = 'women';
              category = 'Women';
              categoryIcon = '👩‍🏫';
              defaultImg = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80';
            } else if (
              combinedText.includes('tree') ||
              combinedText.includes('plant') ||
              combinedText.includes('env') ||
              combinedText.includes('water') ||
              combinedText.includes('well')
            ) {
              categoryKey = 'environment';
              category = 'Environment';
              categoryIcon = '🌱';
              defaultImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';
            } else if (
              combinedText.includes('law') ||
              combinedText.includes('court') ||
              combinedText.includes('legal') ||
              combinedText.includes('rights') ||
              combinedText.includes('bail')
            ) {
              categoryKey = 'human_rights';
              category = 'Legal Aid';
              categoryIcon = '⚖️';
              defaultImg = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';
            }

            const target = Number(item.requested_amount || item.amount_requested || 0);
            const raised = Number(item.raised_amount || item.amount_disbursed || 0);
            const applicantName = item.full_name || 'Verified Seeker';

            let causeTitle = item.reason || item.title || 'Assistance & Social Relief Support';
            if (causeTitle.includes(':')) {
              causeTitle = causeTitle.split(':')[1].trim();
            }

            const rawDesc = String(item.description || item.reason_for_aid || '');
            const locMatch = rawDesc.match(/\[Location:\s*([^\]]+)\]/i);
            const parsedLocation =
              locMatch?.[1]?.trim() ||
              [item.city, item.state].filter(Boolean).join(', ') ||
              'India';
            const cleanDescription = rawDesc
              .replace(/\s*\[(Location|Urgency|Age):[^\]]+\]/gi, '')
              .trim();

            return {
              id: item.id || `live-cause-${idx}`,
              title: `${applicantName} (${causeTitle})`,
              category,
              categoryKey,
              categoryIcon,
              location: parsedLocation,
              imageUrl: defaultImg,
              description: cleanDescription || `Verified assistance cause for ${applicantName}.`,
              aboutStory:
                cleanDescription ||
                `HRSJM verified assistance request for ${applicantName}.\n\nPurpose: ${causeTitle}\n\nYour contribution goes directly to support this verified case.`,
              targetAmount: target,
              raisedAmount: raised,
              status: raised >= target && target > 0 ? 'closed' : 'active',
              beneficiariesCount: 1,
              targetBeneficiaries: `1 Beneficiary (${applicantName})`,
              donorCount: Number(item.donor_count || (raised > 0 ? 1 : 0)),
              daysLeft: 20,
              isVerified: true,
              createdAt: item.created_at || new Date().toISOString(),
            };
          });

        setCauses(mappedFromBackend);
      } catch (err) {
        console.warn('[MemberCausesPage] Error fetching live approved causes:', err);
        setCauses([]);
      } finally {
        setLoading(false);
      }
    };

    loadApprovedCauses();
  }, []);

  // Compute KPI Stats directly from live causes
  const kpiStats = useMemo(() => {
    const totalCauses = causes.length;
    const activeCauses = causes.filter((c) => c.status === 'active').length;
    const totalTarget = causes.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
    const totalRaised = causes.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
    const totalBeneficiaries = causes.reduce((sum, c) => sum + (c.beneficiariesCount || 0), 0);
    const totalDonors = causes.reduce((sum, c) => sum + (c.donorCount || 0), 0);

    const formatRupeeShort = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      return `₹${val.toLocaleString('en-IN')}`;
    };

    return {
      totalCauses,
      activeCauses,
      totalRaised,
      totalRaisedFormatted: formatRupeeShort(totalRaised),
      totalBeneficiaries,
      totalDonors,
      totalTarget,
    };
  }, [causes]);

  // Filter causes by tab and search
  const filteredCauses = useMemo(() => {
    return causes.filter((cause) => {
      // Tab category filter
      if (activeTab === 'active' && cause.status !== 'active') {
        return false;
      }
      if (activeTab !== 'all' && activeTab !== 'active' && cause.categoryKey !== activeTab) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = cause.title.toLowerCase().includes(q);
        const matchCategory = cause.category.toLowerCase().includes(q);
        const matchLocation = cause.location.toLowerCase().includes(q);
        return matchTitle || matchCategory || matchLocation;
      }

      return true;
    });
  }, [causes, activeTab, searchQuery]);

  const handleOpenDonate = (cause: MemberCause) => {
    setSelectedCauseForDonation(cause);
  };

  const handleOpenDetails = (cause: MemberCause) => {
    setSelectedCauseForDetails(cause);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* ════════════════════════════════════════════════════════════
          1. TITLE SECTION: 1:1 Parity with APK
      ════════════════════════════════════════════════════════════ */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#011F39] tracking-tight">
          Causes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Discover and support causes that make a difference.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════
          2. KPI IMPACT GRID (2x2 Mobile, 4x1 Desktop): 1:1 APK Parity
      ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Causes */}
        <div className="bg-white rounded-2xl border border-[#DCE4EC] p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#1E3A8A]">
            <Target size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#011F39] font-black text-lg sm:text-xl leading-tight">
              {kpiStats.activeCauses}
            </div>
            <div className="text-slate-500 text-xs font-medium truncate mt-0.5">
              Active Causes
            </div>
          </div>
        </div>

        {/* Card 2: Funds Raised */}
        <div className="bg-white rounded-2xl border border-[#DCE4EC] p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#059669]">
            <Banknote size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#059669] font-black text-lg sm:text-xl leading-tight">
              {kpiStats.totalRaisedFormatted}
            </div>
            <div className="text-slate-500 text-xs font-medium truncate mt-0.5">
              Funds Raised
            </div>
          </div>
        </div>

        {/* Card 3: Lives Impacted */}
        <div className="bg-white rounded-2xl border border-[#DCE4EC] p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#D97706]">
            <Users size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#D97706] font-black text-lg sm:text-xl leading-tight">
              {kpiStats.totalBeneficiaries}
            </div>
            <div className="text-slate-500 text-xs font-medium truncate mt-0.5">
              Lives Impacted
            </div>
          </div>
        </div>

        {/* Card 4: Supporters */}
        <div className="bg-white rounded-2xl border border-[#DCE4EC] p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#DC2626]">
            <Heart size={20} className="stroke-[2.2] fill-[#DC2626]/10 text-[#DC2626]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#DC2626] font-black text-lg sm:text-xl leading-tight">
              {kpiStats.totalDonors}
            </div>
            <div className="text-slate-500 text-xs font-medium truncate mt-0.5">
              Supporters
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          3. SEARCH & QUICK ACTION BAR: 1:1 APK Parity
      ════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 bg-white rounded-xl border border-[#DCE4EC] px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs transition focus-within:border-[#011F39]">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, category or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-hidden font-normal"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
              aria-label="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'active' ? 'all' : 'active')}
          title="Quick Filter: Active Causes"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FEF9E6] border border-[#FAD465] text-[#C9971A] hover:bg-[#FAD465] hover:text-[#011F39] transition flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
        >
          <Zap size={18} className="fill-current" />
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          4. CATEGORY FILTER PILLS: Horizontal Scrolling
      ════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#011F39] text-white shadow-xs border border-[#011F39]'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-[#DCE4EC]'
              }`}
            >
              {tab.icon && <span className="text-xs">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════
          5. SECTION HEADER: "All Social Initiatives" + Count Badge
      ════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-base sm:text-lg font-serif font-black text-[#011F39]">
          {activeTab === 'all'
            ? 'All Social Initiatives'
            : `${CATEGORY_TABS.find((t) => t.key === activeTab)?.label} Causes`}
        </h2>
        <span className="text-xs sm:text-sm font-bold text-slate-500">
          {filteredCauses.length} {filteredCauses.length === 1 ? 'cause' : 'causes'}
        </span>
      </div>

      {/* ════════════════════════════════════════════════════════════
          6. CAUSES CARDS LIST / GRID: 1:1 APK CauseCard Parity
      ════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EC] p-10 text-center space-y-2 shadow-2xs">
          <div className="w-8 h-8 border-2 border-[#011F39] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading verified causes...</p>
        </div>
      ) : filteredCauses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EC] p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <h3 className="font-bold text-[#011F39] text-base">No causes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery.trim()
              ? `No social causes matching "${searchQuery}". Try a different keyword.`
              : 'No causes match the selected filter category.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#011F39] text-white text-xs font-bold hover:bg-[#06294D] transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredCauses.map((cause) => {
            const percentRaised = Math.min(
              100,
              Math.round((cause.raisedAmount / (cause.targetAmount || 1)) * 100)
            );
            const isCompleted = cause.status === 'closed' || percentRaised >= 100;

            return (
              <div
                key={cause.id}
                className="bg-white rounded-2xl border border-[#DCE4EC] overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top Media Banner */}
                  <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-800">
                    <img
                      src={cause.imageUrl}
                      alt={cause.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Floating Category Badge (Top-Left) */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#06294D] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-white/50">
                      <span>{cause.categoryIcon}</span>
                      <span>{cause.category}</span>
                    </div>

                    {/* Status Badge (Top-Right) */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-white/50">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCompleted ? 'bg-sky-500' : 'bg-emerald-500 animate-pulse'
                        }`}
                      />
                      <span className={isCompleted ? 'text-sky-700' : 'text-emerald-700'}>
                        {isCompleted ? 'Goal Reached' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {/* Cause Title */}
                    <h3
                      onClick={() => handleOpenDetails(cause)}
                      className="font-bold text-[#06294D] text-base leading-snug line-clamp-2 hover:text-[#011F39] cursor-pointer"
                      title={cause.title}
                    >
                      {cause.title}
                    </h3>

                    {/* Location & Beneficiaries Meta Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{cause.location}</span>
                      </div>
                      <div className="bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Users size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{cause.targetBeneficiaries}</span>
                      </div>
                    </div>

                    {/* Financial Metrics Row */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="text-[#06294D] font-black text-base sm:text-lg leading-tight">
                          ₹{cause.raisedAmount.toLocaleString('en-IN')}{' '}
                          <span className="text-[11px] font-medium text-slate-500">raised</span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                          Raised so far
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-slate-600 font-bold text-sm sm:text-base leading-tight">
                          ₹{cause.targetAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                          Goal Amount
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar with Percentage Badge */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isCompleted ? 'bg-sky-500' : 'bg-[#059669]'
                          }`}
                          style={{ width: `${percentRaised}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 min-w-[32px] text-right">
                        {percentRaised}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="p-4 sm:p-5 pt-0 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(cause)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-[#DCE4EC] bg-white hover:bg-slate-50 text-[#06294D] font-bold text-xs sm:text-sm text-center shadow-2xs transition cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    disabled={isCompleted}
                    onClick={() => handleOpenDonate(cause)}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-center shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCompleted
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39]'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check size={14} className="stroke-[2.5]" />
                        <span>Goal Reached</span>
                      </>
                    ) : (
                      <>
                        <Heart size={14} className="fill-[#011F39] text-[#011F39]" />
                        <span>Donate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          7. CAUSE DETAILS MODAL
      ════════════════════════════════════════════════════════════ */}
      {selectedCauseForDetails && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCauseForDetails(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="h-52 w-full relative bg-slate-900">
              <img
                src={selectedCauseForDetails.imageUrl}
                alt={selectedCauseForDetails.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

              <button
                type="button"
                onClick={() => setSelectedCauseForDetails(null)}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <span className="bg-white/95 text-[#06294D] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {selectedCauseForDetails.categoryIcon} {selectedCauseForDetails.category}
                </span>
                <span className="bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <ShieldCheck size={13} /> Verified Cause
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-serif font-black text-[#011F39] leading-snug">
                  {selectedCauseForDetails.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {selectedCauseForDetails.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-slate-400" />
                    {selectedCauseForDetails.targetBeneficiaries}
                  </span>
                  {selectedCauseForDetails.daysLeft && (
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Calendar size={13} />
                      {selectedCauseForDetails.daysLeft} days remaining
                    </span>
                  )}
                </div>
              </div>

              {/* Story & Background */}
              <div className="bg-[#FAF7F0] border border-[#DCE4EC] p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  About This Initiative
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedCauseForDetails.aboutStory || selectedCauseForDetails.description}
                </p>
              </div>

              {/* Financial Progress Breakdown */}
              <div className="bg-white border border-[#DCE4EC] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Fundraising Progress</span>
                  <span className="font-bold text-[#059669]">
                    {Math.min(
                      100,
                      Math.round(
                        (selectedCauseForDetails.raisedAmount /
                          (selectedCauseForDetails.targetAmount || 1)) *
                          100
                      )
                    )}
                    % Reached
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#059669]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (selectedCauseForDetails.raisedAmount /
                            (selectedCauseForDetails.targetAmount || 1)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10.5px]">Raised so far</span>
                    <span className="font-bold text-[#06294D] text-sm">
                      ₹{selectedCauseForDetails.raisedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10.5px]">Target Goal</span>
                    <span className="font-bold text-slate-700 text-sm">
                      ₹{selectedCauseForDetails.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCauseForDetails(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#DCE4EC] text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = selectedCauseForDetails;
                    setSelectedCauseForDetails(null);
                    handleOpenDonate(target);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Heart size={15} className="fill-[#011F39] text-[#011F39]" />
                  <span>Donate to this Cause</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          8. OFFICIAL CASHFREE / GATEWAY PAYMENT MODAL
      ════════════════════════════════════════════════════════════ */}
      {selectedCauseForDonation && (
        <GlobalPaymentModal
          isOpen={Boolean(selectedCauseForDonation)}
          onClose={() => setSelectedCauseForDonation(null)}
          payload={{
            purpose: 'donation',
            amount: 1000,
            title: selectedCauseForDonation.title,
            subtitle: selectedCauseForDonation.category,
            entityId: selectedCauseForDonation.id,
            userId: user?.id || member?.id,
            donorName: user?.full_name || member?.fullName || 'HRSJM Contributor',
            donorMobile: user?.mobile_number || member?.phone || '',
            donorEmail: user?.email || member?.email || '',
          }}
          onSuccess={(receipt) => {
            const donatedId = selectedCauseForDonation.id;
            const donatedTitle = selectedCauseForDonation.title;
            const amount = receipt.amount;

            // Update local causes list state
            setCauses((prev) =>
              prev.map((c) =>
                c.id === donatedId
                  ? {
                      ...c,
                      raisedAmount: Math.min(c.targetAmount, c.raisedAmount + amount),
                      donorCount: (c.donorCount || 0) + 1,
                      status: c.raisedAmount + amount >= c.targetAmount ? 'closed' : c.status,
                    }
                  : c
              )
            );

            // Record donation in member store passbook
            processDonation(
              donatedTitle,
              amount,
              'CASHFREE',
              receipt.panNumber,
              receipt.transactionId
            );

            setSelectedCauseForDonation(null);
          }}
        />
      )}
    </div>
  );
};

export default MemberCausesPage;
