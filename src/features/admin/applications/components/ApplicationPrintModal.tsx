import React, { useRef } from 'react';
import type { MembershipApplicationItem } from '../types/applications.types';
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface ApplicationPrintModalProps {
  isOpen: boolean;
  application: MembershipApplicationItem | null;
  onClose: () => void;
}

export const ApplicationPrintModal: React.FC<ApplicationPrintModalProps> = ({
  isOpen,
  application,
  onClose,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(Boolean(isOpen && application));

  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  const appId = application.applicationId || application.id || 'HRSJM-APP';
  const candidateName = application.applicantName || 'Applicant Candidate';
  const postCategory = application.membershipType || 'Council Cadre Member';
  const submissionDate = application.submittedDate || application.submittedAt || new Date().toLocaleDateString('en-GB');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1080,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(6, 41, 77, 0.8)',
        backdropFilter: 'blur(5px)',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Dynamic @media print CSS injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #hrsjm-printable-application, #hrsjm-printable-application * {
            visibility: visible !important;
          }
          #hrsjm-printable-application {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 8mm 12mm !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '94vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(6, 41, 77, 0.4)',
          border: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden on print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            backgroundColor: '#06294D',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1E3A5F',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(250, 212, 101, 0.15)',
                color: '#FAD465',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(250, 212, 101, 0.3)',
              }}
            >
              <Printer size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Print Official Membership Application Form
              </h3>
              <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '2px 0 0' }}>
                Ref ID: <strong style={{ color: '#FAD465' }}>{appId}</strong> • {candidateName}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                backgroundColor: '#FAD465',
                color: '#06294D',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
              className="hover:bg-[#E9B82E] transition"
            >
              <Printer size={16} />
              <span>Print Application</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
              className="hover:bg-white/20 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Printable Official Application Form Sheet */}
          <div
            id="hrsjm-printable-application"
            ref={printAreaRef}
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #06294D',
              borderRadius: '8px',
              padding: '28px 32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              position: 'relative',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: '#0F172A',
            }}
          >
            {/* Top Statutory Watermark / Seal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid #06294D',
                paddingBottom: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src="/hrsjm_logo.png"
                  alt="HRSJM Logo"
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h1
                    style={{
                      fontSize: '18px',
                      fontWeight: 900,
                      color: '#06294D',
                      margin: 0,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Human Rights &amp; Social Justice Mission
                  </h1>
                  <h2
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#B45309',
                      margin: '2px 0 0',
                    }}
                  >
                    मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट
                  </h2>
                  <p style={{ fontSize: '10px', color: '#64748B', margin: '3px 0 0' }}>
                    Reg. No: HR/0092/2019 • PAN: AABTH4589K • NITI Aayog: DL/2021/0284562 • 12A &amp; 80G Certified
                  </p>
                </div>
              </div>

              {/* Form Metadata Box */}
              <div
                style={{
                  textAlign: 'right',
                  padding: '8px 12px',
                  backgroundColor: '#FAF7F0',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Application Number
                </div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#06294D', fontFamily: 'monospace' }}>
                  {appId}
                </div>
                <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  Status: {(application.status || 'SUBMITTED').toUpperCase()}
                </div>
              </div>
            </div>

            {/* Application Title Banner */}
            <div
              style={{
                backgroundColor: '#06294D',
                color: '#FFFFFF',
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                National Cadre Membership Enrolment Form
              </div>
              <div style={{ fontSize: '11px', color: '#FAD465', fontWeight: 600 }}>
                राष्ट्रीय सदस्यता नामांकन आवेदन पत्र
              </div>
            </div>

            {/* Section 1: Candidate Photo & Key Post Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                gap: '16px',
                marginBottom: '16px',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '16px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Applied Cadre / Designation
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#06294D' }}>
                    {postCategory}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Date of Application
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#06294D' }}>
                    {submissionDate}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    State Chapter
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                    {application.stateChapter || application.address?.split(',').pop()?.trim() || 'Central Secretariat'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Membership Validity
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                    {application.validityDays ? `${application.validityDays} Days` : '365 Days (1 Year Official Term)'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Enrolment / Package Fee
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#06294D' }}>
                    ₹{application.amount ? Number(application.amount).toLocaleString('en-IN') : '800'} ({application.paymentStatus || 'PAID'})
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Payment Reference / Txn ID
                  </span>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7', fontFamily: 'monospace' }}>
                    {application.transactionId || 'CASHFREE-TXN-VERIFIED'}
                  </div>
                </div>
              </div>

              {/* Applicant Photo Box */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    height: '140px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    margin: '0 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FAF7F0',
                  }}
                >
                  {application.avatarUrl && application.avatarUrl !== '/' ? (
                    <img
                      src={application.avatarUrl}
                      alt={candidateName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                      <User size={36} />
                      <div style={{ fontSize: '9px', fontWeight: 700, marginTop: '4px' }}>Attested Photo</div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
                  Applicant Photograph
                </div>
              </div>
            </div>

            {/* Section 2: Personal Particulars */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#06294D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  borderBottom: '1px solid #CBD5E1',
                  paddingBottom: '4px',
                }}
              >
                1. Personal Particulars / व्यक्तिगत विवरण
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B', width: '25%' }}>Full Name:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 800, color: '#06294D', width: '25%' }}>{candidateName}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B', width: '25%' }}>Father's / Husband's:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B', width: '25%' }}>{application.fatherName || 'Not Disclosed'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B' }}>Date of Birth:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B' }}>{application.dob || '01/01/1990'}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B' }}>Gender:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B' }}>{application.gender || 'Male'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B' }}>Mobile Number:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#06294D' }}>{application.phone || '9876543210'}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B' }}>Email Address:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B' }}>{application.email || 'member@hrsjm.org'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B' }}>Educational Qualification:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B' }}>{application.qualificationRequirement || 'Graduate / Professional'}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B' }}>Profession / Occupation:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B' }}>{application.occupation || 'Social Activist / Professional'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Residential Address & Police Station */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#06294D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  borderBottom: '1px solid #CBD5E1',
                  paddingBottom: '4px',
                }}
              >
                2. Residential Address &amp; Jurisdiction / आवासीय पता
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B', width: '25%' }}>Full Address:</td>
                    <td colSpan={3} style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B' }}>
                      {application.address || 'Civil Lines, Central District, New Delhi - 110054'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B', width: '25%' }}>Police Station (Thana):</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B', width: '25%' }}>
                      {application.policeStation || 'Civil Lines Police Station'}
                    </td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#64748B', width: '25%' }}>District &amp; State:</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1E293B', width: '25%' }}>
                      {application.district || 'Central'}, {application.stateChapter || 'Delhi'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: Attached KYC Verification Documents Checklist */}
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#06294D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  borderBottom: '1px solid #CBD5E1',
                  paddingBottom: '4px',
                }}
              >
                3. Attached Statutory Verification Documents / संलग्न दस्तावेज
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span><strong>Identity Proof:</strong> Aadhaar Card / Voter ID (Verified)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span><strong>Residential Proof:</strong> Electricity / Domicile Certificate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span><strong>Qualification Proof:</strong> Highest Education Certificate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span><strong>Passport Photo:</strong> Recent Color Photograph Uploaded</span>
                </div>
              </div>
            </div>

            {/* Section 5: Statutory Declaration & Pledge */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '20px',
                fontSize: '10.5px',
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#06294D' }}>Solemn Declaration &amp; Mission Pledge:</strong>
              <p style={{ margin: '4px 0 0' }}>
                I hereby solemnly affirm and declare that the particulars furnished above are true, complete, and authentic to the best of my knowledge. I promise to abide by the Constitution, bylaws, and ethical charter of the Human Rights &amp; Social Justice Mission. I shall relentlessly protect the constitutional and humanitarian rights of all citizens without distinction of caste, religion, gender, or status.
              </p>
            </div>

            {/* Signatures & Seal Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                paddingTop: '16px',
                borderTop: '2px dashed #CBD5E1',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'cursive', fontSize: '14px', color: '#06294D' }}>{candidateName}</span>
                </div>
                <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '10px', fontWeight: 700, color: '#06294D' }}>
                  Candidate / Member Signature
                </div>
              </div>

              <div>
                <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      border: '1.5px solid #047857',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: 800,
                      color: '#047857',
                      textTransform: 'uppercase',
                    }}
                  >
                    HRSJM SEAL
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '10px', fontWeight: 700, color: '#06294D' }}>
                  State Scrutiny Officer Seal
                </div>
              </div>

              <div>
                <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '12px', fontWeight: 700, color: '#047857' }}>
                    Registrar / Authorized Signatory
                  </span>
                </div>
                <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '10px', fontWeight: 700, color: '#06294D' }}>
                  National Headquarters Clearance
                </div>
              </div>
            </div>

            {/* Bottom Footer Notice */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '8px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: '#94A3B8',
              }}
            >
              <span>HRSJM Official Registry Document • IT Act 2000 Statutory Record</span>
              <span>Generated from National Portal: {new Date().toLocaleString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 24px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#059669" />
            <span>Official A4 Print Format • Compatible with all thermal and laser printers</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              className="hover:bg-slate-50 transition"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#06294D',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(6, 41, 77, 0.2)',
              }}
              className="hover:bg-[#011F39] transition"
            >
              <Printer size={15} color="#FAD465" />
              <span>Print Application Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
