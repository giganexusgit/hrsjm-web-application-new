import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileText,
  Users,
  GraduationCap,
  Baby,
  Megaphone,
  BookOpen,
  Handshake,
  Globe,
  Phone,
  Award,
  Heart,
  X,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertCircle,
} from 'lucide-react';
import {
  getRightDetail,
  type RightsCard,
  type RightDetailsContent,
} from '../data/rightsDetailData';

type TabId = 'overview' | 'keyAreas' | 'support' | 'work';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'keyAreas', label: 'Key Areas' },
  { id: 'support', label: 'Support and Help' },
  { id: 'work', label: "HRSJM's Work" },
];

const renderIcon = (name: string, size = 18, className = '') => {
  switch (name) {
    case 'scale':
      return <Scale size={size} className={className} />;
    case 'shield-check':
    case 'shield':
      return <ShieldCheck size={size} className={className} />;
    case 'file-text':
      return <FileText size={size} className={className} />;
    case 'users':
      return <Users size={size} className={className} />;
    case 'graduation-cap':
      return <GraduationCap size={size} className={className} />;
    case 'baby':
    case 'child':
      return <Baby size={size} className={className} />;
    case 'megaphone':
      return <Megaphone size={size} className={className} />;
    case 'book-open':
      return <BookOpen size={size} className={className} />;
    case 'handshake':
      return <Handshake size={size} className={className} />;
    case 'globe':
      return <Globe size={size} className={className} />;
    case 'phone':
      return <Phone size={size} className={className} />;
    case 'award':
      return <Award size={size} className={className} />;
    case 'heart':
      return <Heart size={size} className={className} />;
    case 'download':
      return <Download size={size} className={className} />;
    default:
      return <ShieldCheck size={size} className={className} />;
  }
};

interface RightCardDetailData {
  title: string;
  description: string;
  icon?: string;
  legalBasis: string;
  safeguards: string[];
}

const getCardDetailInfo = (item: RightsCard, rightTitle: string): RightCardDetailData => {
  const titleLower = item.title.toLowerCase();
  let legalBasis = 'Constitution of India • Protection of Human Rights Act 1993';
  let safeguards = [
    'Direct standing to report violations before competent judicial and human rights commissions.',
    'Access to district legal aid authorities and state commission grievance cells.',
    'HRSJM verified legal advocacy intervention and non-discrimination protection.',
  ];

  if (
    titleLower.includes('safety') ||
    titleLower.includes('violence') ||
    titleLower.includes('protection') ||
    titleLower.includes('pocso') ||
    titleLower.includes('abuse') ||
    titleLower.includes('dignity')
  ) {
    legalBasis = 'Protection of Women from Domestic Violence Act 2005 • POCSO Act 2012 • IPC/BNS Section 354, 509';
    safeguards = [
      'Immediate Right to Reside in shared household without threat of forceful dispossession.',
      'Protection Orders enforceable through Protection Officers, CWCs & Judicial Magistrates.',
      '24x7 HRSJM Legal Support Desk & National Helpline 1091 / 1098 / 112 emergency escalation.',
    ];
  } else if (
    titleLower.includes('education') ||
    titleLower.includes('school') ||
    titleLower.includes('rte') ||
    titleLower.includes('learning')
  ) {
    legalBasis = 'Right of Children to Free and Compulsory Education (RTE) Act 2009 • Article 21A';
    safeguards = [
      'Mandatory free education for children 6 to 14 years in recognized neighbourhood schools.',
      '25% reservation for economically weaker and disadvantaged sections in private schools.',
      'Zero capitation fee, physical screening or documentation rejection during admission.',
    ];
  } else if (
    titleLower.includes('child') ||
    titleLower.includes('minor') ||
    titleLower.includes('labour')
  ) {
    legalBasis = 'Child Labour (Prohibition) Act 1986 • Juvenile Justice Act 2015 • POCSO Act 2012';
    safeguards = [
      'Absolute prohibition of hazardous and non-hazardous commercial child employment.',
      'Mandatory child welfare committee rehabilitation and state-funded foster shelter aid.',
      'Statutory legal representation for minors with complete privacy & identity confidentiality.',
    ];
  } else if (
    titleLower.includes('work') ||
    titleLower.includes('employment') ||
    titleLower.includes('pay') ||
    titleLower.includes('wage') ||
    titleLower.includes('pf')
  ) {
    legalBasis = 'Code on Wages 2019 • Equal Remuneration Act 1976 • POSH Act 2013 • Articles 16 & 39(d)';
    safeguards = [
      'Equal floor wage payment for equal work with zero gender or background disparity.',
      'Mandatory Internal Complaints Committee (ICC) in every establishment with 10+ employees.',
      'Right to safe, dignified workplace conditions, overtime pay and statutory PF/ESI benefits.',
    ];
  } else if (
    titleLower.includes('health') ||
    titleLower.includes('nutrition') ||
    titleLower.includes('medical')
  ) {
    legalBasis = 'Article 21 (Right to Health & Dignity) • National Food Security Act • Maintenance of Parents Act';
    safeguards = [
      'Universal access to public primary healthcare, hospital priority and maternal services.',
      'Nutritional entitlements through Anganwadi centers and government supplementary nutrition schemes.',
      'Confidential medical examination and emergency stabilization care in all public & private hospitals.',
    ];
  } else if (
    titleLower.includes('elder') ||
    titleLower.includes('senior') ||
    titleLower.includes('maintenance') ||
    titleLower.includes('parent')
  ) {
    legalBasis = 'Maintenance and Welfare of Parents and Senior Citizens Act 2007 • Article 41';
    safeguards = [
      'Right to claim monthly maintenance from children or legal heirs through Sub-Divisional Tribunals.',
      'Section 23 revocation of property gift deeds if children refuse basic amenities and care.',
      'Severe criminal penalties for abandonment of senior citizens in public or healthcare facilities.',
    ];
  } else if (
    titleLower.includes('information') ||
    titleLower.includes('rti') ||
    titleLower.includes('transparency')
  ) {
    legalBasis = 'Right to Information Act 2005 • Article 19(1)(a) Constitutional Transparency';
    safeguards = [
      'Mandatory 30-day timeline for public authorities to provide certified records and documents.',
      'Strict daily financial penalty up to ₹25,000 on Public Information Officers refusing disclosure.',
      'Two-tier independent appeal mechanism to First Appellate Authority and State/Central Information Commission.',
    ];
  } else if (
    titleLower.includes('speech') ||
    titleLower.includes('expression') ||
    titleLower.includes('press') ||
    titleLower.includes('assembly') ||
    titleLower.includes('protest')
  ) {
    legalBasis = 'Article 19(1)(a) & 19(1)(b) of the Constitution of India • Landmark Supreme Court Precedents';
    safeguards = [
      'Freedom of thought, expression, journalistic investigation and peaceful public assembly without weapons.',
      'High constitutional bar on executive censorship or pre-publication restraints.',
      'Judicial protection against frivolous police harassment or unlawful protest dispersal.',
    ];
  } else if (
    titleLower.includes('privacy') ||
    titleLower.includes('arrest') ||
    titleLower.includes('custody') ||
    titleLower.includes('liberty') ||
    titleLower.includes('bail')
  ) {
    legalBasis = 'Article 21 (Right to Life & Personal Liberty) • Supreme Court D.K. Basu Directives • BNSS / CrPC';
    safeguards = [
      'Mandatory prepared arrest memo, immediate family notification and medical checkup every 48 hours.',
      'Compulsory production before nearest Judicial Magistrate within 24 hours of detention.',
      'Constitutional right to privacy against unauthorized surveillance, data extraction and wiretapping.',
    ];
  } else if (
    titleLower.includes('minority') ||
    titleLower.includes('religion') ||
    titleLower.includes('faith') ||
    titleLower.includes('language')
  ) {
    legalBasis = 'Articles 25, 26, 29 & 30 of the Constitution • National Commission for Minorities Act 1992';
    safeguards = [
      'Right of religious and linguistic minorities to establish and administer educational institutions.',
      'Constitutional parity in government grants and financial aid without minority prejudice.',
      'Complete freedom of conscience and protection against hate crimes and discriminatory slurs.',
    ];
  } else if (
    titleLower.includes('equality') ||
    titleLower.includes('discrimination') ||
    titleLower.includes('human') ||
    titleLower.includes('fundamental') ||
    titleLower.includes('equal')
  ) {
    legalBasis = 'Article 14 (Equality Before Law) • Article 15 (Prohibition of Discrimination) • Article 32 Writs';
    safeguards = [
      'Constitutional guarantee against discrimination on grounds of religion, race, caste, sex or birth.',
      'Direct standing to move Supreme Court (Article 32) or High Court (Article 226) via prerogative writs.',
      'Statutory legal aid through National Legal Services Authority (NALSA) and state grievance cells.',
    ];
  }

  return {
    title: item.title,
    description:
      item.description ||
      `Statutory and constitutional legal rights guaranteed under ${rightTitle}.`,
    icon: item.icon,
    legalBasis,
    safeguards,
  };
};

interface UserRightDetailsPageProps {
  isSeeker?: boolean;
  isMember?: boolean;
}

export const UserRightDetailsPage: React.FC<UserRightDetailsPageProps> = ({
  isSeeker = false,
  isMember = false,
}) => {
  const { rightId, id } = useParams<{ rightId?: string; id?: string }>();
  const navigate = useNavigate();
  const effectiveRightId = rightId || id || 'human-rights';
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedCard, setSelectedCard] = useState<RightCardDetailData | null>(null);

  const rightsListRoute = isSeeker ? '/seeker/rights' : isMember ? '/member/rights' : '/rights';
  const supportRoute = isSeeker ? '/seeker/complaint' : isMember ? '/member/support' : '/support';

  const content: RightDetailsContent = useMemo(() => {
    return getRightDetail(effectiveRightId);
  }, [effectiveRightId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [effectiveRightId]);

  // Format title into first word (white) and rest (gold) for executive typography matching APK
  const titleWords = content.title.split(' ');
  const firstWord = titleWords[0];
  const remainingWords = titleWords.slice(1).join(' ');

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 space-y-6 pt-3 md:pt-4">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(rightsListRoute)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#06294D] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Rights</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to={rightsListRoute} className="hover:text-[#06294D] transition-colors">
            Know Your Rights
          </Link>
          <span>/</span>
          <span className="text-[#06294D] font-bold">{content.title}</span>
        </div>
      </div>

      {/* Hero Banner matching Image 2 */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[260px] bg-[#06294D] shadow-md border border-slate-200/40">
        <img
          src={content.heroImage || '/assets/images/hero-home.webp'}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover object-center mix-blend-overlay opacity-50"
          onError={e => {
            (e.currentTarget as HTMLImageElement).src = '/assets/images/hero-home.webp';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06294D] via-[#06294D]/85 to-transparent" />

        <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] max-w-3xl space-y-2.5">
          {/* Badge Pill */}
          <div className="inline-block">
            <span className="px-2.5 py-1 rounded-md bg-white text-[#06294D] text-[11px] font-black uppercase tracking-wider shadow-xs">
              {content.badge}
            </span>
          </div>

          {/* Title matching screenshot: First word white, rest Gold */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
            <span className="text-white">{firstWord}</span>{' '}
            <span className="text-[#E9B82E]">{remainingWords}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-200/90 max-w-2xl leading-relaxed font-sans">
            {content.description}
          </p>
        </div>
      </div>

      {/* 4 Tabs matching Screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#E9B82E] text-[#06294D] shadow-xs'
                  : 'bg-white hover:bg-slate-100/90 text-slate-600 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* What are Human Rights? Section */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#06294D]">
                {content.overview.title}
              </h2>
              {/* Gold Underline Accent */}
              <div className="w-12 h-1 bg-[#E9B82E] rounded-full mt-1.5" />
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {content.overview.description}
            </p>

            {/* Quote Box matching Screenshot */}
            {content.overview.quote && (
              <div className="relative p-5 sm:p-6 rounded-2xl bg-[#FFF9E6] border border-[#FDE68A] text-slate-800">
                <span className="text-3xl font-serif text-[#E9B82E] leading-none select-none block mb-1">
                  “
                </span>
                <p className="text-xs sm:text-sm font-serif italic text-slate-800 leading-relaxed pl-1">
                  {content.overview.quote}
                </p>
              </div>
            )}
          </div>

          {/* Key Areas Preview Section matching Screenshot */}
          {content.keyAreas && content.keyAreas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#06294D]">
                    Key Areas
                  </h3>
                  <div className="w-10 h-1 bg-[#E9B82E] rounded-full mt-1" />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('keyAreas')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#06294D] hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                {content.title} cover many important areas, including:
              </p>

              {/* 2x2 Grid of Key Area Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {content.keyAreas.slice(0, 4).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCard(getCardDetailInfo(item, content.title))}
                    className="p-4 sm:p-5 rounded-2xl text-left border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                    style={{ backgroundColor: item.color || '#FFFFFF' }}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      {/* Icon Bubble */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-black/5"
                        style={{ backgroundColor: item.iconColor || '#FEF3C7' }}
                      >
                        {renderIcon(item.icon, 20, 'text-[#06294D]')}
                      </div>

                      {/* Small Circle Arrow */}
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-[#06294D] group-hover:text-white transition-colors">
                        <ArrowRight size={12} />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#06294D] group-hover:text-amber-600 transition-colors line-clamp-2 mb-1.5">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legal Framework & Constitutional Guarantees */}
          {content.legalFramework && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#06294D] text-white shadow-md space-y-2">
              <div className="flex items-center gap-2 text-[#E9B82E]">
                <Scale size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Constitutional Guarantees & Statutory Framework
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {content.legalFramework.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {content.legalFramework.description}
              </p>
            </div>
          )}

          {/* Direct File Complaint Call-to-Action Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                <AlertCircle size={13} />
                <span>Grievance Redressal</span>
              </div>
              <h4 className="text-base font-bold text-[#06294D]">
                Facing a Violation of Your {content.title}?
              </h4>
              <p className="text-xs text-slate-600 max-w-xl">
                Submit an official grievance to our national legal protection cell for confidential review, statutory notice drafting, and on-ground representation.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate(supportRoute)}
                className="px-4 py-2.5 rounded-xl bg-[#06294D] hover:bg-[#0c3966] text-white text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>File a Complaint</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <span>Legal Cell Hotline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: KEY AREAS */}
      {activeTab === 'keyAreas' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#06294D]">
              Complete Statutory Safeguards & Key Areas
            </h2>
            <div className="w-10 h-1 bg-[#E9B82E] rounded-full mt-1 mb-2" />
            <p className="text-xs text-slate-600">
              Click any category card to examine statutory safeguards, relevant legal acts, and direct remedial actions provided under Indian jurisprudence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {(content.keyAreas || []).map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCard(getCardDetailInfo(item, content.title))}
                className="p-5 rounded-2xl text-left border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                style={{ backgroundColor: item.color || '#FFFFFF' }}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-black/5"
                    style={{ backgroundColor: item.iconColor || '#FEF3C7' }}
                  >
                    {renderIcon(item.icon, 20, 'text-[#06294D]')}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-[#06294D] group-hover:text-white transition-colors">
                    <ArrowRight size={12} />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#06294D] group-hover:text-amber-600 transition-colors line-clamp-2 mb-1.5">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-[#06294D]">
                  <span>View Legal Safeguard</span>
                  <ExternalLink size={12} className="text-slate-400 group-hover:text-[#06294D]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: SUPPORT AND HELP */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Emergency Statutory Helplines Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#06294D]">
                Statutory Emergency Helplines
              </h2>
              <div className="w-10 h-1 bg-[#E9B82E] rounded-full mt-1 mb-2" />
              <p className="text-xs text-slate-600">
                Toll-free emergency numbers accessible 24/7 across India for urgent rights protection and emergency intervention.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  NHRC National Helpline
                </span>
                <div className="text-xl font-black text-[#06294D] mt-1 font-mono">14433</div>
                <p className="text-[11px] text-slate-500 mt-1">National Human Rights Commission</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  National Emergency
                </span>
                <div className="text-xl font-black text-[#06294D] mt-1 font-mono">112</div>
                <p className="text-[11px] text-slate-500 mt-1">Police, Fire & Ambulance Integrated</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Women Helpline
                </span>
                <div className="text-xl font-black text-[#06294D] mt-1 font-mono">1091 / 181</div>
                <p className="text-[11px] text-slate-500 mt-1">Domestic violence & distress aid</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Childline
                </span>
                <div className="text-xl font-black text-[#06294D] mt-1 font-mono">1098</div>
                <p className="text-[11px] text-slate-500 mt-1">Emergency 24-hour child protection</p>
              </div>
            </div>
          </div>

          {/* HRSJM Support Services */}
          {content.supportAreas && content.supportAreas.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#06294D]">
                HRSJM Support Services for {content.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {content.supportAreas.map(item => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
                      {renderIcon(item.icon, 20)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#06294D]">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources & Document Guides */}
          {content.resources && content.resources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#06294D]">
                Official Legal Guides & Reference Documentation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.resources.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <Download size={18} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-[#06294D] truncate">
                        {item.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading document: ${item.title}`)}
                      className="text-xs font-bold text-[#06294D] hover:text-amber-600 transition-colors shrink-0 cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: HRSJM'S WORK */}
      {activeTab === 'work' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#06294D]">
                HRSJM On-Ground Interventions for {content.title}
              </h2>
              <div className="w-10 h-1 bg-[#E9B82E] rounded-full mt-1 mb-2" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Human Rights and Social Justice Mission actively monitors and intervenes in human rights violations through legal aid, fact-finding missions, writ petitions, and public awareness programs across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-amber-200/60 space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-[#E9B82E]/20 flex items-center justify-center text-[#06294D]">
                  <Scale size={16} />
                </div>
                <h4 className="text-sm font-bold text-[#06294D]">Legal Defense Cell</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated panel of advocates providing pro-bono representation to victims of custodial abuse, civil discrimination, and domestic distress.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-amber-200/60 space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-[#E9B82E]/20 flex items-center justify-center text-[#06294D]">
                  <Megaphone size={16} />
                </div>
                <h4 className="text-sm font-bold text-[#06294D]">Fact-Finding Missions</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Independent on-ground investigations documenting statutory violations, submitting certified reports to District Magistrates and NHRC.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-amber-200/60 space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-[#E9B82E]/20 flex items-center justify-center text-[#06294D]">
                  <Users size={16} />
                </div>
                <h4 className="text-sm font-bold text-[#06294D]">Grassroots Literacy</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Organizing legal literacy camps in rural, semi-urban, and underserved communities to educate citizens on their constitutional remedies.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(supportRoute)}
                className="px-5 py-2.5 rounded-xl bg-[#06294D] hover:bg-[#0c3966] text-white text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Report an Infringement</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/membership')}
                className="px-5 py-2.5 rounded-xl bg-[#E9B82E] hover:bg-amber-400 text-[#06294D] text-xs font-bold shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Join HRSJM Mission</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Safeguard Details Modal Popup */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-[#06294D]">
                  {renderIcon(selectedCard.icon || 'scale', 20)}
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-wider text-amber-700 uppercase">
                    LEGAL SAFEGUARD & STATUTORY RIGHT
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#06294D] leading-snug">
                    {selectedCard.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
              <p className="text-slate-600 leading-relaxed">{selectedCard.description}</p>

              {/* Statutory Basis Box */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <span className="font-bold text-[#06294D] block mb-1">
                  Statutory & Constitutional Basis
                </span>
                <p className="text-slate-700 font-medium">{selectedCard.legalBasis}</p>
              </div>

              {/* Citizen Rights & Protections Bullets */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-[#06294D] block mb-1">
                  Citizen Rights & Protections
                </span>
                {selectedCard.safeguards.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCard(null);
                    navigate(supportRoute);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#06294D] hover:bg-[#0c3966] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>File a Grievance / Complaint</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCard(null);
                    navigate('/contact');
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#06294D] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Contact Legal Cell</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

