import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  FileText,
  Search,
  X,
  ArrowRight,
  Info,
  HeartHandshake,
  Megaphone,
  GraduationCap,
  Shield,
  Heart,
  Lock,
  Users,
  Globe,
  Briefcase,
  Clock,
} from 'lucide-react';

export type RightsCategoryKey =
  | 'ALL'
  | 'CONSTITUTIONAL'
  | 'WOMEN_CHILD'
  | 'CIVIL_JUSTICE'
  | 'LABOUR_WELFARE';

export interface CategoryFilterTab {
  key: RightsCategoryKey;
  label: string;
}

export const CATEGORY_TABS: CategoryFilterTab[] = [
  { key: 'ALL', label: 'All Rights' },
  { key: 'CONSTITUTIONAL', label: 'Constitutional' },
  { key: 'WOMEN_CHILD', label: 'Women & Child' },
  { key: 'CIVIL_JUSTICE', label: 'Civil & Justice' },
  { key: 'LABOUR_WELFARE', label: 'Labour & Welfare' },
];

export interface RightGuideItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: RightsCategoryKey;
  categoryLabel: string;
  legalReference: string;
  highlights: string[];
  accentColor: string;
  badgeBg: string;
  iconBg: string;
}

export const RIGHTS_GUIDES: RightGuideItem[] = [
  {
    id: 'freedom-of-speech',
    title: 'Freedom of Speech & Expression',
    description: 'Constitutional liberty to express views, assemble peacefully and critique governance.',
    icon: 'megaphone',
    category: 'CONSTITUTIONAL',
    categoryLabel: 'Constitutional',
    legalReference: 'Article 19(1)(a) • Expression & Press',
    highlights: ['Freedom of Thought', 'Free Press', 'Peaceful Assembly'],
    accentColor: '#C9971A',
    badgeBg: '#FFF9E6',
    iconBg: '#FFF8E8',
  },
  {
    id: 'fundamental-rights',
    title: 'Fundamental Rights',
    description: 'Constitutional rights guaranteed to every citizen of India enforceable under Article 32.',
    icon: 'file-text',
    category: 'CONSTITUTIONAL',
    categoryLabel: 'Constitutional',
    legalReference: 'Part III of Constitution • Articles 12–35',
    highlights: ['Right to Equality', 'Right to Freedom', 'Article 32 Writs'],
    accentColor: '#06294D',
    badgeBg: '#FFF9E6',
    iconBg: '#FFF8E8',
  },
  {
    id: 'right-to-education',
    title: 'Right to Education',
    description: 'Right to free and compulsory education for all children aged 6 to 14 years.',
    icon: 'graduation-cap',
    category: 'CONSTITUTIONAL',
    categoryLabel: 'Constitutional',
    legalReference: 'RTE Act 2009 • Article 21A',
    highlights: ['Free & Compulsory', 'Age 6 to 14 Years', 'Zero Discrimination'],
    accentColor: '#174A78',
    badgeBg: '#EDF2F7',
    iconBg: '#ECF9F4',
  },
  {
    id: 'womens-rights',
    title: "Women's Rights",
    description: 'Statutory safeguards against domestic violence, workplace harassment, and wage disparity.',
    icon: 'shield',
    category: 'WOMEN_CHILD',
    categoryLabel: 'Women & Child',
    legalReference: 'DV Act 2005 • Article 15(3) • POSH Act',
    highlights: ['Workplace Safety', 'Protection from Violence', 'Equal Inheritance'],
    accentColor: '#06294D',
    badgeBg: '#EDF2F7',
    iconBg: '#FFF0F2',
  },
  {
    id: 'childrens-rights',
    title: "Children's Rights",
    description: 'Protection from abuse, forced labour, trafficking and right to education & care.',
    icon: 'heart',
    category: 'WOMEN_CHILD',
    categoryLabel: 'Women & Child',
    legalReference: 'POCSO Act 2012 • Articles 21A & 24',
    highlights: ['Free Education', 'No Child Labour', 'Nutrition & Care'],
    accentColor: '#174A78',
    badgeBg: '#EDF2F7',
    iconBg: '#EEF4FF',
  },
  {
    id: 'civil-rights',
    title: 'Civil Rights',
    description: 'Rights related to equal treatment, protection under law and non-discrimination.',
    icon: 'scale',
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'Articles 14–18 • Equal Protection',
    highlights: ['Equal Treatment', 'Non-Discrimination', 'Access to Law'],
    accentColor: '#174A78',
    badgeBg: '#EDF2F7',
    iconBg: '#EEF4FF',
  },
  {
    id: 'civil-liberties',
    title: 'Civil Liberties & Personal Freedom',
    description: 'Protection against arbitrary arrest, custody safeguards, privacy and bodily autonomy.',
    icon: 'lock',
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'Article 21 • Personal Liberty & Privacy',
    highlights: ['Right to Privacy', 'Due Process of Law', 'Bodily Autonomy'],
    accentColor: '#174A78',
    badgeBg: '#DBE5EE',
    iconBg: '#EEF4FF',
  },
  {
    id: 'right-to-information',
    title: 'Right to Information',
    description: 'Statutory right to inspect public files, demand citizen transparency and hold authorities accountable.',
    icon: 'search',
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'RTI Act 2005 • Public Accountability',
    highlights: ['Access Public Files', 'Citizen Transparency', '30-Day Reply Window'],
    accentColor: '#06294D',
    badgeBg: '#EDF2F7',
    iconBg: '#EEF4FF',
  },
  {
    id: 'minority-rights',
    title: 'Minority Rights',
    description: 'Safeguards for cultural preservation, mother-tongue education and institutional autonomy.',
    icon: 'users',
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'Articles 29 & 30 • Cultural & Educational',
    highlights: ['Language Preservation', 'Community Institutions', 'Non-Discrimination'],
    accentColor: '#06294D',
    badgeBg: '#DBE5EE',
    iconBg: '#F5F0FF',
  },
  {
    id: 'human-rights',
    title: 'Universal Human Rights',
    description: 'Inalienable rights to life, dignity, equality and protection against cruel punishment.',
    icon: 'globe',
    category: 'LABOUR_WELFARE',
    categoryLabel: 'Universal Protection',
    legalReference: 'UDHR 1948 • NHRC Guidelines',
    highlights: ['Life with Dignity', 'Freedom from Torture', 'Universal Equality'],
    accentColor: '#C9971A',
    badgeBg: '#FFF9E6',
    iconBg: '#FFF8E8',
  },
  {
    id: 'labour-rights',
    title: 'Labour & Worker Rights',
    description: 'Statutory safeguards for fair wages, safe workplaces, unionization and social security.',
    icon: 'briefcase',
    category: 'LABOUR_WELFARE',
    categoryLabel: 'Labour & Welfare',
    legalReference: 'Factories Act 1948 • Minimum Wages Act',
    highlights: ['Fair Compensation', 'Safe Workplace', 'Right to Unionize'],
    accentColor: '#C9971A',
    badgeBg: '#FFF9E6',
    iconBg: '#FFF0F2',
  },
  {
    id: 'senior-citizen-rights',
    title: 'Senior Citizen Rights',
    description: 'Statutory maintenance allowances, property deed protection and healthcare priority for elders.',
    icon: 'clock',
    category: 'LABOUR_WELFARE',
    categoryLabel: 'Labour & Welfare',
    legalReference: 'Maintenance & Welfare Act, 2007',
    highlights: ['Parental Support', 'Special Healthcare', 'Legal Protection'],
    accentColor: '#C9971A',
    badgeBg: '#FFF9E6',
    iconBg: '#FFF8E8',
  },
];

interface UserRightsPageProps {
  isMember?: boolean;
  isSeeker?: boolean;
}

export const UserRightsPage: React.FC<UserRightsPageProps> = ({
  isMember = false,
  isSeeker = false,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RightsCategoryKey>('ALL');

  const filteredRights = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return RIGHTS_GUIDES.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const refMatch = item.legalReference.toLowerCase().includes(q);
      const highlightsMatch = item.highlights.some((h) =>
        h.toLowerCase().includes(q)
      );

      return titleMatch || descMatch || refMatch || highlightsMatch;
    });
  }, [searchQuery, selectedCategory]);

  const renderIcon = (name: string, color: string, size = 20) => {
    switch (name) {
      case 'megaphone':
        return <Megaphone size={size} color={color} />;
      case 'file-text':
        return <FileText size={size} color={color} />;
      case 'graduation-cap':
        return <GraduationCap size={size} color={color} />;
      case 'shield':
        return <Shield size={size} color={color} />;
      case 'heart':
        return <Heart size={size} color={color} />;
      case 'scale':
        return <Scale size={size} color={color} />;
      case 'lock':
        return <Lock size={size} color={color} />;
      case 'search':
        return <Search size={size} color={color} />;
      case 'users':
        return <Users size={size} color={color} />;
      case 'globe':
        return <Globe size={size} color={color} />;
      case 'briefcase':
        return <Briefcase size={size} color={color} />;
      case 'clock':
        return <Clock size={size} color={color} />;
      default:
        return <Scale size={size} color={color} />;
    }
  };

  const handleOpenRight = (rightId: string) => {
    if (isSeeker) {
      navigate(`/seeker/rights/${rightId}`);
    } else {
      navigate(`/rights/${rightId}`);
    }
  };

  const handleFileComplaint = () => {
    if (isSeeker) {
      navigate('/seeker/complaint');
    } else if (isMember) {
      navigate('/member/support');
    } else {
      navigate('/support');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Spotlight Hero Banner */}
      <div className="rounded-2xl bg-[#06294D] text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold tracking-wider uppercase">
            <Scale size={13} className="text-white" />
            <span>CITIZEN RIGHTS & JUSTICE</span>
          </div>
          <span className="text-[#FCD34D] text-xs sm:text-sm font-bold">
            {RIGHTS_GUIDES.length} Legal Guides
          </span>
        </div>

        {/* Title & Tagline */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
          Know Your Rights. Protect Your Voice.
        </h1>
        <p className="text-xs sm:text-sm text-[#E0E7FF] mt-2 leading-relaxed max-w-3xl">
          Every citizen is guaranteed legal protections and fundamental liberties
          by the Constitution of India and international human rights conventions.
        </p>

        {/* 3 Key Pillars Row */}
        <div className="mt-5 bg-black/20 rounded-xl py-3 px-3 sm:px-6 flex items-center justify-around divide-x divide-white/20">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
            <Scale size={20} className="text-[#D97706] mb-1" />
            <span className="text-white text-xs sm:text-sm font-semibold">
              Constitutional Rights
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
            <ShieldCheck size={20} className="text-[#D97706] mb-1" />
            <span className="text-white text-xs sm:text-sm font-semibold">
              Legal Protection
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
            <FileText size={20} className="text-[#D97706] mb-1" />
            <span className="text-white text-xs sm:text-sm font-semibold">
              Free Legal Aid
            </span>
          </div>
        </div>
      </div>

      {/* Facing a Rights Violation Callout Banner */}
      <div className="rounded-xl sm:rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-[#D97706]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#92400E]">
              Facing a Rights Violation?
            </h3>
            <p className="text-xs sm:text-sm text-[#B45309] mt-0.5">
              HRSJM Legal Cell assists members with grievances, legal aid, and guidance.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFileComplaint}
          className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          File Complaint
        </button>
      </div>

      {/* Search and Discovery */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 flex items-center gap-3 shadow-xs">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search rights, laws, or constitutional articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
        />
        {searchQuery.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#06294D] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="font-serif text-base sm:text-lg font-bold text-[#06294D]">
          {selectedCategory === 'ALL'
            ? 'All Rights & Protections'
            : CATEGORY_TABS.find((c) => c.key === selectedCategory)?.label}
        </h2>
        <span className="text-xs font-bold text-[#06294D] bg-[#DBE5EE]/70 px-3 py-1 rounded-full">
          {filteredRights.length} {filteredRights.length === 1 ? 'Topic' : 'Topics'}
        </span>
      </div>

      {/* Rights Cards List / Grid */}
      {filteredRights.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
          <Search size={36} className="mx-auto mb-2 text-slate-300" />
          <p className="text-base font-bold text-slate-700">No Rights Found</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            No rights or articles match &ldquo;{searchQuery}&rdquo;. Try another keyword or clear the search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-[#06294D] bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRights.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenRight(item.id)}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header row with Icon, Category badge, Legal reference */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    {renderIcon(item.icon, item.accentColor, 20)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mb-0.5"
                      style={{
                        backgroundColor: item.badgeBg,
                        color: item.accentColor,
                      }}
                    >
                      {item.categoryLabel.toUpperCase()}
                    </span>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {item.legalReference}
                    </p>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-serif text-lg font-bold text-[#06294D] group-hover:text-[#D97706] transition-colors mt-3 mb-1.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Highlights Pills */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-3.5">
                    {item.highlights.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 font-medium"
                      >
                        <span className="text-slate-400 font-bold">•</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-100">
                <span className="text-xs font-bold text-[#06294D] group-hover:text-[#D97706] transition-colors">
                  Read Legal Guide
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-[#06294D] flex items-center justify-center transition-colors text-slate-600 group-hover:text-white">
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constitutional Safeguards Section */}
      <div className="pt-6 space-y-3.5">
        <h2 className="font-serif text-base sm:text-lg font-bold text-[#06294D]">
          Constitutional Safeguards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-[#D97706]">
              <Info size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#06294D]">
                Article 32 — The Heart & Soul of the Constitution
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Dr. B.R. Ambedkar termed Article 32 as the most fundamental provision,
                granting citizens direct recourse to the Supreme Court through Writs if
                any fundamental right is violated.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-[#D97706]">
              <HeartHandshake size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#06294D]">
                Article 39A — Equal Justice & Free Legal Aid
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                The State is mandated to provide free legal aid to ensure that
                opportunities for securing justice are not denied to any citizen by
                reason of economic or other disabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
