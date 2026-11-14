import type React from 'react';
import { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Copy,
  Check,
  MapPin,
  IdCard,
  FileText,
  Package,
  Edit,
  ShieldCheck,
  ShieldAlert,
  Printer,
  ExternalLink,
  Save,
  KeyRound,
} from 'lucide-react';
import type { Member, KitFulfillmentData } from '../types/members.types';
import { MemberStatusBadge } from './MemberStatusBadge';
import { MemberIdCardModal } from './MemberIdCardModal';
import { membersStore } from '../store/membersStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { getValidAvatarUrl } from '@/utils/avatar';

interface MemberProfileModalProps {
  visible: boolean;
  onClose: () => void;
  member: Member | null;
  onEdit: (member: Member) => void;
  onResetPassword: (member: Member) => void;
  onToggleStatus: (member: Member) => void;
}

type ProfileTab = 'overview' | 'idcard' | 'documents' | 'fulfilment';

const MemberKitFulfillmentSection: React.FC<{ member: Member }> = ({ member }) => {
  const [kitStatus, setKitStatus] = useState<KitFulfillmentData['status']>(
    member.kitFulfillment?.status || 'PROCESSING'
  );
  const [courierName, setCourierName] = useState(
    member.kitFulfillment?.courier_name || 'India Post (Speed Post)'
  );
  const [trackingNumber, setTrackingNumber] = useState(
    member.kitFulfillment?.tracking_number || `SP-${member.membershipId}`
  );
  const [dispatchDate, setDispatchDate] = useState(
    member.kitFulfillment?.dispatch_date || member.joinedDate.split('T')[0]
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    member.kitFulfillment?.delivery_address ||
      [member.address, member.city, member.state, member.pincode].filter(Boolean).join(', ')
  );
  const [kitNotes, setKitNotes] = useState(member.kitFulfillment?.notes || '');
  const [isSavingKit, setIsSavingKit] = useState(false);
  const [kitSaveSuccess, setKitSaveSuccess] = useState(false);

  const handleSaveFulfilment = async () => {
    setIsSavingKit(true);
    try {
      await membersStore.updateKitFulfillment(member.id, {
        status: kitStatus,
        courier_name: courierName,
        tracking_number: trackingNumber,
        dispatch_date: dispatchDate,
        delivery_address: deliveryAddress,
        notes: kitNotes,
        items: member.kitFulfillment?.items || [
          'Physical ID Card',
          'Welcome Lanyard',
          'Official Badge',
          'Constitution Handbook',
        ],
      });
      setKitSaveSuccess(true);
      setTimeout(() => setKitSaveSuccess(false), 3000);
    } finally {
      setIsSavingKit(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#011F39' }}>
            Physical Welcome Kit Fulfillment
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#6B7280' }}>
            Track physical smart card, member lanyard, badge and constitution booklet dispatch
          </p>
        </div>

        {kitSaveSuccess && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#E8F8EE',
              color: '#00A859',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Check size={14} />
            Saved Successfully
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          backgroundColor: '#FAF7F0',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid #F3E8D2',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
            Fulfillment Status
          </label>
          <select
            value={kitStatus}
            onChange={(e) => setKitStatus(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="PENDING">PENDING - Awaiting Processing</option>
            <option value="PROCESSING">PROCESSING - Packing & Printing</option>
            <option value="DISPATCHED">DISPATCHED - Handed to Courier</option>
            <option value="DELIVERED">DELIVERED - Confirmed by Member</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
            Courier Partner
          </label>
          <input
            type="text"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            placeholder="e.g. India Post (Speed Post)"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
            Speed Post / AWB Tracking Number
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. SP-HRSJM2026IN"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
            Dispatch Date
          </label>
          <input
            type="date"
            value={dispatchDate}
            onChange={(e) => setDispatchDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
            Dispatch Delivery Address
          </label>
          <textarea
            rows={2}
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
            Courier / Fulfillment Remark
          </label>
          <input
            type="text"
            value={kitNotes}
            onChange={(e) => setKitNotes(e.target.value)}
            placeholder="e.g. Dispatched via registry, delivered with signoff."
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleSaveFulfilment}
          disabled={isSavingKit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 20px',
            borderRadius: '8px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
            fontSize: '13.5px',
            fontWeight: 600,
            border: 'none',
            cursor: isSavingKit ? 'not-allowed' : 'pointer',
          }}
        >
          <Save size={16} />
          <span>{isSavingKit ? 'Saving Tracking...' : 'Save Kit Fulfilment'}</span>
        </button>
      </div>
    </div>
  );
};

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  visible,
  onClose,
  member,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const photoUrl = member?.photo || (member as any)?.avatarUrl;
  const validPhotoUrl = member ? getValidAvatarUrl(photoUrl) : null;

  useEffect(() => {
    setPhotoError(false);
  }, [member?.id, photoUrl]);

  useLockBodyScroll(Boolean(visible && member));

  if (!visible || !member) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(1, 31, 57, 0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
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
            maxWidth: '760px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div
            style={{
              padding: '20px 24px',
              backgroundColor: '#011F39',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {validPhotoUrl && !photoError ? (
                <img
                  src={validPhotoUrl}
                  alt=""
                  onError={() => setPhotoError(true)}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #FAD465',
                    flexShrink: 0,
                    backgroundColor: '#023158',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#023158',
                    color: '#FAD465',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                    border: '2px solid #FAD465',
                    flexShrink: 0,
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {member.name}
                  </h2>
                  <MemberStatusBadge status={member.status} size="sm" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#FAD465',
                      fontWeight: 600,
                    }}
                  >
                    {member.membershipId}
                  </span>
                  <span style={{ color: '#64748B' }}>•</span>
                  <span style={{ fontSize: '12.5px', color: '#DBE5EE' }}>
                    {member.categoryName || 'District Active Member'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onEdit(member)}
                title="Edit Member"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                }}
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              padding: '0 16px',
            }}
          >
            {[
              { id: 'overview' as ProfileTab, label: 'Overview & Profile', icon: IdCard },
              { id: 'idcard' as ProfileTab, label: 'Digital ID Card', icon: Printer },
              { id: 'documents' as ProfileTab, label: 'Documents', icon: FileText, count: member.documents?.length || 0 },
              { id: 'fulfilment' as ProfileTab, label: 'Kit Fulfilment', icon: Package },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#011F39' : '#6B7280',
                    borderBottom: isActive ? '3px solid #011F39' : '3px solid transparent',
                    cursor: 'pointer',
                    marginBottom: '-1px',
                  }}
                >
                  <Icon size={15} color={isActive ? '#011F39' : '#6B7280'} />
                  <span>{t.label}</span>
                  {typeof t.count === 'number' && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        backgroundColor: isActive ? '#011F39' : '#E5E7EB',
                        color: isActive ? '#FFFFFF' : '#4B5563',
                      }}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modal Scrollable Content Area */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Quick Contact & Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF7F0',
                    border: '1px solid #F3E8D2',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <a
                      href={`tel:${member.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#011F39',
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={15} color="#00A859" />
                      <span>{member.phone}</span>
                    </a>
                    <span style={{ color: '#D1D5DB' }}>|</span>
                    <a
                      href={`mailto:${member.email}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#011F39',
                        textDecoration: 'none',
                      }}
                    >
                      <Mail size={15} color="#2563EB" />
                      <span>{member.email}</span>
                    </a>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(member.membershipId, 'id')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#FFFFFF',
                        color: '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedKey === 'id' ? <Check size={14} color="#00A859" /> : <Copy size={14} />}
                      <span>{copiedKey === 'id' ? 'Copied' : 'Copy ID'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onResetPassword(member)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #F59E0B',
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                        cursor: 'pointer',
                      }}
                    >
                      <KeyRound size={14} />
                      <span>Reset Pass</span>
                    </button>
                  </div>
                </div>

                {/* Personal & Membership Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Personal Information */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 12px 0',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Personal Details
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Gender:</span>
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>{member.gender || 'Not specified'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Date of Birth:</span>
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>{member.dob || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Qualification:</span>
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>{member.qualification || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Father / Guardian:</span>
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>{member.fatherName || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Membership & Validity */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 12px 0',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Validity & Enrollment
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Joined Date:</span>
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>{formattedJoinedDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Valid Till:</span>
                        <span style={{ fontWeight: 700, color: '#00A859' }}>{formattedValidTill}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Membership Fee:</span>
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>
                          ₹{typeof member.amount === 'number' ? member.amount.toLocaleString('en-IN') : member.amount || '1,300'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Category ID:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4B5563' }}>
                          {member.categoryId || 'DISTRICT_ACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#011F39',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <MapPin size={16} color="#DC2626" />
                    <span>Residential / Postal Address</span>
                  </h4>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#374151', lineHeight: 1.5 }}>
                    {[member.address, member.city, member.state, member.pincode].filter(Boolean).join(', ') ||
                      'Address records not uploaded.'}
                  </p>
                </div>

                {/* Admin Notes */}
                {member.adminNotes && (
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                      fontSize: '13px',
                      color: '#4B5563',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#011F39' }}>Admin Remark: </span>
                    {member.adminNotes}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Digital ID Card Preview */}
            {activeTab === 'idcard' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#011F39' }}>
                    Digital Identity Card
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                    Official government verified member identification credential
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIdCardModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#011F39',
                    color: '#FAD465',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(1, 31, 57, 0.15)',
                  }}
                >
                  <IdCard size={18} />
                  <span>Launch Official ID Card Viewer & Print</span>
                </button>
              </div>
            )}

            {/* TAB: Documents */}
            {activeTab === 'documents' && (
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#011F39' }}>
                  KYC & Membership Verification Files
                </h4>
                {member.documents && member.documents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {member.documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#F9FAFB',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={20} color="#011F39" />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1F2937' }}>
                              {doc.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>
                              {doc.type} • {doc.fileSize || '1.2 MB'} • Uploaded {doc.uploadedAt || 'Recently'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Viewing document: ${doc.name}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #011F39',
                            backgroundColor: '#FFFFFF',
                            color: '#011F39',
                            cursor: 'pointer',
                          }}
                        >
                          <ExternalLink size={13} />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 20px',
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      border: '1.5px dashed #D1D5DB',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9CA3AF',
                      }}
                    >
                      <FileText size={22} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                      No Documents Uploaded
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280', maxWidth: '360px', lineHeight: 1.4 }}>
                      This member has not uploaded any identity, address, or qualification verification documents.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Kit Fulfilment Tracking */}
            {activeTab === 'fulfilment' && (
              <MemberKitFulfillmentSection key={member.id} member={member} />
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              onClick={() => onToggleStatus(member)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: member.status === 'ACTIVE' ? '#FEF2F2' : '#E8F8EE',
                color: member.status === 'ACTIVE' ? '#DC2626' : '#00A859',
                cursor: 'pointer',
              }}
            >
              {member.status === 'ACTIVE' ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
              <span>{member.status === 'ACTIVE' ? 'Suspend Membership' : 'Activate Membership'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ID Card Viewer Sub-modal */}
      <MemberIdCardModal
        visible={showIdCardModal}
        onClose={() => setShowIdCardModal(false)}
        member={member}
      />
    </>
  );
};
