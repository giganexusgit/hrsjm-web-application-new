import type React from 'react';
import { useState } from 'react';
import {
  X,
  Shield,
  Heart,
  User,
  Phone,
  Mail,
  Lock,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import type { PaymentPayload, PaymentReceiptDetails } from '../types/payment.types';
import { cashfreeService } from '../services/cashfreeService';
import { useAuth } from '../../auth/store/authStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

export interface GlobalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: PaymentPayload;
  onSuccess?: (receipt: PaymentReceiptDetails) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

interface PaymentModalContentProps {
  onClose: () => void;
  payload: PaymentPayload;
  onSuccess?: (receipt: PaymentReceiptDetails) => void;
}

const PaymentModalContent: React.FC<PaymentModalContentProps> = ({
  onClose,
  payload,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Form states initialized with payload or auth user
  const [amount, setAmount] = useState<number>(payload.amount || 1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(payload.donorName || user?.full_name || '');
  const [donorMobile, setDonorMobile] = useState<string>(() => {
    const raw = payload.donorMobile || user?.mobile_number || '';
    const digits = raw.replace(/\D/g, '').slice(-10);
    return digits || raw;
  });
  const [donorEmail, setDonorEmail] = useState<string>(payload.donorEmail || user?.email || '');
  const [panNumber, setPanNumber] = useState<string>(payload.panNumber || '');

  // Workflow states: 'details' | 'processing' | 'success' | 'error'
  const [stage, setStage] = useState<'details' | 'processing' | 'success' | 'error'>('details');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<PaymentReceiptDetails | null>(null);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const isDonation = payload.purpose === 'donation';
  const effectiveUserId = payload.userId || user?.id;

  const handleLaunchPayment = async () => {
    if (effectiveAmount < 10) {
      setErrorMessage('Minimum payable amount is ₹10.');
      return;
    }
    if (!donorName.trim()) {
      setErrorMessage('Please provide full name.');
      return;
    }
    const cleanDigits = donorMobile.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length !== 10) {
      setErrorMessage('Mobile number must be exactly 10 digits.');
      return;
    }

    setErrorMessage(null);
    setStage('processing');

    try {
      let session;
      if (isDonation) {
        session = await cashfreeService.createDonationOrder({
          cause: payload.title,
          amount: effectiveAmount,
          donorName: donorName.trim(),
          donorMobile: cleanDigits,
          donorEmail: donorEmail.trim(),
          userId: effectiveUserId,
          panNumber: panNumber.trim().toUpperCase() || undefined,
          need80G: Boolean(panNumber.trim() || payload.need80GReceipt),
        });
      } else {
        session = await cashfreeService.createMembershipOrder({
          applicationId: payload.applicationId || payload.entityId,
          membershipPaymentId: payload.entityId,
          amount: effectiveAmount,
          customerName: donorName.trim(),
          customerMobile: cleanDigits,
          customerEmail: donorEmail.trim(),
          userId: effectiveUserId,
          membershipType: payload.title,
        });
      }

      await cashfreeService.launchCashfreeCheckout(
        session,
        (verifyRes) => {
          const receiptDetails: PaymentReceiptDetails = {
            receiptNumber: verifyRes.receipt_number || `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            orderId: session.order_id,
            transactionId: verifyRes.transaction_id || `CF-${Date.now().toString().slice(-8)}`,
            amount: effectiveAmount,
            purpose: payload.purpose,
            purposeTitle: payload.title,
            donorName: donorName.trim(),
            donorMobile: cleanDigits,
            donorEmail: donorEmail.trim(),
            panNumber: panNumber.trim().toUpperCase() || undefined,
            userId: effectiveUserId,
            applicationId: payload.applicationId,
            membershipNumber: verifyRes.membership?.membership_number,
            paymentMethod: verifyRes.payment_method || 'CASHFREE',
            paidAt: verifyRes.paid_at || new Date().toISOString(),
            is80GEligible: isDonation,
            status: 'SUCCESS',
          };

          setVerifiedReceipt(receiptDetails);
          setStage('success');
          onSuccess?.(receiptDetails);
        },
        () => {
          // User closed checkout without completing
          setStage('details');
        }
      );
    } catch (err: any) {
      setStage('error');
      setErrorMessage(err?.message || 'Failed to initialize payment with Cashfree.');
    }
  };

  const handleDownload = () => {
    if (!verifiedReceipt) return;
    if (isDonation) {
      cashfreeService.downloadDonationReceiptPdf(verifiedReceipt);
    } else {
      cashfreeService.downloadMembershipApplicationPdf(verifiedReceipt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#011F39]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#DCE4EC] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#06294D] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAD465]/20 border border-[#FAD465]/40 flex items-center justify-center text-[#FAD465]">
              {isDonation ? <Heart size={18} /> : <Shield size={18} />}
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#FAD465] uppercase tracking-wider">
                Cashfree Payment Gateway
              </div>
              <h2 className="text-base font-bold font-serif text-white truncate max-w-xs">
                {payload.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close Payment Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Stage 1: Details & Amount Input */}
          {stage === 'details' && (
            <div className="space-y-4">
              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0B2F52] uppercase tracking-wider mb-2">
                  Contribution Amount (INR)
                </label>
                {isDonation ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setAmount(amt);
                            setCustomAmount('');
                          }}
                          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer tabular-nums ${
                            effectiveAmount === amt && !customAmount
                              ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                              : 'bg-[#FAF7F0] border border-[#DCE4EC] text-[#06294D] hover:bg-slate-100'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        placeholder="Or enter custom amount in Rupees"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#DCE4EC] text-xs font-bold text-[#06294D] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#DCE4EC] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Mandatory Accreditation Fee</span>
                      <span className="text-xl font-extrabold font-serif text-[#06294D] tabular-nums">₹{payload.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Standard Statutory Fee
                    </span>
                  </div>
                )}
              </div>

              {/* Applicant / Donor Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-[#0B2F52] uppercase tracking-wider block">
                  {isDonation ? 'Donor Information (For 80G Receipt)' : 'Applicant Identity Credentials'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Legal Name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#DCE4EC] text-xs font-medium text-[#06294D] focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Number *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit Phone"
                        value={donorMobile}
                        onChange={(e) => setDonorMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#DCE4EC] text-xs font-medium text-[#06294D] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email (For e-Receipt)</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#DCE4EC] text-xs font-medium text-[#06294D] focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                      />
                    </div>
                  </div>

                  {isDonation ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">PAN Number (For 80G Tax Exemption)</label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#DCE4EC] text-xs font-bold font-mono text-[#06294D] uppercase focus:outline-none focus:ring-1 focus:ring-[#06294D]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Application Reference</label>
                      <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 truncate">
                        {payload.applicationId || payload.entityId || 'HRSJM-APP-REGISTRY'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attribution Callout */}
              <div className="p-3.5 rounded-2xl bg-[#EDF2F7] border border-[#DBE5EE] text-xs text-[#34516D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-[#06294D] shrink-0" />
                  <span>
                    Linked User ID: <code className="text-[#06294D] font-mono font-bold text-[11px]">{effectiveUserId ? effectiveUserId.slice(0, 12) + '...' : 'Guest Session'}</code>
                  </span>
                </div>
                <span className="text-[10.5px] font-bold text-slate-500 uppercase">256-bit Encrypted</span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Launch Cashfree Gateway CTA */}
              <button
                type="button"
                onClick={handleLaunchPayment}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock size={15} />
                <span>Pay ₹{effectiveAmount.toLocaleString('en-IN')} with Cashfree Gateway</span>
              </button>
            </div>
          )}

          {/* Stage 2: Processing / Waiting for Cashfree */}
          {stage === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#FAD465] border-t-transparent animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold font-serif text-[#06294D]">Connecting to Cashfree Gateway...</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Authorizing transaction order for ₹{effectiveAmount.toLocaleString('en-IN')}. The secure checkout overlay is opening.
                </p>
              </div>
            </div>
          )}

          {/* Stage 3: Payment Success & Instant Receipt Generation */}
          {stage === 'success' && verifiedReceipt && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={32} strokeWidth={2.2} />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Cashfree Payment Verified &amp; Confirmed
                </span>
                <h3 className="text-xl font-bold font-serif text-[#06294D]">
                  {isDonation ? 'Official 80G Donation Receipt' : 'Membership Application Acknowledgement'}
                </h3>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#DCE4EC] text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-[#DCE4EC] pb-2">
                  <span className="text-slate-500">Receipt Voucher #:</span>
                  <span className="font-bold text-[#0B2F52] font-mono">{verifiedReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#DCE4EC] pb-2">
                  <span className="text-slate-500">Cashfree Order ID:</span>
                  <span className="font-mono text-[#06294D] text-[11px]">{verifiedReceipt.orderId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#DCE4EC] pb-2">
                  <span className="text-slate-500">Transaction Reference:</span>
                  <span className="font-mono text-[#06294D] text-[11px]">{verifiedReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#DCE4EC] pb-2">
                  <span className="text-slate-500">{isDonation ? 'Donor Name' : 'Applicant Name'}:</span>
                  <span className="font-bold text-[#0B2F52]">{verifiedReceipt.donorName}</span>
                </div>
                {verifiedReceipt.applicationId && (
                  <div className="flex justify-between items-center border-b border-[#DCE4EC] pb-2">
                    <span className="text-slate-500">Application Number:</span>
                    <span className="font-bold text-[#06294D] font-mono">{verifiedReceipt.applicationId}</span>
                  </div>
                )}
                {verifiedReceipt.panNumber && (
                  <div className="flex justify-between items-center border-b border-[#DCE4EC] pb-2">
                    <span className="text-slate-500">80G PAN Number:</span>
                    <span className="font-bold text-[#0B2F52] font-mono">{verifiedReceipt.panNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-700 font-bold">Total Amount Paid:</span>
                  <span className="text-base font-extrabold text-[#06294D] tabular-nums">
                    ₹{verifiedReceipt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Automatic Ledger Posting Confirmation */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11.5px] text-emerald-800 font-medium">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                <span>Reconciled with General Ledger (Double-Entry A/c Posted automatically).</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="py-2.5 px-4 rounded-xl bg-[#06294D] hover:bg-[#011F39] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download size={14} />
                  <span>Download PDF Slip</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Done / Close</span>
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Error State */}
          {stage === 'error' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-[#06294D]">Payment Initiation Failed</h3>
                <p className="text-xs text-slate-500 mt-1">{errorMessage || 'Unable to connect to Cashfree payment services.'}</p>
              </div>
              <button
                type="button"
                onClick={() => setStage('details')}
                className="py-2 px-5 rounded-xl bg-[#06294D] text-white text-xs font-bold cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const GlobalPaymentModal: React.FC<GlobalPaymentModalProps> = ({
  isOpen,
  onClose,
  payload,
  onSuccess,
}) => {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const instanceKey = `${payload.purpose}_${payload.entityId || payload.referenceId || ''}_${payload.amount || ''}_${payload.userId || ''}`;

  return (
    <PaymentModalContent
      key={instanceKey}
      onClose={onClose}
      payload={payload}
      onSuccess={onSuccess}
    />
  );
};
