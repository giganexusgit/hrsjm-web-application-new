import React, { useState, useEffect, useCallback, useId } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Upload,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Shield,
  Award,
  Users,
  Copy,
  Info,
  Building,
  Briefcase,
  X,
  FileCheck,
  Loader2,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { authStore } from '../features/auth/store/authStore';
import { authService } from '../features/auth/services/authService';
import { userAuthStore } from '../features/user/store/userAuthStore';
import {
  ALL_MEMBERSHIP_POSTS,
  DISTRICT_STATE_POSTS,
  LETTER_PAD_POSTS,
  NATIONAL_LEVEL_POSTS,
  INDIAN_STATES,
  STATE_CITIES,
  CATEGORY_UUID_MAP,
} from '../features/membership/data/membershipCategoriesData';
import { INDIA_LOCATIONS } from '../features/user/data/indiaLocations';
import { membershipService } from '../features/membership/services/membershipService';
import {
  formatDateToDMY,
  validateAgeEligibility,
} from '../utils/age';
import { CalendarDatePicker } from '../components/common/CalendarDatePicker';
import { ApiError } from '../services/apiClient';
import { GlobalPaymentModal } from '@/features/payments';
import type { PaymentReceiptDetails } from '@/features/payments';
import type {
  AddressInfoForm,
  DocumentsForm,
  MembershipPostData,
  PersonalInfoForm,
  SubmittedMembershipRecord,
  UploadedDocumentItem,
} from '../features/membership/types/membership.types';

export const MemberRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Phase: 0 = Post Selection, 1 = Personal Details, 2 = Address, 3 = Documents & Consents, 4 = Complete, -1 = Ineligible Age
  const [phase, setPhase] = useState<number>(() => {
    const postParam = searchParams.get('post');
    return postParam ? 1 : 0;
  });

  // Selected Post
  const [selectedPost, setSelectedPost] = useState<MembershipPostData>(() => {
    const postParam = searchParams.get('post');
    if (postParam) {
      const found = ALL_MEMBERSHIP_POSTS.find(
        p => p.id === postParam || p.slug === postParam || p.postName.toLowerCase() === postParam.toLowerCase()
      );
      if (found) return found;
    }
    return DISTRICT_STATE_POSTS[0]; // Default: District Active Member
  });

  // Sync category UUIDs with live backend
  useEffect(() => {
    membershipService.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setSelectedPost((current) => {
          const matched = cats.find(
            (c) =>
              c.postName.toLowerCase() === current.postName.toLowerCase() ||
              c.id === current.id ||
              (c.slug && current.slug && c.slug === current.slug)
          );
          return matched ? { ...current, id: matched.id } : current;
        });
      }
    }).catch(() => { });
  }, []);

  // Category Filter in Step 0
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'district_state' | 'letter_pad' | 'national'>('all');

  // Step 1: Personal Information Form State
  const [personal, setPersonal] = useState<PersonalInfoForm>({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    mobileNumber: '',
    countryCode: '+91',
    email: '',
    policeStation: '',
    password: '',
    confirmPassword: '',
    profilePhotoUri: undefined,
    profilePhotoName: undefined,
  });

  // Step 2: Address Information Form State
  const [address, setAddress] = useState<AddressInfoForm>({
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
  });

  // Step 3: Documents Upload Form State
  const [documents, setDocuments] = useState<DocumentsForm>({});

  // Consents & Declarations
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreePledge, setAgreePledge] = useState(true);

  // UI & Error States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [documentErrors, setDocumentErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Duplicate Check Feedback
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  // Ineligible Age Calculation
  const [ineligibleAge, setIneligibleAge] = useState<number | null>(null);

  // Completed Application
  const [submittedRecord, setSubmittedRecord] = useState<SubmittedMembershipRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Accessible unique IDs for file upload inputs
  const profileUploadId = useId();
  const identityUploadId = useId();
  const addressUploadId = useId();
  const qualificationUploadId = useId();
  const photoUploadId = useId();

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  /**
   * Debounced duplicate check for mobile
   */
  const checkMobileDuplicate = useCallback(async (phoneToCheck: string) => {
    const clean = phoneToCheck.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) return;
    setCheckingPhone(true);
    try {
      const res = await membershipService.checkDuplicate(undefined, clean);
      if (!res.available) {
        setPersonalErrors(prev => ({
          ...prev,
          mobileNumber: res.message || 'Mobile number is already registered. Please sign in or use another number.',
        }));
        setVerifiedPhone(null);
      } else {
        setVerifiedPhone(clean);
        setPersonalErrors(prev => {
          if (prev.mobileNumber && prev.mobileNumber.toLowerCase().includes('already registered')) {
            const next = { ...prev };
            delete next.mobileNumber;
            return next;
          }
          return prev;
        });
      }
    } finally {
      setCheckingPhone(false);
    }
  }, []);

  /**
   * Debounced duplicate check for email
   */
  const checkEmailDuplicate = useCallback(async (emailToCheck: string) => {
    const clean = emailToCheck.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) return;
    setCheckingEmail(true);
    try {
      const res = await membershipService.checkDuplicate(clean, undefined);
      if (!res.available) {
        setPersonalErrors(prev => ({
          ...prev,
          email: res.message || 'Email address is already registered. Please sign in or use another email.',
        }));
        setVerifiedEmail(null);
      } else {
        setVerifiedEmail(clean);
        setPersonalErrors(prev => {
          if (prev.email && prev.email.toLowerCase().includes('already registered')) {
            const next = { ...prev };
            delete next.email;
            return next;
          }
          return prev;
        });
      }
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  useEffect(() => {
    const clean = personal.mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) return;
    const timer = setTimeout(() => {
      checkMobileDuplicate(clean);
    }, 500);
    return () => clearTimeout(timer);
  }, [personal.mobileNumber, checkMobileDuplicate]);

  useEffect(() => {
    const clean = personal.email.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) return;
    const timer = setTimeout(() => {
      checkEmailDuplicate(clean);
    }, 500);
    return () => clearTimeout(timer);
  }, [personal.email, checkEmailDuplicate]);

  // Handle Photo Picker in Step 1
  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPersonalErrors(prev => ({ ...prev, profilePhoto: 'Photo size must be less than 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setPersonal(prev => ({
        ...prev,
        profilePhotoUri: dataUri,
        profilePhotoName: file.name,
      }));
      // Auto-sync to photograph document in Step 3
      setDocuments(prev => ({
        ...prev,
        photograph: {
          type: 'photo',
          name: 'Passport Photograph',
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          isUploaded: true,
          fileUri: dataUri,
          dataUrl: dataUri,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Document Upload in Step 3
  const handleDocumentUpload = (
    category: 'identity' | 'address' | 'qualification' | 'photo',
    name: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setDocumentErrors(prev => ({ ...prev, [category]: 'File size must be less than 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      const docItem: UploadedDocumentItem = {
        type: category,
        name,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        isUploaded: true,
        fileUri: dataUri,
        dataUrl: dataUri,
      };

      if (category === 'identity') {
        setDocuments(prev => ({ ...prev, identityProof: docItem }));
      } else if (category === 'address') {
        setDocuments(prev => ({ ...prev, addressProof: docItem }));
      } else if (category === 'qualification') {
        setDocuments(prev => ({ ...prev, qualificationProof: docItem }));
      } else if (category === 'photo') {
        setDocuments(prev => ({ ...prev, photograph: docItem }));
      }

      setDocumentErrors(prev => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (category: 'identity' | 'address' | 'qualification' | 'photo') => {
    if (category === 'identity') {
      setDocuments(prev => ({ ...prev, identityProof: undefined }));
    } else if (category === 'address') {
      setDocuments(prev => ({ ...prev, addressProof: undefined }));
    } else if (category === 'qualification') {
      setDocuments(prev => ({ ...prev, qualificationProof: undefined }));
    } else if (category === 'photo') {
      setDocuments(prev => ({ ...prev, photograph: undefined }));
    }
  };

  // ════════════════════════════════════════
  // VALIDATION: Step 1 (Personal Info)
  // ════════════════════════════════════════
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    // Full Name
    const nameTrimmed = personal.fullName.trim();
    if (!nameTrimmed) {
      errors.fullName = 'Full name is required';
    } else if (nameTrimmed.length < 3) {
      errors.fullName = 'Full name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(nameTrimmed)) {
      errors.fullName = 'Full name can only contain letters and spaces';
    }

    // Date of Birth & 18+ eligibility
    const ageResult = validateAgeEligibility(personal.dateOfBirth);
    if (!ageResult.isValid) {
      errors.dateOfBirth = ageResult.error || 'Date of birth is required';
    } else if (!ageResult.isEligible) {
      setIneligibleAge(ageResult.age);
      setPhase(-1);
      return false;
    }

    // Gender
    if (!personal.gender) {
      errors.gender = 'Please select your gender';
    }

    // Mobile Number
    const cleanMobile = personal.mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (cleanMobile.length !== 10) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.mobileNumber = 'Mobile number must start with 6, 7, 8, or 9';
    }

    // Email
    const cleanEmail = personal.email.trim();
    if (!cleanEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    // Nearby Police Station
    if (!personal.policeStation.trim()) {
      errors.policeStation = 'Nearby police station is required';
    } else if (personal.policeStation.trim().length < 3) {
      errors.policeStation = 'Police station must be at least 3 characters';
    }

    // Password
    if (!personal.password) {
      errors.password = 'Password is required';
    } else if (personal.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password
    if (!personal.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (personal.password !== personal.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ════════════════════════════════════════
  // VALIDATION: Step 2 (Address Info)
  // ════════════════════════════════════════
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!address.addressLine1.trim()) {
      errors.addressLine1 = 'Address line 1 is required';
    } else if (address.addressLine1.trim().length < 3) {
      errors.addressLine1 = 'Address must be at least 3 characters';
    }

    if (!address.state.trim()) {
      errors.state = 'Please select a state';
    }

    if (!address.city.trim()) {
      errors.city = 'Please select or enter city';
    }

    const cleanPin = address.pincode.replace(/\D/g, '');
    if (!cleanPin) {
      errors.pincode = 'Pincode is required';
    } else if (cleanPin.length !== 6) {
      errors.pincode = 'Must be a valid 6-digit pincode';
    }

    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
    return Object.keys(errors).length === 0;
  };

  // ════════════════════════════════════════
  // VALIDATION: Step 3 (Documents & Consents)
  // ════════════════════════════════════════
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    // Document uploads are now optional as requested
    // if (!documents.identityProof?.isUploaded) {
    //   errors.identity = 'Please upload your identity proof (Aadhaar / Voter ID / Passport / PAN)';
    // }
    // if (!documents.addressProof?.isUploaded) {
    //   errors.address = 'Please upload your address proof (Electricity Bill / Ration Card / Aadhaar)';
    // }
    // if (!documents.photograph?.isUploaded && !personal.profilePhotoUri) {
    //   errors.photo = 'Please upload your passport-sized photograph';
    // }

    if (!agreeTerms) {
      errors.terms = 'Please accept the Terms & Conditions of HRSJM';
    }
    if (!agreePrivacy) {
      errors.privacy = 'Please accept the Privacy Policy and consent to verification';
    }
    if (!agreePledge) {
      errors.pledge = 'Please solemnly agree to the HRSJM Member Pledge to complete application';
    }

    setDocumentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Final Submission Trigger: Validates and triggers Cashfree payment gateway modal
   */
  const handleFinalSubmit = async () => {
    setServerError(null);

    if (!validateStep3()) {
      return;
    }

    // If an official fee is required, launch Cashfree Payment Gateway first
    if (selectedPost.feeAmount && selectedPost.feeAmount > 0) {
      setIsPaymentModalOpen(true);
      return;
    }

    // Zero-fee or complimentary category: submit directly
    await executeSubmission();
  };

  /**
   * Execute application submission to backend & local store with payment receipt
   */
  const executeSubmission = async (paymentDetails?: PaymentReceiptDetails) => {
    setSubmitting(true);
    const cleanMobile = personal.mobileNumber.replace(/\D/g, '').slice(-10);
    const cleanEmail = personal.email.trim().toLowerCase();
    const cleanDob = formatDateToDMY(personal.dateOfBirth);

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedPost.id);
      const targetCategoryId = isUUID
        ? selectedPost.id
        : CATEGORY_UUID_MAP[selectedPost.id] ||
        CATEGORY_UUID_MAP[selectedPost.slug || ''] ||
        '82f72f9c-b79e-470d-8160-f29b392e28b4';

      const record = await membershipService.submitApplication({
        category_id: targetCategoryId,
        full_name: personal.fullName.trim(),
        mobile_number: cleanMobile,
        email: cleanEmail,
        password: personal.password,
        police_station: personal.policeStation.trim(),
        avatar: personal.profilePhotoUri,
        personal_details: {
          dob: cleanDob,
          dateOfBirth: cleanDob,
          gender: personal.gender,
          addressLine1: address.addressLine1.trim(),
          addressLine2: address.addressLine2?.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          country: address.country.trim(),
          pincode: address.pincode.replace(/\D/g, ''),
        },
        application_data: {
          appliedPostName: selectedPost.postName,
          feeAmount: selectedPost.feeAmount,
          fee: selectedPost.fee,
          validity: selectedPost.validity,
          qualification: selectedPost.qualification,
          payment: paymentDetails ? {
            orderId: paymentDetails.orderId,
            transactionId: paymentDetails.transactionId,
            receiptNumber: paymentDetails.receiptNumber,
            method: paymentDetails.paymentMethod,
            amount: paymentDetails.amount,
            status: paymentDetails.status,
            paidAt: paymentDetails.paidAt || new Date().toISOString(),
          } : undefined,
          documents: [
            ...(documents.identityProof ? [{
              type: 'identity',
              title: documents.identityProof.name,
              fileName: documents.identityProof.fileName,
              fileSize: documents.identityProof.fileSize,
              fileUri: documents.identityProof.fileUri,
            }] : []),
            ...(documents.addressProof ? [{
              type: 'address',
              title: documents.addressProof.name,
              fileName: documents.addressProof.fileName,
              fileSize: documents.addressProof.fileSize,
              fileUri: documents.addressProof.fileUri,
            }] : []),
            ...(documents.qualificationProof ? [{
              type: 'qualification',
              title: documents.qualificationProof.name,
              fileName: documents.qualificationProof.fileName,
              fileSize: documents.qualificationProof.fileSize,
              fileUri: documents.qualificationProof.fileUri,
            }] : []),
            ...(documents.photograph || personal.profilePhotoUri ? [{
              type: 'photo',
              title: 'Applicant Photograph',
              fileName: documents.photograph?.fileName || 'profile_photo.jpg',
              fileSize: documents.photograph?.fileSize || '1.2 MB',
              fileUri: documents.photograph?.fileUri || personal.profilePhotoUri,
            }] : []),
          ],
          consents: {
            agreeTerms,
            agreePrivacy,
            agreePledge,
          },
        },
      });

      setSubmittedRecord(record);

      // Persist documents to localStorage linked to application ID & membership number
      if (typeof window !== 'undefined' && window.localStorage && record) {
        try {
          const appDocs = [
            ...(documents.identityProof ? [{
              id: `doc-${record.id}-idproof`,
              title: documents.identityProof.name || 'Aadhaar Card (Optional)',
              fileName: documents.identityProof.fileName || 'aadhaar_card.pdf',
              fileSize: documents.identityProof.fileSize || '1.8 MB',
              uploadDate: 'Today',
              verified: true,
              uri: documents.identityProof.fileUri || documents.identityProof.dataUrl,
            }] : []),
            ...(documents.addressProof ? [{
              id: `doc-${record.id}-address`,
              title: documents.addressProof.name || 'Residential Address Proof',
              fileName: documents.addressProof.fileName || 'address_proof.pdf',
              fileSize: documents.addressProof.fileSize || '2.1 MB',
              uploadDate: 'Today',
              verified: true,
              uri: documents.addressProof.fileUri || documents.addressProof.dataUrl,
            }] : []),
            ...(documents.qualificationProof ? [{
              id: `doc-${record.id}-qualification`,
              title: documents.qualificationProof.name || 'Educational Qualification Certificate',
              fileName: documents.qualificationProof.fileName || 'qualification.pdf',
              fileSize: documents.qualificationProof.fileSize || '1.4 MB',
              uploadDate: 'Today',
              verified: true,
              uri: documents.qualificationProof.fileUri || documents.qualificationProof.dataUrl,
            }] : []),
            ...(documents.photograph || personal.profilePhotoUri ? [{
              id: `doc-${record.id}-photo`,
              title: 'Official Passport Photograph',
              fileName: documents.photograph?.fileName || 'profile_photo.jpg',
              fileSize: documents.photograph?.fileSize || '1.2 MB',
              uploadDate: 'Today',
              verified: true,
              uri: documents.photograph?.fileUri || personal.profilePhotoUri,
            }] : []),
          ];

          if (record.id) {
            localStorage.setItem(`hrsjm_app_docs_${record.id}`, JSON.stringify(appDocs));
          }
          if (record.applicationId) {
            localStorage.setItem(`hrsjm_app_docs_${record.applicationId}`, JSON.stringify(appDocs));
          }
        } catch { }
      }

      // Ensure application ID is stored for status retrieval across the portal
      if (typeof window !== 'undefined' && record?.applicationId) {
        try {
          localStorage.setItem('hrsjm_user_membership_app_id', record.applicationId);
        } catch { }
      }

      // Ensure valid authenticated session so user is not bounced to sign-in
      try {
        if (!authStore.getSnapshot().isAuthenticated) {
          try {
            const session = await authService.login({
              identifier: cleanMobile,
              password: personal.password,
            });
            if (session?.user) {
              authStore.setUserDirectly(session.user, session.access_token, session.refresh_token);
              userAuthStore.setUser(session.user as any);
            }
          } catch {
            const applicantUser: any = {
              id: record.id || `user-${Date.now()}`,
              full_name: personal.fullName.trim(),
              mobile_number: cleanMobile,
              email: cleanEmail,
              roles: ['USER'],
              account_type: 'user',
              membership_status: 'UNDER_REVIEW',
            };
            authStore.setUserDirectly(applicantUser, `hrsjm_session_${Date.now()}`);
            userAuthStore.setUser(applicantUser);
          }
        }
      } catch (authErr) {
        console.warn('Post-registration session establishment warning:', authErr);
      }

      setPhase(4); // Move to complete view (Image 2)
    } catch (err: unknown) {
      let message = 'Unable to submit membership application. Please check details and try again.';
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          message = 'An account or membership application with this mobile number or email already exists.';
        } else if (err.message) {
          message = err.message;
        }
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      setServerError(message);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // ════════════════════════════════════════
  // VIEW: 18+ Ineligible Age Screen
  // ════════════════════════════════════════
  if (phase === -1) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-center items-center px-4 py-12 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-center">
              <div className="text-base font-black text-[#011F39] font-serif leading-none tracking-wide">
                HRSJM
              </div>
              <div className="text-[10px] font-bold text-[#E9B82E] tracking-wider uppercase mt-0.5">
                Human Rights &amp; Social Justice Mission
              </div>
            </div>
          </div>

          <div className="w-20 h-20 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <span className="text-2xl font-black text-rose-600 font-serif">18+</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#011F39] font-serif mb-1">
            You Are Not Eligible
          </h2>
          <p className="text-xs font-semibold text-rose-600 mb-4">
            Sorry, you cannot apply for HRSJM official membership.
          </p>

          <div className="w-16 h-0.5 bg-slate-200 mx-auto mb-4" />

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            You must be at least 18 years old to hold an official membership post or represent the organization.
            Based on the date of birth provided, you do not meet the minimum statutory age requirement.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-700">Minimum Statutory Age:</span>
            </div>
            <span className="text-xs font-extrabold text-[#011F39] px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
              18 Years
            </span>
          </div>

          {typeof ineligibleAge === 'number' && ineligibleAge >= 0 && (
            <p className="text-[11px] text-slate-500 mb-6 font-medium">
              Current calculated age: {ineligibleAge} {ineligibleAge === 1 ? 'year' : 'years'}
            </p>
          )}

          <button
            onClick={() => {
              setPhase(1);
              setPersonalErrors(prev => ({ ...prev, dateOfBirth: 'Must be at least 18 years old to apply.' }));
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-xs uppercase tracking-wider shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Application</span>
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // VIEW: Step 4 — Application Submitted (Exact APK)
  // ════════════════════════════════════════
  if (phase === 4 && submittedRecord) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center px-4 py-8 sm:py-12 font-sans">
        <div className="w-full max-w-lg">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 px-2">
            <Link
              to="/"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#06294D] hover:bg-slate-50 transition"
              title="Return Home"
            >
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-base font-bold text-[#011F39] font-serif">
              Application Submitted
            </h1>
            <div className="w-9" />
          </div>

          {/* Celebration Header */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 sm:p-8 text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#011F39] font-serif leading-tight mb-2">
              Application Submitted<br />Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your application for official membership has been submitted to the National Verification Committee.
            </p>
          </div>

          {/* Reference Card with Details */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Application Reference ID
                </span>
                <div className="text-lg font-black text-[#011F39] font-mono tracking-wide mt-0.5">
                  {submittedRecord.applicationId}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(submittedRecord.applicationId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#011F39] hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Copy Application Number"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-[13px]">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Applicant Name</span>
                <span className="font-bold text-[#011F39]">{submittedRecord.applicantName}</span>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Applied Membership Post</span>
                <span className="font-bold text-[#059669]">{submittedRecord.postName}</span>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Registration Fee</span>
                <span className="font-bold text-slate-900">{submittedRecord.fee}</span>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Submission Timestamp</span>
                <span className="font-semibold text-slate-700">{submittedRecord.submittedAt}</span>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Application Status</span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs uppercase tracking-wider">
                  Under Review
                </span>
              </div>
            </div>
          </div>

          {/* Verification Timeline Notice */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Info size={20} className="text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 leading-relaxed font-normal">
              <span className="font-bold block mb-0.5">Verification Timeline &amp; Next Steps</span>
              Our National Verification Committee will review your submitted credentials and documents within 2–3 business days. You will receive an official notification via SMS and Email once approved.
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/user/membership-status?id=${encodeURIComponent(submittedRecord.applicationId)}`)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock size={16} />
              <span>Go to My Application</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate('/user/dashboard')}
              className="w-full py-3 px-4 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] border border-[#06294D] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard size={16} />
              <span>Go to User Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // VIEW: Step 0 — Category & Post Selection
  // ════════════════════════════════════════
  if (phase === 0) {
    const displayedPosts =
      categoryFilter === 'district_state'
        ? DISTRICT_STATE_POSTS
        : categoryFilter === 'letter_pad'
          ? LETTER_PAD_POSTS
          : categoryFilter === 'national'
            ? NATIONAL_LEVEL_POSTS
            : ALL_MEMBERSHIP_POSTS;

    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans">
        {/* Header */}
        <header className="bg-[#011F39] text-white border-b border-[#06294D] sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/register" className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#FAD465] transition">
              <ArrowLeft size={16} />
              <span>Change Account Type</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider text-white font-serif leading-none">HRSJM</span>
                <span className="text-[9px] font-bold text-[#FAD465] tracking-widest uppercase mt-0.5">Membership Categories</span>
              </div>
            </div>

            <Link to="/login?role=member" className="text-xs font-bold text-[#FAD465] hover:underline">
              Member Login
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#011F39] via-[#06294D] to-[#0B2F52] text-white pt-9 pb-14 px-4 text-center relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FAD465]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10 space-y-2.5">


            <h1 className="text-2xl sm:text-3.5xl font-extrabold font-serif tracking-tight text-white leading-tight">
              <span style={{ color: '#FFFFFF' }}>Apply for </span>
              <span style={{ color: '#FAD465' }}>Official Membership</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
              Select your post to serve humanity, defend fundamental rights, and uphold constitutional justice at District, State, or National councils.
            </p>
          </div>
        </section>

        {/* Tier Tabs & Posts Grid */}
        <main className="max-w-7xl mx-auto px-4 -mt-7 pb-16 w-full relative z-20">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 bg-white p-1.5 rounded-xl shadow-xs border border-slate-200/80 max-w-2xl mx-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${categoryFilter === 'all'
                ? 'bg-[#011F39] text-[#FAD465] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              All Official Posts ({ALL_MEMBERSHIP_POSTS.length})
            </button>
            <button
              onClick={() => setCategoryFilter('district_state')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${categoryFilter === 'district_state'
                ? 'bg-[#011F39] text-[#FAD465] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              District & State Level Posts
            </button>
            <button
              onClick={() => setCategoryFilter('letter_pad')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${categoryFilter === 'letter_pad'
                ? 'bg-[#011F39] text-[#FAD465] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              Letter Pad Posts
            </button>
            <button
              onClick={() => setCategoryFilter('national')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${categoryFilter === 'national'
                ? 'bg-[#011F39] text-[#FAD465] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              National Level Posts
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedPosts.map(post => {
              const isSelected = selectedPost.id === post.id;
              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 border flex flex-col justify-between group ${isSelected ? 'border-[#011F39] ring-2 ring-[#011F39]/15' : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                >
                  <div>
                    {/* Top Post Badge & Fee */}
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: post.iconBgColor }}>
                        <Award size={18} className="text-[#011F39]" />
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-[#011F39] font-serif leading-none">{post.fee}</div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                          {post.validity} Validity
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#011F39] font-serif mb-1 leading-snug line-clamp-2 min-h-[38px]">
                      {post.postName}
                    </h3>
                    <p className="text-[11px] text-[#059669] font-medium mb-3 line-clamp-1">
                      {post.qualification}
                    </p>

                    {/* Deliverables / Kit Checklist */}
                    <div className="space-y-1.5 mb-4 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Membership Deliverables &amp; Kit:
                      </div>
                      {post.checklistItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-[#059669] shrink-0 mt-0.5" />
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setPhase(1); // Proceed to Step 1 Personal Details
                    }}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] shadow-xs hover:shadow-sm"
                  >
                    <span>Apply for this Post</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ════════════════════════════════════════
  // VIEW: Step 1, 2, 3 Registration Multi-Step Shell
  // ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#011F39] text-white border-b border-[#06294D] sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setPhase(prev => (prev > 0 ? prev - 1 : 0))}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#FAD465] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white font-serif leading-none">HRSJM</span>
              <span className="text-[9px] font-bold text-[#FAD465] tracking-widest uppercase mt-0.5">Apply for Membership</span>
            </div>
          </div>

          <Link to="/login?role=member" className="text-xs font-bold text-[#FAD465] hover:underline">
            Login
          </Link>
        </div>
      </header>

      {/* Hero Strip */}
      <section className="bg-gradient-to-b from-[#011F39] via-[#06294D] to-[#0B2F52] text-white pt-8 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3.5xl font-extrabold font-serif tracking-tight text-white">
            <span style={{ color: '#FFFFFF' }}>Apply for </span>
            <span style={{ color: '#FAD465' }}>Membership</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            {phase === 1 && 'Step 1 of 3: Provide your personal and contact details'}
            {phase === 2 && 'Step 2 of 3: Provide your verified address details'}
            {phase === 3 && 'Step 3 of 3: Upload verification proofs and declare pledge'}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-10 relative z-20">
          {/* 3-Step Progress Indicator */}
          <div className="mb-7 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between relative max-w-md mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition ${phase > 1
                    ? 'bg-[#E9B82E] text-white'
                    : phase === 1
                      ? 'bg-[#011F39] text-[#FAD465] border-2 border-[#E9B82E]'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                >
                  {phase > 1 ? <Check size={16} /> : '1'}
                </div>
                <span className="text-[10px] font-bold text-[#011F39] mt-1 text-center leading-tight">
                  Personal<br />Info
                </span>
              </div>

              <div className={`flex-1 h-0.5 mx-2 -mt-4 transition ${phase > 1 ? 'bg-[#E9B82E]' : 'bg-slate-200'}`} />

              {/* Step 2 */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition ${phase > 2
                    ? 'bg-[#E9B82E] text-white'
                    : phase === 2
                      ? 'bg-[#011F39] text-[#FAD465] border-2 border-[#E9B82E]'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                >
                  {phase > 2 ? <Check size={16} /> : '2'}
                </div>
                <span className="text-[10px] font-bold text-[#011F39] mt-1 text-center leading-tight">
                  Address<br />Details
                </span>
              </div>

              <div className={`flex-1 h-0.5 mx-2 -mt-4 transition ${phase > 2 ? 'bg-[#E9B82E]' : 'bg-slate-200'}`} />

              {/* Step 3 */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition ${phase === 3
                    ? 'bg-[#011F39] text-[#FAD465] border-2 border-[#E9B82E]'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                >
                  3
                </div>
                <span className="text-[10px] font-bold text-[#011F39] mt-1 text-center leading-tight">
                  Documents<br />&amp; Pledge
                </span>
              </div>
            </div>
          </div>

          {/* Selected Post Banner */}
          <div className="bg-gradient-to-r from-[#06294D] via-[#0B2F52] to-[#011F39] text-white border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FAD465]/15 border border-[#FAD465]/40 text-[#FAD465] flex items-center justify-center shrink-0 shadow-xs">
                <Award size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#FAD465] uppercase tracking-wider block">
                  Applying For Official Post:
                </span>
                <span className="text-base sm:text-lg font-black text-white font-serif block">
                  {selectedPost.postName}
                </span>
                <span className="text-[11px] text-slate-300">
                  {selectedPost.qualification} • {selectedPost.validity} Duration
                </span>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <div className="px-3 py-1 rounded-lg bg-white/10 border border-[#FAD465]/30 text-sm font-black text-[#FAD465]">
                {selectedPost.fee}
              </div>
              <button
                type="button"
                onClick={() => setPhase(0)}
                className="text-xs font-bold text-[#FAD465] hover:underline cursor-pointer flex items-center gap-1 mt-1 sm:mt-1.5"
              >
                <span>Change Post</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* STEP 1: Personal Information Form */}
          {/* ═══════════════════════════════════════════ */}
          {phase === 1 && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (validateStep1()) {
                  setPhase(2);
                }
              }}
              className="space-y-4"
              noValidate
            >
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h2 className="text-lg font-bold text-[#011F39] font-serif">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">
                  Please provide your personal details to apply for membership.
                </p>
              </div>

              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {personal.profilePhotoUri ? (
                    <img src={personal.profilePhotoUri} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={30} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <label
                    htmlFor={profileUploadId}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#011F39] text-xs font-semibold cursor-pointer transition inline-flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    <span>{personal.profilePhotoUri ? 'Change Photo' : 'Upload Profile Photo'}</span>
                  </label>
                  <input
                    id={profileUploadId}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoSelect}
                    className="hidden"
                  />
                  {personal.profilePhotoUri && (
                    <button
                      type="button"
                      onClick={() => setPersonal(p => ({ ...p, profilePhotoUri: undefined, profilePhotoName: undefined }))}
                      className="ml-2 text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    JPG or PNG up to 5MB. Passport size preferred.
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${personalErrors.fullName
                    ? 'border-rose-300 bg-rose-50/20'
                    : focusedField === 'fullName'
                      ? 'border-[#011F39] bg-white ring-2 ring-[#011F39]/10'
                      : 'border-slate-200'
                    }`}
                >
                  <User size={18} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Full Legal Name *"
                    value={personal.fullName}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => {
                      setPersonal(p => ({ ...p, fullName: e.target.value }));
                      if (personalErrors.fullName) setPersonalErrors(err => ({ ...err, fullName: '' }));
                    }}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                </div>
                {personalErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{personalErrors.fullName}</p>
                )}
              </div>

              {/* Date of Birth & Gender Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DOB with interactive Calendar format */}
                <CalendarDatePicker
                  label="Date of Birth"
                  required
                  minAge={18}
                  value={personal.dateOfBirth}
                  error={personalErrors.dateOfBirth}
                  placeholder="dd-mm-yyyy"
                  onChange={(val) => {
                    setPersonal((p) => ({ ...p, dateOfBirth: val }));
                    if (val) {
                      const ageCheck = validateAgeEligibility(val);
                      if (!ageCheck.isValid) {
                        setPersonalErrors((err) => ({ ...err, dateOfBirth: ageCheck.error || '' }));
                      } else if (!ageCheck.isEligible) {
                        setIneligibleAge(ageCheck.age);
                        setPhase(-1);
                      } else {
                        setPersonalErrors((err) => {
                          const next = { ...err };
                          delete next.dateOfBirth;
                          return next;
                        });
                      }
                    } else {
                      setPersonalErrors((err) => {
                        const next = { ...err };
                        delete next.dateOfBirth;
                        return next;
                      });
                    }
                  }}
                />

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <Users size={18} className="text-slate-400 mr-2.5 shrink-0" />
                    <select
                      value={personal.gender}
                      onChange={e => setPersonal(p => ({ ...p, gender: e.target.value }))}
                      className="w-full bg-transparent text-sm text-slate-900 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Non-Binary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${personalErrors.mobileNumber
                    ? 'border-rose-300 bg-rose-50/20'
                    : focusedField === 'phone'
                      ? 'border-[#011F39] bg-white ring-2 ring-[#011F39]/10'
                      : 'border-slate-200'
                    }`}
                >
                  <Phone size={18} className="text-slate-400 mr-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md mr-2.5 select-none">
                    {personal.countryCode}
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit Mobile Number *"
                    value={personal.mobileNumber}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPersonal(p => ({ ...p, mobileNumber: clean }));
                      setVerifiedPhone(null);
                      if (personalErrors.mobileNumber) setPersonalErrors(err => ({ ...err, mobileNumber: '' }));
                    }}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                  {checkingPhone ? (
                    <Loader2 size={16} className="text-[#E9B82E] animate-spin shrink-0 ml-2" />
                  ) : verifiedPhone && personal.mobileNumber === verifiedPhone && !personalErrors.mobileNumber ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 ml-2" />
                  ) : null}
                </div>
                {personalErrors.mobileNumber && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{personalErrors.mobileNumber}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${personalErrors.email
                    ? 'border-rose-300 bg-rose-50/20'
                    : focusedField === 'email'
                      ? 'border-[#011F39] bg-white ring-2 ring-[#011F39]/10'
                      : 'border-slate-200'
                    }`}
                >
                  <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="email"
                    placeholder="name@example.com *"
                    value={personal.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => {
                      setPersonal(p => ({ ...p, email: e.target.value }));
                      setVerifiedEmail(null);
                      if (personalErrors.email) setPersonalErrors(err => ({ ...err, email: '' }));
                    }}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                  {checkingEmail ? (
                    <Loader2 size={16} className="text-[#E9B82E] animate-spin shrink-0 ml-2" />
                  ) : verifiedEmail && personal.email.trim().toLowerCase() === verifiedEmail && !personalErrors.email ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 ml-2" />
                  ) : null}
                </div>
                {personalErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{personalErrors.email}</p>
                )}
              </div>

              {/* Nearby Police Station */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nearby Police Station <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${personalErrors.policeStation
                    ? 'border-rose-300 bg-rose-50/20'
                    : focusedField === 'ps'
                      ? 'border-[#011F39] bg-white ring-2 ring-[#011F39]/10'
                      : 'border-slate-200'
                    }`}
                >
                  <Building size={18} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Connaught Place Police Station *"
                    value={personal.policeStation}
                    onFocus={() => setFocusedField('ps')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => {
                      setPersonal(p => ({ ...p, policeStation: e.target.value }));
                      if (personalErrors.policeStation) setPersonalErrors(err => ({ ...err, policeStation: '' }));
                    }}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                </div>
                {personalErrors.policeStation && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{personalErrors.policeStation}</p>
                )}
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${personalErrors.password
                      ? 'border-rose-300 bg-rose-50/20'
                      : focusedField === 'pwd'
                        ? 'border-[#011F39] bg-white ring-2 ring-[#011F39]/10'
                        : 'border-slate-200'
                      }`}
                  >
                    <Lock size={18} className="text-slate-400 mr-2.5 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters *"
                      value={personal.password}
                      onFocus={() => setFocusedField('pwd')}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => {
                        setPersonal(p => ({ ...p, password: e.target.value }));
                        if (personalErrors.password) setPersonalErrors(err => ({ ...err, password: '' }));
                      }}
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {personalErrors.password && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{personalErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${personalErrors.confirmPassword
                      ? 'border-rose-300 bg-rose-50/20'
                      : focusedField === 'cpwd'
                        ? 'border-[#011F39] bg-white ring-2 ring-[#011F39]/10'
                        : 'border-slate-200'
                      }`}
                  >
                    <Lock size={18} className="text-slate-400 mr-2.5 shrink-0" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password *"
                      value={personal.confirmPassword}
                      onFocus={() => setFocusedField('cpwd')}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => {
                        setPersonal(p => ({ ...p, confirmPassword: e.target.value }));
                        if (personalErrors.confirmPassword) setPersonalErrors(err => ({ ...err, confirmPassword: '' }));
                      }}
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {personalErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{personalErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPhase(0)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Change Post
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Address Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* STEP 2: Address Details Form */}
          {/* ═══════════════════════════════════════════ */}
          {phase === 2 && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (validateStep2()) {
                  setPhase(3);
                }
              }}
              className="space-y-4"
              noValidate
            >
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h2 className="text-lg font-bold text-[#011F39] font-serif">
                  Address Details
                </h2>
                <p className="text-xs text-slate-500">
                  Please provide your current address details for membership verification and kit delivery.
                </p>
              </div>

              {/* Error banner if validation failed */}
              {Object.keys(addressErrors).length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertCircle size={15} className="text-rose-600 shrink-0" />
                    <span>Please complete the required address fields to proceed:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11.5px] text-rose-700 pl-1 space-y-0.5 font-medium">
                    {Object.values(addressErrors).map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Address Line 1 <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${addressErrors.addressLine1 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                >
                  <MapPin size={18} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="House/Flat No., Building, Street *"
                    value={address.addressLine1}
                    onChange={e => {
                      setAddress(a => ({ ...a, addressLine1: e.target.value }));
                      if (addressErrors.addressLine1) setAddressErrors(err => ({ ...err, addressLine1: '' }));
                    }}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                </div>
                {addressErrors.addressLine1 && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{addressErrors.addressLine1}</p>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <MapPin size={18} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Area, Sector, Landmark (Optional)"
                    value={address.addressLine2 || ''}
                    onChange={e => setAddress(a => ({ ...a, addressLine2: e.target.value }))}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* State & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${addressErrors.state ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                      }`}
                  >
                    <select
                      value={address.state}
                      onChange={e => {
                        const newState = e.target.value;
                        setAddress(a => ({ ...a, state: newState, city: '' }));
                      }}
                      className="w-full bg-transparent text-sm text-slate-900 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="">Select State *</option>
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  {addressErrors.state && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{addressErrors.state}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City / District <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${addressErrors.city ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                      }`}
                  >
                    <select
                      value={address.city}
                      disabled={!address.state}
                      onChange={e => {
                        const newCity = e.target.value;
                        setAddress(a => ({ ...a, city: newCity }));
                        if (addressErrors.city) setAddressErrors(err => ({ ...err, city: '' }));
                      }}
                      className="w-full bg-transparent text-sm text-slate-900 focus:outline-none font-medium cursor-pointer disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {address.state ? 'Select City / District *' : 'Select State First *'}
                      </option>
                      {(
                        STATE_CITIES[address.state] ||
                        INDIA_LOCATIONS.find(loc => loc.name === address.state)?.cities ||
                        []
                      ).map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {addressErrors.city && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{addressErrors.city}</p>
                  )}
                </div>
              </div>

              {/* Pincode & Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pincode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={`flex items-center px-3.5 py-2.5 bg-slate-50 border rounded-xl transition ${addressErrors.pincode ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                      }`}
                  >
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit PIN Code *"
                      value={address.pincode}
                      onChange={e => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setAddress(a => ({ ...a, pincode: clean }));
                        if (addressErrors.pincode) setAddressErrors(err => ({ ...err, pincode: '' }));
                      }}
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium tracking-wider"
                    />
                  </div>
                  {addressErrors.pincode && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{addressErrors.pincode}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl select-none">
                    <span className="text-sm font-semibold text-slate-700">India</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPhase(1)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Back to Personal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* STEP 3: Document Uploads & Declarations */}
          {/* ═══════════════════════════════════════════ */}
          {phase === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-[#011F39] font-serif">
                  Document Verification &amp; Pledge
                </h2>
                <p className="text-xs text-slate-500">
                  Upload verification documents (PDF, JPG, PNG up to 5MB each) to complete your membership file.
                </p>
              </div>

              {/* 4 Document Upload Cards in Responsive 2-Col Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Aadhaar Card (Optional Identity Proof) */}
                <div className={`p-4 rounded-2xl border transition ${documents.identityProof ? 'bg-emerald-50/40 border-emerald-200' : documentErrors.identity ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <FileCheck size={18} className={documents.identityProof ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-[#011F39]">
                        1. Aadhaar Card <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Aadhaar Card (UIDAI)</span>
                  </div>

                  {documents.identityProof ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 mt-2">
                      <span className="text-xs font-medium text-emerald-800 truncate max-w-[240px]">
                        {documents.identityProof.fileName} ({documents.identityProof.fileSize})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDocument('identity')}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <label htmlFor={identityUploadId} className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-center block text-xs font-semibold text-slate-600 hover:border-[#011F39] hover:bg-white transition cursor-pointer">
                        <Upload size={14} className="inline mr-1.5" />
                        <span>Select Aadhaar Card File</span>
                      </label>
                      <input id={identityUploadId} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleDocumentUpload('identity', 'Aadhaar Card', e)} className="hidden" />
                    </div>
                  )}
                  {documentErrors.identity && <p className="text-[11px] text-rose-600 mt-1 font-medium">{documentErrors.identity}</p>}
                </div>

                {/* 2. Address Proof */}
                <div className={`p-4 rounded-2xl border transition ${documents.addressProof ? 'bg-emerald-50/40 border-emerald-200' : documentErrors.address ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className={documents.addressProof ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-[#011F39]">
                        2. Address Proof <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Electricity Bill, Ration Card, Bank Passbook</span>
                  </div>

                  {documents.addressProof ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 mt-2">
                      <span className="text-xs font-medium text-emerald-800 truncate max-w-[240px]">
                        {documents.addressProof.fileName} ({documents.addressProof.fileSize})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDocument('address')}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <label htmlFor={addressUploadId} className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-center block text-xs font-semibold text-slate-600 hover:border-[#011F39] hover:bg-white transition cursor-pointer">
                        <Upload size={14} className="inline mr-1.5" />
                        <span>Select Address Proof File</span>
                      </label>
                      <input id={addressUploadId} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleDocumentUpload('address', 'Address Proof', e)} className="hidden" />
                    </div>
                  )}
                  {documentErrors.address && <p className="text-[11px] text-rose-600 mt-1 font-medium">{documentErrors.address}</p>}
                </div>

                {/* 3. Qualification Proof */}
                <div className={`p-4 rounded-2xl border transition ${documents.qualificationProof ? 'bg-emerald-50/40 border-emerald-200' : documentErrors.qualification ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className={documents.qualificationProof ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-[#011F39]">
                        3. Qualification Proof <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Degree, 10th / 12th Certificate</span>
                  </div>

                  {documents.qualificationProof ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 mt-2">
                      <span className="text-xs font-medium text-emerald-800 truncate max-w-[240px]">
                        {documents.qualificationProof.fileName} ({documents.qualificationProof.fileSize})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDocument('qualification')}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <label htmlFor={qualificationUploadId} className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-center block text-xs font-semibold text-slate-600 hover:border-[#011F39] hover:bg-white transition cursor-pointer">
                        <Upload size={14} className="inline mr-1.5" />
                        <span>Select Qualification Proof File</span>
                      </label>
                      <input id={qualificationUploadId} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleDocumentUpload('qualification', 'Qualification Proof', e)} className="hidden" />
                    </div>
                  )}
                  {documentErrors.qualification && <p className="text-[11px] text-rose-600 mt-1 font-medium">{documentErrors.qualification}</p>}
                </div>

                {/* 4. Photograph */}
                <div className={`p-4 rounded-2xl border transition ${documents.photograph || personal.profilePhotoUri ? 'bg-emerald-50/40 border-emerald-200' : documentErrors.photo ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <User size={18} className={documents.photograph || personal.profilePhotoUri ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-[#011F39]">
                        4. Photograph <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Passport Size Photograph</span>
                  </div>

                  {documents.photograph || personal.profilePhotoUri ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 mt-2">
                      <span className="text-xs font-medium text-emerald-800 truncate max-w-[240px]">
                        {documents.photograph?.fileName || personal.profilePhotoName || 'profile_photograph.jpg'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          removeDocument('photo');
                          setPersonal(p => ({ ...p, profilePhotoUri: undefined }));
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <label htmlFor={photoUploadId} className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-center block text-xs font-semibold text-slate-600 hover:border-[#011F39] hover:bg-white transition cursor-pointer">
                        <Upload size={14} className="inline mr-1.5" />
                        <span>Select Photograph File</span>
                      </label>
                      <input id={photoUploadId} type="file" accept="image/*" onChange={e => handleDocumentUpload('photo', 'Passport Photograph', e)} className="hidden" />
                    </div>
                  )}
                  {documentErrors.photo && <p className="text-[11px] text-rose-600 mt-1 font-medium">{documentErrors.photo}</p>}
                </div>
              </div>

              {/* Declarations & Solemn Pledge */}
              <div className="pt-2 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
                <div className="font-bold text-[#011F39] flex items-center gap-1.5">
                  <Shield size={16} className="text-[#059669]" />
                  <span>Mandatory Declarations &amp; Member Pledge</span>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#011F39] focus:ring-[#011F39] cursor-pointer"
                  />
                  <span>
                    I agree to the <span className="font-semibold text-[#011F39] underline">Terms &amp; Conditions</span> and Constitution of HRSJM. <span className="text-rose-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={e => setAgreePrivacy(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#011F39] focus:ring-[#011F39] cursor-pointer"
                  />
                  <span>
                    I accept the <span className="font-semibold text-[#011F39] underline">Privacy Policy</span> and consent to statutory document verification. <span className="text-rose-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreePledge}
                    onChange={e => setAgreePledge(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#011F39] focus:ring-[#011F39] cursor-pointer"
                  />
                  <span>
                    I solemnly pledge to uphold the Constitution of India and the noble human rights mission of HRSJM. <span className="text-rose-500">*</span>
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPhase(2)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Back to Address
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#011F39]" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application ({selectedPost.fee})</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-400">
        © 2026 Human Rights Sanrakshan Sansthan (HRSJM). All rights reserved.
      </footer>

      {/* Cashfree Payment Gateway Modal */}
      <GlobalPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSubmitting(false);
        }}
        payload={{
          purpose: 'membership',
          amount: selectedPost.feeAmount || 800,
          title: `Membership Application: ${selectedPost.postName}`,
          subtitle: `Tenure: ${selectedPost.validity}`,
          entityId: selectedPost.id,
          donorName: personal.fullName.trim(),
          donorMobile: personal.mobileNumber.replace(/\D/g, '').slice(-10),
          donorEmail: personal.email.trim().toLowerCase(),
        }}
        onSuccess={async (receipt) => {
          setIsPaymentModalOpen(false);
          await executeSubmission(receipt);
        }}
      />
    </div>
  );
};
