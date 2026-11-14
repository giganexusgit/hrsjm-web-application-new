import type {
  BalanceSheetReportResponse,
  BalanceSheetSummaryResponse,
  DateRangePreset,
  ProfitLossReportResponse,
  ProfitLossSummaryResponse,
  ReportsAnalyticsResponse,
  TrialBalanceReportResponse,
  TrialBalanceSummaryResponse,
} from '../types/reports.types';

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
export const formatDateStr = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const getDatePresets = (): DateRangePreset[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0);

  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);

  let qStartMonth = 0;
  if (month >= 3 && month <= 5) qStartMonth = 3;
  else if (month >= 6 && month <= 8) qStartMonth = 6;
  else if (month >= 9 && month <= 11) qStartMonth = 9;
  else qStartMonth = 0;
  const thisQuarterStart = new Date(year, qStartMonth, 1);
  const thisQuarterEnd = new Date(year, qStartMonth + 3, 0);

  const isAfterApr = month >= 3;
  const fyStartYear = isAfterApr ? year : year - 1;
  const fyEndYear = fyStartYear + 1;
  const thisFyStart = new Date(fyStartYear, 3, 1);
  const thisFyEnd = new Date(fyEndYear, 2, 31);

  const lastFyStart = new Date(fyStartYear - 1, 3, 1);
  const lastFyEnd = new Date(fyStartYear, 2, 31);

  return [
    {
      key: 'THIS_MONTH',
      label: 'This Month',
      startDate: formatDateStr(thisMonthStart),
      endDate: formatDateStr(thisMonthEnd),
      asOfDate: formatDateStr(thisMonthEnd),
    },
    {
      key: 'LAST_MONTH',
      label: 'Last Month',
      startDate: formatDateStr(lastMonthStart),
      endDate: formatDateStr(lastMonthEnd),
      asOfDate: formatDateStr(lastMonthEnd),
    },
    {
      key: 'THIS_QUARTER',
      label: 'This Quarter',
      startDate: formatDateStr(thisQuarterStart),
      endDate: formatDateStr(thisQuarterEnd),
      asOfDate: formatDateStr(thisQuarterEnd),
    },
    {
      key: 'THIS_FY',
      label: `FY ${fyStartYear}-${fyEndYear.toString().slice(2)}`,
      startDate: formatDateStr(thisFyStart),
      endDate: formatDateStr(thisFyEnd),
      asOfDate: formatDateStr(thisFyEnd),
    },
    {
      key: 'LAST_FY',
      label: `FY ${fyStartYear - 1}-${fyStartYear.toString().slice(2)}`,
      startDate: formatDateStr(lastFyStart),
      endDate: formatDateStr(lastFyEnd),
      asOfDate: formatDateStr(lastFyEnd),
    },
  ];
};

export const getDefaultDatePreset = (): DateRangePreset => {
  return getDatePresets()[0];
};

// ==========================================
// CLEAN ZEROED PLATFORM ANALYTICS RESPONSE
// ==========================================
export const MOCK_REPORTS_ANALYTICS: ReportsAnalyticsResponse = {
  kpis: {
    total_users: 0,
    users_growth_pct: 0,
    total_donations_amount: 0,
    donations_growth_pct: 0,
    total_donations_count: 0,
    total_complaints: 0,
    complaints_growth_pct: 0,
    total_events: 0,
    events_growth_pct: 0,
  },
  user_growth: [],
  user_distribution: [],
  donations_overview: {
    total_amount: 0,
    growth_pct: 0,
    total_donations: 0,
    donations_count_growth_pct: 0,
    timeline: [],
  },
  complaints_overview: {
    total: 0,
    resolved: 0,
    in_progress: 0,
    pending: 0,
    growth_pct: 0,
    resolved_pct: 0,
    in_progress_pct: 0,
    pending_pct: 0,
    timeline: [],
  },
  top_content: {
    rights: [],
    blogs: [],
    news: [],
  },
  events_overview: {
    total_events: 0,
    events_growth_pct: 0,
    total_registrations: 0,
    registrations_growth_pct: 0,
    avg_attendance_pct: 0,
    timeline: [],
  },
};

// ==========================================
// CLEAN ZEROED TRIAL BALANCE REPORT
// ==========================================
export const MOCK_TRIAL_BALANCE: TrialBalanceReportResponse = {
  as_of_date: formatDateStr(new Date()),
  accounts: [],
  total_debit: 0,
  total_credit: 0,
  total_gross_debit: 0,
  total_gross_credit: 0,
  difference: 0,
  is_balanced: true,
};

export const MOCK_TRIAL_BALANCE_SUMMARY: TrialBalanceSummaryResponse = {
  as_of_date: formatDateStr(new Date()),
  total_debit: 0,
  total_credit: 0,
  difference: 0,
  is_balanced: true,
  total_accounts: 0,
  by_account_type: {},
};

// ==========================================
// CLEAN ZEROED PROFIT & LOSS REPORT
// ==========================================
export const MOCK_PROFIT_LOSS: ProfitLossReportResponse = {
  from_date: formatDateStr(new Date()),
  to_date: formatDateStr(new Date()),
  income: { items: [], total: 0 },
  expenses: { items: [], total: 0 },
  total_income: 0,
  total_expenses: 0,
  net_result: 0,
  net_profit_loss: 0,
  result_type: 'SURPLUS',
};

export const MOCK_PROFIT_LOSS_SUMMARY: ProfitLossSummaryResponse = {
  from_date: formatDateStr(new Date()),
  to_date: formatDateStr(new Date()),
  total_income: 0,
  total_expenses: 0,
  net_result: 0,
  net_profit_loss: 0,
  result_type: 'SURPLUS',
  income_accounts_count: 0,
  expense_accounts_count: 0,
};

// ==========================================
// CLEAN ZEROED BALANCE SHEET REPORT
// ==========================================
export const MOCK_BALANCE_SHEET: BalanceSheetReportResponse = {
  as_of_date: formatDateStr(new Date()),
  assets: { items: [], total: 0 },
  liabilities: { items: [], total: 0 },
  equity: { items: [], total_equity_accounts: 0, current_surplus_deficit: 0, total: 0 },
  total_assets: 0,
  total_liabilities: 0,
  total_equity: 0,
  total_liabilities_and_equity: 0,
  difference: 0,
  is_balanced: true,
};

export const MOCK_BALANCE_SHEET_SUMMARY: BalanceSheetSummaryResponse = {
  as_of_date: formatDateStr(new Date()),
  total_assets: 0,
  total_liabilities: 0,
  total_equity: 0,
  current_surplus_deficit: 0,
  total_liabilities_and_equity: 0,
  difference: 0,
  is_balanced: true,
  asset_accounts_count: 0,
  liability_accounts_count: 0,
  equity_accounts_count: 0,
};
