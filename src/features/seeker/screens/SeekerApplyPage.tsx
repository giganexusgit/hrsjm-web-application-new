import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Trash2,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  Waves,
  Utensils,
  Accessibility,
  Home,
  MoreHorizontal,
  Info,
  PhoneCall,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { useSeekerStore } from '../store/seekerStore';
import { useAuth } from '../../auth/store/authStore';
import type { AssistanceRequest } from '../types/seeker.types';

interface AttachedDoc {
  id: string;
  category: string;
  fileName: string;
  fileSize: string;
  file?: File;
}

const CAUSE_OPTIONS = [
  { key: 'Medical Emergency', label: 'Medical Emergency', desc: 'Surgeries, ICU, medicines & critical care', icon: Stethoscope },
  { key: 'Education & Tuition', label: 'Education & Tuition', desc: 'School/college fees, exam fees & textbooks', icon: GraduationCap },
  { key: 'Disaster Relief', label: 'Disaster Relief', desc: 'Flood, fire, house collapse & calamity aid', icon: Waves },
  { key: 'Livelihood & Food', label: 'Livelihood & Food', desc: 'Ration kits, small vendor grants & living relief', icon: Utensils },
  { key: 'Disability Support', label: 'Disability Support', desc: 'Wheelchairs, prosthetics & caregiver support', icon: Accessibility },
  { key: 'Housing / Shelter', label: 'Housing & Shelter', desc: 'Emergency rent distress & temporary shelter', icon: Home },
  { key: 'Other', label: 'Other Specific Cause', desc: 'Specialized legal, humanitarian or social welfare', icon: MoreHorizontal },
];

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const URGENCY_LEVELS = [
  {
    key: 'NORMAL',
    label: 'Normal',
    sub: '7-10 Days',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    key: 'MEDIUM',
    label: 'Medium Priority',
    sub: '3-5 Days',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    key: 'HIGH',
    label: 'High Priority',
    sub: '24-48 Hours',
    color: '#F97316',
    bg: '#FFF7ED',
    border: '#FED7AA',
  },
  {
    key: 'CRITICAL',
    label: 'Critical Emergency',
    sub: 'Immediate',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
  },
];

const SEEKER_DOC_CATEGORIES = [
  'Aadhaar / ID Proof',
  'Medical Report / Hospital Bill',
  'Income / Ration Card',
  'Tuition / School Fee Slip',
  'Other Document',
];

export const SeekerApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRequest } = useSeekerStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [mobile, setMobile] = useState(user?.mobile_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  const [selectedCause, setSelectedCause] = useState<string>('Medical Emergency');
  const [customCause, setCustomCause] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('25000');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([]);
  const [docCategory, setDocCategory] = useState<string>('Aadhaar / ID Proof');
  const [customDocName, setCustomDocName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRequest, setSubmittedRequest] = useState<AssistanceRequest | null>(null);

  const handleGoBack = () => {
    navigate('/seeker/requests');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full legal name is required (min 2 characters).';
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      errs.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (selectedCause === 'Other' && !customCause.trim()) {
      errs.customCause = 'Please specify the custom aid purpose/reason.';
    }

    const amt = parseFloat(requestedAmount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) {
      errs.requestedAmount = 'Please enter a valid amount greater than ₹0.';
    }

    if (attachedDocs.length === 0) {
      errs.documents = 'Please attach at least 1 supporting document (Aadhaar, hospital bill, or fee receipt).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const finalDocName =
      docCategory === 'Other Document'
        ? customDocName.trim() || 'Supporting Document'
        : docCategory;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const newDoc: AttachedDoc = {
      id: `doc-${Date.now()}`,
      category: finalDocName,
      fileName: file.name,
      fileSize: `${sizeInMb} MB`,
      file,
    };

    setAttachedDocs((prev) => [...prev, newDoc]);
    setErrors((prev) => ({ ...prev, documents: '' }));
    e.target.value = '';
  };

  const removeDoc = (id: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const amt = parseFloat(requestedAmount.replace(/,/g, ''));
    const finalReason = selectedCause === 'Other' ? customCause.trim() : selectedCause;

    try {
      const created = await createRequest({
        full_name: fullName.trim(),
        mobile: mobile.replace(/\D/g, ''),
        email: email.trim() || undefined,
        requested_amount: amt,
        reason: finalReason,
        description: description.trim() || undefined,
        status: 'UNDER_REVIEW',
        documents: attachedDocs.map((d) => ({
          document_name: d.category,
          file_name: d.fileName,
          file_size: d.fileSize,
          file: d.file,
        })),
      });

      setSubmittedRequest(created);
    } catch (err: any) {
      setErrors({ form: err?.message || 'Submission failed. Please check details and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-[#DCE4EC] px-6 py-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-10 h-10 rounded-xl bg-[#EDF2F7] hover:bg-[#DBE5EE] active:scale-95 flex items-center justify-center text-[#06294D] transition cursor-pointer shrink-0"
            title="Return to Aid Tracker"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                Official Welfare Application
              </span>
              <span className="text-xs text-[#718096] hidden sm:inline">•</span>
              <span className="text-xs text-[#718096] hidden sm:inline">100% Free & Transparent</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52] mt-0.5 leading-tight">
              Apply for Humanitarian Assistance
            </h1>
            <p className="text-xs text-[#718096] mt-0.5">
              Submit an official aid application for verified review, field assessment, and relief fund sanction.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/seeker/requests"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DBE5EE] text-[#0B2F52] hover:bg-[#EDF2F7] text-xs font-bold transition"
          >
            <FileText size={14} className="text-[#0D47A1]" />
            <span>My Applications</span>
          </Link>
          <a
            href="tel:+919888880004"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#06294D] text-xs font-bold rounded-xl transition"
          >
            <PhoneCall size={14} className="text-[#10B981]" />
            <span>24×7 Helpline</span>
          </a>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: FORM + SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: APPLICATION FORM */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 shadow-xs">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
                <div>
                  <div className="font-bold">Submission Error</div>
                  <p className="mt-0.5 leading-relaxed">{errors.form}</p>
                </div>
              </div>
            )}

            {/* SECTION 1: APPLICANT INFORMATION */}
            <div className="bg-white rounded-2xl border border-[#DCE4EC] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#06294D] text-[#FAD465] flex items-center justify-center text-xs font-bold">
                    01
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#0B2F52] uppercase tracking-wide">
                      Applicant Information
                    </h2>
                    <p className="text-[11px] text-[#718096]">
                      Primary contact details for verification and status updates
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> Auto-filled from Profile
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Applicant's full name as per Aadhaar"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FAD465] focus:border-transparent transition"
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FAD465] focus:border-transparent transition"
                    />
                  </div>
                  {errors.mobile && <p className="text-[11px] text-rose-600 mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                    Email Address <span className="text-[#718096] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FAD465] focus:border-transparent transition"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                    Residential Location / City
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, District, State"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FAD465] focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: CAUSE & ASSISTANCE TYPE */}
            <div className="bg-white rounded-2xl border border-[#DCE4EC] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#06294D] text-[#FAD465] flex items-center justify-center text-xs font-bold">
                    02
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#0B2F52] uppercase tracking-wide">
                      Assistance Cause & Relief Category <span className="text-rose-500">*</span>
                    </h2>
                    <p className="text-[11px] text-[#718096]">
                      Select the primary domain of aid needed
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CAUSE_OPTIONS.map((c) => {
                  const Icon = c.icon;
                  const isSelected = selectedCause === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setSelectedCause(c.key)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#06294D] text-white border-[#06294D] shadow-sm'
                          : 'bg-[#FAF7F0] hover:bg-[#EDF2F7] text-[#0B2F52] border-[#DCE4EC]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/15 text-[#FAD465]' : 'bg-white text-[#06294D] shadow-2xs'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#FAD465]" />
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#0B2F52]'}`}>
                          {c.label}
                        </div>
                        <div className={`text-[10px] mt-1 leading-snug line-clamp-2 ${isSelected ? 'text-[#DCE4EC]' : 'text-[#718096]'}`}>
                          {c.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCause === 'Other' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                    Specify Custom Cause / Purpose <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCause}
                    onChange={(e) => setCustomCause(e.target.value)}
                    placeholder="e.g. Legal assistance for unlawful tenancy eviction"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] focus:outline-none focus:ring-2 focus:ring-[#FAD465] transition"
                  />
                  {errors.customCause && <p className="text-[11px] text-rose-600 mt-1">{errors.customCause}</p>}
                </div>
              )}
            </div>

            {/* SECTION 3: REQUESTED AMOUNT & URGENCY */}
            <div className="bg-white rounded-2xl border border-[#DCE4EC] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#06294D] text-[#FAD465] flex items-center justify-center text-xs font-bold">
                    03
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#0B2F52] uppercase tracking-wide">
                      Requested Aid Amount & Urgency Level <span className="text-rose-500">*</span>
                    </h2>
                    <p className="text-[11px] text-[#718096]">
                      Enter amount needed and assessment timeframe
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                  Requested Aid Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-lg font-bold text-[#06294D]">₹</span>
                  <input
                    type="text"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 25000"
                    className="w-full pl-9 pr-4 py-2.5 text-lg font-extrabold bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] focus:outline-none focus:ring-2 focus:ring-[#FAD465] transition"
                  />
                </div>
                {errors.requestedAmount && <p className="text-[11px] text-rose-600 mt-1">{errors.requestedAmount}</p>}

                {/* Amount Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="text-[11px] text-[#718096] font-medium mr-1">Quick Select:</span>
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRequestedAmount(String(amt))}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition cursor-pointer ${
                        requestedAmount === String(amt)
                          ? 'bg-[#06294D] text-[#FAD465] border-[#06294D] shadow-xs'
                          : 'bg-[#FAF7F0] text-[#34516D] border-[#DCE4EC] hover:bg-[#EDF2F7]'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#0B2F52] mb-2">
                  Urgency Assessment Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {URGENCY_LEVELS.map((u) => {
                    const isSelected = urgency === u.key;
                    return (
                      <button
                        key={u.key}
                        type="button"
                        onClick={() => setUrgency(u.key)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-[#06294D] ring-2 ring-[#06294D]/25 shadow-xs'
                            : 'border-[#DCE4EC] hover:bg-[#FAF7F0]'
                        }`}
                        style={{
                          backgroundColor: isSelected ? u.bg : '#FFFFFF',
                        }}
                      >
                        <span className="text-xs font-bold leading-tight" style={{ color: u.color }}>
                          {u.label}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5">
                          {u.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 4: HARDSHIP BACKGROUND */}
            <div className="bg-white rounded-2xl border border-[#DCE4EC] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#06294D] text-[#FAD465] flex items-center justify-center text-xs font-bold">
                    04
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#0B2F52] uppercase tracking-wide">
                      Circumstances & Ground Situation
                    </h2>
                    <p className="text-[11px] text-[#718096]">
                      Describe the situation, family condition, and why aid is urgently required
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                  Case Description & Hardship Background
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the applicant hardship: patient condition, monthly household income, breadwinner employment status, hospital or school name, and how the sanctioned grant will be utilized..."
                  className="w-full px-4 py-3 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FAD465] transition leading-relaxed"
                />
              </div>
            </div>

            {/* SECTION 5: SUPPORTING DOCUMENTS */}
            <div className="bg-white rounded-2xl border border-[#DCE4EC] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#06294D] text-[#FAD465] flex items-center justify-center text-xs font-bold">
                    05
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#0B2F52] uppercase tracking-wide">
                      Supporting Verification Documents <span className="text-rose-500">*</span>
                    </h2>
                    <p className="text-[11px] text-[#718096]">
                      Upload government ID, hospital estimate, fee receipt, or ration card
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                      Select Document Type
                    </label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                    >
                      {SEEKER_DOC_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {docCategory === 'Other Document' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#0B2F52] mb-1.5">
                        Custom Document Title
                      </label>
                      <input
                        type="text"
                        value={customDocName}
                        onChange={(e) => setCustomDocName(e.target.value)}
                        placeholder="e.g. Village Sarpanch / MLA Letter"
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#DCE4EC] rounded-xl text-[#0B2F52] focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                      />
                    </div>
                  )}
                </div>

                {/* Upload Drag/Click Zone */}
                <label className="border-2 border-dashed border-[#DCE4EC] hover:border-[#06294D] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#FAF7F0] hover:bg-[#EDF2F7] cursor-pointer transition group">
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-[#06294D] group-hover:scale-110 transition mb-2">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-xs font-bold text-[#0B2F52]">
                    Click or Drag to Upload Supporting Document
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1 max-w-sm">
                    Accepted formats: PDF, JPG, PNG (Max 10 MB per file)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {errors.documents && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.documents}
                  </p>
                )}

                {/* Attached Documents List */}
                {attachedDocs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck size={13} className="text-emerald-600" />
                      <span>Attached Files ({attachedDocs.length})</span>
                    </div>
                    {attachedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-3 truncate pr-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EDF2F7] flex items-center justify-center text-[#0D9488] shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-[#0B2F52] truncate">{doc.category}</div>
                            <div className="text-[11px] text-gray-500 truncate">
                              {doc.fileName} • <span className="font-medium text-[#06294D]">{doc.fileSize}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(doc.id)}
                          className="w-8 h-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer shrink-0"
                          title="Remove file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FORM FOOTER ACTIONS */}
            <div className="bg-white rounded-2xl border border-[#DCE4EC] p-4 shadow-xs flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGoBack}
                className="px-5 py-2.5 rounded-xl border border-[#DBE5EE] hover:bg-[#EDF2F7] text-[#34516D] font-bold text-xs transition cursor-pointer"
              >
                Cancel / Return
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-2.5 bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#C9971A] text-[#011F39] font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>{submitting ? 'Registering Application...' : 'Submit Aid Application'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: VERIFICATION GUIDE & REQUIREMENTS SIDEBAR */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. VERIFICATION WORKFLOW CARD */}
          <div className="bg-white rounded-2xl border border-[#DCE4EC] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EDF2F7]">
              <ShieldCheck size={18} className="text-[#0D9488]" />
              <h3 className="text-xs font-bold text-[#0B2F52] uppercase tracking-wider">
                Verification & Approval Workflow
              </h3>
            </div>

            <ol className="space-y-3.5 text-xs">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#06294D] text-[#FAD465] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-bold text-[#0B2F52]">Immediate Registration</div>
                  <p className="text-[11px] text-[#718096] mt-0.5 leading-relaxed">
                    Application assigned an official reference number (<span className="font-mono font-semibold">ASST-XXXXXXXX</span>).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#06294D] text-[#FAD465] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-bold text-[#0B2F52]">Secretariat KYC Audit</div>
                  <p className="text-[11px] text-[#718096] mt-0.5 leading-relaxed">
                    Identity, hospital estimate, and institution credentials verified within 24–48 hours.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#06294D] text-[#FAD465] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-bold text-[#0B2F52]">Ground Field Assessment</div>
                  <p className="text-[11px] text-[#718096] mt-0.5 leading-relaxed">
                    HRSJM district social worker validates applicant living conditions and emergency urgency.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#06294D] text-[#FAD465] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <div className="font-bold text-[#0B2F52]">Grant Approval & Relief</div>
                  <p className="text-[11px] text-[#718096] mt-0.5 leading-relaxed">
                    Official sanction issued, published to 80G verified donor portal or directly disbursed.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* 2. REQUIRED DOCUMENTS CHECKLIST */}
          <div className="bg-[#FAF7F0] rounded-2xl border border-[#DCE4EC] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2F52] uppercase tracking-wider">
              <Info size={15} className="text-[#0D47A1]" />
              <span>Recommended Documents</span>
            </div>

            <ul className="space-y-2 text-[11px] text-[#34516D]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                <span>Government ID (Aadhaar, Voter ID, Ration Card)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                <span>Doctor diagnosis report or hospital estimate</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                <span>School / College fee challan or demand note</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                <span>BPL / Income certificate (if available)</span>
              </li>
            </ul>
          </div>

          {/* 3. ASSISTANCE HELPLINE BANNER */}
          <div className="bg-white rounded-2xl border border-[#DCE4EC] p-5 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold text-[#0B2F52] uppercase tracking-wider">
              Need Help Filing Application?
            </h4>
            <p className="text-[11px] text-[#718096] leading-relaxed">
              If you lack scanning facilities or need assistance filling details, contact our community desk:
            </p>
            <div className="pt-1 space-y-1.5">
              <div className="text-xs font-bold text-[#06294D] flex items-center gap-2">
                <PhoneCall size={13} className="text-emerald-600" />
                <span>+91 98888 80004 / 1800-HRSJM</span>
              </div>
              <div className="text-xs text-[#718096] flex items-center gap-2">
                <Mail size={13} className="text-[#0D47A1]" />
                <span>support@hrsjm.org</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {submittedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
                Application Successfully Registered
              </span>
              <h3 className="text-xl font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52] mt-2">
                Assistance Request Logged!
              </h3>
              <div className="mt-2.5 inline-block px-4 py-1.5 bg-[#EDF2F7] rounded-xl font-mono text-sm font-bold text-[#06294D] border border-[#DBE5EE]">
                ASST-{submittedRequest.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

            <p className="text-xs text-[#34516D] leading-relaxed">
              Your assistance request for <span className="font-bold text-[#0B2F52]">₹{Number(submittedRequest.requested_amount).toLocaleString('en-IN')}</span> has been submitted to the HRSJM Secretariat and assigned for field investigation.
            </p>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/seeker/requests"
                className="w-full py-2.5 bg-[#06294D] hover:bg-[#123F68] text-[#FAD465] text-xs font-bold rounded-xl transition text-center shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Track in Aid Applications Tracker</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/seeker/home"
                className="w-full py-2.5 bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#0B2F52] text-xs font-bold rounded-xl transition text-center"
              >
                Back to Home Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
