import type React from 'react';
import { useState } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import type { Member, MembershipCategoryItem } from '../types/members.types';
import { membersStore } from '../store/membersStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface EditMemberModalProps {
  visible: boolean;
  onClose: () => void;
  member: Member | null;
  categories: MembershipCategoryItem[];
  onSaved?: () => void;
}

interface EditMemberFormProps {
  member: Member;
  categories: MembershipCategoryItem[];
  onClose: () => void;
  onSaved?: () => void;
}

const EditMemberForm: React.FC<EditMemberFormProps> = ({
  member,
  categories,
  onClose,
  onSaved,
}) => {
  const [fullName, setFullName] = useState(member.name || '');
  const [phone, setPhone] = useState(member.phone && member.phone !== '—' ? member.phone : '');
  const [email, setEmail] = useState(member.email && member.email !== '—' ? member.email : '');
  const [categoryId, setCategoryId] = useState(member.categoryId || '1');
  const [gender, setGender] = useState(member.gender || 'Male');
  const [dob, setDob] = useState(member.dob || '');
  const [qualification, setQualification] = useState(member.qualification || '');
  const [fatherName, setFatherName] = useState(member.fatherName || '');
  const [address, setAddress] = useState(member.address || '');
  const [city, setCity] = useState(member.city || '');
  const [state, setState] = useState(member.state || '');
  const [pincode, setPincode] = useState(member.pincode || '');
  const [adminNotes, setAdminNotes] = useState(member.adminNotes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await membersStore.updateMember(member.id, {
        category_id: categoryId,
        application_data: {
          full_name: fullName.trim(),
          mobile_number: phone.trim(),
          email: email.trim(),
          personal_details: {
            dob,
            gender,
            qualification,
            father_name: fatherName,
            address,
            city,
            state,
            pincode,
          },
        },
        admin_notes: adminNotes,
      });

      onSaved?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update member records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Mobile Number *</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Membership Category / Post</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={inputStyle}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personal Details */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700, color: '#011F39' }}>
            Personal Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={inputStyle}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Graduate, LL.B"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Father / Guardian Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700, color: '#011F39' }}>
            Residential Address
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Street Address / House No.</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          <label style={labelStyle}>Admin Remarks / Notes</label>
          <textarea
            rows={2}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal verification notes..."
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '14px 24px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#4B5563',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 22px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#FFFFFF',
            backgroundColor: '#011F39',
            border: 'none',
            borderRadius: '8px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          <Save size={15} />
          <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
};

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  visible,
  onClose,
  member,
  categories,
  onSaved,
}) => {
  useLockBodyScroll(Boolean(visible && member));

  if (!visible || !member) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(1, 31, 57, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overscrollBehavior: 'contain',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={18} color="#FAD465" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
              Edit Member Profile: {member.name}
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

        {/* Sub-form with key={member.id} */}
        <EditMemberForm
          key={member.id}
          member={member}
          categories={categories}
          onClose={onClose}
          onSaved={onSaved}
        />
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '13px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  backgroundColor: '#FFFFFF',
  color: '#1F2937',
  outline: 'none',
  boxSizing: 'border-box',
};
