import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Filter,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Copy,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useUserAuth } from '../store/userAuthStore';
import { membershipService } from '@/features/membership/services/membershipService';
import { applicationsStore } from '@/features/admin/applications/store/applicationsStore';
import {
  DISTRICT_STATE_POSTS,
  LETTER_PAD_POSTS,
  NATIONAL_LEVEL_POSTS,
  ALL_MEMBERSHIP_POSTS,
  type MembershipPostData,
} from '../data/membershipCategoriesData';
import { MembershipPostCard } from '../components/membership/MembershipPostCard';
import { MembershipVerificationNotice } from '../components/membership/MembershipVerificationNotice';
import { MembershipStep1, type Step1FormData } from '../components/membership/MembershipStep1';
import { MembershipStep2, type Step2FormData } from '../components/membership/MembershipStep2';
import { MembershipStep3, type Step3SubmitPayload } from '../components/membership/MembershipStep3';
import { MembershipSubmitted } from '../components/membership/MembershipSubmitted';
import { GlobalPaymentModal } from '../../payments';

export const UserMembershipPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, updateMembershipStatus } = useUserAuth();

  const [membershipData, setMembershipData] = useState<any | null>(null);
  const [loadingMembership, setLoadingMembership] = useState<boolean>(true);
  const [allPosts, setAllPosts] = useState<MembershipPostData[]>(ALL_MEMBERSHIP_POSTS);

  const [submittedAppId, setSubmittedAppId] = useState<string>('');
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);

  // hasApplied is strictly based on backend membership profile or an immediate submission in this session
  const hasApplied = Boolean(
    (membershipData && (membershipData.id || membershipData.membership_number)) ||
    (justSubmitted && submittedAppId)
  );

  const initialTab =
    searchParams.get('tab') === 'status' || location.pathname.includes('status')
      ? 'status'
      : 'categories';
  const [activeTab, setActiveTab] = useState<'categories' | 'status'>(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'district_state' | 'letter_pad' | 'national'>('all');

  // Wizard state
  const [viewMode, setViewMode] = useState<'categories' | 'wizard' | 'submitted'>('categories');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPost, setSelectedPost] = useState<MembershipPostData>(ALL_MEMBERSHIP_POSTS[0] || DISTRICT_STATE_POSTS[0]);
  const [submitting, setSubmitting] = useState(false);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState<Step3SubmitPayload | null>(null);

  // Form data across steps (empty initial values so placeholders guide user)
  const [step1Data, setStep1Data] = useState<Step1FormData>({
    fullName: user?.full_name || '',
    dob: '',
    gender: 'Male',
    mobile: user?.mobile_number || '',
    email: user?.email || '',
    policeStation: '',
    password: '',
    confirmPassword: '',
    photoUrl: user?.avatar || undefined,
  });

  const [step2Data, setStep2Data] = useState<Step2FormData>({
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: user?.state || '',
    city: user?.city || '',
    pincode: '',
    aadhaarNumber: '',
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Live status derived from backend and synced stores
  const rawStatus = (
    membershipData?.status ||
    (justSubmitted ? 'UNDER_REVIEW' : 'NOT_APPLIED')
  ).toUpperCase();

  const isApproved = rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
  const isRejected = rawStatus === 'REJECTED' || rawStatus === 'CANCELLED';
  const isPending =
    !isApproved &&
    !isRejected &&
    (rawStatus === 'UNDER_REVIEW' || rawStatus === 'PENDING' || rawStatus === 'SUBMITTED');

  const currentStatus = isApproved
    ? 'APPROVED'
    : isRejected
    ? 'REJECTED'
    : isPending
    ? 'UNDER_REVIEW'
    : rawStatus;

  const adminRemarks =
    membershipData?.admin_notes ||
    membershipData?.rejection_reason ||
    membershipData?.rejectionReason ||
    membershipData?.adminNotes ||
    membershipData?.remarks ||
    membershipData?.reviewer_remarks;

  // Synchronize authenticated user's real membership record & categories
  useEffect(() => {
    let isMounted = true;

    const loadMembershipAndCategories = async () => {
      setLoadingMembership(true);
      try {
        const urlId =
          searchParams.get('id') ||
          searchParams.get('ref') ||
          searchParams.get('application_id');
        const storedAppId =
          typeof window !== 'undefined'
            ? localStorage.getItem('hrsjm_user_membership_app_id')
            : null;
        const targetId = urlId || storedAppId;

        const [mem, categories] = await Promise.all([
          membershipService.getMyMembership(),
          membershipService.getCategories(),
        ]);

        if (!isMounted) return;

        if (categories && categories.length > 0) {
          const updated: MembershipPostData[] = ALL_MEMBERSHIP_POSTS.map(p => {
            const match = (categories as any[]).find((c: any) =>
              c.name?.toLowerCase().includes(p.postName.toLowerCase()) ||
              p.postName.toLowerCase().includes(c.name?.toLowerCase()) ||
              c.id === p.id
            );
            return match ? { ...p, id: match.id, feeAmount: match.feeAmount || p.feeAmount, fee: match.fee || p.fee } : p;
          });
          setAllPosts(updated);
          setSelectedPost(updated[0]);
        }

        // Look up applications in applicationsStore to sync any Admin updates & remarks
        const allAdminApps = applicationsStore.getAllApplications();
        const cleanUserPhone = user?.mobile_number?.replace(/\D/g, '').slice(-10);
        const adminAppMatch = allAdminApps.find(
          a =>
            (targetId &&
              (a.id === targetId ||
                a.applicationId === targetId ||
                a.applicationId?.toUpperCase() === targetId.toUpperCase())) ||
            (cleanUserPhone &&
              a.phone?.replace(/\D/g, '').slice(-10) === cleanUserPhone) ||
            (user?.email && a.email?.toLowerCase() === user.email.toLowerCase()) ||
            (user?.id && a.id === user.id)
        );

        if (mem && (mem.id || mem.membership_number)) {
          // Merge admin store updates (such as recent approval/rejection or notes) if newer
          const merged = {
            ...mem,
            status: adminAppMatch?.status ? adminAppMatch.status.toUpperCase() : mem.status,
            admin_notes:
              adminAppMatch?.rejectionReason ||
              adminAppMatch?.adminNotes ||
              mem.admin_notes ||
              mem.rejection_reason,
            rejection_reason:
              adminAppMatch?.rejectionReason || mem.rejection_reason,
          };
          setMembershipData(merged);
          setSubmittedAppId(merged.membership_number || merged.id);
          if (typeof window !== 'undefined' && merged.membership_number) {
            localStorage.setItem('hrsjm_user_membership_app_id', merged.membership_number);
          }
        } else if (adminAppMatch) {
          const mappedRecord = {
            id: adminAppMatch.id,
            membership_number: adminAppMatch.applicationId || targetId || 'HRSJM-MEM-2026',
            status: adminAppMatch.status ? adminAppMatch.status.toUpperCase() : 'UNDER_REVIEW',
            applied_at: adminAppMatch.submittedAt || adminAppMatch.submittedDate,
            applicantName: adminAppMatch.applicantName,
            applied_post_name: adminAppMatch.membershipType,
            fee: adminAppMatch.amount ? `₹ ${adminAppMatch.amount}` : '₹ 800',
            admin_notes: adminAppMatch.rejectionReason,
            rejection_reason: adminAppMatch.rejectionReason,
            category: { name: adminAppMatch.membershipType },
          };
          setMembershipData(mappedRecord);
          setSubmittedAppId(mappedRecord.membership_number);
          if (typeof window !== 'undefined') {
            localStorage.setItem('hrsjm_user_membership_app_id', mappedRecord.membership_number);
          }
        } else {
          // Check locally submitted records
          const localSubmissions = membershipService.getLocalSubmissions();
          const localMatch = localSubmissions.find(
            l =>
              (targetId &&
                (l.applicationId === targetId ||
                  l.id === targetId ||
                  l.applicationId?.toUpperCase() === targetId.toUpperCase())) ||
              (cleanUserPhone &&
                l.mobileNumber?.replace(/\D/g, '').slice(-10) === cleanUserPhone) ||
              (user?.email && l.email?.toLowerCase() === user.email.toLowerCase())
          );
          if (localMatch) {
            setMembershipData({
              id: localMatch.id,
              membership_number: localMatch.applicationId,
              status: localMatch.status ? localMatch.status.toUpperCase() : 'UNDER_REVIEW',
              applied_at: localMatch.submittedAt,
              applicantName: localMatch.applicantName,
              applied_post_name: localMatch.postName,
              fee: localMatch.fee,
            });
            setSubmittedAppId(localMatch.applicationId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('hrsjm_user_membership_app_id', localMatch.applicationId);
            }
          } else {
            setMembershipData(null);
            setSubmittedAppId('');
            setJustSubmitted(false);
          }
        }
      } catch {
        if (isMounted) {
          setMembershipData(null);
          setSubmittedAppId('');
          setJustSubmitted(false);
        }
      } finally {
        if (isMounted) {
          setLoadingMembership(false);
        }
      }
    };

    void loadMembershipAndCategories();
    const unsubscribe = applicationsStore.subscribe(() => {
      void loadMembershipAndCategories();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.id, user?.mobile_number, user?.email]);

  // Handle post selection -> initiates 3-step verification wizard
  const handleSelectPostToApply = (post: MembershipPostData) => {
    setSelectedPost(post);
    setCurrentStep(1);
    setViewMode('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 1 -> Step 2
  const handleStep1Next = (data: Step1FormData) => {
    setStep1Data(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3
  const handleStep2Next = (data: Step2FormData) => {
    setStep2Data(data);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 -> Payment Modal
  const handleStep3Submit = (payload: Step3SubmitPayload) => {
    setPendingDocuments(payload);
    setIsPaymentModalOpen(true);
  };

  const filteredPosts = () => {
    if (categoryFilter === 'all') return allPosts;
    return allPosts.filter(p => p.categoryGroup === categoryFilter);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#06294D] text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B82E]/20 text-[#FAD465] text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard size={14} />
            <span>National Membership Council</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Membership Categories &amp; Verification</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Choose your official post, undergo 3-step statutory verification, and receive your verified national appointment credentials.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/20 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setViewMode('categories');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'categories' ? 'bg-[#E9B82E] text-[#011F39] shadow-xs' : 'text-slate-200 hover:text-white'
            }`}
          >
            Membership Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'status' ? 'bg-[#E9B82E] text-[#011F39] shadow-xs' : 'text-slate-200 hover:text-white'
            }`}
          >
            My Membership Status
          </button>
        </div>
      </div>

      {activeTab === 'status' ? (
        /* Status Tab */
        <div className="space-y-6">
          {loadingMembership ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center space-y-3 max-w-xl mx-auto">
              <div className="w-10 h-10 border-3 border-[#06294D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Verifying membership records with National Council...</p>
            </div>
          ) : !hasApplied ? (
            /* Empty State: User has not applied yet */
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center space-y-5 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#06294D]/5 text-[#06294D] flex items-center justify-center mx-auto">
                <CreditCard size={32} className="text-[#06294D]" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDF2F7] text-[#06294D]">
                  Application Status: Not Applied
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-['Playfair_Display',Georgia,serif] text-[#06294D]">
                  No Active Membership Application Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  You have not submitted an application for any National or State Council membership post yet. Select a designated post from our categories to begin the 3-step statutory verification.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('categories');
                    setViewMode('categories');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#C9971A] text-[#011F39] text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <span>Browse Membership Categories</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EDF2F7]">
                  <span className="text-[10px] font-bold text-[#C9971A] uppercase tracking-wider block">Official Post</span>
                  <p className="text-xs text-[#06294D] font-medium mt-0.5">District, State &amp; National Appointments</p>
                </div>
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EDF2F7]">
                  <span className="text-[10px] font-bold text-[#C9971A] uppercase tracking-wider block">Credentials</span>
                  <p className="text-xs text-[#06294D] font-medium mt-0.5">National ID Card &amp; Appointment Letter</p>
                </div>
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EDF2F7]">
                  <span className="text-[10px] font-bold text-[#C9971A] uppercase tracking-wider block">Statutory</span>
                  <p className="text-xs text-[#06294D] font-medium mt-0.5">3-Step Verified Mission Council Membership</p>
                </div>
              </div>
            </div>
          ) : (
            /* Active Application Card */
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Application Tracking Number
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-black text-[#06294D] font-mono">
                      {submittedAppId || membershipData?.membership_number || membershipData?.id || (user?.id ? `HRSJM-MEM-2026-${user.id.slice(-4).toUpperCase()}` : 'HRSJM-MEM-2026-PENDING')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const id = submittedAppId || membershipData?.membership_number || membershipData?.id;
                        if (id) {
                          navigator.clipboard.writeText(id);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Copy Reference ID"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Verification Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isRejected
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {currentStatus === 'UNDER_REVIEW'
                        ? 'Under Review'
                        : currentStatus === 'APPROVED'
                        ? 'Approved'
                        : currentStatus === 'REJECTED'
                        ? 'Rejected'
                        : currentStatus}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLoadingMembership(true);
                      setTimeout(() => setLoadingMembership(false), 400);
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-[#06294D] hover:bg-slate-50 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Refresh Status"
                  >
                    <RefreshCw size={13} className={loadingMembership ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Stepper Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle size={16} />
                    <span>1. Application Submitted</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Documents and credentials successfully received by Central Mission Desk.</p>
                </div>

                {/* Step 2 */}
                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isApproved
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isRejected
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}>
                  <div className={`flex items-center gap-2 font-bold text-xs ${
                    isApproved ? 'text-emerald-800' : isRejected ? 'text-rose-800' : 'text-amber-900'
                  }`}>
                    {isApproved ? (
                      <CheckCircle size={16} className="text-emerald-600" />
                    ) : isRejected ? (
                      <AlertCircle size={16} className="text-rose-600" />
                    ) : (
                      <Clock size={16} className="text-amber-600" />
                    )}
                    <span>2. State Council Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isApproved
                      ? 'State Chapter verification completed and verified.'
                      : isRejected
                      ? 'Scrutiny completed by verification cell — see remarks below.'
                      : 'Currently being reviewed by District Verification Officers.'}
                  </p>
                </div>

                {/* Step 3 */}
                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isApproved
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isRejected
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`flex items-center gap-2 font-bold text-xs ${isApproved ? 'text-emerald-800' : 'text-slate-400'}`}>
                    <Award size={16} />
                    <span>3. Council Approval</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isApproved
                      ? 'Official National Member credentials activated.'
                      : isRejected
                      ? 'Clearance withheld by Scrutiny Committee.'
                      : 'Credentials activate upon final state council review.'}
                  </p>
                </div>
              </div>

              {/* Application Details Particulars */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#06294D] uppercase tracking-wider pb-2 border-b border-slate-200">
                  <ShieldCheck size={16} className="text-blue-700" />
                  <span>Application Particulars</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Applicant Name</span>
                    <span className="font-bold text-slate-800">
                      {membershipData?.applicantName || membershipData?.applicant_name || membershipData?.full_name || user?.full_name || 'Applicant'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Applied Post</span>
                    <span className="font-bold text-[#059669]">
                      {membershipData?.applied_post_name || membershipData?.postName || membershipData?.category?.name || 'Council Member'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Submission Date</span>
                    <span className="font-bold text-slate-800">
                      {membershipData?.applied_at || membershipData?.submittedAt || 'Today'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Statutory Status</span>
                    <span className={`font-bold ${isApproved ? 'text-emerald-700' : isRejected ? 'text-rose-700' : 'text-amber-700'}`}>
                      {isApproved ? 'Verified & Approved' : isRejected ? 'Rejected' : 'Under Review'}
                    </span>
                  </div>
                </div>
              </div>

              {/* REJECTED STATE VIEW */}
              {isRejected && (
                <div className="p-5 sm:p-6 rounded-2xl bg-rose-50/80 border border-rose-300 text-rose-950 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-rose-700 mt-0.5">
                      <AlertCircle size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-rose-900 font-serif">
                        Application Rejected by Verification Committee
                      </h4>
                      <p className="text-xs text-rose-800 leading-relaxed">
                        The National Verification Committee has reviewed your application and was unable to approve it based on statutory criteria.
                      </p>
                    </div>
                  </div>

                  {/* Admin Remarks Box */}
                  <div className="bg-white rounded-xl p-4 border border-rose-200 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                      Admin Remarks &amp; Scrutiny Findings:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                      "{adminRemarks || 'Document verification failed statutory compliance requirements. Please review uploaded proofs and re-apply.'}"
                    </p>
                  </div>

                  {/* General User Retention Notice */}
                  <div className="bg-white/80 rounded-xl p-3.5 border border-rose-200 text-xs text-slate-700 flex items-start gap-2.5">
                    <Info size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] leading-relaxed">
                      <strong>General User Access:</strong> You retain full, uninterrupted access to your General User Portal. You can continue filing complaints, exploring public human rights resources, and participating in citizen aid programs.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Link
                      to="/user/dashboard"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={15} />
                      <span>Go to User Dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('categories');
                        setViewMode('categories');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Re-apply for Membership</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* PENDING / UNDER REVIEW STATE VIEW */}
              {isPending && (
                <div className="space-y-4">
                  {/* Admin Remarks (if present) */}
                  {adminRemarks && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <Info size={15} className="text-amber-700" />
                        <span>Admin Remarks / Notes</span>
                      </div>
                      <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-amber-200 font-medium leading-relaxed">
                        "{adminRemarks}"
                      </p>
                    </div>
                  )}

                  {/* General User Portal Guidance Banner */}
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-[#06294D] flex items-start gap-3">
                    <Info size={20} className="text-sky-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold block text-sky-950">Application Awaiting Verification Committee Decision</span>
                      <p className="text-sky-900 leading-relaxed font-normal">
                        Our National Verification Committee is reviewing your submitted credentials and documents. While your membership application is awaiting decision, you have full access to your General User Portal for filing complaints, tracking grievances, and accessing citizen services.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <Link
                      to="/user/dashboard"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={15} />
                      <span>Go to User Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* APPROVED STATE VIEW */}
              {isApproved && (
                <div className="space-y-4">
                  {/* Admin Remarks (if present) */}
                  {adminRemarks && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        <CheckCircle size={15} className="text-emerald-700" />
                        <span>Approval Remarks / Council Notes</span>
                      </div>
                      <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-emerald-200 font-medium leading-relaxed">
                        "{adminRemarks}"
                      </p>
                    </div>
                  )}

                  {/* Official Credentials Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#06294D] to-[#011F39] text-white space-y-4 max-w-lg mx-auto shadow-xl border border-amber-400/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm text-white">HRSJM NATIONAL COUNCIL</h4>
                        <span className="text-[9.5px] text-[#FAD465] font-bold uppercase tracking-wider">Official Member Credentials</span>
                      </div>
                      <Award className="text-[#FAD465]" size={24} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/20">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Member Name</span>
                        <span className="font-bold text-white">{membershipData?.applicantName || user?.full_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Member ID Code</span>
                        <span className="font-bold text-[#FAD465] font-mono">{submittedAppId || membershipData?.membership_number || 'HRSJM-MEM-ACTIVE'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Designation</span>
                        <span className="font-bold text-white">{membershipData?.applied_post_name || 'Active Member'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Status</span>
                        <span className="font-bold text-emerald-400">ACTIVE &amp; APPROVED</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to="/member/dashboard"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <span>Enter Member Portal</span>
                      <ArrowRight size={15} />
                    </Link>

                    <Link
                      to="/user/dashboard"
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={15} />
                      <span>Go to User Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : viewMode === 'wizard' ? (
        /* 3-Step Verification Wizard */
        <div className="space-y-6">
          {/* Stepper Header Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('categories')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                ← Back
              </button>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Applying For Official Post
                </span>
                <span className="text-sm font-black text-[#06294D]">
                  {selectedPost.postName} ({selectedPost.fee} • {selectedPost.validity})
                </span>
              </div>
            </div>

            {/* Stepper Indicators */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentStep === 1
                    ? 'bg-[#06294D] text-[#FAD465] border-[#06294D] shadow-xs'
                    : currentStep > 1
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Personal</span>
              </button>

              <span className="text-slate-300">→</span>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentStep === 2
                    ? 'bg-[#06294D] text-[#FAD465] border-[#06294D] shadow-xs'
                    : currentStep > 2
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Address &amp; ID</span>
              </button>

              <span className="text-slate-300">→</span>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(3);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentStep === 3
                    ? 'bg-[#06294D] text-[#FAD465] border-[#06294D] shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Fee &amp; Docs</span>
              </button>
            </div>
          </div>

          {/* Current Step Component */}
          {currentStep === 1 && (
            <MembershipStep1
              initialData={step1Data}
              onNext={handleStep1Next}
              onBack={() => setViewMode('categories')}
            />
          )}

          {currentStep === 2 && (
            <MembershipStep2
              initialData={step2Data}
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <MembershipStep3
              selectedPost={selectedPost}
              step1Data={step1Data}
              step2Data={step2Data}
              onSubmit={handleStep3Submit}
              onBack={() => setCurrentStep(2)}
              submitting={submitting}
            />
          )}
        </div>
      ) : viewMode === 'submitted' ? (
        /* Submitted Screen */
        <MembershipSubmitted
          applicationId={submittedAppId}
          selectedPost={selectedPost}
          step1Data={step1Data}
          step2Data={step2Data}
          onGoToStatus={() => {
            setActiveTab('status');
            setViewMode('categories');
          }}
          onReset={() => {
            setViewMode('categories');
            setCurrentStep(1);
          }}
        />
      ) : (
        /* Categories Listing View (APK clone) */
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1 flex items-center gap-1">
                <Filter size={12} />
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Posts ({ALL_MEMBERSHIP_POSTS.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('district_state')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  categoryFilter === 'district_state'
                    ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                District & State ({DISTRICT_STATE_POSTS.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('letter_pad')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  categoryFilter === 'letter_pad'
                    ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Letter Pad ({LETTER_PAD_POSTS.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('national')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  categoryFilter === 'national'
                    ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                National Council ({NATIONAL_LEVEL_POSTS.length})
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredPosts().length}</strong> available posts
            </span>
          </div>

          {/* District & State Posts Section */}
          {(categoryFilter === 'all' || categoryFilter === 'district_state') && (
            <div className="space-y-3">
              {/* Section Header Banner matching APK */}
              <div className="bg-[#EDF2F7] px-4 py-2 rounded-xl border border-[#DBE5EE] flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-[#06294D] tracking-wide">
                  District & State Level Posts
                </span>
                <span className="text-[11px] text-slate-500 font-bold">
                  {DISTRICT_STATE_POSTS.length} Posts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DISTRICT_STATE_POSTS.map(post => (
                  <MembershipPostCard
                    key={post.id}
                    post={post}
                    onApply={handleSelectPostToApply}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Letter Pad Posts Section */}
          {(categoryFilter === 'all' || categoryFilter === 'letter_pad') && (
            <div className="space-y-3">
              {/* Section Header Banner matching APK */}
              <div className="bg-[#EDF2F7] px-4 py-2 rounded-xl border border-[#DBE5EE] flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-[#06294D] tracking-wide">
                  Letter Pad Posts
                </span>
                <span className="text-[11px] text-slate-500 font-bold">
                  {LETTER_PAD_POSTS.length} Posts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LETTER_PAD_POSTS.map(post => (
                  <MembershipPostCard
                    key={post.id}
                    post={post}
                    onApply={handleSelectPostToApply}
                  />
                ))}
              </div>
            </div>
          )}

          {/* National Level Posts Section */}
          {(categoryFilter === 'all' || categoryFilter === 'national') && (
            <div className="space-y-3">
              {/* Section Header Banner matching APK */}
              <div className="bg-[#EDF2F7] px-4 py-2 rounded-xl border border-[#DBE5EE] flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-[#06294D] tracking-wide">
                  National Level Posts
                </span>
                <span className="text-[11px] text-slate-500 font-bold">
                  {NATIONAL_LEVEL_POSTS.length} Posts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NATIONAL_LEVEL_POSTS.map(post => (
                  <MembershipPostCard
                    key={post.id}
                    post={post}
                    onApply={handleSelectPostToApply}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Verification & Policy Notice matching APK */}
          <MembershipVerificationNotice />
        </div>
      )}

      {/* Cashfree Payment Modal — triggered after Step 3 form submit */}
      <GlobalPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSubmitting(false);
        }}
        payload={{
          purpose: 'membership',
          amount: selectedPost.feeAmount,
          title: `Membership Application: ${selectedPost.postName}`,
          subtitle: `Validity: ${selectedPost.validity}`,
          entityId: selectedPost.id,
          userId: user?.id,
          donorName: step1Data.fullName,
          donorMobile: step1Data.mobile,
          donorEmail: step1Data.email,
        }}
        onSuccess={async (receipt) => {
          setIsPaymentModalOpen(false);
          setSubmitting(false);

          let newAppId = receipt.applicationId || receipt.membershipNumber;

          try {
            const result = await membershipService.submitApplication({
              category_id: selectedPost.id,
              full_name: step1Data.fullName,
              mobile_number: step1Data.mobile,
              email: step1Data.email,
              password: step1Data.password || 'MemberPass#1',
              police_station: step1Data.policeStation,
              avatar: step1Data.photoUrl,
              personal_details: {
                dob: step1Data.dob,
                dateOfBirth: step1Data.dob,
                gender: step1Data.gender,
                addressLine1: step2Data.addressLine1,
                addressLine2: step2Data.addressLine2,
                city: step2Data.city,
                state: step2Data.state,
                country: step2Data.country,
                pincode: step2Data.pincode,
              },
              application_data: {
                appliedPostName: selectedPost.postName,
                feeAmount: selectedPost.feeAmount,
                fee: selectedPost.fee,
                validity: selectedPost.validity,
                qualification: selectedPost.qualification,
                documents: pendingDocuments
                  ? Object.entries(pendingDocuments.documents)
                      .filter(([key, val]) => Boolean(val) && !key.endsWith('Name') && key !== 'urls')
                      .map(([key, file]) => {
                        const f = file as File;
                        const fName = f?.name || (pendingDocuments.documents as any)[`${key}Name`] || `${key}.pdf`;
                        const fSize = f?.size ? `${Math.round(f.size / 1024)} KB` : '1.5 MB';
                        const fUri = pendingDocuments.documents?.urls?.[key] || (key === 'photoProof' ? step1Data.photoUrl : undefined);
                        return {
                          type: key,
                          title:
                            key === 'identityProof'
                              ? 'Identity Proof (Aadhaar / Voter ID)'
                              : key === 'addressProof'
                              ? 'Address Proof (Electricity / Rent / ID)'
                              : key === 'qualificationProof'
                              ? 'Qualification Certificate'
                              : 'Passport Photograph',
                          fileName: fName,
                          fileSize: fSize,
                          uri: fUri,
                          verified: true,
                          uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        };
                      })
                  : [],
                consents: {
                  agreeTerms: true,
                  agreePrivacy: true,
                  agreePledge: true,
                },
              },
            });

            if (result?.applicationId) {
              newAppId = result.applicationId;
            }
            setMembershipData(result);
          } catch (err) {
            console.error('Failed to submit membership application to backend:', err);
          }

          if (!newAppId) {
            const year = new Date().getFullYear();
            const seq = Math.floor(1000 + Math.random() * 9000);
            newAppId = `HRSJM-MEM-${year}-${seq}`;
          }

          // Persist uploaded documents under application ID and user ID
          if (pendingDocuments) {
            const formattedDocs = Object.entries(pendingDocuments.documents)
              .filter(([key, val]) => Boolean(val) && !key.endsWith('Name') && key !== 'urls')
              .map(([key, file], idx) => {
                const f = file as File;
                const fName = f?.name || (pendingDocuments.documents as any)[`${key}Name`] || `${key}.pdf`;
                const fSize = f?.size ? `${Math.round(f.size / 1024)} KB` : '1.5 MB';
                const fUri = pendingDocuments.documents?.urls?.[key] || (key === 'photoProof' ? step1Data.photoUrl : undefined);
                return {
                  id: `doc-${newAppId}-${idx + 1}`,
                  type: key,
                  title:
                    key === 'identityProof'
                      ? 'Identity Proof (Aadhaar / Voter ID)'
                      : key === 'addressProof'
                      ? 'Address Proof (Electricity / Rent / ID)'
                      : key === 'qualificationProof'
                      ? 'Qualification Certificate'
                      : 'Passport Photograph',
                  fileName: fName,
                  fileSize: fSize,
                  uri: fUri,
                  verified: true,
                  uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                };
              });

            if (formattedDocs.length > 0) {
              localStorage.setItem(`hrsjm_app_docs_${newAppId}`, JSON.stringify(formattedDocs));
              if (user?.id) {
                localStorage.setItem(`hrsjm_user_docs_${user.id}`, JSON.stringify(formattedDocs));
              }
            }
          }

          localStorage.setItem('hrsjm_user_membership_app_id', newAppId);
          if (updateMembershipStatus) {
            updateMembershipStatus('PENDING');
          }

          setSubmittedAppId(newAppId);
          setJustSubmitted(true);
          setPendingDocuments(null);
          setViewMode('submitted');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
