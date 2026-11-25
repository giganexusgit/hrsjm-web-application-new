import React from 'react';
import type { MembershipApplicationItem } from '../types/applications.types';
import {
  getApplicationAccountType,
  getApplicationFeeAmount,
  getApplicationPaymentStatus,
} from '../types/applications.types';
import { Eye, ChevronRight, Printer } from 'lucide-react';

interface ApplicationRowProps {
  application: MembershipApplicationItem;
  onView: (app: MembershipApplicationItem) => void;
  onPrint?: (app: MembershipApplicationItem) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  submitted: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'Submitted' },
  under_review: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'Under Review' },
  approved: { bg: '#ECFDF5', text: '#059669', dot: '#10B981', label: 'Approved' },
  rejected: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444', label: 'Rejected' },
};

export const ApplicationRow: React.FC<ApplicationRowProps> = ({
  application,
  onView,
  onPrint,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const isSeeker = getApplicationAccountType(application) === 'seeker';
  const feeAmount = getApplicationFeeAmount(application);
  const paymentStatus = getApplicationPaymentStatus(application);
  const statusStyle = STATUS_STYLES[application.status] || STATUS_STYLES.submitted;

  React.useEffect(() => {
    setImgError(false);
  }, [application.avatarUrl]);

  const initials = application.applicantName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  return (
    <tr
      style={{
        borderBottom: '1px solid #EDF2F7',
        transition: 'background-color 0.15s ease',
      }}
      className="table-row-hover"
    >
      {/* Applicant Info */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {application.avatarUrl && !imgError ? (
            <img
              src={application.avatarUrl}
              alt={application.applicantName}
              onError={() => setImgError(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1px solid #DBE5EE',
              }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isSeeker ? '#B45309' : '#011F39',
                color: isSeeker ? '#FFFFFF' : '#FAD465',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {initials || 'A'}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div
              onClick={() => onView(application)}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#011F39',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={application.applicantName}
            >
              {application.applicantName}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#718096',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {application.phone || application.email || '—'}
            </div>
          </div>
        </div>
      </td>

      {/* Application ID */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#123F68' }}>
          {application.applicationId}
        </div>
        <div style={{ fontSize: '11px', color: '#718096' }}>
          {isSeeker ? 'Aid Application' : 'Membership Application'}
        </div>
      </td>

      {/* Account Type & Category */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 9px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: isSeeker ? '#FEF3C7' : '#EFF6FF',
            color: isSeeker ? '#B45309' : '#1D4ED8',
            marginBottom: '4px',
          }}
        >
          {isSeeker ? 'Donor Seeker' : 'Membership'}
        </span>
        <div style={{ fontSize: '12px', color: '#34516D', fontWeight: 500 }}>
          {application.membershipType}
        </div>
      </td>

      {/* Amount & Payment Status */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#011F39' }}>
          {feeAmount}
        </div>
        <span
          style={{
            display: 'inline-block',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '6px',
            backgroundColor:
              paymentStatus === 'PAID'
                ? '#ECFDF5'
                : paymentStatus === 'EXEMPT'
                ? '#EFF6FF'
                : '#FEF2F2',
            color:
              paymentStatus === 'PAID'
                ? '#059669'
                : paymentStatus === 'EXEMPT'
                ? '#1D4ED8'
                : '#DC2626',
          }}
        >
          {paymentStatus}
        </span>
      </td>

      {/* Review Status */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: statusStyle.dot,
            }}
          />
          {statusStyle.label}
        </span>
      </td>

      {/* Submitted Date */}
      <td
        style={{
          padding: '14px 16px',
          verticalAlign: 'middle',
          fontSize: '12px',
          color: '#34516D',
          whiteSpace: 'nowrap',
        }}
      >
        {application.submittedAt.split(',')[0]}
        <div style={{ fontSize: '11px', color: '#718096' }}>
          {application.submittedAt.split(',')[1] || ''}
        </div>
      </td>

      {/* Actions */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {onPrint && (
            <button
              type="button"
              onClick={() => onPrint(application)}
              title="Print Application Form"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                backgroundColor: '#FAF7F0',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#011F39',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-amber-50 hover:border-amber-200"
            >
              <Printer size={14} color="#011F39" />
              <span>Print</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onView(application)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DBE5EE',
              borderRadius: '8px',
              color: '#011F39',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Eye size={14} />
            <span>Review</span>
            <ChevronRight size={14} color="#718096" />
          </button>
        </div>
      </td>
    </tr>
  );
};

