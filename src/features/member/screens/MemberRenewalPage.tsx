import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Download,
  Building2,
  QrCode,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { useCurrentMember } from '../store/memberStore';
import { MEMBER_RENEWAL_PACKAGES } from '../data/memberFixtures';
import type { RenewalPackageOption, MemberPassbookEntry } from '../types/member.types';
import { generateMemberCertificatePdf } from '../utils/memberDocumentGenerator';
import { GlobalPaymentModal, cashfreeService } from '../../payments';

export const MemberRenewalPage: React.FC = () => {
  const { member, processRenewal, setDevMemberState } = useCurrentMember();

  const [selectedPackageId, setSelectedPackageId] = useState<string>('standard_1yr');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'CASHFREE'>('CASHFREE');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCashfreeModalOpen, setIsCashfreeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<MemberPassbookEntry | null>(null);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(member.fullName);

  // Selected package details
  const selectedPackage: RenewalPackageOption =
    MEMBER_RENEWAL_PACKAGES.find((p) => p.id === selectedPackageId) || MEMBER_RENEWAL_PACKAGES[0];

  // Calculate new proposed expiration based on member's validity
  const proposedExpiryStr = React.useMemo(() => {
    const baseDate = new Date(member.validUpto);
    baseDate.setFullYear(baseDate.getFullYear() + selectedPackage.durationYears);
    return baseDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [member.validUpto, selectedPackage.durationYears]);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText('hrsjm.central@icici');
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const cleanPhone = (member.phone || '').replace(/\D/g, '').slice(-10) || '7021057853';
      const cleanEmail = member.email || 'member@hrsjm.org';
      const cleanName = member.fullName || 'HRSJM Member';

      // 1. Create official membership renewal order on Cashfree PG
      const session = await cashfreeService.createMembershipOrder({
        applicationId: member.id,
        membershipPaymentId: `REN-${member.id.slice(-6)}-${selectedPackage.id}`,
        amount: selectedPackage.fee,
        customerName: cleanName,
        customerMobile: cleanPhone,
        customerEmail: cleanEmail,
        membershipType: `Membership Renewal: ${selectedPackage.name}`,
        userId: member.id,
      });

      // 2. Launch Cashfree native drop-in checkout overlay
      await cashfreeService.launchCashfreeCheckout(
        session,
        async (verifyRes) => {
          const txnId = verifyRes.transaction_id || `CF_REN_${Date.now()}`;
          const res = await processRenewal(selectedPackage.id, 'CASHFREE', txnId);
          if (res.success) {
            setLatestReceipt({
              ...res.receipt,
              transactionId: txnId,
              orderId: session.order_id,
            } as any);
            setIsSuccessModalOpen(true);
          }
          setIsProcessing(false);
        },
        () => {
          setIsProcessing(false);
        }
      );
    } catch (err: any) {
      console.warn('Direct Cashfree launch fallback:', err);
      // Fallback: If direct SDK drop-in throws, open the robust GlobalPaymentModal
      setIsCashfreeModalOpen(true);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Dev Mode State Toggler */}
      <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Interactive Expiry Simulation:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDevMemberState('active')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              member.status === 'ACTIVE'
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            Active (56 Days Left)
          </button>
          <button
            type="button"
            onClick={() => setDevMemberState('expiring')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              member.status === 'EXPIRING_SOON'
                ? 'bg-amber-600 text-white'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            Expiring Soon (18 Days Left)
          </button>
          <button
            type="button"
            onClick={() => setDevMemberState('expired')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              member.status === 'EXPIRED'
                ? 'bg-rose-600 text-white'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            Expired (-36 Days Overdue)
          </button>
        </div>
      </div>

      {/* Hero: Current Validity Status Banner */}
      <div
        className={`rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden border ${
          member.isExpired
            ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-rose-500/40'
            : member.isExpiringSoon
            ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-500/40'
            : 'bg-gradient-to-r from-[#011F39] via-[#06294D] to-[#011F39] border-[#FAD465]/30'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20">
              {member.isExpired ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300">Membership Term Expired</span>
                </>
              ) : member.isExpiringSoon ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-amber-200">Renewal Window Open (Grace Period Active)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-200">Active Membership Status</span>
                </>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold font-['Playfair_Display',Georgia,serif] tracking-tight text-white !text-white" style={{ color: '#FFFFFF' }}>
              Membership Renewal & Extension Center
            </h1>

            <p className="text-xs md:text-sm text-slate-200 max-w-xl leading-relaxed">
              Maintain unbroken human rights credentials, preserve your voting delegation, and extend your official photo ID card validity online.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-slate-300 block text-[11px]">Member ID:</span>
                <span className="font-mono font-bold text-white">{member.membershipNumber}</span>
              </div>
              <div className="border-l border-white/20 pl-4">
                <span className="text-slate-300 block text-[11px]">Designation:</span>
                <span className="font-semibold text-white">{member.categoryTitle}</span>
              </div>
              <div className="border-l border-white/20 pl-4">
                <span className="text-slate-300 block text-[11px]">Current Expiration Date:</span>
                <span className="font-bold text-[#FAD465]">
                  {new Date(member.validUpto).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Countdown & Grace Notice */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-center md:min-w-[200px] shrink-0">
            <div className="text-3xl md:text-4xl font-black text-[#FAD465] font-mono">
              {member.daysRemaining > 0 ? member.daysRemaining : Math.abs(member.daysRemaining)}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">
              {member.daysRemaining > 0 ? 'Days Remaining' : 'Days Overdue'}
            </div>
            <div className="mt-3 text-[11px] text-slate-300 border-t border-white/15 pt-2">
              30-day grace period without identity re-verification
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Plan Selection & Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan Options (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#06294D] tracking-tight">
              1. Select Renewal Term or Upgrade Package
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose an annual term extension or upgrade your mandate to State / National Council.
            </p>
          </div>

          <div className="space-y-4">
            {MEMBER_RENEWAL_PACKAGES.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#06294D] bg-[#06294D]/5 ring-2 ring-[#06294D]/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#06294D] bg-[#06294D] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <h3 className="font-extrabold text-[#06294D] text-base">{pkg.name}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {pkg.recommended && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FAD465] text-[#06294D] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Recommended
                        </span>
                      )}
                      {pkg.discountBadge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {pkg.discountBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 ml-7 leading-relaxed">{pkg.description}</p>

                  {/* Features List */}
                  <div className="mt-3 ml-7 grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-700">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fee Footer */}
                  <div className="mt-4 pt-3 ml-7 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Contribution:</span>
                    <div className="flex items-baseline gap-2">
                      {pkg.originalFee && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          ₹{pkg.originalFee.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-lg font-black text-[#06294D] tabular-nums">
                        ₹{pkg.fee.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Checkout & Payment Gateway Simulation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#06294D] tracking-tight">
              2. Payment & Extension Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure 256-bit encrypted statutory payment gateway with instant 80G tax receipt.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            {/* Calculation summary */}
            <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>Selected Plan</span>
                <span className="font-bold text-slate-800">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Term Extension</span>
                <span className="font-semibold text-slate-800">+{selectedPackage.durationYears} Year(s)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>New Expiry Date</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {proposedExpiryStr}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-1">
                <span>Statutory 80G Tax Exemption</span>
                <span className="font-semibold text-slate-800">50% Deduction</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-bold text-[#06294D]">
                <span>Payable Amount</span>
                <span className="text-xl font-black">₹{selectedPackage.fee.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Choose Payment Method
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-[#06294D] bg-[#06294D] text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 mx-auto mb-1" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-[#06294D] bg-[#06294D] text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASHFREE')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paymentMethod === 'CASHFREE'
                      ? 'border-[#06294D] bg-[#06294D] text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1" />
                  Cashfree
                </button>
              </div>

              {/* Dynamic Payment Method Forms */}
              {paymentMethod === 'UPI' && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center space-y-3">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
                    {/* Simulated SVG QR Code */}
                    <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="0" y="0" width="30" height="30" rx="4" />
                      <rect x="6" y="6" width="18" height="18" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />

                      <rect x="70" y="0" width="30" height="30" rx="4" />
                      <rect x="76" y="6" width="18" height="18" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />

                      <rect x="0" y="70" width="30" height="30" rx="4" />
                      <rect x="6" y="76" width="18" height="18" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />

                      <rect x="40" y="15" width="20" height="10" />
                      <rect x="40" y="35" width="10" height="20" />
                      <rect x="60" y="45" width="15" height="15" />
                      <rect x="45" y="75" width="20" height="10" />
                      <rect x="75" y="75" width="15" height="15" />
                    </svg>
                  </div>

                  <div className="text-xs">
                    <p className="text-slate-500">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800">
                      <span>hrsjm.central@icici</span>
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer ml-1"
                        title="Copy VPA"
                      >
                        {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'CREDIT_CARD' && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 •••• •••• 8912"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM / YY"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'CASHFREE' && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center space-y-2 text-xs">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600 font-bold">
                    CF
                  </div>
                  <p className="font-bold text-slate-800">Cashfree PG Direct Checkout</p>
                  <p className="text-slate-500 text-[11px]">
                    Supports NetBanking (50+ banks), Corporate UPI, EMI, and PayLater wallets.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Error Banner */}
            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                {paymentError}
              </div>
            )}

            {/* Execute Payment Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecutePayment}
              className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isProcessing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#FAD465] hover:bg-[#E9B82E] text-[#06294D]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Connecting to Cashfree Gateway...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ₹{selectedPackage.fee.toLocaleString('en-IN')} & Renew via Cashfree
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Receipt & 80G Certificate issued instantaneously</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Cashfree Membership Renewal Modal */}
      <GlobalPaymentModal
        isOpen={isCashfreeModalOpen}
        onClose={() => setIsCashfreeModalOpen(false)}
        payload={{
          purpose: 'membership',
          amount: selectedPackage.fee,
          title: `Membership Renewal: ${selectedPackage.name}`,
          subtitle: `Validity Extended to: ${proposedExpiryStr}`,
          entityId: selectedPackage.id,
          referenceId: `REN-${member.id.slice(-6)}-${selectedPackage.id}`,
          userId: member.id,
          donorName: member.fullName,
          donorMobile: member.phone,
          donorEmail: member.email,
        }}
        onSuccess={async (receipt) => {
          setIsCashfreeModalOpen(false);
          const res = await processRenewal(selectedPackage.id, 'CASHFREE');
          if (res.success) {
            setLatestReceipt({
              ...res.receipt,
              transactionId: receipt.transactionId,
              orderId: receipt.orderId,
            } as any);
            setIsSuccessModalOpen(true);
          }
        }}
      />

      {/* Success Modal */}
      {isSuccessModalOpen && latestReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-200 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Authorized & Processed
              </span>
              <h2 className="text-2xl font-black text-[#06294D] pt-2">
                Membership Successfully Renewed!
              </h2>
              <p className="text-xs text-slate-500">
                Your credentials have been extended. Official tax receipt and digital ledger have been updated.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Receipt Number</span>
                <span className="font-mono font-bold text-slate-800">{latestReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-slate-700">{latestReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-black text-[#06294D]">₹{latestReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">New Validity Expiration</span>
                <span className="font-bold text-emerald-700">
                  {new Date(member.validUpto).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">80G IT Deduction Ref</span>
                <span className="font-mono text-slate-700">{latestReceipt.section80GRef}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                to="/member/id-card"
                className="w-full py-3 rounded-xl bg-[#06294D] hover:bg-[#083a6b] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CreditCard className="w-4 h-4 text-[#FAD465]" />
                View Updated Digital ID Card
              </Link>

              <button
                type="button"
                onClick={() => generateMemberCertificatePdf(member)}
                className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Download Official Certificate (PDF)
              </button>

              <button
                type="button"
                onClick={() => {
                  cashfreeService.downloadMembershipApplicationPdf({
                    orderId: (latestReceipt as any)?.orderId || `CF_ORD_${latestReceipt.receiptNumber.replace(/\//g, '_')}`,
                    transactionId: latestReceipt.transactionId,
                    amount: latestReceipt.amount,
                    purpose: 'membership',
                    purposeTitle: `Membership Renewal: ${selectedPackage.name}`,
                    donorName: member.fullName,
                    donorMobile: member.phone,
                    donorEmail: member.email,
                    paidAt: latestReceipt.date,
                    receiptNumber: latestReceipt.receiptNumber,
                    status: 'SUCCESS',
                    applicationId: member.membershipNumber,
                    userId: member.id,
                    paymentMethod: 'Cashfree PG',
                    is80GEligible: true,
                  });
                }}
                className="w-full py-3 rounded-xl border border-[#06294D] bg-[#FAF7F0] hover:bg-amber-50 text-[#06294D] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#06294D]" />
                Download Verified Renewal Payment Slip (PDF)
              </button>

              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer pt-1 block mx-auto"
              >
                Close & Return to Renewal Center
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
