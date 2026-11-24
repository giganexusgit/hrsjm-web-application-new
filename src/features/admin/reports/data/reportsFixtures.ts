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
// REALISTIC PLATFORM ANALYTICS BASELINE
// ==========================================
export const MOCK_REPORTS_ANALYTICS: ReportsAnalyticsResponse = {
  kpis: {
    total_users: 8,
    users_growth_pct: 0,
    total_donations_amount: 10,
    donations_growth_pct: 0,
    total_donations_count: 1,
    total_complaints: 1,
    complaints_growth_pct: 0,
    total_events: 0,
    events_growth_pct: 0,
  },
  user_growth: [
    { label: '1 Nov', count: 0, date: '2026-11-01' },
    { label: '8 Nov', count: 0, date: '2026-11-08' },
    { label: '15 Nov', count: 0, date: '2026-11-15' },
    { label: '23 Nov', count: 7, date: '2026-11-23' },
    { label: '30 Nov', count: 8, date: '2026-11-30' },
  ],
  user_distribution: [
    { label: 'Members', count: 1, pct: '13%', color: '#3B82F6' },
    { label: 'Donation Seekers', count: 1, pct: '13%', color: '#10B981' },
    { label: 'Donors', count: 1, pct: '13%', color: '#F59E0B' },
    { label: 'Complaint Users', count: 1, pct: '13%', color: '#EF4444' },
    { label: 'General Users', count: 4, pct: '50%', color: '#8B5CF6' },
  ],
  donations_overview: {
    total_amount: 10,
    growth_pct: 0,
    total_donations: 1,
    donations_count_growth_pct: 0,
    timeline: [
      { label: '6 Nov', amount: 0, count: 0 },
      { label: '12 Nov', amount: 0, count: 0 },
      { label: '18 Nov', amount: 10, count: 1 },
      { label: '24 Nov', amount: 0, count: 0 },
      { label: '30 Nov', amount: 0, count: 0 },
    ],
  },
  complaints_overview: {
    total: 1,
    resolved: 0,
    in_progress: 0,
    pending: 1,
    growth_pct: 0,
    resolved_pct: 0,
    in_progress_pct: 0,
    pending_pct: 100,
    timeline: [
      { label: '6 Nov', received: 0, resolved: 0, pending: 0 },
      { label: '12 Nov', received: 0, resolved: 0, pending: 0 },
      { label: '18 Nov', received: 0, resolved: 0, pending: 0 },
      { label: '24 Nov', received: 1, resolved: 0, pending: 1 },
      { label: '30 Nov', received: 0, resolved: 0, pending: 0 },
    ],
  },
  top_content: {
    rights: [
      { rank: 1, title: 'Fundamental Rights of Every Citizen', views: '1.4K' },
      { rank: 2, title: "Women's Rights and Legal Protection", views: '1.1K' },
      { rank: 3, title: 'Child Rights and Protection Laws', views: '950' },
      { rank: 4, title: 'Labour Rights and Workplace Safety', views: '720' },
      { rank: 5, title: 'Environmental Rights & Green Acts', views: '540' },
    ],
    blogs: [
      { rank: 1, title: 'Understanding Your Legal Rights as a Citizen', views: '2.1K' },
      { rank: 2, title: 'The Importance of Community Support', views: '1.9K' },
      { rank: 3, title: 'Relief Efforts for Flood-Affected Families', views: '1.8K' },
      { rank: 4, title: "Highlights from HRSJM's Community Outreach Program", views: '1.6K' },
      { rank: 5, title: 'Empowering Women Through Legal Awareness', views: '1.2K' },
    ],
    news: [
      { rank: 1, title: 'Know Your Rights: Arrest and Bail Process', views: '2.1K' },
      { rank: 2, title: 'Relief Support Provided to Flood-Affected Families', views: '1.5K' },
      { rank: 3, title: 'HRSJM Organizes Legal Aid Camp in Kurla', views: '1.2K' },
      { rank: 4, title: 'HRSJM Raises Concern on Recent Policy Changes', views: '1.1K' },
      { rank: 5, title: 'Supreme Court Highlights Importance of Human Rights', views: '980' },
    ],
  },
  events_overview: {
    total_events: 0,
    events_growth_pct: 0,
    total_registrations: 0,
    registrations_growth_pct: 0,
    avg_attendance_pct: 0,
    timeline: [
      { label: '6 Nov', events: 0, registrations: 0, attendance: 0 },
      { label: '12 Nov', events: 0, registrations: 0, attendance: 0 },
      { label: '18 Nov', events: 0, registrations: 0, attendance: 0 },
      { label: '24 Nov', events: 0, registrations: 0, attendance: 0 },
      { label: '30 Nov', events: 0, registrations: 0, attendance: 0 },
    ],
  },
};

// ==========================================
// REALISTIC TRIAL BALANCE SUMMARY BASELINE
// ==========================================
export const MOCK_TRIAL_BALANCE: TrialBalanceReportResponse = {
  as_of_date: formatDateStr(new Date()),
  accounts: [],
  total_debit: 512,
  total_credit: 512,
  total_gross_debit: 512,
  total_gross_credit: 512,
  difference: 0,
  is_balanced: true,
};

export const MOCK_TRIAL_BALANCE_SUMMARY: TrialBalanceSummaryResponse = {
  as_of_date: formatDateStr(new Date()),
  total_debit: 512,
  total_credit: 512,
  difference: 0,
  is_balanced: true,
  total_accounts: 2,
  by_account_type: {},
};

// ==========================================
// REALISTIC PROFIT & LOSS SUMMARY BASELINE
// ==========================================
export const MOCK_PROFIT_LOSS: ProfitLossReportResponse = {
  from_date: formatDateStr(new Date()),
  to_date: formatDateStr(new Date()),
  income: { items: [], total: 512 },
  expenses: { items: [], total: 0 },
  total_income: 512,
  total_expenses: 0,
  net_result: 512,
  net_profit_loss: 512,
  result_type: 'SURPLUS',
};

export const MOCK_PROFIT_LOSS_SUMMARY: ProfitLossSummaryResponse = {
  from_date: formatDateStr(new Date()),
  to_date: formatDateStr(new Date()),
  total_income: 512,
  total_expenses: 0,
  net_result: 512,
  net_profit_loss: 512,
  result_type: 'SURPLUS',
  income_accounts_count: 1,
  expense_accounts_count: 0,
};

// ==========================================
// REALISTIC BALANCE SHEET SUMMARY BASELINE
// ==========================================
export const MOCK_BALANCE_SHEET: BalanceSheetReportResponse = {
  as_of_date: formatDateStr(new Date()),
  assets: { items: [], total: 512 },
  liabilities: { items: [], total: 0 },
  equity: { items: [], total_equity_accounts: 0, current_surplus_deficit: 512, total: 512 },
  total_assets: 512,
  total_liabilities: 0,
  total_equity: 512,
  total_liabilities_and_equity: 512,
  difference: 0,
  is_balanced: true,
};

export const MOCK_BALANCE_SHEET_SUMMARY: BalanceSheetSummaryResponse = {
  as_of_date: formatDateStr(new Date()),
  total_assets: 512,
  total_liabilities: 0,
  total_equity: 512,
  current_surplus_deficit: 512,
  total_liabilities_and_equity: 512,
  difference: 0,
  is_balanced: true,
  asset_accounts_count: 1,
  liability_accounts_count: 0,
  equity_accounts_count: 0,
};
