import type React from 'react';
import { useState, useEffect, useCallback, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  HeartHandshake,
  UploadCloud,
  FileText,
  FileCheck,
  Trash2,
  Copy,
  ShieldCheck,
  Search,
  X,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { authStore } from '../features/auth/store/authStore';
import { authService } from '../features/auth/services/authService';
import { userAuthStore } from '../features/user/store/userAuthStore';
import { seekerService } from '../features/seeker/services/seekerService';
import {
  SEEKER_DOCUMENT_OPTIONS,
  CAUSE_OPTIONS,
  PRESET_AMOUNTS,
  URGENCY_LEVELS,
} from '../features/seeker/data/seekerConstants';
import {
  validateAgeEligibility,
} from '../utils/age';
import { CalendarDatePicker } from '../components/common/CalendarDatePicker';
import type {
  SeekerPersonalDetails,
  AssistanceNeedDetails,
  UploadedDocFile,
  SeekerApplicationRecord,
  DocumentTypeOption,
  SeekerValidationErrors,
} from '../features/seeker/types/seekerRegistration.types';

const CURRENT_YEAR = new Date().getFullYear();
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const SeekerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  // Multi-step phase: 1 (Personal Details), 2 (Identity Verification), 3 (Assistance Need), 4 (Complete), -1 (Ineligible)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // --- Step 1: Personal Details ---
  const [personal, setPersonal] = useState<SeekerPersonalDetails>({
    fullName: '',
    phone: '',
    countryCode: '+91',
    email: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [ineligibleAge, setIneligibleAge] = useState<number | null>(null);

  // --- Step 2: Identity Verification ---
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeOption>('aadhaar');
  const [otherDocName, setOtherDocName] = useState('');
  const [identityFiles, setIdentityFiles] = useState<UploadedDocFile[]>([]);
  const identityInputId = useId();

  // --- Step 3: Assistance Need Details ---
  const [need, setNeed] = useState<AssistanceNeedDetails>({
    cause: 'Medical Emergency',
    otherCauseDetails: '',
    requestedAmount: 25000,
    urgency: 'HIGH',
    description: '',
    additionalDocuments: [],
    termsAccepted: true,
    privacyAccepted: true,
    pledgeAccepted: true,
  });
  const [customAmountStr, setCustomAmountStr] = useState('25000');
  const additionalInputId = useId();

  // --- File Preview Modal ---
  const [previewFile, setPreviewFile] = useState<UploadedDocFile | null>(null);

  // --- Submission & Complete State ---
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<SeekerValidationErrors>({});
  const [submittedRecord, setSubmittedRecord] = useState<SeekerApplicationRecord | null>(null);
  const [copiedAppNo, setCopiedAppNo] = useState(false);

  // --- Status Tracking Drawer / Modal ---
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedRecord, setTrackedRecord] = useState<SeekerApplicationRecord | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Debounced Phone duplicate check
  const checkPhoneDuplicate = useCallback(async (phoneVal: string) => {
    const cleanPhone = phoneVal.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) return;
    setCheckingPhone(true);
    try {
      const res = await seekerService.checkDuplicate({ mobile_number: cleanPhone });
      if (res.mobile_taken) {
        setErrors((prev) => ({
          ...prev,
          phone: res.mobile_message || 'Mobile number is already registered.',
        }));
        setVerifiedPhone(null);
      } else {
        setVerifiedPhone(cleanPhone);
        setErrors((prev) => {
          if (prev.phone?.toLowerCase().includes('already registered')) {
            const copy = { ...prev };
            delete copy.phone;
            return copy;
          }
          return prev;
        });
      }
    } catch {
      // ignore
    } finally {
      setCheckingPhone(false);
    }
  }, []);

  // Debounced Email duplicate check
  const checkEmailDuplicate = useCallback(async (emailVal: string) => {
    const cleanEmail = emailVal.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return;
    setCheckingEmail(true);
    try {
      const res = await seekerService.checkDuplicate({ email: cleanEmail });
      if (res.email_taken) {
        setErrors((prev) => ({
          ...prev,
          email: res.email_message || 'Email is already registered.',
        }));
        setVerifiedEmail(null);
      } else {
        setVerifiedEmail(cleanEmail);
        setErrors((prev) => {
          if (prev.email?.toLowerCase().includes('already registered')) {
            const copy = { ...prev };
            delete copy.email;
            return copy;
          }
          return prev;
        });
      }
    } catch {
      // ignore
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Handle Step 1 Inputs
  const handlePersonalChange = (
    field: keyof SeekerPersonalDetails,
    val: string
  ) => {
    setPersonal((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (field === 'phone') {
      const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
      if (digitsOnly.length === 10) {
        checkPhoneDuplicate(digitsOnly);
      } else {
        setVerifiedPhone(null);
      }
    }

    if (field === 'email') {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
        checkEmailDuplicate(val.trim());
      } else {
        setVerifiedEmail(null);
      }
    }

    if (field === 'dob' && val) {
      const validation = validateAgeEligibility(val, 18);
      if (!validation.isEligible) {
        setIneligibleAge(validation.age);
        setCurrentStep(-1);
      }
    }
  };

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errs: SeekerValidationErrors = {};
    if (!personal.fullName.trim() || personal.fullName.trim().length < 2) {
      errs.fullName = 'Full Name is required (minimum 2 characters).';
    }
    const cleanPhone = personal.phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Valid 10-digit Indian mobile number is required.';
    }
    if (personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!personal.dob) {
      errs.dob = 'Date of birth is required.';
    } else {
      const ageCheck = validateAgeEligibility(personal.dob, 18);
      if (!ageCheck.isEligible) {
        setIneligibleAge(ageCheck.age);
        setCurrentStep(-1);
        return false;
      }
    }
    if (!personal.gender) {
      errs.gender = 'Please select your gender.';
    }
    if (!personal.password || personal.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (personal.password !== personal.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle File Uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'identity' | 'additional'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: UploadedDocFile[] = [];
    let fileError = '';

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > MAX_FILE_SIZE_BYTES) {
        fileError = `File "${f.name}" exceeds the 5MB limit.`;
        continue;
      }

      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'pdf'].includes(ext || '')) {
        fileError = `File "${f.name}" has unsupported format. Use JPG, PNG or PDF.`;
        continue;
      }

      const formatted =
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`;

      const previewUrl = f.type.startsWith('image/')
        ? URL.createObjectURL(f)
        : undefined;

      const docTitle =
        target === 'identity'
          ? selectedDocType === 'other'
            ? otherDocName.trim() || 'Other Document'
            : SEEKER_DOCUMENT_OPTIONS.find((d) => d.id === selectedDocType)?.title ||
              'Identity Proof'
          : `Supporting Document - ${f.name}`;

      newDocs.push({
        id: `file-${Date.now()}-${i}`,
        name: f.name,
        sizeBytes: f.size,
        type: f.type,
        formattedSize: formatted,
        previewUrl,
        docTitle,
        file: f,
        uploadDate: 'Today',
      });
    }

    if (fileError) {
      setErrors((prev) => ({ ...prev, docFile: fileError }));
    } else {
      setErrors((prev) => ({ ...prev, docFile: undefined }));
    }

    if (newDocs.length > 0) {
      if (target === 'identity') {
        setIdentityFiles((prev) => [...prev, ...newDocs]);
      } else {
        setNeed((prev) => ({
          ...prev,
          additionalDocuments: [...prev.additionalDocuments, ...newDocs],
        }));
      }
    }

    // Reset input
    e.target.value = '';
  };

  // Remove File
  const handleRemoveFile = (id: string, target: 'identity' | 'additional') => {
    if (target === 'identity') {
      setIdentityFiles((prev) => prev.filter((d) => d.id !== id));
    } else {
      setNeed((prev) => ({
        ...prev,
        additionalDocuments: prev.additionalDocuments.filter((d) => d.id !== id),
      }));
    }
  };

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const errs: SeekerValidationErrors = {};
    if (selectedDocType === 'other' && !otherDocName.trim()) {
      errs.otherDocName = 'Please specify the name of this document.';
    }
    if (identityFiles.length === 0) {
      errs.docFile = 'Please upload at least one valid identity verification file.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validate Step 3
  const validateStep3 = (): boolean => {
    const errs: SeekerValidationErrors = {};
    if (!need.cause) {
      errs.cause = 'Please select the cause for assistance.';
    }
    if (!need.requestedAmount || need.requestedAmount <= 0) {
      errs.requestedAmount = 'Please enter a valid requested assistance amount.';
    }
    if (!need.description.trim() || need.description.trim().length < 15) {
      errs.description = 'Please describe your requirement in detail (minimum 15 characters).';
    }
    if (!need.termsAccepted) {
      errs.terms = 'You must accept the Terms & Conditions.';
    }
    if (!need.privacyAccepted) {
      errs.privacy = 'You must accept the Privacy Policy.';
    }
    if (!need.pledgeAccepted) {
      errs.pledge = 'You must confirm the truthfulness of this declaration.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Final Submission
  const handleSubmitApplication = async () => {
    if (!validateStep3()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const selectedTitle =
        selectedDocType === 'other'
          ? otherDocName.trim() || 'Other Document'
          : SEEKER_DOCUMENT_OPTIONS.find((d) => d.id === selectedDocType)?.title ||
            'Identity Proof';

      const result = await seekerService.submitApplication({
        personal,
        selectedDocType,
        selectedDocTitle: selectedTitle,
        identityFiles,
        need,
      });

      setSubmittedRecord(result);

      // Persist documents to localStorage linked to application ID & reference number
      if (typeof window !== 'undefined' && window.localStorage && result) {
        try {
          const allDocs = [...(result.identityDocuments || identityFiles || []), ...(result.additionalDocuments || need.additionalDocuments || [])];
          const mappedDocs = allDocs.map((doc: any, idx: number) => ({
            id: doc.id || `doc-seeker-${idx + 1}`,
            title: doc.docTitle || doc.title || 'Assistance Verification Document',
            fileName: doc.name || doc.fileName || 'document.pdf',
            fileSize: doc.formattedSize || doc.size || '1.2 MB',
            uploadDate: 'Today',
            verified: true,
            uri: doc.previewUrl || doc.fileUri || doc.uri,
          }));

          if (result.id) {
            localStorage.setItem(`hrsjm_app_docs_${result.id}`, JSON.stringify(mappedDocs));
          }
          if (result.applicationNumber) {
            localStorage.setItem(`hrsjm_app_docs_${result.applicationNumber}`, JSON.stringify(mappedDocs));
          }
        } catch {}
      }

      // Ensure application ID is stored for tracking retrieval across the portal
      if (typeof window !== 'undefined' && result?.applicationNumber) {
        try {
          localStorage.setItem('hrsjm_seeker_app_id', result.applicationNumber);
        } catch {}
      }

      // Ensure valid authenticated session so applicant can use User Dashboard
      try {
        if (!authStore.getSnapshot().isAuthenticated) {
          const cleanMobile = personal.phone.replace(/\D/g, '').slice(-10);
          const cleanEmail = personal.email?.trim().toLowerCase();
          try {
            const session = await authService.login({
              identifier: cleanMobile,
              password: personal.password || 'Hrsjm@2026',
            });
            if (session?.user) {
              authStore.setUserDirectly(session.user, session.access_token, session.refresh_token);
              userAuthStore.setUser(session.user as any);
            }
          } catch {
            const applicantUser: any = {
              id: result.id || `seeker-${Date.now()}`,
              full_name: personal.fullName.trim(),
              mobile_number: cleanMobile,
              email: cleanEmail,
              roles: ['USER'],
              account_type: 'user',
              assistance_status: 'UNDER_REVIEW',
            };
            authStore.setUserDirectly(applicantUser, `hrsjm_seeker_token_${Date.now()}`);
            userAuthStore.setUser(applicantUser);
          }
        }
      } catch (authErr) {
        console.warn('Seeker post-registration session warning:', authErr);
      }

      setCurrentStep(4);
    } catch (err: any) {
      setErrors({
        description: err?.message || 'Failed to submit application. Please check details and retry.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Copy Application Number
  const handleCopyAppNo = () => {
    if (submittedRecord?.applicationNumber) {
      navigator.clipboard.writeText(submittedRecord.applicationNumber);
      setCopiedAppNo(true);
      setTimeout(() => setCopiedAppNo(false), 2000);
    }
  };

  // Handle Live Application Tracking
  const handleTrackQuery = async () => {
    if (!trackingQuery.trim()) return;
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedRecord(null);
    try {
      const res = await seekerService.trackApplication(trackingQuery.trim());
      if (res) {
        setTrackedRecord(res);
      } else {
        setTrackingError('No application found for this reference or mobile number.');
      }
    } catch {
      setTrackingError('Unable to query application status. Please check your network.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] font-sans antialiased text-slate-800 flex flex-col">
      {/* Top Brand Navbar */}
      <header className="bg-[#011F39] text-white border-b border-navy-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-white block leading-tight">
                HRSJM
              </span>
              <span className="text-[10px] tracking-widest text-[#FAD465] uppercase font-semibold block">
                Human Rights & Social Justice Mission
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTrackingModalOpen(true);
                setTrackedRecord(null);
                setTrackingError(null);
                const last = seekerService.getLastApplicationNumber();
                if (last) setTrackingQuery(last);
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-600 hover:border-[#FAD465] text-xs font-semibold text-slate-200 hover:text-[#FAD465] transition cursor-pointer"
            >
              <Search size={14} />
              <span>Track Application</span>
            </button>
            <Link
              to="/login?role=seeker"
              className="px-4 py-2 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Seeker Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Step Progress Stepper (Visible for Steps 1-3) */}
        {currentStep > 0 && currentStep < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-xl mx-auto relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#011F39] -translate-y-1/2 transition-all duration-300 z-0"
                style={{
                  width: `${((currentStep - 1) / 2) * 100}%`,
                }}
              />

              {[
                { step: 1, label: 'Personal Details' },
                { step: 2, label: 'Identity Verification' },
                { step: 3, label: 'Assistance Need' },
              ].map((item) => {
                const isPassed = currentStep > item.step;
                const isCurrent = currentStep === item.step;
                return (
                  <div
                    key={item.step}
                    className="relative z-10 flex flex-col items-center group cursor-pointer"
                    onClick={() => {
                      if (item.step < currentStep) setCurrentStep(item.step);
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isPassed
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isCurrent
                          ? 'bg-[#011F39] text-[#FAD465] ring-4 ring-[#FAD465]/30'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check size={18} strokeWidth={3} /> : item.step}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                        isCurrent
                          ? 'text-[#011F39]'
                          : isPassed
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PHASE -1: INELIGIBLE AGE SCREEN                               */}
        {/* ------------------------------------------------------------- */}
        {currentStep === -1 && (
          <div className="bg-white rounded-3xl border border-red-200 shadow-xl p-8 sm:p-12 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-6">
              <AlertCircle size={44} strokeWidth={2.2} />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider inline-block mb-3">
              18+ Age Restriction
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#011F39] mb-3">
              Application Age Requirement
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              In accordance with legal statutes and HRSJM constitution, primary applicants
              for direct financial aid must be at least 18 years of age.
              {ineligibleAge !== null && (
                <span className="block mt-2 font-semibold text-slate-800">
                  Calculated age based on entered Date of Birth: {ineligibleAge} years.
                </span>
              )}
            </p>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-left text-xs text-amber-900 mb-6 flex gap-3">
              <Info size={18} className="shrink-0 text-amber-700 mt-0.5" />
              <span>
                If assistance is required for a minor child (such as pediatric treatment or child schooling), a parent or legal guardian must submit the application as the primary applicant.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2.5 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-white text-xs font-bold transition cursor-pointer"
              >
                Modify Date of Birth
              </button>
              <Link
                to="/"
                className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition text-center"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: PERSONAL DETAILS & ACCOUNT PROVISIONING               */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#011F39] text-white p-6 sm:p-8 border-b border-navy-800">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FAD465]/20 text-[#FAD465] border border-[#FAD465]/30">
                  Step 1 of 3
                </span>
                <span className="text-xs text-slate-300">Donation Seeker Enrollment</span>
              </div>
              <h1 style={{ color: '#FFFFFF' }} className="font-serif text-2xl sm:text-3xl font-bold !text-white mb-2">
                Personal Information
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Please provide applicant personal information. An official seeker account will be created so you can securely track the progress of your humanitarian assistance request.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (validateStep1()) setCurrentStep(2);
              }}
              className="p-6 sm:p-8 space-y-6"
            >
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name of Applicant <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter applicant's legal full name (as in Aadhaar/Govt ID)"
                    value={personal.fullName}
                    onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? 'border-red-400 ring-red-100 bg-red-50/30'
                        : 'border-slate-200 focus:border-[#011F39] focus:ring-[#011F39]/10'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Mobile Number & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={personal.phone}
                      onChange={(e) => handlePersonalChange('phone', e.target.value)}
                      className={`w-full px-3 py-3 rounded-r-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-red-400 ring-red-100 bg-red-50/30'
                          : verifiedPhone
                          ? 'border-emerald-400 ring-emerald-100'
                          : 'border-slate-200 focus:border-[#011F39] focus:ring-[#011F39]/10'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {checkingPhone ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : verifiedPhone ? (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      ) : (
                        <Phone size={16} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                  {errors.phone ? (
                    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.phone}
                    </p>
                  ) : verifiedPhone ? (
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                      Mobile number verified available.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      placeholder="e.g. applicant@email.com"
                      value={personal.email}
                      onChange={(e) => handlePersonalChange('email', e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-400 ring-red-100 bg-red-50/30'
                          : 'border-slate-200 focus:border-[#011F39] focus:ring-[#011F39]/10'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {checkingEmail ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : verifiedEmail ? (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      ) : null}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* DOB with interactive Calendar format */}
                <CalendarDatePicker
                  label="Date of Birth"
                  required
                  minAge={18}
                  value={personal.dob}
                  error={errors.dob}
                  placeholder="dd-mm-yyyy"
                  onChange={(val) => handlePersonalChange('dob', val)}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handlePersonalChange('gender', g)}
                        className={`py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          personal.gender === g
                            ? 'bg-[#011F39] text-[#FAD465] border-[#011F39] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 characters"
                      value={personal.password}
                      onChange={(e) => handlePersonalChange('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                        errors.password
                          ? 'border-red-400 ring-red-100 bg-red-50/30'
                          : 'border-slate-200 focus:border-[#011F39] focus:ring-[#011F39]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={personal.confirmPassword}
                      onChange={(e) => handlePersonalChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? 'border-red-400 ring-red-100 bg-red-50/30'
                          : 'border-slate-200 focus:border-[#011F39] focus:ring-[#011F39]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Navigation */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#011F39] transition"
                >
                  <ArrowLeft size={14} />
                  <span>Change Account Type</span>
                </Link>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to KYC Documents</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: IDENTITY VERIFICATION & DOCUMENT UPLOADS              */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#011F39] text-white p-6 sm:p-8 border-b border-navy-800">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FAD465]/20 text-[#FAD465] border border-[#FAD465]/30">
                  Step 2 of 3
                </span>
                <span className="text-xs text-slate-300">Identity Verification</span>
              </div>
              <h1 style={{ color: '#FFFFFF' }} className="font-serif text-2xl sm:text-3xl font-bold !text-white mb-2">
                Identity & KYC Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                To guarantee fund transparency, anti-fraud standards, and donor trust, please select and upload a clear copy of applicant government identity proof.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Document Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Select Document to Upload <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SEEKER_DOCUMENT_OPTIONS.map((doc) => {
                    const isSelected = selectedDocType === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocType(doc.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#011F39] bg-[#011F39]/5 ring-2 ring-[#011F39]/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#011F39]">
                              {doc.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {doc.shortCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {doc.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {doc.acceptedFormats}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#011F39] border-[#011F39] text-[#FAD465]'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Other Document Name Input */}
              {selectedDocType === 'other' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                    Document Name / Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BPL Ration Card, Government Disability Certificate, or Job Card"
                    value={otherDocName}
                    onChange={(e) => {
                      setOtherDocName(e.target.value);
                      setErrors((prev) => ({ ...prev, otherDocName: undefined }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 ${
                      errors.otherDocName
                        ? 'border-red-400 ring-red-100'
                        : 'border-amber-300 focus:border-[#011F39] focus:ring-[#011F39]/10'
                    }`}
                  />
                  {errors.otherDocName && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.otherDocName}
                    </p>
                  )}
                </div>
              )}

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Upload Identity Document File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#011F39] rounded-2xl p-6 text-center transition bg-slate-50/50 hover:bg-slate-50">
                  <input
                    id={identityInputId}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'identity')}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-[#011F39]/5 text-[#011F39] flex items-center justify-center mx-auto mb-3">
                    <UploadCloud size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-[#011F39] mb-1">
                    Click to browse or drag and drop your document
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Supports JPG, PNG or PDF files up to 5MB
                  </p>
                  <label
                    htmlFor={identityInputId}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <FileText size={14} />
                    <span>Choose File from Device</span>
                  </label>
                </div>
                {errors.docFile && (
                  <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.docFile}
                  </p>
                )}
              </div>

              {/* Uploaded Documents List */}
              {identityFiles.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Attached Documents ({identityFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {identityFiles.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileCheck size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#011F39] truncate">
                              {doc.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {doc.docTitle} • {doc.formattedSize}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc.previewUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewFile(doc)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              Preview
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(doc.id!, 'identity')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Personal Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setCurrentStep(3);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to Assistance Need</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: ASSISTANCE NEED DETAILS & SUBMISSION                  */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#011F39] text-white p-6 sm:p-8 border-b border-navy-800">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FAD465]/20 text-[#FAD465] border border-[#FAD465]/30">
                  Step 3 of 3
                </span>
                <span className="text-xs text-slate-300">Cause & Assistance Details</span>
              </div>
              <h1 style={{ color: '#FFFFFF' }} className="font-serif text-2xl sm:text-3xl font-bold !text-white mb-2">
                Humanitarian Aid Need & Consents
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Specify the cause for aid, requested financial relief amount, urgency level, and attach any hospital bills, fee slips, or damage records.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Cause Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Aid Cause / Purpose <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {CAUSE_OPTIONS.map((c) => {
                    const isSelected = need.cause === c.key;
                    return (
                      <div
                        key={c.key}
                        onClick={() => {
                          setNeed((prev) => ({ ...prev, cause: c.key }));
                          setErrors((prev) => ({ ...prev, cause: undefined }));
                        }}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                          isSelected
                            ? 'border-[#011F39] bg-[#011F39]/5 ring-2 ring-[#011F39]/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-[#011F39]">
                            {c.key}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 size={15} className="text-[#011F39]" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {c.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {errors.cause && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.cause}
                  </p>
                )}
              </div>

              {/* Other Cause Specification */}
              {need.cause === 'Other' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                    Specify Cause Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Briefly state the specific emergency aid requirement"
                    value={need.otherCauseDetails}
                    onChange={(e) =>
                      setNeed((prev) => ({
                        ...prev,
                        otherCauseDetails: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#011F39]/10"
                  />
                </div>
              )}

              {/* Requested Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Requested Assistance Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = need.requestedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setNeed((prev) => ({ ...prev, requestedAmount: amt }));
                          setCustomAmountStr(String(amt));
                          setErrors((prev) => ({
                            ...prev,
                            requestedAmount: undefined,
                          }));
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#011F39] text-[#FAD465] border-[#011F39]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    );
                  })}
                </div>
                <div className="relative max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    placeholder="Or enter custom amount in Rupees"
                    value={customAmountStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomAmountStr(val);
                      setNeed((prev) => ({
                        ...prev,
                        requestedAmount: Number(val) || 0,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        requestedAmount: undefined,
                      }));
                    }}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 ${
                      errors.requestedAmount
                        ? 'border-red-400 ring-red-100'
                        : 'border-slate-200 focus:border-[#011F39] focus:ring-[#011F39]/10'
                    }`}
                  />
                </div>
                {errors.requestedAmount && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.requestedAmount}
                  </p>
                )}
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {URGENCY_LEVELS.map((u) => {
                    const isSelected = need.urgency === u.key;
                    return (
                      <div
                        key={u.key}
                        onClick={() => setNeed((prev) => ({ ...prev, urgency: u.key }))}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                          isSelected
                            ? `border-2 ${u.borderActive} ${u.badgeBg}`
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${u.badgeText}`}>
                            {u.label}
                          </span>
                          {isSelected && <Check size={14} className={u.badgeText} />}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {u.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Need Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Detailed Case Statement / Requirement Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your situation, who is impacted, reason for financial assistance, and how the funds will be utilized..."
                  value={need.description}
                  onChange={(e) => {
                    setNeed((prev) => ({ ...prev, description: e.target.value }));
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                    errors.description
                      ? 'border-red-400 ring-red-100 bg-red-50/30'
                      : 'border-slate-200 focus:border-[#011F39] focus:ring-[#011F39]/10'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Supporting Document Proofs (Hospital bill, Fee receipt, Damage photo) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Supporting Proofs / Bills <span className="text-slate-400 font-normal lowercase">(hospital estimates, tuition bills, ration card - optional)</span>
                </label>
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#011F39]">
                        Attach Medical / Tuition / Expense Proofs
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Supports PDF, JPG, PNG up to 5MB each.
                      </p>
                    </div>
                  </div>

                  <input
                    id={additionalInputId}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'additional')}
                    className="hidden"
                  />
                  <label
                    htmlFor={additionalInputId}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:border-[#011F39] bg-white text-xs font-bold text-[#011F39] transition cursor-pointer shrink-0"
                  >
                    + Add Supporting File
                  </label>
                </div>

                {need.additionalDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {need.additionalDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCheck size={16} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 truncate">
                            {doc.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({doc.formattedSize})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(doc.id!, 'additional')}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Declarations & Legal Consents */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-[#011F39] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#011F39]" />
                  <span>Applicant Declarations & Consent</span>
                </h4>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={need.termsAccepted}
                    onChange={(e) =>
                      setNeed((prev) => ({
                        ...prev,
                        termsAccepted: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-4 h-4 rounded text-[#011F39] focus:ring-[#011F39]"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I agree to the <span className="font-semibold text-[#011F39]">Terms & Conditions</span> governing human rights assistance and grant allocations.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[11px] text-red-600 font-medium pl-7">
                    {errors.terms}
                  </p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={need.privacyAccepted}
                    onChange={(e) =>
                      setNeed((prev) => ({
                        ...prev,
                        privacyAccepted: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-4 h-4 rounded text-[#011F39] focus:ring-[#011F39]"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I consent to the verification of my documents and contact information pursuant to the <span className="font-semibold text-[#011F39]">HRSJM Privacy Policy</span>.
                  </span>
                </label>
                {errors.privacy && (
                  <p className="text-[11px] text-red-600 font-medium pl-7">
                    {errors.privacy}
                  </p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={need.pledgeAccepted}
                    onChange={(e) =>
                      setNeed((prev) => ({
                        ...prev,
                        pledgeAccepted: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-4 h-4 rounded text-[#011F39] focus:ring-[#011F39]"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    <strong>Solemn Truth Pledge:</strong> I solemnly affirm that the statements made and documents uploaded are true to the best of my knowledge, and understand any misrepresentation will result in immediate disqualification.
                  </span>
                </label>
                {errors.pledge && (
                  <p className="text-[11px] text-red-600 font-medium pl-7">
                    {errors.pledge}
                  </p>
                )}
              </div>

              {/* Step 3 Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to KYC Documents</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitApplication}
                  className="px-7 py-3.5 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-xs font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#011F39]" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake size={18} />
                      <span>Submit Assistance Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: APPLICATION SUBMITTED & VERIFICATION CONFIRMATION    */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 4 && submittedRecord && (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-800 to-[#011F39] text-white p-8 text-center relative">
              <div className="w-20 h-20 rounded-full bg-white text-emerald-600 mx-auto flex items-center justify-center shadow-lg mb-4 ring-8 ring-emerald-400/20">
                <CheckCircle2 size={44} strokeWidth={2.5} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 uppercase tracking-wider inline-block mb-2">
                Verification & Application Submitted
              </span>
              <h1 style={{ color: '#FFFFFF' }} className="font-serif text-2xl sm:text-3xl font-bold !text-white mb-2">
                Application Successfully Received!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
                Your humanitarian assistance application and verification documents have been logged into the HRSJM Secretariat registry.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Reference ID Card */}
              <div className="p-5 rounded-2xl bg-[#011F39] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAD465]">
                    Official Application Reference Number
                  </span>
                  <div className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider mt-0.5">
                    {submittedRecord.applicationNumber}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAppNo}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition flex items-center gap-2 cursor-pointer"
                >
                  {copiedAppNo ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-300">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Reference ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Summary Details */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                <h4 className="font-bold text-[#011F39] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Application Summary
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Applicant:</span>
                    <p className="font-bold text-slate-800">{submittedRecord.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact:</span>
                    <p className="font-bold text-slate-800">{submittedRecord.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Cause:</span>
                    <p className="font-bold text-slate-800">{submittedRecord.cause}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Requested Amount:</span>
                    <p className="font-bold text-emerald-700 text-sm">
                      ₹{submittedRecord.requestedAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Identity Document:</span>
                    <p className="font-bold text-slate-800">{submittedRecord.selectedDocTitle}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Current Status:</span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      Under Review
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Timeline */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h4 className="font-bold text-[#011F39] uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                  <Clock size={15} />
                  <span>Review & Disbursement Process</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Application Submitted</p>
                      <p className="text-slate-500 text-[11px]">Identity documents and need request uploaded.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Document Verification (24-48 Hours)</p>
                      <p className="text-slate-500 text-[11px]">HRSJM Verification Cell verifies ID and case merit.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-slate-600">Fund Sanction & Direct Transfer</p>
                      <p className="text-slate-400 text-[11px]">Approved aid is transferred directly via verified bank mandate.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrackingQuery(submittedRecord.applicationNumber);
                    setTrackedRecord(submittedRecord);
                    setTrackingModalOpen(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Search size={15} />
                  <span>Go to My Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/user/dashboard')}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] border border-[#06294D] text-xs font-bold transition flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <LayoutDashboard size={15} />
                  <span>Go to User Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* FILE PREVIEW MODAL                                            */}
      {/* ------------------------------------------------------------- */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 bg-[#011F39] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText size={18} className="text-[#FAD465]" />
                <span className="text-sm font-bold truncate">
                  {previewFile.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-slate-100 min-h-[300px]">
              {previewFile.previewUrl ? (
                <img
                  src={previewFile.previewUrl}
                  alt={previewFile.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-sm font-bold text-slate-700">
                    PDF Document Attached
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {previewFile.name} ({previewFile.formattedSize})
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* APPLICATION STATUS TRACKING MODAL                             */}
      {/* ------------------------------------------------------------- */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 px-6 bg-[#011F39] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HeartHandshake size={20} className="text-[#FAD465]" />
                <h3 style={{ color: '#FFFFFF' }} className="text-base font-bold !text-white">
                  Track Assistance Application
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-auto flex-1 space-y-5">
              {/* Query Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter Application Number or Mobile Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. HRSJM-SEK-XXXXXX or 9876543210"
                    value={trackingQuery}
                    onChange={(e) => setTrackingQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTrackQuery();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#011F39]/20"
                  />
                  <button
                    type="button"
                    disabled={trackingLoading}
                    onClick={handleTrackQuery}
                    className="px-5 py-2.5 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {trackingLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                    <span>Search</span>
                  </button>
                </div>
                {trackingError && (
                  <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> {trackingError}
                  </p>
                )}
              </div>

              {/* Tracked Result */}
              {trackedRecord && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        APPLICATION REF
                      </span>
                      <p className="font-mono text-base font-bold text-[#011F39]">
                        {trackedRecord.applicationNumber}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        trackedRecord.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : trackedRecord.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {trackedRecord.status === 'approved'
                        ? 'Approved'
                        : trackedRecord.status === 'rejected'
                        ? 'Rejected'
                        : 'Under Review'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500">Applicant:</span>
                      <p className="font-bold text-slate-800">{trackedRecord.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cause:</span>
                      <p className="font-bold text-slate-800">{trackedRecord.cause}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Requested Amount:</span>
                      <p className="font-bold text-slate-800">
                        ₹{trackedRecord.requestedAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Submitted Date:</span>
                      <p className="font-bold text-slate-800">{trackedRecord.submittedAt}</p>
                    </div>
                  </div>

                  {/* Admin Remarks (if present) */}
                  {trackedRecord.adminRemark && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 block">
                        Admin Remarks &amp; Scrutiny Notes:
                      </span>
                      <p className="text-slate-800 font-medium">"{trackedRecord.adminRemark}"</p>
                    </div>
                  )}

                  {/* Rejection Notice (if rejected) */}
                  {trackedRecord.status === 'rejected' && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-rose-800 block">
                        Application Status Notice:
                      </span>
                      <p className="text-slate-700">
                        This assistance request was not approved based on verification criteria. You retain full access to your General User Portal.
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Verification Timeline
                    </span>
                    {trackedRecord.timeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold ${
                            step.completed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {step.completed ? '✓' : idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{step.title}</p>
                          <p className="text-slate-500 text-[11px]">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setTrackingModalOpen(false);
                  navigate('/user/dashboard');
                }}
                className="px-4 py-2 rounded-xl bg-[#011F39] text-[#FAD465] text-xs font-bold hover:bg-[#06294D] transition flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span>Go to User Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {CURRENT_YEAR} Human Rights Sanrakshan Sansthan (HRSJM). All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link to="/" className="hover:text-[#011F39]">Home</Link>
            <Link to="/membership/apply" className="hover:text-[#011F39]">Become a Member</Link>
            <Link to="/login" className="hover:text-[#011F39]">Portal Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
