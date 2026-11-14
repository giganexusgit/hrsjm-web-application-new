import type React from 'react';
import { useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Printer,
  Download,
  AlertCircle,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import { expensesStore } from '../store/expensesStore';
import { formatINR } from '../types/expenses.types';
import {
  printOfficialExpenseVoucher,
  downloadOfficialExpenseVoucherPdf,
} from '../utils/expenseReceiptGenerator';
import { numberToIndianWords } from '../../donations/utils/donationReceiptGenerator';
import hrsjmLogo from '../../../../assets/hrsjm_logo.png';

export const ExpenseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const snapshot = useSyncExternalStore(expensesStore.subscribe, expensesStore.getSnapshot);
  const voucher = snapshot.vouchers.find((v) => v.id === id || v.voucher_number === id);

  if (!voucher) {
    return (
      <div style={styles.notFoundContainer}>
        <AlertCircle size={48} color="#94A3B8" />
        <h2 style={styles.notFoundTitle}>Expense Voucher Not Found</h2>
        <p style={styles.notFoundText}>
          The expense voucher you are looking for does not exist or may have been deleted.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/expenses')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Back to Expenses</span>
        </button>
      </div>
    );
  }

  const isCancelled = voucher.status === 'CANCELLED';
  const lines = voucher.accounting_entry?.lines ?? [];

  const formatDate = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '28 Sep 2026';
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '28 Sep 2026';
    }
  };

  const formatDateTime = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '28 Sep 2026, 10:30 AM';
      return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } catch {
      return '28 Sep 2026, 10:30 AM';
    }
  };

  const isWebApp = Boolean(
    voucher.reference_number?.toUpperCase().startsWith('WEB-APP') ||
    voucher.description?.includes('[Source: Web App]')
  );

  const handlePrint = () => {
    printOfficialExpenseVoucher(voucher);
  };

  const handleDownloadPdf = () => {
    downloadOfficialExpenseVoucherPdf(voucher);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body, #root, #root > div, main, .admin-content-inner {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #FFFFFF !important;
            box-shadow: none !important;
          }
          aside, header, nav, .no-print, button {
            display: none !important;
          }
          #printable-expense-voucher {
            display: block !important;
            margin: 0 auto !important;
            padding: 14px 18px !important;
            border: 2px solid #011F39 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            width: 100% !important;
            max-width: 820px !important;
            background: #FFFFFF !important;
          }
        }
      `}</style>

      {/* Top Header Navigation & Actions Bar */}
      <div style={styles.topBar} className="no-print">
        <button
          type="button"
          onClick={() => navigate('/admin/expenses')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Back to Expenses</span>
        </button>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            style={styles.downloadBtn}
            title="Download high-resolution official PDF document"
          >
            <Download size={15} />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={styles.printBtn}
            title="Open official single-page print preview"
          >
            <Printer size={15} />
            <span>Print Voucher</span>
          </button>
        </div>
      </div>

      {/* Cancellation Notice Banner (only shown if record is already cancelled in database) */}
      {isCancelled && (
        <div style={styles.cancellationBanner} className="no-print">
          <AlertCircle size={20} color="#DC2626" />
          <div>
            <strong style={{ color: '#991B1B', fontSize: '14px' }}>Voucher Voided / Cancelled</strong>
            <p style={{ margin: '2px 0 0 0', color: '#B91C1C', fontSize: '13px' }}>
              {voucher.cancellation_reason || 'This expense voucher has been cancelled and reversed in the general ledger.'}
            </p>
          </div>
        </div>
      )}

      {/* Official Voucher Printable Receipt Slip */}
      <div id="printable-expense-voucher" style={styles.receiptSlip}>
        {/* Subtle Watermark */}
        <div style={styles.watermark}>HRSJM VOUCHER</div>

        {/* Letterhead Header */}
        <div style={styles.letterhead}>
          <div style={styles.logoWrap}>
            <img src={hrsjmLogo} alt="HRSJM Logo" style={styles.logoImg} />
          </div>
          <div style={styles.orgInfo}>
            <h1 style={styles.orgTitle}>HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION</h1>
            <div style={styles.orgHindi}>मानव अधिकार एवं सामाजिक न्याय मिशन</div>
            <div style={styles.orgTagline}>
              National Organization for Human Rights Advocacy, Social Justice, Legal Aid &amp; Public Welfare
            </div>
            <div style={styles.orgRegLine}>
              Registered under Societies Registration Act XXI of 1860 • NITI Aayog NGO-Darpan Regd: UP/2021/0285655 • Section 12A &amp; 80G Certified
              <br />
              Central Secretariat: New Delhi / Lucknow, Uttar Pradesh, India • contact@hrsjm.org • www.hrsjm.org
            </div>
          </div>
        </div>

        {/* Voucher Banner Ribbon */}
        <div style={styles.voucherRibbon}>
          <div>
            <div style={styles.ribbonTitle}>
              PAYMENT DISBURSEMENT VOUCHER
              {isCancelled && <span style={styles.cancelledTag}>[VOIDED / CANCELLED]</span>}
              {isWebApp && <span style={styles.webAppTag}>Web App</span>}
            </div>
            <div style={styles.ribbonSubtitle}>
              Official Double-Entry Statutory Society Expenditure Receipt
            </div>
          </div>
          <div style={styles.ribbonRight}>
            <div style={styles.ribbonNumLabel}>Voucher Number</div>
            <div style={styles.ribbonNumVal}>{voucher.voucher_number}</div>
          </div>
        </div>

        {/* 4-Column Metadata Grid */}
        <table style={styles.metaTable}>
          <tbody>
            <tr>
              <td style={styles.metaLabel}>Voucher Date</td>
              <td style={styles.metaVal}>{formatDate(voucher.expense_date)}</td>
              <td style={styles.metaLabel}>Payment Method</td>
              <td style={styles.metaVal}>
                {voucher.payment_method === 'UPI'
                  ? 'UPI'
                  : voucher.payment_method === 'CASH'
                  ? 'Cash'
                  : voucher.payment_method === 'BANK_TRANSFER'
                  ? 'Bank Transfer'
                  : voucher.payment_method}
              </td>
            </tr>
            <tr>
              <td style={styles.metaLabel}>Disbursing Source</td>
              <td style={styles.metaVal}>
                {voucher.payment_method === 'UPI'
                  ? 'UPI (Bank Account)'
                  : voucher.payment_method === 'CASH'
                  ? (voucher.paid_from_account?.account_name || 'Cash Account')
                  : (voucher.paid_from_account?.account_name || 'Bank Account')}
              </td>
              <td style={styles.metaLabel}>External Ref / Bill #</td>
              <td style={{ ...styles.metaVal, fontFamily: 'monospace' }}>{voucher.reference_number || '—'}</td>
            </tr>
            <tr>
              <td style={styles.metaLabel}>Audit Status</td>
              <td style={{ ...styles.metaVal, color: isCancelled ? '#DC2626' : '#15803D' }}>
                {voucher.status === 'POSTED' ? 'AUDITED & POSTED' : voucher.status}
              </td>
              <td style={styles.metaLabel}>Recorded At</td>
              <td style={styles.metaVal}>{formatDateTime(voucher.created_at)}</td>
            </tr>
          </tbody>
        </table>

        {/* Beneficiary & Classification Table */}
        <div style={styles.sectionTitle}>Disbursement Particulars &amp; Classification</div>
        <table style={styles.particularsTable}>
          <thead>
            <tr>
              <th style={styles.particularsThPayee}>Paid To (Recipient / Payee)</th>
              <th style={styles.particularsThHead}>Expense Head (Classification)</th>
              <th style={styles.particularsThPurpose}>Detailed Purpose &amp; Narration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.particularsTd}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#011F39' }}>{voucher.paid_to}</div>
                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Authorized Payee / Beneficiary</div>
              </td>
              <td style={styles.particularsTd}>
                <div style={{ fontWeight: 700, color: '#011F39' }}>{voucher.expense_account?.account_name || 'Expense Head'}</div>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                  A/c #{voucher.expense_account?.account_code || '5002'}
                </div>
              </td>
              <td style={styles.particularsTd}>
                <div style={{ color: '#334155', lineHeight: '1.45' }}>
                  {voucher.description || 'Disbursement for approved organizational operations and activities.'}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount Card with Amount in Words */}
        <div style={styles.amountCard}>
          <div style={styles.amountWordsBox}>
            <div style={styles.amountWordsTitle}>Amount Passed for Payment (in Words)</div>
            <div style={styles.amountWordsVal}>{numberToIndianWords(voucher.amount)}</div>
          </div>
          <div style={styles.amountDigitsBox}>
            <div style={styles.amountDigitsTitle}>Total Disbursed (INR)</div>
            <div style={{
              ...styles.amountDigitsVal,
              textDecoration: isCancelled ? 'line-through' : 'none',
              color: isCancelled ? '#94A3B8' : '#011F39',
            }}>
              {formatINR(voucher.amount)}
            </div>
          </div>
        </div>

        {/* Double-Entry Journal Postings */}
        <div style={styles.journalBox}>
          <div style={styles.journalBoxHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="#011F39" />
              <span style={{ fontWeight: 700 }}>Double-Entry General Ledger Postings</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Ref: {voucher.accounting_entry?.entry_number || 'JV-AUTO'}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/admin/accounting?search=${voucher.voucher_number || voucher.id}`)}
                className="no-print"
                style={styles.ledgerBtn}
              >
                <span>View in General Ledger</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <table style={styles.journalSubTable}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: '#475569', fontSize: '10.5px' }}>Account Code &amp; Name</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: '#475569', fontSize: '10.5px' }}>Accounting Entry Type</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: '#475569', fontSize: '10.5px' }}>Debit (Dr.)</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: '#475569', fontSize: '10.5px' }}>Credit (Cr.)</th>
              </tr>
            </thead>
            <tbody>
              {lines.length > 0 ? (
                lines.map((l) => {
                  const debit = Number(l.debit_amount ?? l.debit ?? 0);
                  const credit = Number(l.credit_amount ?? l.credit ?? 0);
                  return (
                    <tr key={l.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600, color: '#0F172A' }}>
                        {l.account?.account_name}
                        {l.account?.account_code && (
                          <span style={{ color: '#64748B', fontSize: '10.5px', marginLeft: '6px' }}>
                            (A/c #{l.account.account_code})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '6px 8px', color: '#64748B' }}>
                        {debit > 0 ? 'Dr. Expense Allocation' : 'Cr. Disbursing Asset'}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: debit > 0 ? '#15803D' : '#94A3B8' }}>
                        {debit > 0 ? formatINR(debit) : '—'}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: credit > 0 ? '#C2410C' : '#94A3B8' }}>
                        {credit > 0 ? formatINR(credit) : '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: '#0F172A' }}>
                    {voucher.expense_account?.account_name || 'Expense Head'}
                    {voucher.expense_account?.account_code && (
                      <span style={{ color: '#64748B', fontSize: '10.5px', marginLeft: '6px' }}>
                        (A/c #{voucher.expense_account.account_code})
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#64748B' }}>Dr. Expense Allocation</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#15803D' }}>
                    {formatINR(voucher.amount)}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94A3B8' }}>—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Attachment link if exists */}
        {voucher.attachment_url && (
          <div style={styles.attachmentBox} className="no-print">
            <Paperclip size={15} color="#0284C7" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0369A1' }}>Supporting Document:</span>
            <a href={voucher.attachment_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0284C7', textDecoration: 'underline' }}>
              View Attached Bill / Invoice
            </a>
          </div>
        )}

        {/* Signatures & Seal Authorization Block */}
        <div style={styles.signatureRow}>
          <div style={styles.signCol}>
            <div style={styles.signLine} />
            <div style={styles.signTitle}>Prepared By</div>
            <div style={styles.signRole}>Accounts Officer / Cashier</div>
          </div>

          <div style={styles.signCol}>
            <div style={styles.sealGraphic}>
              HRSJM<br />OFFICIAL<br />SEAL
            </div>
            <div style={styles.signTitle}>Verified &amp; Audited</div>
            <div style={styles.signRole}>Internal Finance Auditor</div>
          </div>

          <div style={styles.signCol}>
            <div style={styles.signLine} />
            <div style={styles.signTitle}>Authorized Signatory</div>
            <div style={styles.signRole}>Treasurer / General Secretary</div>
          </div>
        </div>

        {/* Official Statutory Footer */}
        <div style={styles.footerNote}>
          This is an official computer-generated payment disbursement voucher of <strong>Human Rights &amp; Social Justice Mission</strong>.
          <br />
          Certified for statutory society audit under the Societies Registration Act XXI of 1860. Retain for official accounting records.
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 0 32px 0',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#06294D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.15s ease',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid #BAE6FD',
    backgroundColor: '#F0F9FF',
    color: '#0284C7',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.15s ease',
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '10px',
    border: '1px solid #011F39',
    backgroundColor: '#011F39',
    color: '#FAD465',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(1, 31, 57, 0.15)',
    transition: 'all 0.15s ease',
  },
  cancellationBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '8px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #F87171',
    marginBottom: '16px',
  },

  /* Receipt Slip Document Card */
  receiptSlip: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '2px solid #011F39',
    padding: '28px 36px',
    boxShadow: '0 4px 20px rgba(1, 31, 57, 0.08)',
    overflow: 'hidden',
    width: '100%',
  },
  watermark: {
    position: 'absolute',
    top: '48%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-24deg)',
    fontSize: '68px',
    fontWeight: 900,
    color: 'rgba(1, 31, 57, 0.03)',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },

  /* Letterhead */
  letterhead: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    borderBottom: '2px solid #011F39',
    paddingBottom: '14px',
    marginBottom: '16px',
  },
  logoWrap: {
    width: '78px',
    height: '78px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  orgInfo: {
    flex: 1,
    textAlign: 'center',
  },
  orgTitle: {
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: '21px',
    fontWeight: 900,
    color: '#011F39',
    letterSpacing: '0.5px',
    margin: 0,
    lineHeight: 1.2,
  },
  orgHindi: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#926A04',
    marginTop: '3px',
  },
  orgTagline: {
    fontSize: '10px',
    color: '#475569',
    fontStyle: 'italic',
    marginTop: '2px',
  },
  orgRegLine: {
    fontSize: '9.5px',
    color: '#334155',
    fontWeight: 600,
    marginTop: '5px',
    lineHeight: 1.4,
  },

  /* Voucher Ribbon */
  voucherRibbon: {
    background: 'linear-gradient(90deg, #011F39 0%, #06294D 100%)',
    color: '#FAD465',
    padding: '10px 18px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #E9B82E',
  },
  ribbonTitle: {
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cancelledTag: {
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontWeight: 700,
  },
  webAppTag: {
    fontSize: '9.5px',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(250, 212, 101, 0.25)',
    border: '1px solid rgba(250, 212, 101, 0.5)',
    color: '#FFFFFF',
    fontWeight: 700,
  },
  ribbonSubtitle: {
    fontSize: '10px',
    color: '#FDF4DC',
    marginTop: '2px',
  },
  ribbonRight: {
    textAlign: 'right',
  },
  ribbonNumLabel: {
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#FDF4DC',
  },
  ribbonNumVal: {
    fontFamily: 'monospace',
    fontSize: '15px',
    fontWeight: 800,
    color: '#FFFFFF',
  },

  /* Metadata Table */
  metaTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '11.5px',
  },
  metaLabel: {
    padding: '8px 12px',
    color: '#64748B',
    fontWeight: 600,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    width: '25%',
    border: '1px solid #E2E8F0',
  },
  metaVal: {
    padding: '8px 12px',
    fontWeight: 700,
    color: '#0F172A',
    width: '25%',
    border: '1px solid #E2E8F0',
  },

  /* Section Title */
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: '#011F39',
    borderBottom: '1.5px solid #011F39',
    paddingBottom: '4px',
    margin: '14px 0 10px 0',
  },

  /* Particulars Table */
  particularsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '14px',
    fontSize: '11.5px',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
  },
  particularsThPayee: {
    width: '28%',
    backgroundColor: '#F1F5F9',
    color: '#334155',
    fontWeight: 700,
    padding: '7px 12px',
    border: '1px solid #CBD5E1',
    textAlign: 'left',
    fontSize: '10px',
    textTransform: 'uppercase',
  },
  particularsThHead: {
    width: '32%',
    backgroundColor: '#F1F5F9',
    color: '#334155',
    fontWeight: 700,
    padding: '7px 12px',
    border: '1px solid #CBD5E1',
    textAlign: 'left',
    fontSize: '10px',
    textTransform: 'uppercase',
  },
  particularsThPurpose: {
    width: '40%',
    backgroundColor: '#F1F5F9',
    color: '#334155',
    fontWeight: 700,
    padding: '7px 12px',
    border: '1px solid #CBD5E1',
    textAlign: 'left',
    fontSize: '10px',
    textTransform: 'uppercase',
  },
  particularsTd: {
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    verticalAlign: 'top',
  },

  /* Amount Box */
  amountCard: {
    backgroundColor: '#F8FAFC',
    border: '1.5px solid #011F39',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '14px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  amountWordsBox: {
    flex: 1,
  },
  amountWordsTitle: {
    fontSize: '9.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#475569',
    letterSpacing: '0.4px',
  },
  amountWordsVal: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#011F39',
    marginTop: '3px',
  },
  amountDigitsBox: {
    textAlign: 'right',
    paddingLeft: '20px',
    borderLeft: '1.5px solid #CBD5E1',
    minWidth: '180px',
  },
  amountDigitsTitle: {
    fontSize: '9.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#475569',
  },
  amountDigitsVal: {
    fontSize: '24px',
    fontWeight: 900,
    fontFamily: 'Playfair Display, Georgia, serif',
    lineHeight: 1.1,
    marginTop: '3px',
  },

  /* Double-Entry Journal Table */
  journalBox: {
    backgroundColor: '#FAFAFA',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '14px',
  },
  journalBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11px',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '8px',
    marginBottom: '8px',
  },
  journalSubTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11.5px',
  },
  ledgerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0284C7',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  /* Attachment Box */
  attachmentBox: {
    padding: '10px 14px',
    backgroundColor: '#F0F9FF',
    borderRadius: '8px',
    border: '1px solid #BAE6FD',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },

  /* Signatures */
  signatureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px dashed #CBD5E1',
  },
  signCol: {
    textAlign: 'center',
    width: '28%',
  },
  signLine: {
    height: '38px',
    borderBottom: '1px solid #011F39',
    marginBottom: '6px',
  },
  signTitle: {
    fontSize: '10.5px',
    fontWeight: 800,
    color: '#011F39',
    textTransform: 'uppercase',
  },
  signRole: {
    fontSize: '9px',
    color: '#64748B',
  },
  sealGraphic: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '1.5px dashed #06294D',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '7px',
    fontWeight: 800,
    color: '#06294D',
    textTransform: 'uppercase',
    padding: '3px',
    lineHeight: 1.1,
    backgroundColor: '#F8FAFC',
    marginBottom: '4px',
  },

  /* Footer Note */
  footerNote: {
    textAlign: 'center',
    fontSize: '9px',
    color: '#64748B',
    marginTop: '18px',
    borderTop: '1px solid #E2E8F0',
    paddingTop: '10px',
    lineHeight: 1.4,
  },

  notFoundContainer: {
    padding: '80px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    margin: '16px 0 8px 0',
    fontSize: '22px',
    fontWeight: 700,
    color: '#1E293B',
  },
  notFoundText: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#64748B',
  },
};
