import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { EventsOverviewData } from '../types/reports.types';

interface EventsOverviewChartProps {
  data?: EventsOverviewData;
  currentPresetLabel?: string;
}

export const EventsOverviewChart: React.FC<EventsOverviewChartProps> = ({
  data,
  currentPresetLabel = 'This Month',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const timeline = data?.timeline || [];
  const maxEvents = Math.max(
    ...timeline.map(t => Math.max(t.registrations, t.attendance)),
    0
  );
  const ceiling = maxEvents > 50 ? Math.ceil((maxEvents * 1.15) / 50) * 50 : Math.max(maxEvents + 5, 10);

  const width = 580;
  const height = 150;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;
  const stepX = innerW / Math.max(timeline.length, 1);
  const barWidth = 10;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-serif">Events Overview</h4>
            <p className="text-xs text-slate-500">Event registrations and attendance.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
          {currentPresetLabel}
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-3 text-center">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Events
          </span>
          <span className="text-base font-bold text-slate-900 font-serif">
            {data?.total_events ?? 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block">
            +{data?.events_growth_pct ?? 0}%
          </span>
        </div>

        <div className="border-l border-slate-200">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Registrations
          </span>
          <span className="text-base font-bold text-slate-900 font-serif">
            {data?.total_registrations?.toLocaleString('en-IN') ?? 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block">
            +{data?.registrations_growth_pct ?? 0}%
          </span>
        </div>

        <div className="border-l border-slate-200 bg-purple-50/50 rounded-md">
          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block">
            Avg Attendance
          </span>
          <span className="text-base font-bold text-purple-700 font-serif">
            {data?.avg_attendance_pct ?? 0}%
          </span>
          <span className="text-[10px] text-purple-600 font-medium block">
            Turnout Rate
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 text-xs mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span className="text-slate-600 text-[11px] font-medium">Registrations</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-slate-600 text-[11px] font-medium">Attendance</span>
        </div>
      </div>

      {/* Dual Bar Chart SVG */}
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
              <g key={`evt-grid-${idx}`}>
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
                  {val}
                </text>
              </g>
            );
          })}

          {/* Dual Bars */}
          {timeline.map((pt, i) => {
            const groupX = paddingLeft + i * stepX + (stepX - barWidth * 2 - 4) / 2;
            const xReg = groupX;
            const xAtt = groupX + barWidth + 3;

            const regH = pt.registrations > 0 ? Math.max(4, (pt.registrations / ceiling) * innerH) : 2;
            const attH = pt.attendance > 0 ? Math.max(4, (pt.attendance / ceiling) * innerH) : 2;

            const yReg = paddingTop + innerH - regH;
            const yAtt = paddingTop + innerH - attH;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={`evt-bar-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Registration Bar (Blue) */}
                <rect
                  x={xReg}
                  y={yReg}
                  width={barWidth}
                  height={regH}
                  rx="2"
                  fill={isHovered ? '#1D4ED8' : '#2563EB'}
                />

                {/* Attendance Bar (Green) */}
                <rect
                  x={xAtt}
                  y={yAtt}
                  width={barWidth}
                  height={attH}
                  rx="2"
                  fill={isHovered ? '#059669' : '#10B981'}
                />

                {isHovered && (
                  <g>
                    <rect
                      x={groupX - 30}
                      y={Math.min(yReg, yAtt) - 26}
                      width="80"
                      height="20"
                      rx="3"
                      fill="#011F39"
                    />
                    <text
                      x={groupX + 10}
                      y={Math.min(yReg, yAtt) - 12}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="600"
                    >
                      Reg:{pt.registrations} | Att:{pt.attendance}
                    </text>
                  </g>
                )}

                {/* Month label */}
                <text
                  x={groupX + barWidth + 1.5}
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
