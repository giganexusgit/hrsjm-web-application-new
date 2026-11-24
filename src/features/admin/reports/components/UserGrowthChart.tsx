import React, { useState } from 'react';
import { Users } from 'lucide-react';
import type { UserGrowthPoint } from '../types/reports.types';

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
  currentPresetLabel?: string;
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
  data,
  currentPresetLabel = 'This Year',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawMax = Math.max(...data.map(d => d.count), 0);
  const maxVal = rawMax > 20 ? Math.ceil((rawMax * 1.15) / 10) * 10 : Math.max(rawMax + 2, 5);

  // Chart coordinates
  const width = 580;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;

  const points = data.map((pt, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = paddingTop + innerH - (pt.count / maxVal) * innerH;
    return { x, y, pt };
  });

  const lineD = points.length > 0
    ? points.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`, '')
    : '';

  const areaD = points.length > 0
    ? `${lineD} L ${points[points.length - 1].x.toFixed(1)} ${paddingTop + innerH} L ${points[0].x.toFixed(1)} ${paddingTop + innerH} Z`
    : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-serif">User Growth</h4>
            <p className="text-xs text-slate-500">New user registrations over time.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
          {currentPresetLabel}
        </span>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="userGrowthAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + innerH * ratio;
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={`grid-${idx}`}>
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

          {/* Area */}
          {areaD && <path d={areaD} fill="url(#userGrowthAreaGradient)" />}

          {/* Line */}
          {lineD && (
            <path
              d={lineD}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={`pt-${idx}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
                {isHovered && (
                  <g>
                    <rect
                      x={p.x - 35}
                      y={p.y - 30}
                      width="70"
                      height="22"
                      rx="4"
                      fill="#011F39"
                    />
                    <text
                      x={p.x}
                      y={p.y - 15}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {p.pt.count.toLocaleString()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* X Axis labels */}
          {points.map((p, idx) => (
            <text
              key={`x-${idx}`}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#64748B"
              fontWeight="500"
            >
              {p.pt.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
