import type React from 'react';
import type { MemberStatus } from '../types/members.types';

interface MemberStatusBadgeProps {
  status: MemberStatus;
  size?: 'sm' | 'md';
}

export const MemberStatusBadge: React.FC<MemberStatusBadgeProps> = ({ status, size = 'md' }) => {
  let label = 'Active';
  let bg = '#E8F8EE';
  let color = '#00A859';
  let border = '#B7EB8F';

  switch (status) {
    case 'ACTIVE':
    case 'EXPIRING_SOON':
      label = 'Active';
      bg = '#E8F8EE';
      color = '#00A859';
      border = '#B7EB8F';
      break;
    case 'INACTIVE':
      label = 'Inactive';
      bg = '#FEF2F2';
      color = '#DC2626';
      border = '#FECACA';
      break;
    case 'PENDING':
      label = 'Pending';
      bg = '#EFF6FF';
      color = '#2563EB';
      border = '#BFDBFE';
      break;
  }

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      {label}
    </span>
  );
};

