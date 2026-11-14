import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  X,
  UserPlus,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Award,
  Upload,
  AlertCircle,
  Search,
  Layers,
  ChevronDown,
} from 'lucide-react';
import type { MembershipCategoryItem } from '../types/members.types';
import { membersStore } from '../store/membersStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { INDIAN_STATES, STATE_CITIES } from '@/features/membership/data/membershipCategoriesData';
import { CalendarDatePicker } from '@/components/common/CalendarDatePicker';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  categories: MembershipCategoryItem[];
  onCreated?: () => void;
}

interface UploadedDoc {
  name: string;
  size: string;
  type: string;
}

type CadreTierType = 'district_state' | 'letter_pad' | 'national';

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  visible,
  onClose,
  categories,
  onCreated,
}) => {
  // Stepper Phase: 1 = Personal Info, 2 = Address Details, 3 = Documents & Verification
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Category & Post Picker
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '1');
  const [showPostPicker, setShowPostPicker] = useState(false);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [cadreTier, setCadreTier] = useState<CadreTierType>('district_state');

  // Step 1: Personal Info State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [qualification, setQualification] = useState('');
  const [fatherName, setFatherName] = useState('');

  // Step 2: Address Details State
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [policeStation, setPoliceStation] = useState('');

  // Step 3: Documents & Verification State
  const [identityProofDoc, setIdentityProofDoc] = useState<UploadedDoc | null>(null);
  const [addressProofDoc, setAddressProofDoc] = useState<UploadedDoc | null>(null);
  const [photoDoc, setPhotoDoc] = useState<UploadedDoc | null>(null);
  const [qualificationDoc, setQualificationDoc] = useState<UploadedDoc | null>(null);
  const [autoActivate, setAutoActivate] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [agreedConstitution, setAgreedConstitution] = useState(true);
  const [agreedVerification, setAgreedVerification] = useState(true);

  // Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useLockBodyScroll(visible);

  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setShowPostPicker(false);
      setPostSearchQuery('');
      setErrors({});
      setServerError('');
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
    }
  }, [visible, categories]);

  const selectedCat = categories.find((c) => c.id === categoryId) || categories[0];

  const getCategoryGroup = (item: MembershipCategoryItem): 'district_state' | 'letter_pad' | 'national' => {
    const code = (item.code || '').toUpperCase();
    const name = (item.name || '').toLowerCase();
    if (code.includes('NATIONAL') || name.includes('national')) {
      return 'national';
    }
    if (
      code.includes('LION') ||
      code.includes('COUNSELLOR') ||
      code.includes('AMBASSADOR') ||
      code.includes('DIRECTOR') ||
      name.includes('lion') ||
      name.includes('counsellor') ||
      name.includes('ambassador') ||
      name.includes('director')
    ) {
      return 'letter_pad';
    }
    return 'district_state';
  };

  const selectedGroup = selectedCat ? getCategoryGroup(selectedCat) : 'district_state';
  const selectedGroupBadge =
    selectedGroup === 'national'
      ? 'National Council Cell'
      : selectedGroup === 'letter_pad'
        ? 'Letter Pad Dignitary'
        : 'District & State Unit';

  const groupCounts = useMemo(() => {
    return {
      district_state: categories.filter((c) => getCategoryGroup(c) === 'district_state').length,
      letter_pad: categories.filter((c) => getCategoryGroup(c) === 'letter_pad').length,
      national: categories.filter((c) => getCategoryGroup(c) === 'national').length,
    };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      // Must match active 3 main options
      if (getCategoryGroup(c) !== cadreTier) return false;

      // Keyword query filter
      if (postSearchQuery.trim()) {
        const q = postSearchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
      }

      return true;
    });
  }, [categories, cadreTier, postSearchQuery]);

  // Helper for mock doc upload
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (doc: UploadedDoc | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'application/pdf',
      });
    }
  };

  // Validation: Step 1 (Personal Info)
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 3) {
      errs.fullName = 'Full Name must be at least 3 characters';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Mobile Number is required';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation: Step 2 (Address Details)
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!address.trim()) {
      errs.address = 'Street Address / House No. is required';
    }
    if (!state.trim()) {
      errs.state = 'State is required';
    }
    if (!city.trim()) {
      errs.city = 'City / District is required';
    }
    const cleanPin = pincode.replace(/\D/g, '');
    if (!cleanPin) {
      errs.pincode = 'Pincode is required';
    } else if (cleanPin.length !== 6) {
      errs.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setShowPostPicker(false);
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedConstitution || !agreedVerification) {
      setServerError('Please accept the mandatory declarations to complete member enrollment.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const uploadedDocsList: {
        id: string;
        name: string;
        type: string;
        fileSize: string;
        uploadedAt: string;
      }[] = [];

      const todayStr = new Date().toISOString().split('T')[0];

      if (identityProofDoc) {
        uploadedDocsList.push({
          id: `doc-${Date.now()}-1`,
          name: identityProofDoc.name || 'Identity Proof',
          type: identityProofDoc.type || 'application/pdf',
          fileSize: identityProofDoc.size || '1.0 MB',
          uploadedAt: todayStr,
        });
      }
      if (addressProofDoc) {
        uploadedDocsList.push({
          id: `doc-${Date.now()}-2`,
          name: addressProofDoc.name || 'Address Proof',
          type: addressProofDoc.type || 'application/pdf',
          fileSize: addressProofDoc.size || '1.0 MB',
          uploadedAt: todayStr,
        });
      }
      if (qualificationDoc) {
        uploadedDocsList.push({
          id: `doc-${Date.now()}-3`,
          name: qualificationDoc.name || 'Qualification Certificate',
          type: qualificationDoc.type || 'application/pdf',
          fileSize: qualificationDoc.size || '1.0 MB',
          uploadedAt: todayStr,
        });
      }
      if (photoDoc) {
        uploadedDocsList.push({
          id: `doc-${Date.now()}-4`,
          name: photoDoc.name || 'Passport Photo',
          type: photoDoc.type || 'image/jpeg',
          fileSize: photoDoc.size || '500 KB',
          uploadedAt: todayStr,
        });
      }

      await membersStore.createMember({
        category_id: categoryId,
        full_name: fullName.trim(),
        mobile_number: phone.trim(),
        email: email.trim() || undefined,
        personal_details: {
          gender,
          dob: dob || undefined,
          qualification: qualification.trim() || undefined,
          father_name: fatherName.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        documents: uploadedDocsList,
        admin_notes: adminNotes || `Admin enrollment: ${selectedCat?.name || 'Standard'}`,
        auto_activate: autoActivate,
      });

      onCreated?.();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to register member. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const citiesForState = STATE_CITIES[state] || [];

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#011F39]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#DCE4EC] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#011F39] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAD465]/15 border border-[#FAD465]/30 flex items-center justify-center text-[#FAD465]">
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Playfair_Display',Georgia,serif] text-white leading-tight">
                Register New Organization Member
              </h3>
              <p className="text-[11px] text-[#DBE5EE]">National Digital Governance Membership Enrollment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 3-Step Stepper Progress Bar (Exact Signup Page Match) */}
        <div className="bg-[#FAF7F0] border-b border-[#DCE4EC] px-6 py-3.5 shrink-0">
          <div className="flex items-center justify-between max-w-md mx-auto relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <button
                type="button"
                onClick={() => currentStep > 1 && setCurrentStep(1)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${currentStep > 1
                  ? 'bg-[#E9B82E] text-white cursor-pointer'
                  : currentStep === 1
                    ? 'bg-[#011F39] text-[#FAD465] border-2 border-[#E9B82E]'
                    : 'bg-slate-200 text-slate-500'
                  }`}
              >
                {currentStep > 1 ? <Check size={14} /> : '1'}
              </button>
              <span className="text-[10px] font-bold text-[#011F39] mt-1 text-center">
                Personal<br />Info
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${currentStep > 1 ? 'bg-[#E9B82E]' : 'bg-slate-200'
                }`}
            />

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <button
                type="button"
                onClick={() => {
                  if (currentStep > 2) setCurrentStep(2);
                  else if (currentStep === 1 && validateStep1()) setCurrentStep(2);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${currentStep > 2
                  ? 'bg-[#E9B82E] text-white cursor-pointer'
                  : currentStep === 2
                    ? 'bg-[#011F39] text-[#FAD465] border-2 border-[#E9B82E]'
                    : 'bg-slate-200 text-slate-500'
                  }`}
              >
                {currentStep > 2 ? <Check size={14} /> : '2'}
              </button>
              <span className="text-[10px] font-bold text-[#011F39] mt-1 text-center">
                Address<br />Details
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${currentStep > 2 ? 'bg-[#E9B82E]' : 'bg-slate-200'
                }`}
            />

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${currentStep === 3
                  ? 'bg-[#011F39] text-[#FAD465] border-2 border-[#E9B82E]'
                  : 'bg-slate-200 text-slate-500'
                  }`}
              >
                3
              </div>
              <span className="text-[10px] font-bold text-[#011F39] mt-1 text-center">
                Documents<br />&amp; Pledge
              </span>
            </div>
          </div>
        </div>

        {/* Category & Cadre Selector (Interactive Form Option) */}
        <div className="px-5 sm:px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#011F39] flex items-center gap-1.5">
              <Layers size={14} className="text-[#06294D]" />
              <span>Membership Post &amp; Category <span className="text-rose-500">*</span></span>
            </label>
            <span className="text-[11px] font-semibold text-[#06294D]">
              {showPostPicker ? 'Click card to collapse' : 'Click to select / change post'}
            </span>
          </div>

          {/* Interactive Selecting Option Card */}
          <button
            type="button"
            onClick={() => setShowPostPicker(!showPostPicker)}
            className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs ${showPostPicker
              ? 'border-[#06294D] bg-[#FAF7F0] ring-3 ring-[#06294D]/10'
              : 'border-[#DCE4EC] hover:border-[#06294D] bg-white hover:bg-[#FAF7F0]/60'
              }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#011F39] text-[#FAD465] border border-[#FAD465]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Award size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#06294D] text-[#FAD465] tracking-wider">
                    {selectedGroupBadge}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Selected Post</span>
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#011F39] leading-tight truncate">
                  {selectedCat?.name || 'District Active Member'}
                </h4>
                <p className="text-xs text-[#34516D] truncate mt-0.5">
                  {selectedCat?.description || 'Minimum 8th Class • 1 Year Validity'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#DCE4EC] shrink-0">
              <div className="text-left sm:text-right">
                <div className="text-[10px] uppercase font-bold text-[#718096] tracking-wider">Annual Cadre Fee</div>
                <div className="text-base font-black text-[#011F39]">
                  ₹ {typeof selectedCat?.fee === 'number' ? selectedCat.fee.toLocaleString('en-IN') : selectedCat?.fee || '800'}
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${showPostPicker
                  ? 'bg-[#011F39] text-[#FAD465]'
                  : 'bg-[#011F39]/5 text-[#011F39] hover:bg-[#011F39] hover:text-[#FAD465]'
                  }`}
              >
                <span>{showPostPicker ? 'Close Picker' : 'Choose Post'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showPostPicker ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Interactive Post & Category Picker Overlay */}
          {showPostPicker && (
            <div className="mt-2.5 p-3.5 sm:p-4 bg-[#FAF7F0] border-2 border-[#06294D]/20 rounded-2xl shadow-xl space-y-3 animate-in fade-in duration-150">
              {/* Header: Title, Search, Close */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#011F39]">
                  <Layers size={14} className="text-[#06294D]" />
                  <span>Choose Membership Post Option:</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      placeholder="Search by post name..."
                      className="w-full pl-7 pr-3 py-1 text-xs rounded-lg border border-[#DCE4EC] bg-white text-[#0B2F52] focus:outline-none focus:border-[#06294D]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPostPicker(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* 3 Main Category Option Cards */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#011F39] uppercase tracking-wide flex items-center justify-between">
                  <span>1. Choose Main Category Tier:</span>
                  <span className="text-[10.5px] text-[#34516D] font-medium lowercase">select one to view related posts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: District & State */}
                  <button
                    type="button"
                    onClick={() => setCadreTier('district_state')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${cadreTier === 'district_state'
                      ? 'border-[#011F39] bg-[#011F39] text-white shadow-sm ring-2 ring-[#011F39]/20'
                      : 'border-[#DCE4EC] bg-white hover:border-[#06294D] hover:bg-[#FAF7F0] text-[#011F39]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded ${cadreTier === 'district_state'
                          ? 'bg-[#FAD465] text-[#011F39]'
                          : 'bg-[#FAF7F0] text-[#06294D] border border-[#DCE4EC]'
                          }`}
                      >
                        Tier 1
                      </span>
                      <span
                        className={`text-[10.5px] font-bold ${cadreTier === 'district_state' ? 'text-[#FAD465]' : 'text-[#34516D]'
                          }`}
                      >
                        {groupCounts.district_state} Posts
                      </span>
                    </div>
                    <div className={`text-xs font-bold leading-tight ${cadreTier === 'district_state' ? 'text-white' : 'text-[#011F39]'}`}>
                      District & State Level Posts
                    </div>
                    <div
                      className={`text-[10.5px] mt-0.5 leading-snug ${cadreTier === 'district_state' ? 'text-slate-200' : 'text-slate-500'
                        }`}
                    >
                      Active Members &amp; Unit Posts
                    </div>
                  </button>

                  {/* Option 2: Letter Pad Posts */}
                  <button
                    type="button"
                    onClick={() => setCadreTier('letter_pad')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${cadreTier === 'letter_pad'
                      ? 'border-[#011F39] bg-[#011F39] text-white shadow-sm ring-2 ring-[#011F39]/20'
                      : 'border-[#DCE4EC] bg-white hover:border-[#06294D] hover:bg-[#FAF7F0] text-[#011F39]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded ${cadreTier === 'letter_pad'
                          ? 'bg-[#FAD465] text-[#011F39]'
                          : 'bg-[#FAF7F0] text-[#06294D] border border-[#DCE4EC]'
                          }`}
                      >
                        Tier 2
                      </span>
                      <span
                        className={`text-[10.5px] font-bold ${cadreTier === 'letter_pad' ? 'text-[#FAD465]' : 'text-[#34516D]'
                          }`}
                      >
                        {groupCounts.letter_pad} Posts
                      </span>
                    </div>
                    <div className={`text-xs font-bold leading-tight ${cadreTier === 'letter_pad' ? 'text-white' : 'text-[#011F39]'}`}>
                      Letter Pad Posts
                    </div>
                    <div
                      className={`text-[10.5px] mt-0.5 leading-snug ${cadreTier === 'letter_pad' ? 'text-slate-200' : 'text-slate-500'
                        }`}
                    >
                      Lion, Counsellor, Ambassador, Director
                    </div>
                  </button>

                  {/* Option 3: National Level Posts */}
                  <button
                    type="button"
                    onClick={() => setCadreTier('national')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${cadreTier === 'national'
                      ? 'border-[#011F39] bg-[#011F39] text-white shadow-sm ring-2 ring-[#011F39]/20'
                      : 'border-[#DCE4EC] bg-white hover:border-[#06294D] hover:bg-[#FAF7F0] text-[#011F39]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded ${cadreTier === 'national'
                          ? 'bg-[#FAD465] text-[#011F39]'
                          : 'bg-[#FAF7F0] text-[#06294D] border border-[#DCE4EC]'
                          }`}
                      >
                        Tier 3
                      </span>
                      <span
                        className={`text-[10.5px] font-bold ${cadreTier === 'national' ? 'text-[#FAD465]' : 'text-[#34516D]'
                          }`}
                      >
                        {groupCounts.national} Posts
                      </span>
                    </div>
                    <div className={`text-xs font-bold leading-tight ${cadreTier === 'national' ? 'text-white' : 'text-[#011F39]'}`}>
                      National Level Posts
                    </div>
                    <div
                      className={`text-[10.5px] mt-0.5 leading-snug ${cadreTier === 'national' ? 'text-slate-200' : 'text-slate-500'
                        }`}
                    >
                      Legal, Minority, Woman, Political
                    </div>
                  </button>
                </div>
              </div>

              {/* Sub-header for Related Posts List */}
              <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-[#011F39] uppercase tracking-wide">
                <span>
                  2. Choose Post under{' '}
                  {cadreTier === 'district_state'
                    ? 'District & State Units'
                    : cadreTier === 'letter_pad'
                      ? 'Letter Pad Posts'
                      : 'National Level Post'}
                  :
                </span>
                <span className="text-[#34516D] lowercase font-medium">
                  {filteredCategories.length} {filteredCategories.length === 1 ? 'post' : 'posts'} available
                </span>
              </div>

              {/* Categorized List of Post Cards */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
                    No posts matched your search or category filter.
                  </div>
                ) : (
                  filteredCategories.map((c) => {
                    const isCurrent = c.id === categoryId;
                    const group = getCategoryGroup(c);
                    const groupBadge =
                      group === 'national'
                        ? 'National Council'
                        : group === 'letter_pad'
                          ? 'Letter Pad Dignitary'
                          : 'District & State';

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(c.id);
                          setShowPostPicker(false);
                        }}
                        className={`w-full p-2.5 sm:p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${isCurrent
                          ? 'bg-[#011F39] text-white border-[#011F39] ring-2 ring-[#011F39]/20 shadow-xs'
                          : 'bg-white hover:bg-[#FAF7F0] text-[#34516D] border-[#DCE4EC] hover:border-[#06294D]'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Selection Radio / Check Indicator */}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${isCurrent
                            ? 'border-[#FAD465] bg-[#FAD465] text-[#011F39]'
                            : 'border-slate-300 bg-slate-50'
                            }`}>
                            {isCurrent && <Check size={12} strokeWidth={3} />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span
                                className={`text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isCurrent
                                  ? 'bg-white/20 text-[#FAD465]'
                                  : 'bg-[#EDF2F7] text-[#06294D]'
                                  }`}
                              >
                                {groupBadge}
                              </span>
                              <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-[#011F39]'}`}>
                                {c.name}
                              </span>
                            </div>
                            <div className={`text-[11px] truncate ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                              {c.description || 'Standard Verification'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`text-xs font-black ${isCurrent ? 'text-[#FAD465]' : 'text-[#06294D]'}`}>
                            ₹{typeof c.fee === 'number' ? c.fee.toLocaleString('en-IN') : c.fee}
                          </div>
                          {isCurrent ? (
                            <span className="text-[10px] text-[#FAD465] font-bold block">✓ Selected</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 group-hover:text-[#06294D] block">Click to select</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Global Error Banner */}
            {serverError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* STEP 1: Personal Information Form */}
            {/* ═══════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar Sharma"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white transition focus:outline-none ${errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-[#DCE4EC] focus:border-[#06294D]'
                        }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white transition focus:outline-none ${errors.phone ? 'border-red-400 bg-red-50/20' : 'border-[#DCE4EC] focus:border-[#06294D]'
                        }`}
                    />
                    {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="member@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white transition focus:outline-none ${errors.email ? 'border-red-400 bg-red-50/20' : 'border-[#DCE4EC] focus:border-[#06294D]'
                        }`}
                    />
                    {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">
                      Educational Qualification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Graduate, Advocate, 10th Pass"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4EC] bg-white focus:outline-none focus:border-[#06294D] transition"
                    />
                  </div>
                </div>

                {/* Personal Details Sub-section */}
                <div className="pt-2 pb-24 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#011F39] mb-2.5">
                    Personal Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#718096] mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4EC] bg-white focus:outline-none focus:border-[#06294D] transition"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <CalendarDatePicker
                        label="Date of Birth"
                        value={dob}
                        onChange={(val) => setDob(val)}
                        placeholder="dd-mm-yyyy"
                        maxDate={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#718096] mb-1">Father / Guardian Name</label>
                      <input
                        type="text"
                        placeholder="Father's Name"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4EC] bg-white focus:outline-none focus:border-[#06294D] transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* STEP 2: Address Details Form */}
            {/* ═══════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-[#011F39]">Residential & Delivery Address</h4>
                  <p className="text-[11px] text-[#718096]">
                    Physical membership welcome kit and PVC smart card will be dispatched to this location.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#34516D] mb-1">
                    Street Address / House No. *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. House 42, Green Park Road, Sector 5"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                    }}
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white transition focus:outline-none ${errors.address ? 'border-red-400 bg-red-50/20' : 'border-[#DCE4EC] focus:border-[#06294D]'
                      }`}
                  />
                  {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setCity('');
                        if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
                      }}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4EC] bg-white focus:outline-none focus:border-[#06294D] transition"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">City / District *</label>
                    {citiesForState.length > 0 ? (
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                        }}
                        className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white transition focus:outline-none ${errors.city ? 'border-red-400 bg-red-50/20' : 'border-[#DCE4EC] focus:border-[#06294D]'
                          }`}
                      >
                        <option value="">Select City / District</option>
                        {citiesForState.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter City / District"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                        }}
                        className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white transition focus:outline-none ${errors.city ? 'border-red-400 bg-red-50/20' : 'border-[#DCE4EC] focus:border-[#06294D]'
                          }`}
                      />
                    )}
                    {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit PIN"
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPincode(val);
                        if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }));
                      }}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white transition focus:outline-none ${errors.pincode ? 'border-red-400 bg-red-50/20' : 'border-[#DCE4EC] focus:border-[#06294D]'
                        }`}
                    />
                    {errors.pincode && <p className="text-[11px] text-red-600 mt-1">{errors.pincode}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#34516D] mb-1">
                      Local Police Station (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Civil Lines Police Station"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4EC] bg-white focus:outline-none focus:border-[#06294D] transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* STEP 3: Documents, Verification & Pledge */}
            {/* ═══════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-[#011F39]">Document Verification & Pledge</h4>
                  <p className="text-[11px] text-[#718096]">
                    Upload verification documents (PDF, JPG, PNG up to 5MB) to complete member accreditation.
                  </p>
                </div>

                {/* 4 Document Upload Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Identity Proof */}
                  <div className="p-3 rounded-xl border border-[#DCE4EC] bg-[#FAF7F0]/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#011F39]">1. Identity Proof</span>
                        <span className="text-[10px] text-slate-400">Aadhaar, Voter ID, PAN</span>
                      </div>
                      {identityProofDoc ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                          <span className="truncate max-w-[170px]">{identityProofDoc.name}</span>
                          <button
                            type="button"
                            onClick={() => setIdentityProofDoc(null)}
                            className="text-red-600 hover:underline text-[10px] ml-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-[#DCE4EC] hover:border-[#06294D] rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-600 cursor-pointer bg-white transition">
                          <Upload size={13} className="text-[#06294D]" />
                          <span>Select Identity Proof File</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setIdentityProofDoc)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 2. Address Proof */}
                  <div className="p-3 rounded-xl border border-[#DCE4EC] bg-[#FAF7F0]/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#011F39]">2. Address Proof</span>
                        <span className="text-[10px] text-slate-400">Ration Card, Electricity</span>
                      </div>
                      {addressProofDoc ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                          <span className="truncate max-w-[170px]">{addressProofDoc.name}</span>
                          <button
                            type="button"
                            onClick={() => setAddressProofDoc(null)}
                            className="text-red-600 hover:underline text-[10px] ml-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-[#DCE4EC] hover:border-[#06294D] rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-600 cursor-pointer bg-white transition">
                          <Upload size={13} className="text-[#06294D]" />
                          <span>Select Address Proof File</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setAddressProofDoc)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 3. Qualification Proof */}
                  <div className="p-3 rounded-xl border border-[#DCE4EC] bg-[#FAF7F0]/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#011F39]">3. Qualification Proof</span>
                        <span className="text-[10px] text-slate-400">(Optional) Degree / 10th</span>
                      </div>
                      {qualificationDoc ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                          <span className="truncate max-w-[170px]">{qualificationDoc.name}</span>
                          <button
                            type="button"
                            onClick={() => setQualificationDoc(null)}
                            className="text-red-600 hover:underline text-[10px] ml-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-[#DCE4EC] hover:border-[#06294D] rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-600 cursor-pointer bg-white transition">
                          <Upload size={13} className="text-[#06294D]" />
                          <span>Select Qualification Proof File</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setQualificationDoc)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 4. Photograph */}
                  <div className="p-3 rounded-xl border border-[#DCE4EC] bg-[#FAF7F0]/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#011F39]">4. Photograph</span>
                        <span className="text-[10px] text-slate-400">Passport Photo</span>
                      </div>
                      {photoDoc ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                          <span className="truncate max-w-[170px]">{photoDoc.name}</span>
                          <button
                            type="button"
                            onClick={() => setPhotoDoc(null)}
                            className="text-red-600 hover:underline text-[10px] ml-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-[#DCE4EC] hover:border-[#06294D] rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-600 cursor-pointer bg-white transition">
                          <Upload size={13} className="text-[#06294D]" />
                          <span>Select Photograph File</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setPhotoDoc)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Administrative Controls & Member Summary */}
                <div className="p-3.5 rounded-xl border border-[#DCE4EC] bg-[#FAF7F0]/60 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
                    <span className="font-bold text-[#011F39]">Enrollment Candidate:</span>
                    <span className="font-semibold text-[#06294D]">
                      {fullName || 'Name not entered'} ({phone || 'No phone'})
                    </span>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#011F39]">
                    <input
                      type="checkbox"
                      checked={autoActivate}
                      onChange={(e) => setAutoActivate(e.target.checked)}
                      className="w-4 h-4 rounded text-[#06294D] accent-[#011F39]"
                    />
                    <span>Auto-Activate Membership Immediately</span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-[#34516D] mb-1">
                      Administrative Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enrolled directly at district headquarters camp..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#DCE4EC] bg-white focus:outline-none focus:border-[#06294D] transition"
                    />
                  </div>
                </div>

                {/* Mandatory Declarations & Member Pledge */}
                <div className="p-3.5 rounded-xl border border-[#DCE4EC] bg-white space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#06294D] block">
                    Mandatory Declarations &amp; Member Pledge
                  </span>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#34516D]">
                    <input
                      type="checkbox"
                      checked={agreedConstitution}
                      onChange={(e) => setAgreedConstitution(e.target.checked)}
                      className="w-4 h-4 rounded text-[#06294D] accent-[#011F39] mt-0.5"
                    />
                    <span>
                      I verify that the candidate agrees to the <strong>Terms &amp; Conditions</strong> and Constitution of HRSJM.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#34516D]">
                    <input
                      type="checkbox"
                      checked={agreedVerification}
                      onChange={(e) => setAgreedVerification(e.target.checked)}
                      className="w-4 h-4 rounded text-[#06294D] accent-[#011F39] mt-0.5"
                    />
                    <span>
                      I solemn pledge that the enrolled member agrees to uphold the Constitution of India and the human rights mission of HRSJM.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer Controls */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-[#DCE4EC] bg-[#FAF7F0] flex items-center justify-between gap-3 shrink-0">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-xl border border-[#DCE4EC] bg-white hover:bg-slate-100 text-xs font-bold text-[#34516D] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#DCE4EC] bg-white hover:bg-slate-100 text-xs font-bold text-[#718096] transition cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#718096] hidden sm:inline mr-2">
                Step {currentStep} of 3
              </span>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{currentStep === 1 ? 'Next: Address Details' : 'Next: Documents & Pledge'}</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Registering Member...' : 'Register Member'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
