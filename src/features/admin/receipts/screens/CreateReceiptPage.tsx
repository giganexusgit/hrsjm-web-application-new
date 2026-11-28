import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  FileText,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  STANDARD_INCOME_ACCOUNTS,
  STANDARD_RECEIVED_IN_ACCOUNTS,
} from '../data/receiptsFixtures';
import { receiptsStore } from '../store/receiptsStore';
import { formatINR, type PaymentMethod } from '../types/receipts.types';

function getInitialDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const CreateReceiptPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [receiptDate, setReceiptDate] = useState(getInitialDate);
  const [receivedFrom, setReceivedFrom] = useState('');
  const [incomeAccountId, setIncomeAccountId] = useState(STANDARD_INCOME_ACCOUNTS[0].id);
  const [receivedInAccountId, setReceivedInAccountId] = useState(STANDARD_RECEIVED_IN_ACCOUNTS[0].id);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIncomeAccount =
    STANDARD_INCOME_ACCOUNTS.find((a) => a.id === incomeAccountId) || STANDARD_INCOME_ACCOUNTS[0];
  const selectedReceivedInAccount =
    STANDARD_RECEIVED_IN_ACCOUNTS.find((a) => a.id === receivedInAccountId) || STANDARD_RECEIVED_IN_ACCOUNTS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receivedFrom.trim()) {
      setError('Please specify the person or entity from whom income was received.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive income amount.');
      return;
    }

    if (!receiptDate) {
      setError('Please choose a valid receipt date.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await receiptsStore.createVoucher({
        receipt_date: receiptDate,
        received_from: receivedFrom.trim(),
        income_account_id: incomeAccountId,
        received_in_account_id: receivedInAccountId,
        amount: numericAmount,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || undefined,
        description: description.trim() || undefined,
      });

      navigate(`/admin/receipts/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record receipt voucher.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto pb-10 px-3.5 sm:px-6 box-border overflow-x-hidden">
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/receipts')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            fontSize: '13.5px',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            backgroundColor: '#FFFFFF',
            color: '#374151',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Receipts</span>
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#011F39',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={18} color="#FAD465" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              color: '#011F39',
              letterSpacing: '-0.02em',
            }}
          >
            Record Inward Income Voucher
          </h1>
        </div>
        <p style={{ margin: '4px 0 0 40px', fontSize: '13px', color: '#6B7280' }}>
          Post an official receipt voucher with double-entry journal allocation to bank or cash asset
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#991B1B',
            fontSize: '13.5px',
          }}
        >
          <AlertCircle size={18} color="#DC2626" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Grid: Left Form, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        {/* Left: Input Form Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            padding: '24px',
          }}
        >
          <h3
            style={{
              margin: '0 0 16px 0',
              fontSize: '15px',
              fontWeight: 700,
              color: '#011F39',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '10px',
            }}
          >
            Voucher Details
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Receipt Date */}
            <div>
              <label style={labelStyle}>
                Receipt Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Received From */}
            <div>
              <label style={labelStyle}>
                Received From (Donor / Member / Entity) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                value={receivedFrom}
                onChange={(e) => setReceivedFrom(e.target.value)}
                placeholder="e.g. Anand Mahindra, Kind Citizen, State Bar Council..."
                required
                style={inputStyle}
              />
            </div>

            {/* Income Account Selection */}
            <div>
              <label style={labelStyle}>
                Income Account (Credit) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={incomeAccountId}
                onChange={(e) => setIncomeAccountId(e.target.value)}
                style={inputStyle}
              >
                {STANDARD_INCOME_ACCOUNTS.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_code ? `[#${acc.account_code}] ` : ''}
                    {acc.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Received In Account Selection */}
            <div>
              <label style={labelStyle}>
                Received-In Account (Debit Asset) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={receivedInAccountId}
                onChange={(e) => setReceivedInAccountId(e.target.value)}
                style={inputStyle}
              >
                {STANDARD_RECEIVED_IN_ACCOUNTS.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_code ? `[#${acc.account_code}] ` : ''}
                    {acc.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label style={labelStyle}>
                Amount (INR ₹) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                style={{ ...inputStyle, fontSize: '16px', fontWeight: 600, color: '#059669' }}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label style={labelStyle}>
                Payment Method <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                style={inputStyle}
              >
                <option value="UPI">UPI / Online / Cashfree</option>
                <option value="BANK_TRANSFER">Bank Transfer (IMPS / NEFT / RTGS)</option>
                <option value="CASH">Cash in Hand</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="OTHER">Other Method</option>
              </select>
            </div>

            {/* Reference Number */}
            <div>
              <label style={labelStyle}>Reference Number / Transaction ID</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. cf_pay_123456, UTR #88990011, CHQ #004412"
                style={inputStyle}
              />
            </div>

            {/* Description / Remittance */}
            <div>
              <label style={labelStyle}>Narration / Remarks</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or details regarding cause, donor request, or event registration..."
                rows={3}
                style={{ ...inputStyle, fontFamily: 'inherit' }}
              />
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/receipts')}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#011F39',
                  color: '#FAD465',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: '0 2px 4px rgba(1, 31, 57, 0.15)',
                }}
              >
                <Check size={18} color="#FAD465" />
                <span>{isSubmitting ? 'Recording...' : 'Post Receipt Voucher'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Interactive Voucher Preview Card */}
        <div>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: '#011F39',
                padding: '18px 20px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#FAD465" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FAD465' }}>
                  Live Voucher Slip Preview
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#93C5FD', textTransform: 'uppercase' }}>
                Auto Generated
              </span>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Receipt Date:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                  {receiptDate || 'Today'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Received From:</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#011F39' }}>
                  {receivedFrom || '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Credit Account:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>
                  {selectedIncomeAccount.account_name}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Debit Account:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>
                  {selectedReceivedInAccount.account_name}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Payment Method:</span>
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#374151' }}>
                  {paymentMethod}
                </span>
              </div>

              {referenceNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Reference:</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#011F39' }}>
                    {referenceNumber}
                  </span>
                </div>
              )}

              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Total Inward Credit:</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
                  {formatINR(amount || 0)}
                </span>
              </div>
            </div>

            {/* Journal Preview */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                borderTop: '1px solid #E5E7EB',
                padding: '16px 20px',
                fontSize: '12px',
              }}
            >
              <div style={{ fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>
                Automatic Double-Entry Journal:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#111827', marginBottom: '4px' }}>
                <span>Dr. {selectedReceivedInAccount.account_name} (Asset)</span>
                <b>{formatINR(amount || 0)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span style={{ paddingLeft: '12px' }}>Cr. {selectedIncomeAccount.account_name} (Income)</span>
                <b>{formatINR(amount || 0)}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '13.5px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  backgroundColor: '#FFFFFF',
  color: '#111827',
  boxSizing: 'border-box',
  outline: 'none',
};
