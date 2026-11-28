import type React from 'react';
import { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { LedgerTransaction } from '../types/accounting.types';

interface PassbookExportModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: LedgerTransaction[];
}

const parseDateToMs = (dStr?: string): number | null => {
  if (!dStr) return null;
  const parsed = new Date(dStr);
  if (!isNaN(parsed.getTime())) return parsed.getTime();
  const match = dStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`).getTime();
  }
  return null;
};

const formatStatementDate = (dStr?: string): string => {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dStr.slice(0, 10);
};

export const PassbookExportModal: React.FC<PassbookExportModalProps> = ({
  visible,
  onClose,
  transactions,
}) => {
  const [format, setFormat] = useState<'CSV' | 'PRINT'>('PRINT');
  const [dateRange, setDateRange] = useState<'ALL' | 'CUSTOM'>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [viewMode, setViewMode] = useState<'CONFIG' | 'PREVIEW'>('CONFIG');

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    if (dateRange === 'ALL') {
      return transactions;
    }

    const fromMs = fromDate ? new Date(fromDate + 'T00:00:00').getTime() : null;
    const toMs = toDate ? new Date(toDate + 'T23:59:59.999').getTime() : null;

    return transactions.filter((t) => {
      const txMs = parseDateToMs(t.entry_date || t.created_at);
      if (txMs === null) {
        const datePart = (t.entry_date || '').slice(0, 10);
        if (fromDate && datePart < fromDate) return false;
        if (toDate && datePart > toDate) return false;
        return true;
      }
      if (fromMs !== null && txMs < fromMs) return false;
      if (toMs !== null && txMs > toMs) return false;
      return true;
    });
  }, [transactions, dateRange, fromDate, toDate]);

  // Aggregate totals
  const totalCredit = useMemo(
    () => filteredTransactions.reduce((acc, t) => acc + (Number(t.credit) || 0), 0),
    [filteredTransactions]
  );
  const totalDebit = useMemo(
    () => filteredTransactions.reduce((acc, t) => acc + (Number(t.debit) || 0), 0),
    [filteredTransactions]
  );
  const closingBalance = useMemo(() => {
    if (filteredTransactions.length === 0) return 0;
    const last = filteredTransactions[filteredTransactions.length - 1];
    return last.running_balance !== undefined ? Number(last.running_balance) : totalCredit - totalDebit;
  }, [filteredTransactions, totalCredit, totalDebit]);

  if (!visible) return null;

  const handleDownloadCsv = () => {
    const headers = [
      'Sl No',
      'Date',
      'Voucher / Ref No',
      'Account Code',
      'Account Name',
      'Particulars / Narration',
      'Credit (Inflow ₹)',
      'Debit (Outflow ₹)',
      'Running Balance (₹)',
      'Payment Method',
      'Contributor / Beneficiary',
      'Stream / Category',
    ];

    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      formatStatementDate(t.entry_date),
      `"${t.entry_number || t.voucher_number || ''}"`,
      t.account_code || '',
      `"${(t.account_name || '').replace(/"/g, '""')}"`,
      `"${(t.narration || '').replace(/"/g, '""')}"`,
      Number(t.credit || 0).toFixed(2),
      Number(t.debit || 0).toFixed(2),
      Number(t.running_balance || 0).toFixed(2),
      t.payment_method || '',
      `"${(t.received_from || t.paid_to || '').replace(/"/g, '""')}"`,
      t.stream_category || t.category_tag || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrsjm_passbook_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleAction = () => {
    if (format === 'CSV') {
      handleDownloadCsv();
    } else {
      setViewMode('PREVIEW');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseModal = () => {
    setViewMode('CONFIG');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6, 41, 77, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={handleCloseModal}
    >
      {/* Dynamic @media print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #hrsjm-printable-passbook, #hrsjm-printable-passbook * {
            visibility: visible !important;
          }
          #hrsjm-printable-passbook {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm 10mm !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
        }
      `}</style>

      {viewMode === 'CONFIG' ? (
        /* Configuration Step Card */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(6, 41, 77, 0.35)',
            border: '1px solid #CBD5E1',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              backgroundColor: '#011F39',
              color: '#FFFFFF',
              borderBottom: '1px solid #1E3A5F',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(250, 212, 101, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Download size={18} color="#FAD465" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#FAD465' }}>
                  Export Passbook Statement
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                  Official double-entry general ledger statement
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#FFFFFF',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="hover:bg-white/10"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Format Selection */}
            <div>
              <label style={labelStyle}>Export Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFormat('CSV')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: format === 'CSV' ? '2px solid #011F39' : '1px solid #CBD5E1',
                    backgroundColor: format === 'CSV' ? '#F0F9FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FileSpreadsheet size={20} color={format === 'CSV' ? '#0284C7' : '#64748B'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#011F39' }}>CSV / Excel</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Data spreadsheet</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('PRINT')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: format === 'PRINT' ? '2px solid #011F39' : '1px solid #CBD5E1',
                    backgroundColor: format === 'PRINT' ? '#F0F9FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FileText size={20} color={format === 'PRINT' ? '#0284C7' : '#64748B'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#011F39' }}>Print Slip</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Official A4 Document</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Range Scope */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Date Range Scope</label>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: filteredTransactions.length > 0 ? '#ECFDF5' : '#FEF2F2',
                    color: filteredTransactions.length > 0 ? '#059669' : '#DC2626',
                  }}
                >
                  {filteredTransactions.length} records matching
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setDateRange('ALL')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: dateRange === 'ALL' ? '2px solid #011F39' : '1px solid #CBD5E1',
                    backgroundColor: dateRange === 'ALL' ? '#F0F9FF' : '#FFFFFF',
                    color: dateRange === 'ALL' ? '#011F39' : '#64748B',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  All Records ({transactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange('CUSTOM')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: dateRange === 'CUSTOM' ? '2px solid #011F39' : '1px solid #CBD5E1',
                    backgroundColor: dateRange === 'CUSTOM' ? '#F0F9FF' : '#FFFFFF',
                    color: dateRange === 'CUSTOM' ? '#011F39' : '#64748B',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Custom Range
                </button>
              </div>

              {dateRange === 'CUSTOM' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      From Date:
                    </span>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      To Date:
                    </span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Empty state alert if custom filter yielded 0 results */}
            {dateRange === 'CUSTOM' && filteredTransactions.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  color: '#B91C1C',
                  fontSize: '12px',
                }}
              >
                <AlertCircle size={16} />
                <span>No ledger transactions found between the selected dates.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  cursor: 'pointer',
                }}
                className="hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={filteredTransactions.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 22px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: filteredTransactions.length > 0 ? '#011F39' : '#94A3B8',
                  color: '#FAD465',
                  cursor: filteredTransactions.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 6px rgba(1, 31, 57, 0.2)',
                }}
                className="hover:opacity-95 transition"
              >
                {format === 'CSV' ? (
                  <>
                    <Download size={15} color="#FAD465" />
                    <span>Download CSV ({filteredTransactions.length})</span>
                  </>
                ) : (
                  <>
                    <Printer size={15} color="#FAD465" />
                    <span>Generate &amp; Print Statement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Printable Document Preview Modal */
        <div
          style={{
            width: '100%',
            maxWidth: '920px',
            maxHeight: '94vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(6, 41, 77, 0.4)',
            border: '1px solid #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Control Bar (Hidden during actual print) */}
          <div
            className="no-print"
            style={{
              padding: '14px 20px',
              backgroundColor: '#011F39',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1E3A5F',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setViewMode('CONFIG')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover:bg-white/20 transition"
              >
                <ArrowLeft size={14} />
                <span>Back to Options</span>
              </button>

              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FAD465' }}>
                Passbook Statement Preview ({filteredTransactions.length} Entries)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#FAD465',
                  color: '#011F39',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
                className="hover:bg-[#e9bf36] transition"
              >
                <Printer size={15} color="#011F39" />
                <span>Print Document</span>
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  padding: '7px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="hover:bg-white/20"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Scroll Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              backgroundColor: '#F1F5F9',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* The Actual Printable Sheet with Repeating thead & tfoot */}
            <div
              id="hrsjm-printable-passbook"
              style={{
                width: '100%',
                maxWidth: '840px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #06294D',
                borderRadius: '8px',
                padding: '24px 28px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#0F172A',
                boxSizing: 'border-box',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                {/* Running Header on Every Page */}
                <thead style={{ display: 'table-header-group' }}>
                  <tr>
                    <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                      {/* Organization Statutory Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '2px solid #06294D',
                          paddingBottom: '14px',
                          marginBottom: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src="/hrsjm_logo.png"
                            alt="HRSJM Logo"
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <h1
                              style={{
                                fontSize: '18px',
                                fontWeight: 900,
                                color: '#06294D',
                                margin: 0,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}
                            >
                              Human Rights &amp; Social Justice Mission
                            </h1>
                            <h2
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#B45309',
                                margin: '2px 0 0',
                              }}
                            >
                              मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट
                            </h2>
                            <p style={{ fontSize: '9.5px', color: '#64748B', margin: '3px 0 0' }}>
                              Reg. No: HR/0092/2019 • PAN: AABTH4589K • NITI Aayog: DL/2021/0284562 • 12A &amp; 80G Certified
                            </p>
                          </div>
                        </div>

                        {/* Document Type Badge */}
                        <div
                          style={{
                            textAlign: 'right',
                            padding: '6px 12px',
                            backgroundColor: '#FAF7F0',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                            Statement Scope
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 900, color: '#06294D' }}>
                            {dateRange === 'CUSTOM' ? 'Filtered Period' : 'Complete Passbook'}
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                            {filteredTransactions.length} Transactions
                          </div>
                        </div>
                      </div>

                      {/* Statement Title Banner */}
                      <div
                        style={{
                          backgroundColor: '#011F39',
                          color: '#FFFFFF',
                          textAlign: 'center',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          marginBottom: '14px',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          Official Passbook &amp; General Ledger Statement
                        </div>
                        <div style={{ fontSize: '10px', color: '#FAD465', fontWeight: 600 }}>
                          राष्ट्रीय खाता बही एवं आधिकारिक पासबुक विवरण
                        </div>
                      </div>

                      {/* Metadata & Summary Strip */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '10px',
                          padding: '10px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          marginBottom: '14px',
                          fontSize: '11px',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                            Statement Period
                          </span>
                          <span style={{ fontWeight: 800, color: '#0F172A' }}>
                            {dateRange === 'CUSTOM'
                              ? `${formatStatementDate(fromDate)} to ${formatStatementDate(toDate)}`
                              : 'All Recorded Transactions'}
                          </span>
                        </div>

                        <div>
                          <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                            Total Inflows (Cr)
                          </span>
                          <span style={{ fontWeight: 800, color: '#059669' }}>
                            ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div>
                          <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                            Total Outflows (Dr)
                          </span>
                          <span style={{ fontWeight: 800, color: '#DC2626' }}>
                            ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div>
                          <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                            Net Liquid Balance
                          </span>
                          <span style={{ fontWeight: 900, color: '#011F39' }}>
                            ₹{closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Table Column Header Row (Repeated on Every Page) */}
                  <tr style={{ backgroundColor: '#06294D', color: '#FFFFFF' }}>
                    <th style={{ ...thPrintStyle, width: '30px' }}>#</th>
                    <th style={{ ...thPrintStyle, width: '85px' }}>Date</th>
                    <th style={{ ...thPrintStyle, width: '120px' }}>Voucher No</th>
                    <th style={{ ...thPrintStyle, width: '110px' }}>Account Head</th>
                    <th style={{ ...thPrintStyle }}>Particulars &amp; Beneficiary</th>
                    <th style={{ ...thPrintStyle, width: '85px', textAlign: 'right' }}>Credit (₹)</th>
                    <th style={{ ...thPrintStyle, width: '85px', textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ ...thPrintStyle, width: '95px', textAlign: 'right' }}>Balance (₹)</th>
                  </tr>
                </thead>

                {/* Table Body: All Filtered Transactions */}
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx, idx) => {
                      const isExpense = tx.category_tag === 'EXPENSE' || (tx.debit > 0 && tx.credit === 0);
                      const party = tx.paid_to || tx.received_from || '';
                      return (
                        <tr
                          key={tx.id || idx}
                          style={{
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                            borderBottom: '1px solid #E2E8F0',
                            fontSize: '11px',
                          }}
                        >
                          <td style={{ ...tdPrintStyle, textAlign: 'center', color: '#64748B' }}>{idx + 1}</td>
                          <td style={{ ...tdPrintStyle, whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {formatStatementDate(tx.entry_date)}
                          </td>
                          <td style={{ ...tdPrintStyle, fontFamily: 'monospace', fontWeight: 700, color: '#011F39' }}>
                            {tx.entry_number || tx.voucher_number || '—'}
                            {tx.payment_method && (
                              <div style={{ fontSize: '9px', color: '#64748B', fontFamily: 'system-ui' }}>
                                [{tx.payment_method}]
                              </div>
                            )}
                          </td>
                          <td style={{ ...tdPrintStyle }}>
                            <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                              {tx.account_name || 'General Account'}
                            </span>
                            {tx.account_code && (
                              <span style={{ fontSize: '9px', color: '#64748B' }}>#{tx.account_code}</span>
                            )}
                          </td>
                          <td style={{ ...tdPrintStyle }}>
                            {party && (
                              <div style={{ fontWeight: 700, color: '#0F172A' }}>{party}</div>
                            )}
                            <div style={{ color: '#475569', fontSize: '10.5px' }}>
                              {tx.narration || (isExpense ? 'Expenditure disbursement' : 'Inward contribution')}
                            </div>
                          </td>
                          <td style={{ ...tdPrintStyle, textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                            {tx.credit > 0 ? `₹${Number(tx.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td style={{ ...tdPrintStyle, textAlign: 'right', fontWeight: 700, color: '#DC2626' }}>
                            {tx.debit > 0 ? `₹${Number(tx.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td style={{ ...tdPrintStyle, textAlign: 'right', fontWeight: 800, color: '#011F39' }}>
                            ₹{Number(tx.running_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        No ledger transactions found matching the selected statement scope.
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Running Footer on Every Page */}
                <tfoot style={{ display: 'table-footer-group' }}>
                  {/* Totals Summary Row */}
                  <tr style={{ backgroundColor: '#FAF7F0', borderTop: '2px solid #06294D', borderBottom: '2px solid #06294D' }}>
                    <td colSpan={5} style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 800, color: '#011F39', textTransform: 'uppercase' }}>
                      Statement Grand Totals ({filteredTransactions.length} Entries)
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                      ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>
                      ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11px', fontWeight: 900, color: '#011F39' }}>
                      ₹{closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {/* Statutory Signatures & Seal Block */}
                  <tr>
                    <td colSpan={8} style={{ padding: '20px 0 0 0', border: 'none' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '16px',
                          textAlign: 'center',
                          paddingTop: '16px',
                          borderTop: '1.5px dashed #CBD5E1',
                        }}
                      >
                        <div>
                          <div style={{ height: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'cursive', fontSize: '13px', color: '#06294D' }}>
                              Accounts Section
                            </span>
                          </div>
                          <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '9.5px', fontWeight: 700, color: '#06294D' }}>
                            Prepared by (Accountant)
                          </div>
                        </div>

                        <div>
                          <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div
                              style={{
                                border: '1.5px solid #047857',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '7px',
                                fontWeight: 800,
                                color: '#047857',
                                textTransform: 'uppercase',
                              }}
                            >
                              HRSJM SEAL
                            </div>
                          </div>
                          <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '9.5px', fontWeight: 700, color: '#06294D' }}>
                            Internal Audit Clearance
                          </div>
                        </div>

                        <div>
                          <div style={{ height: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: 700, color: '#047857' }}>
                              Authorized Signatory
                            </span>
                          </div>
                          <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '9.5px', fontWeight: 700, color: '#06294D' }}>
                            Finance Trustee / Secretary
                          </div>
                        </div>
                      </div>

                      {/* Footnote Notice */}
                      <div
                        style={{
                          marginTop: '14px',
                          paddingTop: '6px',
                          borderTop: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '8.5px',
                          color: '#94A3B8',
                        }}
                      >
                        <span>HRSJM Official General Ledger Statement • Valid Record Under IT Act 2000</span>
                        <span>Generated on: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB')}</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bottom Dialog Action Bar (Hidden during actual print) */}
          <div
            className="no-print"
            style={{
              padding: '12px 20px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#059669" />
              <span>Official Statutory A4 Statement • Header and footer repeat on every page</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover:bg-slate-50 transition"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#011F39',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(1, 31, 57, 0.2)',
                }}
                className="hover:bg-[#06294D] transition"
              >
                <Printer size={15} color="#FAD465" />
                <span>Print Statement Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
  padding: '8px 10px',
  fontSize: '12.5px',
  borderRadius: '6px',
  border: '1px solid #CBD5E1',
  backgroundColor: '#FFFFFF',
  color: '#111827',
  boxSizing: 'border-box',
  outline: 'none',
};

const thPrintStyle: React.CSSProperties = {
  padding: '7px 8px',
  fontSize: '9.5px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderRight: '1px solid rgba(255, 255, 255, 0.15)',
  textAlign: 'left',
};

const tdPrintStyle: React.CSSProperties = {
  padding: '7px 8px',
  verticalAlign: 'middle',
  borderRight: '1px solid #E2E8F0',
};
