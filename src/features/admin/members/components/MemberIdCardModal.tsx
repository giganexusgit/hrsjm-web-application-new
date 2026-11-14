import type React from 'react';
import { useState } from 'react';
import { X, Printer, RefreshCw, ShieldCheck, QrCode } from 'lucide-react';
import type { Member } from '../types/members.types';
import { HrsjmLogo } from '@/components/common/HrsjmLogo';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface MemberIdCardModalProps {
  visible: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberIdCardModal: React.FC<MemberIdCardModalProps> = ({
  visible,
  onClose,
  member,
}) => {
  const [side, setSide] = useState<'FRONT' | 'BACK'>('FRONT');

  useLockBodyScroll(Boolean(visible && member));

  if (!visible || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedJoinedDate = member.joinedDate
    ? new Date(member.joinedDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '01 Jan 2026';

  const formattedValidTill =
    member.validTill && !member.validTill.includes('Lifetime')
      ? new Date(member.validTill).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Lifetime';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(1, 31, 57, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#FAD465" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              Official Membership Smart ID Card
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px 20px', backgroundColor: '#F8FAFC' }}>
          {/* Card View Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => setSide('FRONT')}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: side === 'FRONT' ? '2px solid #011F39' : '1px solid #D1D5DB',
                backgroundColor: side === 'FRONT' ? '#011F39' : '#FFFFFF',
                color: side === 'FRONT' ? '#FFFFFF' : '#4B5563',
                cursor: 'pointer',
              }}
            >
              Front Side
            </button>
            <button
              type="button"
              onClick={() => setSide('BACK')}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: side === 'BACK' ? '2px solid #011F39' : '1px solid #D1D5DB',
                backgroundColor: side === 'BACK' ? '#011F39' : '#FFFFFF',
                color: side === 'BACK' ? '#FFFFFF' : '#4B5563',
                cursor: 'pointer',
              }}
            >
              Back Side
            </button>
            <button
              type="button"
              onClick={() => setSide(side === 'FRONT' ? 'BACK' : 'FRONT')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#6B7280',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} />
              <span>Flip</span>
            </button>
          </div>

          {/* THE DIGITAL ID CARD DISPLAY */}
          <div
            id="printable-id-card"
            style={{
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto',
              aspectRatio: '1.586 / 1', // CR80 standard credit card ratio
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 8px 24px rgba(1, 31, 57, 0.15)',
              border: '2px solid #011F39',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {side === 'FRONT' ? (
              /* FRONT SIDE */
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* ID Card Top Band */}
                <div
                  style={{
                    backgroundColor: '#011F39',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #FAD465',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HrsjmLogo size="sm" variant="light" showWordmark={false} showIcon={true} />
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          letterSpacing: '0.04em',
                          lineHeight: 1.1,
                        }}
                      >
                        HUMAN RIGHTS & SOCIAL JUSTICE MISSION
                      </div>
                      <div style={{ fontSize: '8px', color: '#FAD465', fontWeight: 600 }}>
                        Regd. Under Indian Trust Act · Govt of India
                      </div>
                    </div>
                  </div>
                </div>

                {/* ID Card Main Body */}
                <div
                  style={{
                    padding: '10px 14px',
                    flex: 1,
                    display: 'flex',
                    gap: '12px',
                    backgroundColor: '#FAF7F0',
                  }}
                >
                  {/* Photo & ID Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '74px',
                        height: '92px',
                        borderRadius: '6px',
                        backgroundColor: '#011F39',
                        color: '#FAD465',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        fontWeight: 800,
                        border: '2px solid #FAD465',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#011F39',
                        marginTop: '4px',
                        textAlign: 'center',
                      }}
                    >
                      MEMBERSHIP
                    </div>
                  </div>

                  {/* Member Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#011F39', lineHeight: 1.15 }}>
                      {member.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#B45309',
                        marginTop: '2px',
                      }}
                    >
                      {member.categoryName || 'District Active Member'}
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontSize: '10px', color: '#374151' }}>
                        <span style={{ fontWeight: 600 }}>Member ID:</span>{' '}
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#011F39' }}>
                          {member.membershipId}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#374151' }}>
                        <span style={{ fontWeight: 600 }}>Mobile:</span> {member.phone}
                      </div>
                      <div style={{ fontSize: '10px', color: '#374151' }}>
                        <span style={{ fontWeight: 600 }}>Issued:</span> {formattedJoinedDate}
                      </div>
                      <div style={{ fontSize: '10px', color: '#00A859', fontWeight: 700 }}>
                        <span>Valid Till:</span> {formattedValidTill}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                      }}
                    >
                      <QrCode size={46} color="#011F39" />
                    </div>
                    <span style={{ fontSize: '7.5px', color: '#6B7280', marginTop: '3px' }}>
                      Scan to Verify
                    </span>
                  </div>
                </div>

                {/* ID Card Bottom Strip */}
                <div
                  style={{
                    backgroundColor: '#011F39',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '8px', color: '#DBE5EE' }}>
                    Auth. Signature: <i>National President</i>
                  </span>
                  <span style={{ fontSize: '8px', color: '#FAD465', fontWeight: 600 }}>
                    www.hrsjm.org
                  </span>
                </div>
              </div>
            ) : (
              /* BACK SIDE */
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#011F39',
                    borderBottom: '1px solid #011F39',
                    paddingBottom: '3px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Member Profile & Address
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9.5px', color: '#374151' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>Father's Name:</span> {member.fatherName || '—'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700 }}>Date of Birth:</span> {member.dob || '—'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700 }}>Qualification:</span> {member.qualification || '—'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700 }}>Address:</span>{' '}
                    {[member.address, member.city, member.state, member.pincode].filter(Boolean).join(', ') || '—'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700 }}>Emergency Contact:</span> {member.phone}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #D1D5DB',
                    fontSize: '7.5px',
                    color: '#6B7280',
                    lineHeight: 1.3,
                  }}
                >
                  <b>NOTICE:</b> This card remains the property of Human Rights & Social Justice Mission. If found, please return to: Central Secretariat, New Delhi. Contact Toll-Free: 1800-HRSJM-NGO.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            Official printable resolution (300 DPI vector)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#011F39',
                border: '1px solid #011F39',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              <span>Print ID Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#011F39',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
