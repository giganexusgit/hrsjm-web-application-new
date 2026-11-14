import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/api';
import { expensesStore } from '../store/expensesStore';
import { OFFICIAL_EXPENSE_TYPES } from '../data/expensesFixtures';
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from '../types/expenses.types';

const ALLOWED_PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'UPI', 'BANK_TRANSFER'];

const getInitialDate = () => new Date().toISOString().slice(0, 10);

export const CreateExpensePage: React.FC = () => {
  const navigate = useNavigate();

  const [expenseDate, setExpenseDate] = useState(getInitialDate);
  const [expenseAccounts, setExpenseAccounts] = useState<
    Array<{ id: string; code: string; name: string; description: string }>
  >([]);
  const defaultType = OFFICIAL_EXPENSE_TYPES.find((t) => t.code === '5002') || OFFICIAL_EXPENSE_TYPES[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    defaultType.id || 'b8cbe676-5f17-4d9a-9499-92937a84d7a1'
  );
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Load real accounts from database on mount to get their database UUIDs
  useEffect(() => {
    let active = true;
    async function loadRealAccounts() {
      try {
        const res = await apiClient.get<any>('/accounts?account_type=EXPENSE');
        const items = Array.isArray(res) ? res : res?.items || res?.data?.items || res?.data || [];
        if (active && Array.isArray(items) && items.length > 0) {
          const mapped = items.map((a: any) => ({
            id: a.id,
            code: a.account_code || '',
            name: a.account_name,
            description: a.description || '',
          }));
          setExpenseAccounts(mapped);
          const defaultAcc = mapped.find((a: any) => a.code === '5002') || mapped[0];
          if (defaultAcc) {
            setSelectedAccountId(defaultAcc.id);
          }
          return;
        }
      } catch (err) {
        console.warn('Could not fetch accounts from backend API, using fallback fixtures:', err);
      }
      if (active) {
        setExpenseAccounts(
          OFFICIAL_EXPENSE_TYPES.map((t) => ({
            id: t.id || t.code,
            code: t.code,
            name: t.name,
            description: t.description,
          }))
        );
      }
    }
    loadRealAccounts();
    return () => {
      active = false;
    };
  }, []);

  const selectedCategory =
    expenseAccounts.find((t) => t.id === selectedAccountId || t.code === selectedAccountId) ||
    OFFICIAL_EXPENSE_TYPES.find((t) => t.code === '5002');

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!expenseDate) errs.expenseDate = 'Expense date is required';
    if (!selectedAccountId) errs.expenseAccountId = 'Expense account category is required';
    if (!paidTo.trim()) errs.paidTo = 'Payee / recipient name is required';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      errs.amount = 'Valid positive amount in INR is required';
    }
    if (!paymentMethod) errs.paymentMethod = 'Payment method is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      // Ensure we have a valid database UUID for the expense account
      let finalAccountId = selectedAccountId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(finalAccountId)) {
        const matched = expenseAccounts.find(
          (a) => a.code === finalAccountId || a.id === finalAccountId
        );
        if (matched && uuidRegex.test(matched.id)) {
          finalAccountId = matched.id;
        } else {
          try {
            const res = await apiClient.get<any>('/accounts?account_type=EXPENSE');
            const items = Array.isArray(res) ? res : res?.items || res?.data || [];
            const apiMatched = items.find(
              (a: any) => a.account_code === finalAccountId || a.account_code === '5002'
            );
            if (apiMatched && uuidRegex.test(apiMatched.id)) {
              finalAccountId = apiMatched.id;
            }
          } catch (e) {
            console.warn('Account UUID resolution error:', e);
          }
        }
      }

      // Add Web App source tag to reference and description
      const webAppRef = `WEB-APP-${Date.now().toString(36).toUpperCase()}`;
      const baseDesc = description.trim() || `Disbursement for ${selectedCategory?.name || 'operations'}`;
      const finalDescription = baseDesc.includes('[Source: Web App]')
        ? baseDesc
        : `${baseDesc} [Source: Web App]`;

      const created = await expensesStore.create({
        expense_date: new Date(expenseDate).toISOString(),
        paid_to: paidTo.trim(),
        expense_account_id: finalAccountId,
        amount: Number(amount),
        payment_method: paymentMethod,
        reference_number: webAppRef,
        description: finalDescription,
      });

      // Synchronize expenses store from backend database
      await expensesStore.syncFromBackend();

      navigate(`/admin/expenses/${created.id}`);
    } catch (err: any) {
      console.error('Error creating expense voucher:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save expense voucher to database';
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/expenses')}
            style={styles.backBtn}
          >
            <ArrowLeft size={16} />
            <span>Back to Expenses</span>
          </button>
          <h1 style={styles.pageTitle}>Record Expense Voucher</h1>
          <p style={styles.subtitle}>
            Create an official outgoing expenditure voucher with automatic double-entry journal posting.
          </p>
        </div>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={() => navigate('/admin/expenses')}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (validate()) setConfirmOpen(true);
            }}
            disabled={isSubmitting}
            style={styles.recordBtn}
          >
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {errors.submit && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #F87171',
          borderRadius: '8px',
          color: '#991B1B',
          fontSize: '13px',
          marginBottom: '20px',
        }}>
          <AlertCircle size={18} color="#DC2626" />
          <span><strong>Failed to save voucher:</strong> {errors.submit}</span>
        </div>
      )}

      <div style={styles.formGrid}>
        {/* Main Column */}
        <div style={styles.mainCol}>
          {/* Section 1: Basic Transaction Information */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Voucher Information</h2>

            <div style={styles.row}>
              {/* Expense Date */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <Calendar size={13} color="#64748B" />
                  <span>Expense Date <span style={styles.required}>*</span></span>
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: errors.expenseDate ? '#DC2626' : '#CBD5E1',
                  }}
                />
                {errors.expenseDate && <span style={styles.errorText}>{errors.expenseDate}</span>}
              </div>

              {/* Amount */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Amount (INR ₹) <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputPrefixWrap}>
                  <span style={styles.currencyPrefix}>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      ...styles.inputWithPrefix,
                      borderColor: errors.amount ? '#DC2626' : '#CBD5E1',
                    }}
                  />
                </div>
                {errors.amount && <span style={styles.errorText}>{errors.amount}</span>}
              </div>
            </div>

            {/* Paid To */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <User size={13} color="#64748B" />
                <span>Paid To (Recipient / Payee Name) <span style={styles.required}>*</span></span>
              </label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. Apex Office Supplies Ltd, City Metro Travel, Hotel Landmark"
                style={{
                  ...styles.input,
                  borderColor: errors.paidTo ? '#DC2626' : '#CBD5E1',
                }}
              />
              {errors.paidTo && <span style={styles.errorText}>{errors.paidTo}</span>}
            </div>

            {/* Description */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Detailed Description / Purpose</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Explain the administrative purpose, items purchased, or project context for audit..."
                style={styles.textarea}
              />
            </div>
          </div>

          {/* Section 2: Payment Details */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Payment Method</h2>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Payment Method <span style={styles.required}>*</span>
              </label>
              <div style={styles.methodButtonsGrid}>
                {ALLOWED_PAYMENT_METHODS.map((m) => {
                  const active = paymentMethod === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      style={{
                        ...styles.methodButton,
                        backgroundColor: active ? '#06294D' : '#F8FAFC',
                        color: active ? '#FFFFFF' : '#334155',
                        borderColor: active ? '#06294D' : '#CBD5E1',
                      }}
                    >
                      {PAYMENT_METHOD_LABELS[m]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column: Account Classification */}
        <div style={styles.sideCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <Building2 size={16} color="#06294D" />
              <span>Accounting Classification</span>
            </h2>
            <p style={styles.helpText}>
              Official chart of accounts head for statutory society audits.
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Expense Account (Head) <span style={styles.required}>*</span>
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                style={styles.select}
              >
                {(expenseAccounts.length > 0 ? expenseAccounts : OFFICIAL_EXPENSE_TYPES).map((t) => (
                  <option key={t.id || t.code} value={t.id || t.code}>
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Help Card */}
            {selectedCategory && (
              <div style={styles.categoryInfoBox}>
                <div style={styles.categoryHeader}>
                  <Info size={14} color="#0284C7" />
                  <span style={styles.categoryCode}>{selectedCategory.code} Head</span>
                </div>
                <div style={styles.categoryName}>{selectedCategory.name}</div>
                <p style={styles.categoryDesc}>{selectedCategory.description}</p>
              </div>
            )}

            <div style={styles.accountingPreviewBox}>
              <span style={styles.acctPreviewLabel}>Automated Journal Entry Preview</span>
              <div style={styles.acctLine}>
                <span style={styles.acctDr}>Dr. {selectedCategory?.name || 'Expense'}</span>
                <span style={styles.acctAmt}>₹ {amount ? Number(amount).toLocaleString('en-IN') : '0.00'}</span>
              </div>
              <div style={styles.acctLine}>
                <span style={styles.acctCr}>Cr. Bank / Cash Asset A/c</span>
                <span style={styles.acctAmt}>₹ {amount ? Number(amount).toLocaleString('en-IN') : '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div style={styles.overlay} onClick={() => setConfirmOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmHeader}>
              <CheckCircle size={24} color="#16A34A" />
              <h3 style={styles.confirmTitle}>Confirm Expense Voucher</h3>
            </div>
            <p style={styles.confirmMessage}>
              Are you sure you want to record an expense voucher of{' '}
              <strong style={{ color: '#0F172A' }}>₹ {Number(amount).toLocaleString('en-IN')}</strong> paid to{' '}
              <strong style={{ color: '#0F172A' }}>{paidTo}</strong> under{' '}
              <strong>{selectedCategory?.name}</strong>? This will post an official debit to the general ledger.
            </p>
            <div style={styles.confirmFooter}>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                style={styles.cancelBtn}
              >
                Review Again
              </button>
              <button
                type="button"
                onClick={handleCreateSubmit}
                disabled={isSubmitting}
                style={styles.confirmSubmitBtn}
              >
                {isSubmitting ? 'Recording...' : 'Yes, Record & Post Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px 32px',
    maxWidth: '1240px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#06294D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '8px',
  },
  pageTitle: {
    margin: '4px 0 0 0',
    fontSize: '28px',
    fontWeight: 700,
    color: '#011F39',
    fontFamily: 'Playfair Display, Georgia, serif',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#64748B',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cancelBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  recordBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(6, 41, 77, 0.2)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 380px',
    gap: '24px',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    fontFamily: 'Playfair Display, Georgia, serif',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1E293B',
  },
  required: {
    color: '#DC2626',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
  },
  inputPrefixWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: '12px',
    fontSize: '14px',
    fontWeight: 700,
    color: '#64748B',
  },
  inputWithPrefix: {
    width: '100%',
    padding: '9px 12px 9px 28px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  errorText: {
    fontSize: '12px',
    color: '#DC2626',
    fontWeight: 500,
  },
  methodButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  methodButton: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  helpText: {
    margin: '0 0 14px 0',
    fontSize: '13px',
    color: '#64748B',
    lineHeight: 1.45,
  },
  categoryInfoBox: {
    padding: '12px 14px',
    backgroundColor: '#F0F9FF',
    borderRadius: '8px',
    border: '1px solid #BAE6FD',
    marginBottom: '16px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  categoryCode: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#0369A1',
    letterSpacing: '0.04em',
  },
  categoryName: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#0C4A6E',
    marginBottom: '4px',
  },
  categoryDesc: {
    margin: 0,
    fontSize: '12px',
    lineHeight: 1.45,
    color: '#0284C7',
  },
  accountingPreviewBox: {
    padding: '14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  acctPreviewLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  acctLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12.5px',
  },
  acctDr: {
    color: '#15803D',
    fontWeight: 600,
  },
  acctCr: {
    color: '#B91C1C',
    fontWeight: 600,
  },
  acctAmt: {
    fontWeight: 700,
    color: '#0F172A',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(1, 31, 57, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '16px',
  },
  confirmModal: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  confirmHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  confirmTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#011F39',
    fontFamily: 'Playfair Display, Georgia, serif',
  },
  confirmMessage: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#475569',
  },
  confirmFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  confirmSubmitBtn: {
    padding: '8px 18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
