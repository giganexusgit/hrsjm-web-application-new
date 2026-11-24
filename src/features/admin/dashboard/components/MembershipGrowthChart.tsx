import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { membersStore } from '@/features/admin/members/store/membersStore';
import type { GrowthPoint } from '../data/dashboardDemoData';

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

interface CoordinatePoint extends ExtendedGrowthPoint {
  x: number;
  y: number;
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
  const now = new Date();
  const points: ExtendedGrowthPoint[] = [];

  for (let i = daysCount - 1; i >= 0; i -= sampleInterval) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(23, 59, 59, 999);

    const count = members.filter((m) => {
      const rawDate = m.joinedDate || m.created_at || m.createdAt || m.startDate || m.membership?.startDate;
      if (!rawDate) return true;
      const parsed = new Date(rawDate);
      return !isNaN(parsed.getTime()) ? parsed <= d : true;
    }).length;

    const label =
      daysCount <= 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const fullLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    points.push({ label, fullLabel, members: count });
  }

  return points;
};

const computeMonthlyGrowthFromMembers = (
  members: any[],
  monthsCount: number
): ExtendedGrowthPoint[] => {
  const now = new Date();
  const points: ExtendedGrowthPoint[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const count = members.filter((m) => {
      const rawDate = m.joinedDate || m.created_at || m.createdAt || m.startDate || m.membership?.startDate;
      if (!rawDate) return true;
      const parsed = new Date(rawDate);
      return !isNaN(parsed.getTime()) ? parsed <= endOfMonth : true;
    }).length;

    const label = MONTH_NAMES[d.getMonth()];
    const fullLabel = `${label} ${d.getFullYear()}`;
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
  // Sync live verified members directly from the store
  const membersSnapshot = useSyncExternalStore(membersStore.subscribe, membersStore.getSnapshot);
  const liveStoreMembers = membersSnapshot.members.length > 0 ? membersSnapshot.members : membersStore.getAllMembers();

  // Filter only real active/expiring_soon members
  const activeMembersList = useMemo(() => {
    return liveStoreMembers.filter(
      (m) => (m.status || '').toUpperCase() === 'ACTIVE' || (m.status || '').toUpperCase() === 'EXPIRING_SOON' || !m.status
    );
  }, [liveStoreMembers]);

  const effectiveGrowth = initialGrowth || growthData;
  const effectiveTotal = totalMembers ?? currentCount ?? liveStoreMembers.length;

  const [range, setRange] = useState<'7d' | '30d' | '6m' | '1y'>('6m');
  const [hoveredPoint, setHoveredPoint] = useState<CoordinatePoint | null>(null);
  const [cachedData, setCachedData] = useState<Record<string, ExtendedGrowthPoint[]>>(() => {
    const initial: Record<string, ExtendedGrowthPoint[]> = {};
    if (effectiveGrowth && effectiveGrowth.length > 0) {
      initial['6m'] = parseMonthlyGrowth(effectiveGrowth);
    }
    return initial;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Sync when initial props arrive or change
  useEffect(() => {
    if (effectiveGrowth && effectiveGrowth.length > 0) {
      const parsed = parseMonthlyGrowth(effectiveGrowth);
      setCachedData((prev) => ({ ...prev, '6m': parsed }));
      setIsLiveConnected(true);
    }
  }, [effectiveGrowth]);

  // Load data for the requested range from live API if 6m/1y
  const loadDataForRange = useCallback(
    async (selectedRange: '7d' | '30d' | '6m' | '1y') => {
      if (selectedRange === '7d' || selectedRange === '30d') {
        // Daily ranges are computed directly and dynamically from live active members
        return;
      }

      if (cachedData[selectedRange] && cachedData[selectedRange].length > 0) {
        return;
      }

      setIsLoading(true);
      try {
        const growthMonths = selectedRange === '1y' ? 12 : 6;
        const res = await apiClient.get<any>('/admin/dashboard', { params: { growthMonths } });
        const data = (res as any)?.data || res;
        if (data?.memberGrowth && Array.isArray(data.memberGrowth) && data.memberGrowth.length > 0) {
          const parsed = parseMonthlyGrowth(data.memberGrowth);
          setCachedData((prev) => ({ ...prev, [selectedRange]: parsed }));
          setIsLiveConnected(true);
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

  // Calculate dynamic points strictly according to active members
  const points: ExtendedGrowthPoint[] = useMemo(() => {
    if (range === '7d') {
      return computeDailyGrowthFromMembers(activeMembersList, 7, 1);
    }
    if (range === '30d') {
      return computeDailyGrowthFromMembers(activeMembersList, 30, 5);
    }
    if (range === '6m') {
      if (cachedData['6m'] && cachedData['6m'].length >= 2) {
        return cachedData['6m'];
      }
      return computeMonthlyGrowthFromMembers(activeMembersList, 6);
    }
    if (range === '1y') {
      if (cachedData['1y'] && cachedData['1y'].length >= 2) {
        return cachedData['1y'];
      }
      return computeMonthlyGrowthFromMembers(activeMembersList, 12);
    }
    return computeMonthlyGrowthFromMembers(activeMembersList, 6);
  }, [range, activeMembersList, cachedData]);

  const minVal = points.length > 0 ? Math.min(...points.map((p) => p.members)) : 0;
  const maxVal = points.length > 0 ? Math.max(...points.map((p) => p.members)) : 1;
  const paddingY = Math.max(1, (maxVal - minVal) * 0.2 || 1);
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

  // True active count dynamically determined from real active members
  const dynamicActive = activeMembersList.length > 0
    ? activeMembersList.length
    : (activeMembers ?? effectiveTotal ?? 0);

  const dynamicTotal = Math.max(liveStoreMembers.length, effectiveTotal, dynamicActive);

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
            Verified membership roster: <strong>{dynamicActive.toLocaleString()}</strong> active members
            {dynamicTotal > dynamicActive && (
              <span style={{ color: '#718096', fontSize: '12px' }}>
                {' '}
                ({dynamicTotal.toLocaleString()} registered total)
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
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="expansionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.32" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.00" />
            </linearGradient>
            <filter id="pointGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#06294D" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Gridlines */}
          {[floorVal, Math.round((floorVal + ceilVal) / 2), ceilVal].map((gridYVal, i) => {
            const yPos = getY(gridYVal);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={width - padRight}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={yPos + 4}
                  fill="#94A3B8"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {gridYVal}
                </text>
              </g>
            );
          })}

          {/* Area & Stroke Paths */}
          {areaPath && <path d={areaPath} fill="url(#expansionGradient)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#06294D"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active Interactive Data Points */}
          {coordinates.map((pt, i) => (
            <g
              key={i}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.x === pt.x ? 7 : 5}
                fill={hoveredPoint?.x === pt.x ? '#D97706' : '#FFFFFF'}
                stroke="#06294D"
                strokeWidth="2.5"
                filter="url(#pointGlow)"
              />
              <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />
              <text
                x={pt.x}
                y={height - 10}
                fill="#64748B"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 38}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: '#06294D',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(6, 41, 77, 0.25)',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            <div>{hoveredPoint.fullLabel || hoveredPoint.label}</div>
            <div style={{ color: '#FCD34D', fontSize: '13px' }}>
              {hoveredPoint.members.toLocaleString()} active members
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#F1F5F9',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  badgeLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#06294D',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#ECFDF5',
    color: '#059669',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '12px',
    border: '1px solid #A7F3D0',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#06294D',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  rangeGroup: {
    display: 'inline-flex',
    padding: '4px',
    borderRadius: '10px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    gap: '4px',
  },
  rangeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '6px 14px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  rangeBtnActive: {
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(6,41,77,0.15)',
  },
  svgContainer: {
    width: '100%',
    position: 'relative',
    marginTop: '8px',
  },
};
