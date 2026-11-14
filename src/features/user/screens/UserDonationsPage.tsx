import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Lock,
  ArrowRight,
  BookOpen,
  Scale,
  Users,
  CheckCircle,
  Receipt,
  X,
} from 'lucide-react';
import heroHomeImage from '@/assets/images/hero-home.webp';
import { assistanceService } from '../../admin/assistance/services/assistanceService';
import { donationsService } from '../../admin/donations/services/donationsService';
import { useUserAuth } from '../store/userAuthStore';
import { GlobalPaymentModal } from '../../payments';
import type { PaymentPayload, PaymentReceiptDetails } from '../../payments';
import type { Donation } from '../../admin/donations/types/donations.types';

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

interface UserDonationsPageProps {
  isMember?: boolean;
}

export const UserDonationsPage: React.FC<UserDonationsPageProps> = ({ isMember = false }) => {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedCause, setSelectedCause] = useState<string>('General Fund — HRSJM Mission');

  // Live approved causes from backend API
  const [causes, setCauses] = useState<any[]>([]);
  const [loadingCauses, setLoadingCauses] = useState(true);

  // Payment Modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload | null>(null);
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);

  // History Tab state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastDonations, setPastDonations] = useState<Donation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setLoadingCauses(true);
    assistanceService
      .listApproved({ limit: 100 })
      .then((approved) => {
        const liveCauses = (approved || []).map((a: any, idx: number) => {
          const reason = a.reason || a.title || a.purpose || 'Community Relief Initiative';
          const applicant = a.full_name || a.applicant_name || '';
          const title = applicant ? `${applicant} (${reason})` : reason;
          const rawDesc = String(a.description || a.reason_for_aid || '');
          const cleanDesc = rawDesc
            .replace(/\s*\[(Location|Urgency|Age):[^\]]+\]/gi, '')
            .trim();

          return {
            id: a.id || `live-${idx}`,
            title,
            description: cleanDesc || 'Verified humanitarian support cause.',
            icon: reason.toLowerCase().includes('educat') ? BookOpen : Scale,
            category: a.category || reason || 'Humanitarian Aid',
          };
        });
        setCauses(liveCauses);
      })
      .catch(() => {
        setCauses([]);
      })
      .finally(() => {
        setLoadingCauses(false);
      });
  }, []);

  const effectiveAmount =
    selectedAmount === 'custom' ? Number(customAmount) || 0 : selectedAmount;

  const handleOpenDonate = (causeTitle?: string) => {
    const targetCause = causeTitle || selectedCause;
    const finalAmount = effectiveAmount > 0 ? effectiveAmount : 500;

    const payload: PaymentPayload = {
      purpose: 'donation',
      amount: finalAmount,
      title: `Contribution: ${targetCause}`,
      subtitle: 'HRSJM Humanitarian Support & Relief',
      donorName: user?.full_name || 'Generous Supporter',
      donorEmail: user?.email || 'donor@hrsjm.org',
      donorMobile: user?.mobile_number || '9876543210',
    };

    setPaymentPayload(payload);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (receipt: PaymentReceiptDetails) => {
    setPaymentModalVisible(false);
    const donationRecord: Donation = {
      id: receipt.transactionId || `DON-${Date.now()}`,
      donor_name: user?.full_name || 'Generous Supporter',
      donor_mobile: user?.mobile_number || '9876543210',
      donor_email: user?.email || 'donor@hrsjm.org',
      amount: effectiveAmount > 0 ? effectiveAmount : 500,
      status: 'COMPLETED',
      cause: selectedCause,
      remark: 'Online Contribution',
      transaction_id: receipt.transactionId || `TXN-${Date.now()}`,
      payment_method: 'CASHFREE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCompletedDonation(donationRecord);
  };

  const handleLoadHistory = async () => {
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const list = await donationsService.getMyDonations();
      setPastDonations(list || []);
    } catch {
      setPastDonations([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Hero Banner: Exact 1:1 match to APK (image of girl in sunlight) */}
      <div className="relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[280px] flex flex-col justify-end p-6 sm:p-10 shadow-lg bg-[#06294D]">
        <img
          src={heroHomeImage}
          alt="Donate Now - HRSJM"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06294D] via-[#06294D]/75 to-[#06294D]/35" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl">
          <div className="w-10 h-1 bg-[#FAD465] rounded-full mb-3" />
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-tight">
            Donate Now
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Your support can help advance human rights, education and stronger communities.
          </p>
        </div>
      </div>

      {/* Success Notification if donation just completed */}
      {completedDonation && (
        <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-md text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle size={28} />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment Successful
            </span>
            <h2 className="text-xl font-bold font-serif text-[#06294D] mt-2">
              Thank You for Your Generous Contribution!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your donation of <strong className="text-slate-800">₹{completedDonation.amount.toLocaleString('en-IN')}</strong> will directly empower vulnerable citizens and fund grassroots legal aid.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setCompletedDonation(null)}
              className="px-4 py-2 rounded-xl bg-[#06294D] text-white text-xs font-bold cursor-pointer"
            >
              Make Another Donation
            </button>
            <button
              type="button"
              onClick={handleLoadHistory}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              View My Receipts
            </button>
          </div>
        </div>
      )}

      {/* 2. Overview Section */}
      <div className="space-y-1.5">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#06294D]">
          Your Contribution Creates Change
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          Every contribution can support efforts towards awareness, education and community initiatives. Please review the available donation information before proceeding.
        </p>
      </div>

      {/* 3. Choose Donation Amount */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-[#06294D]">
          Choose Donation Amount
        </h3>

        {/* Amount Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = selectedAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-[#06294D] text-white border-[#06294D] shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedAmount('custom')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
              selectedAmount === 'custom'
                ? 'bg-[#06294D] text-white border-[#06294D] shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Input */}
        {selectedAmount === 'custom' && (
          <div className="pt-2 max-w-sm space-y-1.5 animate-in fade-in">
            <label className="block text-xs font-semibold text-slate-600">
              Enter Custom Donation Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-slate-500">₹</span>
              <input
                type="number"
                min="10"
                placeholder="Enter amount (e.g. 2500)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-[#06294D] focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
              />
            </div>
            {Number(customAmount) > 0 && (
              <p className="text-[11px] text-amber-700 font-semibold">
                Amount: ₹{Number(customAmount).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        )}

        {/* Donate Now Button */}
        <button
          type="button"
          onClick={() => handleOpenDonate()}
          disabled={selectedAmount === 'custom' && (!customAmount || Number(customAmount) < 10)}
          className="w-full py-3.5 px-6 rounded-xl bg-[#FAD465] hover:bg-[#e6c152] disabled:opacity-50 text-[#06294D] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer mt-3"
        >
          <span>
            Donate Now · ₹{effectiveAmount > 0 ? effectiveAmount.toLocaleString('en-IN') : '500'}
          </span>
          <ArrowRight size={16} />
        </button>

        {/* Secure Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
          <Lock size={13} className="text-slate-400" />
          <span>Secure 256-bit encrypted donation. Eligible for 80G tax benefit.</span>
        </div>
      </div>

      {/* 4. Select a Cause to Support */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#06294D]">
            Select a Cause to Support
          </h2>
          <button
            type="button"
            onClick={() => {
              if (isMember) {
                navigate('/member/causes');
              } else {
                navigate('/causes');
              }
            }}
            className="text-xs sm:text-sm font-bold text-[#06294D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Causes</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Cause Cards Grid */}
        {loadingCauses ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs font-semibold text-slate-500">
            Loading verified aid causes...
          </div>
        ) : causes.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
            No active relief causes available right now.
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {causes.slice(0, 4).map((cause) => {
            const Icon = cause.icon || Heart;
            return (
              <div
                key={cause.id}
                onClick={() => {
                  setSelectedCause(cause.title);
                  handleOpenDonate(cause.title);
                }}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#B45309] mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#06294D] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                    {cause.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">
                    {cause.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    {cause.category || 'Humanitarian Cause'}
                  </span>
                  <span className="text-xs font-bold text-[#06294D] group-hover:underline flex items-center gap-1">
                    Support Cause →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* 5. Where Your Donation Helps */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#06294D]">
            Where Your Donation Helps
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            100% transparent deployment into verified human rights initiatives
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#06294D] mb-2.5">
              <BookOpen size={16} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[#06294D]">Awareness & Education</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Support learning initiatives and constitutional literacy camps.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-2.5">
              <Users size={16} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[#06294D]">Community Outreach</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Support approved grassroots outreach and volunteer programs.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-2.5">
              <Scale size={16} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[#06294D]">Rights Protection</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Help marginalized citizens access free legal aid and counsel.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-2.5">
              <Heart size={16} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[#06294D]">Emergency Relief</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Direct humanitarian aid for families facing acute distress.
            </p>
          </div>
        </div>

        {/* Tax Exemption Banner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Receipt size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#06294D]">
                80G Tax Exemption Certificate
              </h4>
              <p className="text-[11px] text-slate-500">
                All donations to HRSJM are eligible for 50% deduction under Section 80G of the Income Tax Act.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadHistory}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#06294D] shrink-0 cursor-pointer"
          >
            View Past Receipts
          </button>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {paymentPayload && (
        <GlobalPaymentModal
          isOpen={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          payload={paymentPayload}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Donation History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-[#06294D]">
                <Receipt size={18} />
                <span>My Donation Receipts & 80G Tax Proofs</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {loadingHistory ? (
                <div className="text-center py-8 text-xs text-slate-400">Loading donation history...</div>
              ) : pastDonations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No donation records found for your account yet.
                </div>
              ) : (
                pastDonations.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#06294D] text-sm">
                        ₹{d.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{d.cause || 'General Donation'}</p>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                        {d.transaction_id || d.id} • {new Date(d.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      80G Verified
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-[#06294D] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
