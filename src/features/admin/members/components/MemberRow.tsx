import type React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  MoreVertical,
  Eye,
  IdCard,
  Edit,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  Hourglass,
  AlertCircle,
  Infinity as InfinityIcon,
} from 'lucide-react';
import type { Member } from '../types/members.types';
import { MemberStatusBadge } from './MemberStatusBadge';
import { getValidAvatarUrl } from '@/utils/avatar';

interface MemberRowProps {
  member: Member;
  onView: (member: Member) => void;
  onViewIdCard: (member: Member) => void;
  onEdit: (member: Member) => void;
  onResetPassword: (member: Member) => void;
  onToggleStatus: (member: Member) => void;
}

// Days left calculation
function getDaysLeftInfo(validTill: string) {
  if (!validTill || validTill.includes('Lifetime')) {
    return {
      text: 'Lifetime',
      days: null,
      tone: 'lifetime' as const,
      bg: '#F3F4F6',
      border: '#E5E7EB',
      color: '#4B5563',
    };
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(validTill);
    if (isNaN(target.getTime())) {
      return {
        text: '—',
        days: null,
        tone: 'unknown' as const,
        bg: '#F3F4F6',
        border: '#E5E7EB',
        color: '#6B7280',
      };
    }
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      const absDays = Math.abs(days);
      return {
        text: `Expired (${absDays}d ago)`,
        days,
        tone: 'expired' as const,
        bg: '#FEF2F2',
        border: '#FECACA',
        color: '#DC2626',
      };
    }
    if (days === 0) {
      return {
        text: 'Expires Today',
        days: 0,
        tone: 'warning' as const,
        bg: '#FEF7E6',
        border: '#FDE68A',
        color: '#D97706',
      };
    }
    if (days === 1) {
      return {
        text: '1 day left',
        days: 1,
        tone: 'warning' as const,
        bg: '#FEF7E6',
        border: '#FDE68A',
        color: '#D97706',
      };
    }
    if (days <= 30) {
      return {
        text: `${days} days left`,
        days,
        tone: 'warning' as const,
        bg: '#FEF7E6',
        border: '#FDE68A',
        color: '#D97706',
      };
    }
    return {
      text: `${days} days left`,
      days,
      tone: 'normal' as const,
      bg: '#E8F8EE',
      border: '#B7EB8F',
      color: '#00A859',
    };
  } catch {
    return {
      text: validTill,
      days: null,
      tone: 'unknown' as const,
      bg: '#F3F4F6',
      border: '#E5E7EB',
      color: '#6B7280',
    };
  }
}

export const MemberRow: React.FC<MemberRowProps> = ({
  member,
  onView,
  onViewIdCard,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const photoUrl = member.photo || (member as any).avatarUrl;
  const validPhotoUrl = useMemo(() => getValidAvatarUrl(photoUrl), [photoUrl]);

  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Initials generator
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name[0] || 'M').toUpperCase();
  };

  const daysLeftInfo = getDaysLeftInfo(member.validTill);

  const formattedJoinedDate = member.joinedDate
    ? new Date(member.joinedDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const formattedValidTill =
    member.validTill && !member.validTill.includes('Lifetime')
      ? new Date(member.validTill).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Lifetime';

  return (
    <tr
      style={{
        borderBottom: '1px solid #E5E7EB',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F9FAFB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Member Identity (Avatar, Name, Membership Number) */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar or Initials Circle */}
          {validPhotoUrl && !imgError ? (
            <img
              src={validPhotoUrl}
              alt=""
              onError={() => setImgError(true)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '2px solid #FAD465',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                backgroundColor: '#F1F5F9',
              }}
            />
          ) : (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#011F39',
                color: '#FAD465',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
                border: '2px solid #E5E7EB',
              }}
            >
              {getInitials(member.name)}
            </div>
          )}

          <div>
            <div
              onClick={() => onView(member)}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#011F39',
                cursor: 'pointer',
              }}
            >
              {member.name}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
                fontFamily: 'monospace',
                color: '#4B5563',
                backgroundColor: '#F3F4F6',
                padding: '1px 6px',
                borderRadius: '4px',
                marginTop: '3px',
              }}
            >
              <span>{member.membershipId}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Contact Info (Phone & Email) */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
          {member.phone}
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
          {member.email}
        </div>
      </td>

      {/* Category / Designation */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#011F39' }}>
          {member.categoryName || 'District Active Member'}
        </div>
        {member.amount && (
          <div style={{ fontSize: '12px', color: '#00A859', fontWeight: 500 }}>
            ₹{typeof member.amount === 'number' ? member.amount.toLocaleString('en-IN') : member.amount} Fee
          </div>
        )}
      </td>

      {/* Validity & Dates */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4B5563' }}>
          <Calendar size={13} color="#9CA3AF" />
          <span>Joined: {formattedJoinedDate}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            color: '#4B5563',
            marginTop: '3px',
          }}
        >
          <Clock size={13} color="#9CA3AF" />
          <span>Valid till: {formattedValidTill}</span>
        </div>
      </td>

      {/* Days Left */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: daysLeftInfo.bg,
            color: daysLeftInfo.color,
            border: `1px solid ${daysLeftInfo.border}`,
            whiteSpace: 'nowrap',
          }}
        >
          {daysLeftInfo.tone === 'lifetime' ? (
            <InfinityIcon size={13} />
          ) : daysLeftInfo.tone === 'expired' ? (
            <AlertCircle size={12} />
          ) : daysLeftInfo.tone === 'warning' ? (
            <Hourglass size={12} />
          ) : (
            <Clock size={12} />
          )}
          <span>{daysLeftInfo.text}</span>
        </span>
      </td>

      {/* Status Badge */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <MemberStatusBadge status={member.status} />
      </td>

      {/* Row Context Actions Menu */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
        <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#4B5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Actions"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '4px',
                width: '190px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E5E7EB',
                zIndex: 50,
                padding: '4px 0',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onView(member);
                }}
                style={menuItemStyle}
              >
                <Eye size={15} color="#011F39" />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onViewIdCard(member);
                }}
                style={menuItemStyle}
              >
                <IdCard size={15} color="#00A859" />
                <span>Digital ID Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(member);
                }}
                style={menuItemStyle}
              >
                <Edit size={15} color="#2563EB" />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onResetPassword(member);
                }}
                style={menuItemStyle}
              >
                <KeyRound size={15} color="#D97706" />
                <span>Reset Password</span>
              </button>

              <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleStatus(member);
                }}
                style={{
                  ...menuItemStyle,
                  color: member.status === 'ACTIVE' ? '#DC2626' : '#00A859',
                }}
              >
                {member.status === 'ACTIVE' ? (
                  <>
                    <ShieldAlert size={15} color="#DC2626" />
                    <span>Deactivate / Suspend</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} color="#00A859" />
                    <span>Activate Member</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
};
