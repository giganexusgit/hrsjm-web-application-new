import React, { useState, useEffect, useMemo } from 'react';
import type { UserItem, UserType, UserStatus } from '../types/user.types';
import { Eye, Edit3, ShieldCheck, KeyRound, Lock, Unlock, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { getValidAvatarUrl } from '@/utils/avatar';

interface UserRowProps {
  user: UserItem;
  onView: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
  onVerify: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onToggleStatus: (user: UserItem, action: 'block' | 'unblock') => void;
}

const USER_TYPE_LABELS: Record<UserType, string> = {
  admin: 'Administrator',
  member: 'Official Member',
  seeker: 'Donation Seeker',
  donor: 'Patron Donor',
  general: 'User',
};

const USER_TYPE_BADGES: Record<UserType, { bg: string; text: string; border: string }> = {
  admin: { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' },
  member: { bg: '#06294D', text: '#FAD465', border: '#FAD465' },
  seeker: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  donor: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  general: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
};

const STATUS_STYLES: Record<UserStatus, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: '#ECFDF5', text: '#047857', dot: '#10B981', label: 'Active & Verified' },
  pending: { bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B', label: 'Pending Review' },
  blocked: { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', label: 'Blocked' },
};

export const UserRow: React.FC<UserRowProps> = ({
  user,
  onView,
  onEdit,
  onVerify,
  onResetPassword,
  onToggleStatus,
}) => {
  const [imgError, setImgError] = useState(false);
  const validAvatarUrl = useMemo(() => getValidAvatarUrl(user.avatarUrl), [user.avatarUrl]);

  useEffect(() => {
    setImgError(false);
  }, [user.avatarUrl]);

  const isMember = user.userType === 'member';
  const typeStyle = USER_TYPE_BADGES[user.userType] || USER_TYPE_BADGES.general;
  const statusStyle = STATUS_STYLES[user.status] || STATUS_STYLES.active;
  const statusLabel = user.userType === 'general' && user.status === 'active' ? 'Active' : statusStyle.label;

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'U';

  const formattedDate = (() => {
    try {
      const d = new Date(user.joinedDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch {
      // Fallback
    }
    return user.joinedDate.split('T')[0] || user.joinedDate;
  })();

  const hasDocs = user.documents && user.documents.length > 0;

  return (
    <tr
      style={{
        borderBottom: '1px solid #EDF2F7',
        transition: 'background-color 0.15s ease',
      }}
      className="table-row-hover hover:bg-amber-50/20"
    >
      {/* 1. User & Contact Info */}
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {validAvatarUrl && !imgError ? (
              <img
                src={validAvatarUrl}
                alt=""
                onError={() => setImgError(true)}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isMember ? '2px solid #FAD465' : '1px solid #DBE5EE',
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
                  backgroundColor: isMember ? '#06294D' : '#011F39',
                  color: '#FAD465',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  border: isMember ? '2px solid #FAD465' : '1px solid #DBE5EE',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                }}
              >
                {initials}
              </div>
            )}
            {isMember && (
              <span
                title="Verified HRSJM Member"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  backgroundColor: '#FAD465',
                  color: '#06294D',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                }}
              >
                <CheckCircle2 size={11} strokeWidth={3} />
              </span>
            )}
          </div>

          {/* Name & Contact Details */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                onClick={() => onView(user)}
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#06294D',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={user.name}
              >
                {user.name}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                marginTop: '2px',
                fontSize: '12px',
                color: '#64748B',
              }}
            >
              {user.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </span>
                </span>
              )}
              {user.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  <span>{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* 2. Identity ID & Classification */}
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: isMember ? '#06294D' : '#1E293B',
              backgroundColor: isMember ? '#FFFBEB' : '#F1F5F9',
              padding: '2px 8px',
              borderRadius: '6px',
              border: isMember ? '1px solid #FDE68A' : '1px solid #CBD5E1',
            }}
          >
            {isMember && <Award size={13} className="text-amber-500" />}
            <span>{user.memberId || `HRSJM-${String(user.id).slice(-5)}`}</span>
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isMember ? '#0284C7' : '#64748B',
              marginTop: '3px',
            }}
          >
            {isMember
              ? (user.membershipCategory || 'Active Member')
              : user.userType === 'seeker'
              ? 'Donation Seeker'
              : user.userType === 'admin'
              ? 'Executive Staff'
              : 'Registered User'}
          </div>
        </div>
      </td>

      {/* 3. Role */}
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            backgroundColor: typeStyle.bg,
            color: typeStyle.text,
            border: `1px solid ${typeStyle.border}`,
            boxShadow: isMember ? '0 1px 3px rgba(6, 41, 77, 0.2)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {USER_TYPE_LABELS[user.userType]}
        </span>
      </td>

      {/* 4. Status */}
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: statusStyle.dot,
              boxShadow: `0 0 6px ${statusStyle.dot}`,
            }}
          />
          {statusLabel}
        </span>
      </td>

      {/* 5. Joined Date */}
      <td
        style={{
          padding: '14px 18px',
          verticalAlign: 'middle',
          fontSize: '13px',
          fontWeight: 500,
          color: '#475569',
          whiteSpace: 'nowrap',
        }}
      >
        {formattedDate}
      </td>

      {/* 6. Action Buttons */}
      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'flex-end',
          }}
        >
          {/* Details */}
          <button
            type="button"
            onClick={() => onView(user)}
            title="View Full Profile"
            style={{
              padding: '7px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#06294D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95"
          >
            <Eye size={15} />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(user)}
            title="Edit User Info"
            style={{
              padding: '7px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#0284C7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-sky-50 hover:border-sky-200 hover:scale-105 active:scale-95"
          >
            <Edit3 size={15} />
          </button>

          {/* Verify KYC */}
          {(hasDocs || user.status === 'pending' || user.userType === 'seeker') && (
            <button
              type="button"
              onClick={() => onVerify(user)}
              title="Review Verification & KYC Documents"
              style={{
                padding: '7px',
                borderRadius: '8px',
                border: '1px solid #A7F3D0',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-emerald-100 hover:scale-105 active:scale-95"
            >
              <ShieldCheck size={15} />
            </button>
          )}

          {/* Reset Password */}
          <button
            type="button"
            onClick={() => onResetPassword(user)}
            title="Reset Password"
            style={{
              padding: '7px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95"
          >
            <KeyRound size={15} />
          </button>

          {/* Block / Unblock */}
          <button
            type="button"
            onClick={() =>
              onToggleStatus(user, user.status === 'blocked' ? 'unblock' : 'block')
            }
            title={user.status === 'blocked' ? 'Unblock User' : 'Suspend / Block User'}
            style={{
              padding: '7px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: user.status === 'blocked' ? '#A7F3D0' : '#FECACA',
              backgroundColor: user.status === 'blocked' ? '#ECFDF5' : '#FEF2F2',
              color: user.status === 'blocked' ? '#059669' : '#DC2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            className="hover:scale-105 active:scale-95"
          >
            {user.status === 'blocked' ? <Unlock size={15} /> : <Lock size={15} />}
          </button>
        </div>
      </td>
    </tr>
  );
};


