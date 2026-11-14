import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import type { GrowthPoint } from '../data/dashboardDemoData';
import { DEMO_GROWTH_DATA } from '../data/dashboardDemoData';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MembershipGrowthChartProps {
  initialGrowth?: { month: string; total: number }[];
  growthData?: { month: string; total: number }[];
  totalMembers?: number;
  currentCount?: number;
  activeMembers?: number;
}

interface ExtendedGrowthPoint extends GrowthPoint {
  fullLabel?: string;
}

const parseMonthlyGrowth = (growthList: { month: string; total: number }[]): ExtendedGrowthPoint[] => {
  return growthList.map((g) => {
    const parts = (g.month || '').split('-');
    const mIndex = parseInt(parts[1] || '1', 10) - 1;
    const shortLabel = MONTH_NAMES[mIndex] || g.month;
    return {
      label: shortLabel,
      fullLabel: `${MONTH_NAMES[mIndex] || ''} ${parts[0] || ''}`.trim(),
      members: Number(g.total) || 0,
    };
  });
};

const computeDailyGrowthFromMembers = (
  members: any[],
  daysCount: number,
  sampleInterval = 1
): ExtendedGrowthPoint[] => {
  const withMemb = members.filter((m) => m && (m.membership || m.membershipNumber || m.status));
  const now = new Date();
  const points: ExtendedGrowthPoint[] = [];

  for (let i = daysCount - 1; i >= 0; i -= sampleInterval) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(23, 59, 59, 999);
    const count = withMemb.filter((m) => new Date(m.created_at) <= d).length;

    const label =
      daysCount <= 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const fullLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    points.push({ label, fullLabel, members: count });
  }

  return points;
};

export const MembershipGrowthChart: React.FC<MembershipGrowthChartProps> = ({
  initialGrowth,
  growthData,
  totalMembers,
  currentCount,
  activeMembers,
}) => {
  const effectiveGrowth = initialGrowth || growthData;
  const effectiveTotal = totalMembers ?? currentCount;
  const [range, setRange] = useState<'7d' | '30d' | '6m' | '1y'>('6m');
  const [hoveredPoint, setHoveredPoint] = useState<ExtendedGrowthPoint | null>(null);
  const [cachedData, setCachedData] = useState<Record<string, ExtendedGrowthPoint[]>>(() => {
    const initial: Record<string, ExtendedGrowthPoint[]> = {};
    if (effectiveGrowth && effectiveGrowth.length > 0) {
      initial['6m'] = parseMonthlyGrowth(effectiveGrowth);
    }
    return initial;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [membersCount, setMembersCount] = useState<{ total?: number; active?: number }>({
    total: effectiveTotal,
    active: activeMembers,
  });

  // Sync when initial props arrive or change
  useEffect(() => {
    if (effectiveGrowth && effectiveGrowth.length > 0) {
      const parsed = parseMonthlyGrowth(effectiveGrowth);
      setCachedData((prev) => ({ ...prev, '6m': parsed }));
      setIsLiveConnected(true);
    }
  }, [effectiveGrowth]);

  useEffect(() => {
    if (effectiveTotal !== undefined || activeMembers !== undefined) {
      setMembersCount({ total: effectiveTotal, active: activeMembers });
    }
  }, [effectiveTotal, activeMembers]);

  // Load data for the requested range from live API
  const loadDataForRange = useCallback(
    async (selectedRange: '7d' | '30d' | '6m' | '1y') => {
      // If already cached, no need to refetch immediately
      if (cachedData[selectedRange] && cachedData[selectedRange].length > 0) {
        return;
      }

      setIsLoading(true);
      try {
        if (selectedRange === '6m' || selectedRange === '1y') {
          const growthMonths = selectedRange === '1y' ? 12 : 6;
          const res = await apiClient.get<any>('/admin/dashboard', { params: { growthMonths } });
          const data = (res as any)?.data || res;
          if (data?.memberGrowth && Array.isArray(data.memberGrowth) && data.memberGrowth.length > 0) {
            const parsed = parseMonthlyGrowth(data.memberGrowth);
            setCachedData((prev) => ({ ...prev, [selectedRange]: parsed }));
            setIsLiveConnected(true);
            if (data.memberships) {
              setMembersCount({
                total: data.memberships.total,
                active: data.memberships.active,
              });
            }
          }
        } else {
          // '7d' or '30d': fetch live member roster to aggregate daily cumulative counts
          const res = await apiClient.get<any>('/admin/members', { params: { limit: 100 } });
          const data = (res as any)?.data || res;
          const items = data?.items || (Array.isArray(data) ? data : []);
          if (items.length > 0) {
            const daysCount = selectedRange === '7d' ? 7 : 30;
            const interval = selectedRange === '7d' ? 1 : 5;
            const parsed = computeDailyGrowthFromMembers(items, daysCount, interval);
            setCachedData((prev) => ({ ...prev, [selectedRange]: parsed }));
            setIsLiveConnected(true);
          }
        }
      } catch (err) {
        console.warn(`Could not sync live member growth for range ${selectedRange}:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [cachedData]
  );

  useEffect(() => {
    loadDataForRange(range);
  }, [range, loadDataForRange]);

  // Determine current active points list (live data or fallback)
  const points: ExtendedGrowthPoint[] = useMemo(() => {
    if (cachedData[range] && cachedData[range].length >= 2) {
      return cachedData[range];
    }
    return (DEMO_GROWTH_DATA[range] || DEMO_GROWTH_DATA['6m']) as ExtendedGrowthPoint[];
  }, [cachedData, range]);

  const minVal = points.length > 0 ? Math.min(...points.map((p) => p.members)) : 0;
  const maxVal = points.length > 0 ? Math.max(...points.map((p) => p.members)) : 10;
  const paddingY = Math.max(2, (maxVal - minVal) * 0.15 || 5);
  const floorVal = Math.max(0, Math.floor(minVal - paddingY));
  const ceilVal = Math.ceil(maxVal + paddingY);

  const width = 960;
  const height = 240;
  const padLeft = 46;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 34;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (index: number) => {
    if (points.length <= 1) return padLeft + chartW / 2;
    return padLeft + (index / (points.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    const rangeY = ceilVal - floorVal || 1;
    return padTop + chartH - ((val - floorVal) / rangeY) * chartH;
  };

  const coordinates = points.map((p, idx) => ({
    x: getX(idx),
    y: getY(p.members),
    ...p,
  }));

  // Construct SVG Path
  const linePath = coordinates.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPath =
    coordinates.length > 0
      ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${
          padTop + chartH
        } L ${coordinates[0].x} ${padTop + chartH} Z`
      : '';

  const latestVal = points.length > 0 ? points[points.length - 1].members : 0;
  const displayActive = membersCount.active ?? latestVal;
  const displayTotal = membersCount.total;

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.titleWrap}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={styles.badge}>
              <TrendingUp size={16} color="#06294D" />
              <span style={styles.badgeLabel}>Growth Trajectory</span>
            </div>
            {isLiveConnected && (
              <span style={styles.liveBadge}>
                <span style={styles.liveDot} />
                Live API
              </span>
            )}
            {isLoading && (
              <RefreshCw size={13} className="animate-spin" style={{ color: '#06294D' }} />
            )}
          </div>
          <h3 style={styles.title}>Membership Expansion Trend</h3>
          <p style={styles.subtitle}>
            Verified membership roster: <strong>{displayActive.toLocaleString()}</strong> active members
            {displayTotal !== undefined && displayTotal !== displayActive && (
              <span style={{ color: '#718096', fontSize: '12px' }}>
                {' '}
                ({displayTotal.toLocaleString()} registered total)
              </span>
            )}
          </p>
        </div>

        {/* Range Selector Pill Group */}
        <div style={styles.rangeGroup}>
          {(['7d', '30d', '6m', '1y'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              style={{
                ...styles.rangeBtn,
                ...(range === r ? styles.rangeBtnActive : {}),
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Viewport */}
      <div style={styles.svgContainer}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="growthAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAD465" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#123F68" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06294D" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio) => {
            const y = padTop + chartH * ratio;
            const val = Math.round(ceilVal - (ceilVal - floorVal) * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#718096"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Fill Area Under Curve */}
          {areaPath && <path d={areaPath} fill="url(#growthAreaGrad)" />}

          {/* Trendline */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#06294D"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Accent Gold Trendline Glow */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#FAD465"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {coordinates.map((pt) => (
            <g
              key={pt.label}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.label === pt.label ? 7 : 4.5}
                fill="#FFFFFF"
                stroke="#06294D"
                strokeWidth="2.5"
                style={{ transition: 'r 0.15s ease' }}
              />
              <circle cx={pt.x} cy={pt.y} r={2} fill="#FAD465" />

              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight={hoveredPoint?.label === pt.label ? 700 : 500}
                fill={hoveredPoint?.label === pt.label ? '#06294D' : '#718096'}
                fontFamily="Inter, sans-serif"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div style={styles.tooltip}>
            <span style={styles.tooltipLabel}>{hoveredPoint.fullLabel || hoveredPoint.label}:</span>
            <span style={styles.tooltipVal}>{hoveredPoint.members.toLocaleString()} members</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px -2px rgba(1, 31, 57, 0.05)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#EDF2F7',
    padding: '3px 10px',
    borderRadius: '999px',
    width: 'fit-content',
  },
  badgeLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#06294D',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#16A34A',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0B2F52',
    margin: '4px 0 0 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#34516D',
    margin: 0,
  },
  rangeGroup: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#FAF7F0',
    border: '1px solid #DCE4EC',
    padding: '3px',
    borderRadius: '8px',
  },
  rangeBtn: {
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: 600,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#718096',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  rangeBtnActive: {
    backgroundColor: '#06294D',
    color: '#FAD465',
    boxShadow: '0 1px 3px rgba(1, 31, 57, 0.2)',
  },
  svgContainer: {
    position: 'relative',
    width: '100%',
  },
  tooltip: {
    position: 'absolute',
    top: '12px',
    right: '24px',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(1, 31, 57, 0.25)',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    border: '1px solid #FAD465',
  },
  tooltipLabel: {
    color: '#FAD465',
    fontWeight: 600,
  },
  tooltipVal: {
    color: '#FFFFFF',
    fontWeight: 700,
  },
};
