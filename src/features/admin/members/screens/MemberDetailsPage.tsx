import type React from 'react';
import { useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Copy,
  Check,
  IdCard,
  FileText,
  Package,
  Edit,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Printer,
  Save,
  AlertCircle,
} from 'lucide-react';
import { membersStore } from '../store/membersStore';
import { MemberStatusBadge } from '../components/MemberStatusBadge';
import { MemberIdCardModal } from '../components/MemberIdCardModal';
import { EditMemberModal } from '../components/EditMemberModal';
import {
  MemberConfirmationModal,
  type ConfirmationType,
} from '../components/MemberConfirmationModal';
import { ApplicationPrintModal } from '@/features/admin/applications/components/ApplicationPrintModal';
import { resolveApplicationForMember } from '@/features/admin/applications/utils/resolveApplication';
import { STANDARD_MEMBERSHIP_CATEGORIES } from '../data/membersFixtures';

type DetailsTab = 'overview' | 'idcard' | 'documents' | 'fulfilment';

export const MemberDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const storeSnapshot = useSyncExternalStore(
    membersStore.subscribe,
    membersStore.getSnapshot
  );

  const member = storeSnapshot.members.find((m) => m.id === id);

  const [activeTab, setActiveTab] = useState<DetailsTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    type: ConfirmationType;
  }>({
    visible: false,
    type: 'TOGGLE_STATUS',
  });

  // Kit Fulfillment state
  const [kitStatus, setKitStatus] = useState<'PENDING' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED'>(
    member?.kitFulfillment?.status || 'PROCESSING'
  );
  const [courierName, setCourierName] = useState(
    member?.kitFulfillment?.courier_name || 'India Post (Speed Post)'
  );
  const [trackingNumber, setTrackingNumber] = useState(
    member?.kitFulfillment?.tracking_number || ''
  );
  const [dispatchDate, setDispatchDate] = useState(
    member?.kitFulfillment?.dispatch_date || ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    member?.kitFulfillment?.delivery_address ||
      [member?.address, member?.city, member?.state, member?.pincode].filter(Boolean).join(', ')
  );
  const [kitNotes, setKitNotes] = useState(member?.kitFulfillment?.notes || '');
  const [isSavingKit, setIsSavingKit] = useState(false);
  const [kitSaved, setKitSaved] = useState(false);

  if (!member) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
        <h2 style={{ color: '#011F39', margin: '0 0 8px 0' }}>Member Record Not Found</h2>
        <p style={{ color: '#6B7280', margin: '0 0 16px 0' }}>
          The requested member identifier does not exist or has been removed.
        </p>
        <Link
          to="/admin/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Members Directory</span>
        </Link>
      </div>
    );
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
        ],
      });
      setKitSaved(true);
      setTimeout(() => setKitSaved(false), 3000);
    } finally {
      setIsSavingKit(false);
    }
  };

  const handleConfirmAction = async (notes?: string) => {
    if (confirmationModal.type === 'TOGGLE_STATUS') {
      const newStatus =
        member.status === 'ACTIVE' || member.status === 'EXPIRING_SOON'
          ? 'INACTIVE'
          : 'ACTIVE';
      await membersStore.updateStatus(member.id, newStatus, notes);
      return true;
    } else {
      return await membersStore.resetPassword(member.id);
    }
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#6B7280',
        }}
      >
        <Link to="/admin/members" style={{ color: '#011F39', textDecoration: 'none', fontWeight: 600 }}>
          Members Directory
        </Link>
        <span>/</span>
        <span>{member.name}</span>
      </div>

      {/* Header Profile Banner */}
      <div
        style={{
          backgroundColor: '#011F39',
          color: '#FFFFFF',
          borderRadius: '14px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/members')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#023158',
              color: '#FAD465',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
              border: '2px solid #FAD465',
            }}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#FFFFFF' }}>
                {member.name}
              </h1>
              <MemberStatusBadge status={member.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span style={{ fontFamily: 'monospace', color: '#FAD465', fontWeight: 700, fontSize: '13px' }}>
                {member.membershipId}
              </span>
              <span style={{ color: '#64748B' }}>•</span>
              <span style={{ fontSize: '13px', color: '#DBE5EE' }}>
                {member.categoryName || 'District Active Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Printer size={16} color="#FAD465" />
            <span>Print Application</span>
          </button>

          <button
            type="button"
            onClick={() => setShowIdCardModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              backgroundColor: '#FAD465',
              color: '#011F39',
              fontSize: '13.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <IdCard size={16} />
            <span>View ID Card</span>
          </button>

          <button
            type="button"
            onClick={() => setEditModalVisible(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Tabs Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            padding: '0 20px',
          }}
        >
          {[
            { id: 'overview' as DetailsTab, label: 'Overview & Profile', icon: IdCard },
            { id: 'idcard' as DetailsTab, label: 'Printable ID Card', icon: Printer },
            { id: 'documents' as DetailsTab, label: 'KYC Documents', icon: FileText, count: member.documents?.length || 0 },
            { id: 'fulfilment' as DetailsTab, label: 'Kit Fulfilment Tracking', icon: Package },
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
                  padding: '14px 20px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#011F39' : '#6B7280',
                  borderBottom: isActive ? '3px solid #011F39' : '3px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                }}
              >
                <Icon size={16} color={isActive ? '#011F39' : '#6B7280'} />
                <span>{t.label}</span>
                {typeof t.count === 'number' && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 7px',
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

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Contact & Password Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF7F0',
                  border: '1px solid #F3E8D2',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="#00A859" />
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#011F39' }}>{member.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="#2563EB" />
                    <span style={{ fontSize: '13.5px', color: '#011F39' }}>{member.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(member.membershipId, 'id')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedKey === 'id' ? <Check size={14} color="#00A859" /> : <Copy size={14} />}
                    <span>{copiedKey === 'id' ? 'Copied' : 'Copy Member ID'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmationModal({ visible: true, type: 'RESET_PASSWORD' })
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #F59E0B',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                      cursor: 'pointer',
                    }}
                  >
                    <KeyRound size={14} />
                    <span>Reset Password</span>
                  </button>
                </div>
              </div>

              {/* Grid 2-column info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#011F39' }}>
                    Personal Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Gender:</span>
                      <span style={{ fontWeight: 600 }}>{member.gender || 'Not specified'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Date of Birth:</span>
                      <span style={{ fontWeight: 600 }}>{member.dob || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Educational Qualification:</span>
                      <span style={{ fontWeight: 600 }}>{member.qualification || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Father / Guardian Name:</span>
                      <span style={{ fontWeight: 600 }}>{member.fatherName || '—'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '20px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#011F39' }}>
                    Membership Validity & Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Enrolled On:</span>
                      <span style={{ fontWeight: 600 }}>{formattedJoinedDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Valid Till:</span>
                      <span style={{ fontWeight: 700, color: '#00A859' }}>{formattedValidTill}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Membership Fee:</span>
                      <span style={{ fontWeight: 700, color: '#011F39' }}>
                        ₹{typeof member.amount === 'number' ? member.amount.toLocaleString('en-IN') : member.amount || '1,300'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>Current Lifecycle Status:</span>
                      <MemberStatusBadge status={member.status} size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div style={{ padding: '20px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: '#011F39' }}>
                  Postal & Registered Address
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                  {[member.address, member.city, member.state, member.pincode].filter(Boolean).join(', ') ||
                    'Address records not uploaded.'}
                </p>
              </div>

              {/* Status Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={() => setConfirmationModal({ visible: true, type: 'TOGGLE_STATUS' })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: member.status === 'ACTIVE' ? '#FEF2F2' : '#E8F8EE',
                    color: member.status === 'ACTIVE' ? '#DC2626' : '#00A859',
                    cursor: 'pointer',
                  }}
                >
                  {member.status === 'ACTIVE' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                  <span>{member.status === 'ACTIVE' ? 'Suspend Membership' : 'Activate Membership'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'idcard' && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <IdCard size={48} color="#011F39" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700, color: '#011F39' }}>
                Printable Official Member ID Card
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#6B7280' }}>
                Dual-sided CR80 printable card format with QR code verification and security seal
              </p>
              <button
                type="button"
                onClick={() => setShowIdCardModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  backgroundColor: '#011F39',
                  color: '#FAD465',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Printer size={16} />
                <span>Open Digital ID Card & Print</span>
              </button>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#011F39' }}>
                Submitted Member Documents
              </h3>
              {member.documents && member.documents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {member.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={22} color="#011F39" />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#6B7280' }}>
                            {doc.type} • {doc.fileSize || '1.2 MB'} • Uploaded {doc.uploadedAt || 'Recently'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Opening ${doc.name}`)}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px solid #011F39',
                          backgroundColor: '#FFFFFF',
                          color: '#011F39',
                          cursor: 'pointer',
                        }}
                      >
                        View File
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '36px', textAlign: 'center', color: '#9CA3AF' }}>
                  No uploaded verification files attached to this member.
                </div>
              )}
            </div>
          )}

          {activeTab === 'fulfilment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#011F39' }}>
                  Welcome Kit Fulfillment Tracking
                </h3>
                {kitSaved && (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#00A859' }}>
                    ✓ Fulfillment saved successfully
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF7F0',
                  border: '1px solid #F3E8D2',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={kitStatus}
                    onChange={(e) => setKitStatus(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="PENDING">PENDING - Awaiting Dispatch</option>
                    <option value="PROCESSING">PROCESSING - In Packing</option>
                    <option value="DISPATCHED">DISPATCHED - In Transit</option>
                    <option value="DELIVERED">DELIVERED - Received</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Speed Post / AWB Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Dispatch Date
                  </label>
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Courier Remarks / Delivery Confirmation Note
                  </label>
                  <input
                    type="text"
                    value={kitNotes}
                    onChange={(e) => setKitNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
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
                    padding: '10px 22px',
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
                  <span>{isSavingKit ? 'Saving...' : 'Save Kit Details'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      <MemberIdCardModal
        visible={showIdCardModal}
        onClose={() => setShowIdCardModal(false)}
        member={member}
      />

      <EditMemberModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        member={member}
        categories={STANDARD_MEMBERSHIP_CATEGORIES}
      />

      <MemberConfirmationModal
        visible={confirmationModal.visible}
        onClose={() => setConfirmationModal({ visible: false, type: 'TOGGLE_STATUS' })}
        type={confirmationModal.type}
        member={member}
        onConfirm={handleConfirmAction}
      />

      {/* Official Printable Application Modal */}
      <ApplicationPrintModal
        isOpen={printModalOpen}
        application={resolveApplicationForMember(member)}
        onClose={() => setPrintModalOpen(false)}
      />
    </div>
  );
};
