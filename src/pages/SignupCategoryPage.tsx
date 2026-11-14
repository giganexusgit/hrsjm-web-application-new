import type React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Users,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export type AccountTypeOption = 'general' | 'member' | 'seeker';

interface AccountTypeConfig {
  id: AccountTypeOption;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  deliverables: string[];
  ctaText: string;
  targetRoute: string;
  icon: typeof User;
  iconBg: string;
  iconColor: string;
  isPopular?: boolean;
}

const ACCOUNT_TYPES: AccountTypeConfig[] = [
  {
    id: 'general',
    title: 'General User',
    badge: 'Instant Access • Free',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Explore fundamental rights, read official press releases, and submit human rights complaints.',
    deliverables: [
      'Instant self-service activation',
      'Submit human rights grievances',
      'Access legal rights handbooks & resources',
    ],
    ctaText: 'Continue to User Registration',
    targetRoute: '/register/user',
    icon: User,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#06294D]',
  },
  {
    id: 'member',
    title: 'Member',
    badge: 'Official ID & Credentials',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
    description: 'Join as an appointed cadre member, office bearer, or council representative of HRSJM with voting rights.',
    deliverables: [
      'Official Appointment Letter & Certificate',
      'Downloadable Digital & Physical Lanyard ID',
      'Voting rights in regional & national councils',
    ],
    ctaText: 'Proceed to Membership Application',
    targetRoute: '/membership/apply',
    icon: Users,
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#B45309]',
    isPopular: true,
  },
  {
    id: 'seeker',
    title: 'Donation Seeker ',
    badge: 'Requires Document Upload and Admin Approval',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Request financial, medical or educational assistance for verified distress and humanitarian causes.',
    deliverables: [
      'Emergency medical / education relief',
      'Direct verified grant disbursements',
      'Track assistance progress online',
    ],
    ctaText: 'Proceed to Assistance Form',
    targetRoute: '/assistance/apply',
    icon: HeartHandshake,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
  },
];

export const SignupCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<AccountTypeOption>('member');

  const selectedConfig = ACCOUNT_TYPES.find((c) => c.id === selectedType) || ACCOUNT_TYPES[1];

  const handleProceed = () => {
    navigate(selectedConfig.targetRoute);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-[#06294D] text-white border-b border-[#011F39] shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-15 flex items-center justify-between">
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-[#FAD465] transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Login</span>
          </Link>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white font-serif leading-none">
                HRSJM
              </span>
              <span className="text-[9px] font-bold text-[#FAD465] tracking-widest uppercase mt-0.5">
                Human Rights &amp; Social Justice Mission
              </span>
            </div>
          </Link>

          <div className="text-xs">
            <span className="text-slate-300 hidden sm:inline">Already registered? </span>
            <Link to="/login" className="text-[#FAD465] font-extrabold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <section className="bg-gradient-to-b from-[#06294D] via-[#011F39] to-[#0B2F52] text-white pt-8 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#FAD465]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl mx-auto relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-[#FAD465] tracking-widest uppercase">
            <ShieldCheck size={13} />
            <span>Step 1 of Registration</span>
            <span>•</span>
            <span>Account Category</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-white">
            Choose Your <span className="text-[#FAD465]">Account Type</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-md mx-auto leading-relaxed">
            Select the category that best describes your participation to begin the official registration.
          </p>
        </div>
      </section>

      {/* Main Container Overlapping Card */}
      <main className="flex-1 px-4 -mt-8 pb-12">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/90 p-5 sm:p-8 relative z-20">
          {/* Stepper Bar */}
          <div className="mb-6 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between relative max-w-md mx-auto">
              {/* Step 1: Active */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-[#06294D] text-[#FAD465] border-2 border-[#FAD465] flex items-center justify-center text-xs font-black shadow-xs">
                  1
                </div>
                <span className="text-[11px] font-extrabold text-[#06294D] mt-1 text-center leading-tight">
                  Account Type
                </span>
              </div>

              <div className="flex-1 h-0.5 bg-slate-200 mx-3 -mt-4" />

              {/* Step 2 */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 text-center leading-tight">
                  Personal Details
                </span>
              </div>

              <div className="flex-1 h-0.5 bg-slate-200 mx-3 -mt-4" />

              {/* Step 3 */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 text-center leading-tight">
                  Verification
                </span>
              </div>

              <div className="flex-1 h-0.5 bg-slate-200 mx-3 -mt-4" />

              {/* Step 4 */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 text-center leading-tight">
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Section Heading */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-[#06294D] font-serif">
                Select Your Official Participation Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the role you wish to register under within the Human Rights &amp; Social Justice Mission.
              </p>
            </div>
          </div>

          {/* 3 Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {ACCOUNT_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              const IconComp = type.icon;

              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`rounded-2xl border-2 p-5 text-left cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${isSelected
                    ? 'border-[#06294D] bg-[#FAF7F0] shadow-md ring-2 ring-[#06294D]/10'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                >
                  {/* Popular Banner */}
                  {type.isPopular && (
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#06294D] text-[#FAD465] text-[10px] font-black uppercase tracking-wider flex items-center shadow-sm">
                      <span>Recommended Cadre</span>
                    </div>
                  )}

                  <div>
                    {/* Top Row: Icon + Radio Indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-11 h-11 rounded-xl ${type.iconBg} ${type.iconColor} flex items-center justify-center shrink-0 border border-slate-200/60 transition-transform group-hover:scale-105`}
                      >
                        <IconComp size={22} strokeWidth={2.2} />
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                          ? 'border-[#06294D] bg-[#06294D]'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#FAD465]" />}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-[#06294D] mb-1">
                      {type.title}
                    </h3>

                    {/* Badge */}
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border mb-2.5 ${type.badgeColor}`}
                    >
                      {type.badge}
                    </span>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 min-h-[38px]">
                      {type.description}
                    </p>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2 pt-3 border-t border-slate-200/70 text-[11px] text-slate-700">
                      {type.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Selection Status Line */}
                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? 'text-[#06294D]' : 'text-slate-400'}>
                      {isSelected ? '✓ Category Selected' : 'Tap to select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button: Signature Gold Yellow */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleProceed}
              className="w-full py-3.5 px-6 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] active:scale-[0.99] text-[#06294D] font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>{selectedConfig.ctaText}</span>
              <ArrowRight size={17} strokeWidth={2.5} />
            </button>

            {/* Back to Login */}
            <div className="text-center text-xs text-slate-600 pt-1">
              <span>Already have an active account? </span>
              <Link to="/login" className="font-extrabold text-[#06294D] hover:underline">
                Sign in to your member portal
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-5 text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>© {CURRENT_YEAR} Human Rights &amp; Social Justice Mission (HRSJM). All rights reserved.</p>
      </footer>
    </div>
  );
};
