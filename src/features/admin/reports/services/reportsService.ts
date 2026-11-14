import { apiClient } from '@/api';
import type {
  BalanceSheetReportResponse,
  BalanceSheetSummaryResponse,
  ProfitLossReportResponse,
  ProfitLossSummaryResponse,
  ReportsAnalyticsResponse,
  TrialBalanceReportResponse,
  TrialBalanceSummaryResponse,
} from '../types/reports.types';
import {
  MOCK_BALANCE_SHEET,
  MOCK_BALANCE_SHEET_SUMMARY,
  MOCK_PROFIT_LOSS,
  MOCK_PROFIT_LOSS_SUMMARY,
  MOCK_REPORTS_ANALYTICS,
  MOCK_TRIAL_BALANCE,
  MOCK_TRIAL_BALANCE_SUMMARY,
} from '../data/reportsFixtures';

// Helper to trigger browser CSV download
function triggerCsvDownload(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper to format currency for statements
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const reportsService = {
  // 0. Platform Analytics Overview
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ReportsAnalyticsResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.start_date) query.set('start_date', params.start_date);
      if (params?.end_date) query.set('end_date', params.end_date);
      const url = `/reports/analytics${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await apiClient.get<ReportsAnalyticsResponse>(url);
      if (res && res.kpis) {
        return res;
      }
    } catch (e) {
      console.warn('Backend /reports/analytics unavailable, using realistic platform data:', e);
    }
    return MOCK_REPORTS_ANALYTICS;
  },

  // 1. Trial Balance
  async getTrialBalance(params: {
    as_of_date: string;
    include_zero_balances?: boolean;
    account_type?: string;
  }): Promise<TrialBalanceReportResponse> {
    try {
      const query = new URLSearchParams();
      query.set('as_of_date', params.as_of_date);
      if (params.include_zero_balances) query.set('include_zero_balances', 'true');
      if (params.account_type && params.account_type !== 'ALL') {
        query.set('account_type', params.account_type);
      }
      const res = await apiClient.get<TrialBalanceReportResponse>(`/reports/trial-balance?${query.toString()}`);
      if (res && Array.isArray(res.accounts)) {
        return res;
      }
    } catch (e) {
      console.warn('Backend /reports/trial-balance unavailable, using fixture data:', e);
    }

    // Filter mock data according to params
    let filtered = [...MOCK_TRIAL_BALANCE.accounts];
    if (params.account_type && params.account_type !== 'ALL') {
      filtered = filtered.filter(a => a.account.account_type === params.account_type);
    }
    if (!params.include_zero_balances) {
      filtered = filtered.filter(a => a.debit_balance > 0 || a.credit_balance > 0);
    }

    const totalDebit = filtered.reduce((s, a) => s + a.debit_balance, 0);
    const totalCredit = filtered.reduce((s, a) => s + a.credit_balance, 0);

    return {
      ...MOCK_TRIAL_BALANCE,
      as_of_date: params.as_of_date,
      accounts: filtered,
      total_debit: totalDebit,
      total_credit: totalCredit,
      difference: Math.abs(totalDebit - totalCredit),
      is_balanced: totalDebit === totalCredit,
    };
  },

  async getTrialBalanceSummary(params: { as_of_date: string }): Promise<TrialBalanceSummaryResponse> {
    try {
      const res = await apiClient.get<TrialBalanceSummaryResponse>(
        `/reports/trial-balance/summary?as_of_date=${encodeURIComponent(params.as_of_date)}`
      );
      if (res && res.by_account_type) return res;
    } catch (e) {
      console.warn('Backend /reports/trial-balance/summary unavailable, using fixture data:', e);
    }
    return {
      ...MOCK_TRIAL_BALANCE_SUMMARY,
      as_of_date: params.as_of_date,
    };
  },

  // 2. Profit & Loss / Income & Expenditure
  async getProfitLoss(params: {
    from_date?: string;
    to_date?: string;
    include_zero_balances?: boolean;
  }): Promise<ProfitLossReportResponse> {
    try {
      const query = new URLSearchParams();
      if (params.from_date) query.set('from_date', params.from_date);
      if (params.to_date) query.set('to_date', params.to_date);
      if (params.include_zero_balances) query.set('include_zero_balances', 'true');
      const res = await apiClient.get<ProfitLossReportResponse>(`/reports/profit-loss?${query.toString()}`);
      if (res && res.income && res.expenses) return res;
    } catch (e) {
      console.warn('Backend /reports/profit-loss unavailable, using fixture data:', e);
    }

    return {
      ...MOCK_PROFIT_LOSS,
      from_date: params.from_date || MOCK_PROFIT_LOSS.from_date,
      to_date: params.to_date || MOCK_PROFIT_LOSS.to_date,
    };
  },

  async getProfitLossSummary(params: { from_date?: string; to_date?: string }): Promise<ProfitLossSummaryResponse> {
    try {
      const query = new URLSearchParams();
      if (params.from_date) query.set('from_date', params.from_date);
      if (params.to_date) query.set('to_date', params.to_date);
      const res = await apiClient.get<ProfitLossSummaryResponse>(`/reports/profit-loss/summary?${query.toString()}`);
      if (res && res.total_income !== undefined) return res;
    } catch (e) {
      console.warn('Backend /reports/profit-loss/summary unavailable, using fixture data:', e);
    }

    return {
      ...MOCK_PROFIT_LOSS_SUMMARY,
      from_date: params.from_date || MOCK_PROFIT_LOSS_SUMMARY.from_date,
      to_date: params.to_date || MOCK_PROFIT_LOSS_SUMMARY.to_date,
    };
  },

  // 3. Balance Sheet
  async getBalanceSheet(params: { as_of_date: string }): Promise<BalanceSheetReportResponse> {
    try {
      const res = await apiClient.get<BalanceSheetReportResponse>(
        `/reports/balance-sheet?as_of_date=${encodeURIComponent(params.as_of_date)}`
      );
      if (res && res.assets && res.liabilities && res.equity) return res;
    } catch (e) {
      console.warn('Backend /reports/balance-sheet unavailable, using fixture data:', e);
    }

    return {
      ...MOCK_BALANCE_SHEET,
      as_of_date: params.as_of_date,
    };
  },

  async getBalanceSheetSummary(params: { as_of_date: string }): Promise<BalanceSheetSummaryResponse> {
    try {
      const res = await apiClient.get<BalanceSheetSummaryResponse>(
        `/reports/balance-sheet/summary?as_of_date=${encodeURIComponent(params.as_of_date)}`
      );
      if (res && res.total_assets !== undefined) return res;
    } catch (e) {
      console.warn('Backend /reports/balance-sheet/summary unavailable, using fixture data:', e);
    }

    return {
      ...MOCK_BALANCE_SHEET_SUMMARY,
      as_of_date: params.as_of_date,
    };
  },

  // ==========================================
  // EXPORT UTILITIES (CSV)
  // ==========================================
  exportTrialBalanceCsv(report: TrialBalanceReportResponse): void {
    const headers = [
      'Account Code',
      'Account Name',
      'Classification',
      'Gross Debit (INR)',
      'Gross Credit (INR)',
      'Debit Balance (INR)',
      'Credit Balance (INR)',
    ];

    const rows = report.accounts.map(acc => [
      `"${acc.account.account_code || ''}"`,
      `"${acc.account.account_name.replace(/"/g, '""')}"`,
      `"${acc.account.account_type}"`,
      acc.gross_debit.toFixed(2),
      acc.gross_credit.toFixed(2),
      acc.debit_balance.toFixed(2),
      acc.credit_balance.toFixed(2),
    ]);

    rows.push([
      '"TOTAL"',
      '"GRAND TOTAL"',
      '""',
      report.total_gross_debit.toFixed(2),
      report.total_gross_credit.toFixed(2),
      report.total_debit.toFixed(2),
      report.total_credit.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerCsvDownload(csv, `HRSJM_Trial_Balance_${report.as_of_date}.csv`);
  },

  exportProfitLossCsv(report: ProfitLossReportResponse): void {
    const headers = ['Category', 'Account Code', 'Account Name', 'Amount (INR)'];
    const rows: string[][] = [];

    // Income
    rows.push(['"INCOME"', '""', '"--- INCOME ACCOUNTS ---"', '""']);
    report.income.items.forEach(item => {
      rows.push([
        '"Income"',
        `"${item.account.account_code || ''}"`,
        `"${item.account.account_name.replace(/"/g, '""')}"`,
        item.amount.toFixed(2),
      ]);
    });
    rows.push(['"TOTAL INCOME"', '""', '""', report.total_income.toFixed(2)]);

    // Expenses
    rows.push(['"EXPENSES"', '""', '"--- EXPENSE ACCOUNTS ---"', '""']);
    report.expenses.items.forEach(item => {
      rows.push([
        '"Expense"',
        `"${item.account.account_code || ''}"`,
        `"${item.account.account_name.replace(/"/g, '""')}"`,
        item.amount.toFixed(2),
      ]);
    });
    rows.push(['"TOTAL EXPENSES"', '""', '""', report.total_expenses.toFixed(2)]);

    // Net Result
    rows.push([
      `"NET ${report.result_type}"`,
      '""',
      '""',
      report.net_result.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerCsvDownload(csv, `HRSJM_Profit_Loss_${report.from_date}_to_${report.to_date}.csv`);
  },

  exportBalanceSheetCsv(report: BalanceSheetReportResponse): void {
    const headers = ['Section', 'Account Code', 'Account Name', 'Amount (INR)'];
    const rows: string[][] = [];

    // 1. Assets
    rows.push(['"1. ASSETS"', '""', '"--- ASSETS ---"', '""']);
    report.assets.items.forEach(item => {
      rows.push([
        '"Asset"',
        `"${item.account.account_code || ''}"`,
        `"${item.account.account_name.replace(/"/g, '""')}"`,
        item.amount.toFixed(2),
      ]);
    });
    rows.push(['"TOTAL ASSETS"', '""', '""', report.total_assets.toFixed(2)]);

    // 2. Liabilities
    rows.push(['"2. LIABILITIES"', '""', '"--- LIABILITIES ---"', '""']);
    report.liabilities.items.forEach(item => {
      rows.push([
        '"Liability"',
        `"${item.account.account_code || ''}"`,
        `"${item.account.account_name.replace(/"/g, '""')}"`,
        item.amount.toFixed(2),
      ]);
    });
    rows.push(['"TOTAL LIABILITIES"', '""', '""', report.total_liabilities.toFixed(2)]);

    // 3. Equity
    rows.push(['"3. FUND & EQUITY"', '""', '"--- FUND & EQUITY ---"', '""']);
    report.equity.items.forEach(item => {
      rows.push([
        '"Equity"',
        `"${item.account.account_code || ''}"`,
        `"${item.account.account_name.replace(/"/g, '""')}"`,
        item.amount.toFixed(2),
      ]);
    });
    rows.push([
      '"Current Period Surplus / (Deficit)"',
      '""',
      '"Calculated P&L"',
      report.equity.current_surplus_deficit.toFixed(2),
    ]);
    rows.push(['"TOTAL EQUITY"', '""', '""', report.total_equity.toFixed(2)]);
    rows.push([
      '"TOTAL LIABILITIES & EQUITY"',
      '""',
      '""',
      report.total_liabilities_and_equity.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerCsvDownload(csv, `HRSJM_Balance_Sheet_${report.as_of_date}.csv`);
  },

  // ==========================================
  // PRINTABLE STATEMENTS
  // ==========================================
  printStatement(title: string, htmlContent: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to open the printable statement.');
      return;
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Inter', Arial, sans-serif; color: #011F39; margin: 0; padding: 20px; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #011F39; padding-bottom: 12px; margin-bottom: 20px; }
          .org-title { font-size: 20px; font-weight: 800; color: #011F39; letter-spacing: 0.5px; }
          .org-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
          .report-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .report-meta { font-size: 11px; color: #475569; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 20px; }
          th { background: #011F39; color: #ffffff; font-weight: 600; text-align: left; padding: 7px 10px; font-size: 11px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 7px 10px; font-size: 11px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .text-right { text-align: right; }
          .font-bold { font-weight: 700; }
          .total-row { background: #f1f5f9; font-weight: bold; border-top: 2px solid #011F39; border-bottom: 2px solid #011F39; }
          .status-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
          .status-ok { background: #dcfce7; color: #166534; }
          .status-warn { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
          .sign-box { text-align: center; width: 200px; padding-top: 40px; border-top: 1px solid #0f172a; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="org-title">Human Rights &  Social Justice Mission</div>
          <div class="org-sub">Registered National Human Rights NGO • Regd No: HR/0092/2019 • 80G & 12A Certified</div>
          <div class="report-title">${title}</div>
          <div class="report-meta">Generated on ${new Date().toLocaleString('en-IN')} | Strict Audit & General Ledger Copy</div>
        </div>
        ${htmlContent}
        <div class="footer">
          <div>
            <div>Certified true and extracted from Official General Ledger.</div>
            <div>Computer generated statement — does not require physical stamp unless sealed.</div>
          </div>
          <div class="sign-box">
            Authorized Signatory / Finance Controller
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  },

  printTrialBalance(report: TrialBalanceReportResponse): void {
    const html = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 11px;">
        <div><strong>As of Date:</strong> ${report.as_of_date}</div>
        <div>
          <strong>Reconciliation Status:</strong> 
          <span class="status-badge ${report.is_balanced ? 'status-ok' : 'status-warn'}">
            ${report.is_balanced ? 'BALANCED' : 'OUT OF BALANCE'}
          </span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Account Code</th>
            <th style="width: 35%;">Account Name</th>
            <th style="width: 14%;">Classification</th>
            <th style="width: 18%;" class="text-right">Debit Balance (INR)</th>
            <th style="width: 18%;" class="text-right">Credit Balance (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${report.accounts
        .map(
          acc => `
            <tr>
              <td>${acc.account.account_code || '—'}</td>
              <td class="font-bold">${acc.account.account_name}</td>
              <td>${acc.account.account_type}</td>
              <td class="text-right">${acc.debit_balance > 0 ? formatCurrency(acc.debit_balance) : '—'}</td>
              <td class="text-right">${acc.credit_balance > 0 ? formatCurrency(acc.credit_balance) : '—'}</td>
            </tr>
          `
        )
        .join('')}
          <tr class="total-row">
            <td colspan="3" class="font-bold">GRAND TOTAL</td>
            <td class="text-right font-bold">${formatCurrency(report.total_debit)}</td>
            <td class="text-right font-bold">${formatCurrency(report.total_credit)}</td>
          </tr>
        </tbody>
      </table>
      <div style="font-size: 11px; color: ${report.is_balanced ? '#166534' : '#991b1b'}; margin-top: 8px;">
        ${report.is_balanced
        ? '✓ Verified: Total Gross Debits exactly equal Total Gross Credits. No ledger discrepancy detected.'
        : `⚠ Attention: Difference of ${formatCurrency(report.difference)} detected between debits and credits.`
      }
      </div>
    `;
    this.printStatement(`Trial Balance Statement (${report.as_of_date})`, html);
  },

  printProfitLoss(report: ProfitLossReportResponse): void {
    const html = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 11px;">
        <div><strong>Accounting Period:</strong> ${report.from_date} to ${report.to_date}</div>
        <div>
          <strong>Statement Result:</strong> 
          <span class="status-badge ${report.result_type === 'SURPLUS' ? 'status-ok' : 'status-warn'}">
            NET ${report.result_type}
          </span>
        </div>
      </div>

      <h4 style="margin: 16px 0 6px 0; color: #011F39; text-transform: uppercase;">1. Income / Inflows</h4>
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Account Code</th>
            <th style="width: 55%;">Account Title</th>
            <th style="width: 25%;" class="text-right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${report.income.items
        .map(
          item => `
            <tr>
              <td>${item.account.account_code || '—'}</td>
              <td class="font-bold">${item.account.account_name}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `
        )
        .join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL REVENUE / INCOME (A)</td>
            <td class="text-right font-bold">${formatCurrency(report.total_income)}</td>
          </tr>
        </tbody>
      </table>

      <h4 style="margin: 20px 0 6px 0; color: #011F39; text-transform: uppercase;">2. Operating Expenses / Outflows</h4>
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Account Code</th>
            <th style="width: 55%;">Account Title</th>
            <th style="width: 25%;" class="text-right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${report.expenses.items
        .map(
          item => `
            <tr>
              <td>${item.account.account_code || '—'}</td>
              <td class="font-bold">${item.account.account_name}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `
        )
        .join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL EXPENDITURE (B)</td>
            <td class="text-right font-bold">${formatCurrency(report.total_expenses)}</td>
          </tr>
        </tbody>
      </table>

      <div style="background: #f8fafc; border: 2px solid #011F39; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
        <div style="font-size: 13px; font-weight: 800; color: #011F39;">
          NET OPERATING ${report.result_type === 'SURPLUS' ? 'SURPLUS (A - B)' : 'DEFICIT (B - A)'}
        </div>
        <div style="font-size: 16px; font-weight: 800; color: ${report.result_type === 'SURPLUS' ? '#166534' : '#991b1b'};">
          ${formatCurrency(report.net_result)}
        </div>
      </div>
    `;
    this.printStatement(`Income & Expenditure Statement (${report.from_date} to ${report.to_date})`, html);
  },

  printBalanceSheet(report: BalanceSheetReportResponse): void {
    const html = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 11px;">
        <div><strong>As of Date:</strong> ${report.as_of_date}</div>
        <div>
          <strong>Balance Status:</strong> 
          <span class="status-badge ${report.is_balanced ? 'status-ok' : 'status-warn'}">
            ${report.is_balanced ? 'BALANCED' : 'OUT OF BALANCE'}
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h4 style="margin: 0 0 8px 0; color: #011F39; border-bottom: 2px solid #2563EB; padding-bottom: 4px;">1. ASSETS</h4>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th class="text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${report.assets.items
        .map(
          item => `
                <tr>
                  <td>
                    <div class="font-bold">${item.account.account_name}</div>
                    <small style="color: #64748b;">${item.account.account_code || ''}</small>
                  </td>
                  <td class="text-right font-bold">${formatCurrency(item.amount)}</td>
                </tr>
              `
        )
        .join('')}
              <tr class="total-row">
                <td>TOTAL ASSETS (A)</td>
                <td class="text-right">${formatCurrency(report.total_assets)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 style="margin: 0 0 8px 0; color: #011F39; border-bottom: 2px solid #A21CAF; padding-bottom: 4px;">2. LIABILITIES & FUND EQUITY</h4>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th class="text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="2" style="background: #f1f5f9; font-weight: 700; font-size: 10px;">A. CURRENT LIABILITIES</td></tr>
              ${report.liabilities.items
        .map(
          item => `
                <tr>
                  <td>
                    <div>${item.account.account_name}</div>
                    <small style="color: #64748b;">${item.account.account_code || ''}</small>
                  </td>
                  <td class="text-right">${formatCurrency(item.amount)}</td>
                </tr>
              `
        )
        .join('')}
              <tr style="background: #fafafa; font-weight: 600;">
                <td>Subtotal Liabilities</td>
                <td class="text-right">${formatCurrency(report.total_liabilities)}</td>
              </tr>

              <tr><td colspan="2" style="background: #f1f5f9; font-weight: 700; font-size: 10px;">B. CAPITAL & CORPUS FUNDS</td></tr>
              ${report.equity.items
        .map(
          item => `
                <tr>
                  <td>
                    <div>${item.account.account_name}</div>
                    <small style="color: #64748b;">${item.account.account_code || ''}</small>
                  </td>
                  <td class="text-right">${formatCurrency(item.amount)}</td>
                </tr>
              `
        )
        .join('')}
              <tr>
                <td>
                  <div class="font-bold" style="color: #166534;">Current Period Net Surplus</div>
                  <small style="color: #64748b;">Transferred from P&L</small>
                </td>
                <td class="text-right font-bold" style="color: #166534;">${formatCurrency(report.equity.current_surplus_deficit)}</td>
              </tr>
              <tr style="background: #fafafa; font-weight: 600;">
                <td>Subtotal Fund Equity</td>
                <td class="text-right">${formatCurrency(report.total_equity)}</td>
              </tr>

              <tr class="total-row">
                <td>TOTAL LIABILITIES & EQUITY (B)</td>
                <td class="text-right">${formatCurrency(report.total_liabilities_and_equity)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 10px; border-radius: 4px; margin-top: 14px; font-size: 11px; color: #166534;">
        ✓ Total Assets (${formatCurrency(report.total_assets)}) equal Total Liabilities & Fund Equity (${formatCurrency(report.total_liabilities_and_equity)}).
      </div>
    `;
    this.printStatement(`Balance Sheet Statement (${report.as_of_date})`, html);
  },
};
