import type React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import type { UrgencyLevel } from '../types/assistance.types';
import { CAUSE_OPTIONS, PRESET_AMOUNTS } from '../data/assistanceFixtures';
import { assistanceStore } from '../store/assistanceStore';

export const CreateSeekerPage: React.FC = () => {
  const navigate = useNavigate();

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

      const created = await assistanceStore.createRequest({
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

      navigate(`/admin/assistance/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register assistance request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
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
        <Link to="/admin/assistance" style={{ color: '#011F39', textDecoration: 'none', fontWeight: 600 }}>
          Donation Seekers & Aid
        </Link>
        <span>/</span>
        <span>Register Seeker</span>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/assistance')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                Register Donation Seeker & Aid Request
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#DBE5EE' }}>
                Record beneficiary hardship particulars, target aid sum and verification evidence
              </p>
            </div>
          </div>
          <Heart size={22} color="#FAD465" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                fontSize: '13.5px',
                fontWeight: 500,
                marginBottom: '20px',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Aid Cause Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Aid Cause / Humanitarian Category *</label>
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

          {/* Target Amount */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={labelStyle}>Requested Grant / Donation Amount (₹) *</label>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Click preset or enter custom amount</span>
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
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Urgency Level</label>
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
                placeholder="e.g. 42"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>City / District</label>
              <input
                type="text"
                placeholder="e.g. Varanasi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: '#011F39' }}>
              Beneficiary Contact Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Beneficiary Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. Gayatri Devi"
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

          {/* Case Description Narrative */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', marginBottom: '20px' }}>
            <label style={labelStyle}>Detailed Hardship Story / Case Background</label>
            <textarea
              rows={4}
              placeholder="Explain the background circumstances, family hardship, medical diagnosis or urgent aid requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Supporting Documents */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#011F39' }}>
              Supporting Proof Attachment (Optional)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Document Description</label>
                <input
                  type="text"
                  placeholder="e.g. Hospital ICU Estimate or College Fee Challan"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>File Attachment Reference</label>
                <input
                  type="text"
                  placeholder="e.g. bill_estimate_verified.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Direct Approval */}
          <div
            style={{
              borderTop: '1px solid #E5E7EB',
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '14px',
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
              <span>Directly Approve Cause (Skip Under Review Queue)</span>
            </label>

            <div>
              <label style={labelStyle}>Initial Administrative Remark</label>
              <input
                type="text"
                placeholder="e.g. Verified by district nodal officer..."
                value={adminRemark}
                onChange={(e) => setAdminRemark(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '28px',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/admin/assistance')}
              style={{
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#06294D',
                backgroundColor: '#EDF2F7',
                border: '1px solid #DCE4EC',
                borderRadius: '12px',
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
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#011F39',
                backgroundColor: '#FAD465',
                border: 'none',
                borderRadius: '12px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(1, 31, 57, 0.08)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Registering...' : 'Register Seeker'}</span>
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
  color: '#06294D',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '13.5px',
  borderRadius: '12px',
  border: '1px solid #DCE4EC',
  backgroundColor: '#FFFFFF',
  color: '#011F39',
  outline: 'none',
  boxSizing: 'border-box',
};

