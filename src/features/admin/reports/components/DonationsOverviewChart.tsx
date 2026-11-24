import React, { useState } from 'react';
import { HeartHandshake, TrendingUp } from 'lucide-react';
import type { DonationsOverviewData } from '../types/reports.types';

interface DonationsOverviewChartProps {
  data?: DonationsOverviewData;
  currentPresetLabel?: string;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const DonationsOverviewChart: React.FC<DonationsOverviewChartProps> = ({
  data,
  currentPresetLabel = 'This Month',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const timeline = data?.timeline || [];
  const maxDonation = Math.max(...timeline.map(t => t.amount), 0);
  const ceiling = maxDonation > 500 ? Math.ceil((maxDonation * 1.15) / 1000) * 1000 : Math.max(Math.ceil(maxDonation * 1.2), 100);

  const width = 580;
  const height = 150;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;
  const stepX = innerW / Math.max(timeline.length, 1);
  const barWidth = 22;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-serif">Donations Overview</h4>
            <p className="text-xs text-slate-500">Total donations received and count.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
          {currentPresetLabel}
        </span>
      </div>

      {/* Mini-KPI Strip */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Amount
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg font-bold text-slate-900 font-serif">
              {data ? formatINR(data.total_amount) : '—'}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />+{data?.growth_pct ?? 0}%
            </span>
          </div>
        </div>

        <div className="border-l border-slate-200 pl-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Donations
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg font-bold text-slate-900 font-serif">
              {data?.total_donations?.toLocaleString('en-IN') ?? '—'}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />+{data?.donations_count_growth_pct ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart SVG */}
      <div className="w-full overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 select-none"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = paddingTop + innerH * ratio;
            const val = Math.round(ceiling * (1 - ratio));
            return (
              <g key={`don-grid-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontWeight="500"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {timeline.map((pt, i) => {
            const barH = pt.amount > 0 ? Math.max(6, (pt.amount / ceiling) * innerH) : 2;
            const x = paddingLeft + i * stepX + (stepX - barWidth) / 2;
            const y = paddingTop + innerH - barH;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={`bar-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="4"
                  fill={isHovered ? '#059669' : '#10B981'}
                  className="transition-colors duration-200"
                />
                {isHovered && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 40}
                      y={y - 28}
                      width="80"
                      height="22"
                      rx="4"
                      fill="#011F39"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 14}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {formatINR(pt.amount)}
                    </text>
                  </g>
                )}
                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  fontWeight="500"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
