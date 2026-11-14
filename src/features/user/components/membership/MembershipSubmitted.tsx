import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Award,
  Copy,
  Check,
  Download,
  ArrowRight,
  ShieldCheck,
  MapPin,
  LayoutDashboard,
} from 'lucide-react';
import type { MembershipPostData } from '../../data/membershipCategoriesData';
import type { Step1FormData } from './MembershipStep1';
import type { Step2FormData } from './MembershipStep2';

interface MembershipSubmittedProps {
  applicationId: string;
  selectedPost: MembershipPostData;
  step1Data: Step1FormData;
  step2Data: Step2FormData;
  onGoToStatus: () => void;
  onReset: () => void;
}

export const MembershipSubmitted: React.FC<MembershipSubmittedProps> = ({
  applicationId,
  selectedPost,
  step1Data,
  step2Data,
  onGoToStatus,
  onReset,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-3 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Payment Completed & Verified
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#06294D]">
            Membership Application Submitted!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Your application for <strong className="text-slate-800">{selectedPost.postName}</strong> has been officially logged with the State Credentials Committee.
          </p>
        </div>

        {/* Tracking ID Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Application Ref ID:</span>
          <span className="text-sm font-black text-[#06294D] font-mono">{applicationId}</span>
          <button
            type="button"
            onClick={handleCopyId}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            title="Copy ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3-Stage Verification Pipeline (Exact APK clone) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#06294D] uppercase tracking-wider">
          Verification Pipeline
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Stage 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Application & Fee</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Fee paid ({selectedPost.fee}) and KYC documents received.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>2. State Verification</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Dispatched to {step2Data.state || 'Maharashtra'} Chapter & {step1Data.policeStation}.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>3. Appointment Clearance</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Official appointment letter and credentials dispatch post council approval.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#06294D] uppercase tracking-wider pb-2 border-b border-slate-200">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Application Summary</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Applicant Name</span>
            <span className="font-bold text-slate-800">{step1Data.fullName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Designation</span>
            <span className="font-bold text-slate-800">{selectedPost.postName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">State & City</span>
            <span className="font-bold text-slate-800">{step2Data.city}, {step2Data.state}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Validity</span>
            <span className="font-bold text-emerald-700">{selectedPost.validity}</span>
          </div>
        </div>
      </div>

      {/* Kit Dispatch Notice */}
      <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-950">
        <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-relaxed">
          The Welcome Kit including your <strong>Appointment Letter, Certificate, Lanyard & Sticker</strong> will be dispatched to <em>{step2Data.addressLine1}, {step2Data.city} - {step2Data.pincode}</em> once state scrutiny is finalized.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Acknowledgement PDF</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            All Categories
          </button>
          <button
            type="button"
            onClick={onGoToStatus}
            className="px-5 py-2.5 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#D4A416] text-[#011F39] text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#E9B82E]"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Go to My Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/user/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#011F39] hover:bg-[#06294D] text-[#FAD465] text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Go to User Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
