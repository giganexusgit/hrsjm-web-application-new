import React, { useState } from 'react';
import { User, Phone, Mail, Shield, Camera, Upload, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { CalendarDatePicker } from '../../../../components/common/CalendarDatePicker';

export interface Step1FormData {
  fullName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  policeStation: string;
  password?: string;
  confirmPassword?: string;
  occupation?: string;
  photoUrl?: string;
}

interface MembershipStep1Props {
  initialData: Step1FormData;
  onNext: (data: Step1FormData) => void;
  onBack: () => void;
}

export const MembershipStep1: React.FC<MembershipStep1Props> = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<Step1FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(initialData.photoUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setPhotoPreview(base64Url);
        setFormData(prev => ({ ...prev, photoUrl: base64Url }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Full legal name must be at least 3 characters.';
    }

    if (!formData.dob) {
      errs.dob = 'Date of birth is required.';
    } else {
      const age = calculateAge(formData.dob);
      if (age < 18) {
        errs.dob = 'Applicant must be at least 18 years of age to apply.';
      }
    }

    if (!formData.gender) {
      errs.gender = 'Please select a gender.';
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      errs.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.policeStation.trim() || formData.policeStation.trim().length < 3) {
      errs.policeStation = 'Nearby police station is required for mandatory verification.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
          Step 1 of 3
        </span>
        <h2 className="text-xl font-black text-[#06294D]">Personal Details &amp; Identification</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide your legal identity and credentials matching your official government ID.
        </p>
      </div>

      {/* Photo Upload Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
          {photoPreview ? (
            <img src={photoPreview} alt="Applicant preview" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-slate-300" />
          )}
          <label
            htmlFor="profile-upload"
            className="absolute inset-0 bg-black/40 hover:bg-black/50 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
          >
            <Camera className="w-5 h-5 mb-0.5" />
            <span>Upload</span>
          </label>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <label htmlFor="profile-upload" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#D4A416] text-xs font-black text-[#011F39] border border-[#E9B82E] cursor-pointer shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{photoPreview ? 'Change Applicant Photo' : 'Upload Passport Photo'}</span>
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <p className="text-[11px] text-slate-500">
            JPG or PNG format. Clear front-facing photo on a light background.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Full Legal Name (as per Aadhaar / ID) *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Mohd. Ayaan Shaikh"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
            />
          </div>
          {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <CalendarDatePicker
            label="Date of Birth"
            required
            minAge={18}
            value={formData.dob}
            error={errors.dob}
            placeholder="dd-mm-yyyy"
            onChange={(selectedVal) => {
              setFormData((prev) => ({ ...prev, dob: selectedVal }));
              if (errors.dob) {
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.dob;
                  return updated;
                });
              }
            }}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Gender *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Male', 'Female', 'Other'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setFormData({ ...formData, gender: g })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  formData.gender === g
                    ? 'bg-[#06294D] text-[#FAD465] border-[#06294D] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <p className="text-[11px] text-rose-600 mt-1">{errors.gender}</p>}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Mobile Number (10 Digits) *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              required
              value={formData.mobile}
              onChange={e => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
            />
          </div>
          {errors.mobile && <p className="text-[11px] text-rose-600 mt-1">{errors.mobile}</p>}
        </div>

        {/* Email Address */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. member@hrsjm.org"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password || ''}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter secure password (min 6 chars)"
              className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword || ''}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Police Station (Full width) */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Nearby Police Station (Mandatory for Character Verification) *
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={formData.policeStation}
              onChange={e => setFormData({ ...formData, policeStation: e.target.value })}
              placeholder="e.g. Azad Maidan Police Station, Mumbai"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
            />
          </div>
          {errors.policeStation && <p className="text-[11px] text-rose-600 mt-1">{errors.policeStation}</p>}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-relaxed">
         Your password will be used to log in to your Member Portal once approved.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          ← Back to Categories
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#D4A416] text-[#011F39] text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center gap-2 border border-[#E9B82E]"
        >
          <span>Continue to Address &amp; ID (Step 2)</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
};
