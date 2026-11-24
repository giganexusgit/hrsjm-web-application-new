import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import type { ComplaintsOverviewData } from '../types/reports.types';

interface ComplaintsOverviewChartProps {
  data?: ComplaintsOverviewData;
  currentPresetLabel?: string;
}

export const ComplaintsOverviewChart: React.FC<ComplaintsOverviewChartProps> = ({
  data,
  currentPresetLabel = 'This Month',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const timeline = data?.timeline || [];
  const maxVal = Math.max(
    ...timeline.map(t => Math.max(t.received, t.resolved, t.pending)),
    0
  );
  const ceiling = maxVal > 10 ? Math.ceil((maxVal * 1.2) / 5) * 5 : Math.max(maxVal + 2, 5);

  const width = 580;
  const height = 150;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;
  const numPoints = Math.max(timeline.length - 1, 1);

  const receivedPoints = timeline.map((pt, i) => ({
    x: paddingLeft + (i / numPoints) * innerW,
    y: paddingTop + innerH - (pt.received / ceiling) * innerH,
    val: pt.received,
  }));

  const resolvedPoints = timeline.map((pt, i) => ({
    x: paddingLeft + (i / numPoints) * innerW,
    y: paddingTop + innerH - (pt.resolved / ceiling) * innerH,
    val: pt.resolved,
  }));

  const pendingPoints = timeline.map((pt, i) => ({
    x: paddingLeft + (i / numPoints) * innerW,
    y: paddingTop + innerH - (pt.pending / ceiling) * innerH,
    val: pt.pending,
  }));

  const makePath = (pts: Array<{ x: number; y: number }>) =>
    pts.length > 0 ? pts.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`, '') : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-serif">Complaints Overview</h4>
            <p className="text-xs text-slate-500">Total complaints and resolution status.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
          {currentPresetLabel}
        </span>
      </div>

      {/* 4 Status Mini Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-3 text-center">
        <div className="p-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total
          </span>
          <span className="text-base font-bold text-slate-900 font-serif">
            {data?.total ?? 0}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {data?.growth_pct ?? 0}% vs prev
          </span>
        </div>

        <div className="p-1 border-l border-slate-200">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Resolved
          </span>
          <span className="text-base font-bold text-emerald-700 font-serif">
            {data?.resolved ?? 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block">
            {data?.resolved_pct ?? 0}% rate
          </span>
        </div>

        <div className="p-1 border-l border-slate-200">
          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-base font-bold text-amber-700 font-serif">
            {data?.in_progress ?? 0}
          </span>
          <span className="text-[10px] text-amber-600 font-medium block">
            {data?.in_progress_pct ?? 0}%
          </span>
        </div>

        <div className="p-1 border-l border-slate-200">
          <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider block">
            Pending
          </span>
          <span className="text-base font-bold text-rose-700 font-serif">
            {data?.pending ?? 0}
          </span>
          <span className="text-[10px] text-rose-600 font-medium block">
            {data?.pending_pct ?? 0}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 text-xs mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span className="text-slate-600 text-[11px] font-medium">Received</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-slate-600 text-[11px] font-medium">Resolved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span className="text-slate-600 text-[11px] font-medium">Pending</span>
        </div>
      </div>

      {/* Multi-line chart SVG */}
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
              <g key={`cmp-grid-${idx}`}>
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

          {/* Line 1: Received */}
          <path
            d={makePath(receivedPoints)}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Line 2: Resolved */}
          <path
            d={makePath(resolvedPoints)}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Line 3: Pending */}
          <path
            d={makePath(pendingPoints)}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Points for received */}
          {receivedPoints.map((p, idx) => (
            <circle
              key={`rcv-${idx}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 5 : 3.5}
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ))}

          {/* Points for resolved */}
          {resolvedPoints.map((p, idx) => (
            <circle
              key={`res-${idx}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 5 : 3.5}
              fill="#10B981"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ))}

          {/* Hover trigger zones & X Axis labels */}
          {timeline.map((pt, i) => {
            const x = paddingLeft + (i / numPoints) * innerW;
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={`col-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <text
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  fontWeight="500"
                >
                  {pt.label}
                </text>
                {isHovered && (
                  <g>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + innerH}
                      stroke="#94A3B8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <rect
                      x={x - 45}
                      y={paddingTop - 12}
                      width="90"
                      height="20"
                      rx="3"
                      fill="#011F39"
                    />
                    <text
                      x={x}
                      y={paddingTop + 2}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="600"
                    >
                      R:{pt.received} | S:{pt.resolved} | P:{pt.pending}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
