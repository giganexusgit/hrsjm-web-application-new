import type React from 'react';
import { useState } from 'react';
import { X, Heart, CheckCircle2 } from 'lucide-react';
import type { UrgencyLevel } from '../types/assistance.types';
import { CAUSE_OPTIONS, PRESET_AMOUNTS } from '../data/assistanceFixtures';
import { assistanceStore } from '../store/assistanceStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface AddSeekerModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const AddSeekerModal: React.FC<AddSeekerModalProps> = ({
  visible,
  onClose,
  onCreated,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState(CAUSE_OPTIONS[0].key);
  const [requestedAmount, setRequestedAmount] = useState<number>(25000);
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [age, setAge] = useState<string>('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [adminRemark, setAdminRemark] = useState('');

  const [documentName, setDocumentName] = useState('');
  const [fileName, setFileName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useLockBodyScroll(visible);

  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!requestedAmount || requestedAmount <= 0) {
      setErrorMsg('Please specify a valid assistance amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const docs = documentName.trim()
        ? [
            {
              document_name: documentName.trim(),
              file_name: fileName.trim() || 'supporting_doc.pdf',
              file_size: '1.4 MB',
              mime_type: 'application/pdf',
            },
          ]
        : [];

      await assistanceStore.createRequest({
        full_name: fullName.trim(),
        mobile: phone.trim(),
        email: email.trim() || undefined,
        reason,
        requested_amount: Number(requestedAmount),
        urgency,
        age: age ? Number(age) : undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        description: description.trim() || undefined,
        status: autoApprove ? 'APPROVED' : 'UNDER_REVIEW',
        admin_remark: adminRemark.trim() || undefined,
        documents: docs,
      });

      onCreated?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register assistance request.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
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
            <Heart size={20} color="#FAD465" />
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#FFFFFF' }}>
              Create Approved Aid & Relief Cause
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

        {/* Form Body */}
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

            {/* Cause Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Aid Cause & Category *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={inputStyle}
              >
                {CAUSE_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Amount & Presets */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={labelStyle}>Requested Financial Aid Amount (₹) *</label>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Select preset or enter custom</span>
              </div>
              <input
                type="number"
                min={100}
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                style={{ ...inputStyle, fontSize: '16px', fontWeight: 700, color: '#011F39' }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRequestedAmount(amt)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: requestedAmount === amt ? '2px solid #011F39' : '1px solid #D1D5DB',
                      backgroundColor: requestedAmount === amt ? '#011F39' : '#FFFFFF',
                      color: requestedAmount === amt ? '#FFFFFF' : '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency & Demographics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Urgency Priority</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  style={inputStyle}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Emergency</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Beneficiary Age</label>
                <input
                  type="number"
                  placeholder="e.g. 34"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>City / District</label>
                <input
                  type="text"
                  placeholder="e.g. Lucknow"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Beneficiary Identity & Contact */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700, color: '#011F39' }}>
                Seeker Identification & Contact Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Beneficiary Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smt. Kausalya Devi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Mobile Phone *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="seeker@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>State / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Cause Story / Description */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
              <label style={labelStyle}>Detailed Case Description & Hardship Story</label>
              <textarea
                rows={3}
                placeholder="Describe medical diagnosis, family hardship, loss sustained or educational breakdown..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Supporting Document */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 700, color: '#011F39' }}>
                Attach Supporting Document (Optional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. AIIMS Hospital Treatment Estimate"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>File Name / Attachment</label>
                  <input
                    type="text"
                    placeholder="e.g. hospital_estimate_aiims.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Immediate Approval Switch */}
            <div
              style={{
                borderTop: '1px solid #E5E7EB',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#011F39',
                }}
              >
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#011F39' }}
                />
                <span>Directly Approve Cause for Immediate Fundraising Allocation</span>
              </label>

              <div>
                <label style={labelStyle}>Administrative Note / Initial Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Recommended by District Human Rights cell representative..."
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                  style={inputStyle}
                />
              </div>
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
                padding: '9px 24px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#011F39',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Aid Cause'}</span>
            </button>
          </div>
        </form>
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
