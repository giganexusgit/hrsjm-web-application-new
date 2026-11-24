import React, { useEffect, useTransition } from 'react';
import { BarChart3, Printer } from 'lucide-react';
import { useReportsStore, reportsStore } from '../store/reportsStore';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { ReportKpiCards } from '../components/ReportKpiCards';
import { UserGrowthChart } from '../components/UserGrowthChart';
import { UserDistributionChart } from '../components/UserDistributionChart';
import { DonationsOverviewChart } from '../components/DonationsOverviewChart';
import { ComplaintsOverviewChart } from '../components/ComplaintsOverviewChart';
import { TopContentTable } from '../components/TopContentTable';
import { EventsOverviewChart } from '../components/EventsOverviewChart';
import { FinancialStatementsNav } from '../components/FinancialStatementsNav';
import { getDatePresets } from '../data/reportsFixtures';
import type { DatePresetKey } from '../types/reports.types';

export const ReportsOverviewPage: React.FC = () => {
  const store = useReportsStore();
  const [, startTransition] = useTransition();

  useEffect(() => {
    reportsStore.refreshAll();
  }, []);

  const presets = getDatePresets();
  const currentPresetObj = presets.find(p => p.key === store.selectedPreset);
  const currentPresetLabel = currentPresetObj ? currentPresetObj.label : 'Selected Period';

  const handleSelectPreset = (key: DatePresetKey) => {
    startTransition(() => {
      reportsStore.setPreset(key);
    });
  };

  const handleApplyCustom = (startDate: string, endDate: string) => {
    startTransition(() => {
      reportsStore.setCustomDateRange(startDate, endDate);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      reportsStore.refreshAll();
    });
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#011F39] text-[#FAD465] rounded-xl shadow-sm">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif">Reports & Platform Analytics</h1>
              <p className="text-sm text-slate-500">
                Insights and analytics of platform activities, revenue, users, grievances and events.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Print Dashboard
          </button>
        </div>
      </div>

      {/* Date Selector Bar */}
      <ReportDateSelector
        selectedPreset={store.selectedPreset}
        startDate={store.startDate}
        endDate={store.endDate}
        onSelectPreset={handleSelectPreset}
        onApplyCustom={handleApplyCustom}
        onRefresh={handleRefresh}
        isRefreshing={store.isRefreshing}
      />

      {/* 1. TOP 4 KPI CARDS */}
      <ReportKpiCards
        kpis={store.analytics.kpis}
        selectedPreset={store.selectedPreset}
      />

      {/* 2. ANALYTICS CHARTS SECTION (2-COL RESPONSIVE GRID) */}
      <div className="space-y-6">
        {/* Row 1: User Growth + User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserGrowthChart
            data={store.analytics.user_growth}
            currentPresetLabel={currentPresetLabel}
          />
          <UserDistributionChart
            data={store.analytics.user_distribution}
            totalUsers={store.analytics.kpis?.total_users}
          />
        </div>

        {/* Row 2: Donations Overview + Complaints Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonationsOverviewChart
            data={store.analytics.donations_overview}
            currentPresetLabel={currentPresetLabel}
          />
          <ComplaintsOverviewChart
            data={store.analytics.complaints_overview}
            currentPresetLabel={currentPresetLabel}
          />
        </div>

        {/* Row 3: Top Content Table + Events Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopContentTable
            rights={store.analytics.top_content.rights}
            blogs={store.analytics.top_content.blogs}
            news={store.analytics.top_content.news}
            currentPresetLabel={currentPresetLabel}
          />
          <EventsOverviewChart
            data={store.analytics.events_overview}
            currentPresetLabel={currentPresetLabel}
          />
        </div>
      </div>

      {/* 3. FINANCIAL STATEMENTS & AUDIT REPORTS LIST */}
      <div className="pt-4">
        <FinancialStatementsNav
          tbSummary={store.trialBalanceSummary}
          plSummary={store.profitLossSummary}
          bsSummary={store.balanceSheetSummary}
        />
      </div>
    </div>
  );
};
