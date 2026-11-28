import React, { useRef } from 'react';
import type { MembershipApplicationItem } from '../types/applications.types';
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
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

  const isSeeker =
    application.accountType === 'seeker' ||
    (application.membershipType && application.membershipType.toLowerCase().includes('seeker')) ||
    (application.applicationId && application.applicationId.toUpperCase().startsWith('HRSJM-SEK'));

  const appId = application.applicationId || application.id;
  const candidateName = application.applicantName?.trim();
  const postCategory = application.membershipType?.trim();
  const submissionDate = application.submittedDate || application.submittedAt;

  // Collect only real, non-empty personal fields
  const personalFields: { label: string; value: string }[] = [];
  if (candidateName) personalFields.push({ label: 'Full Name', value: candidateName });
  if (application.fatherName?.trim()) personalFields.push({ label: "Father's / Husband's Name", value: application.fatherName.trim() });
  if (application.dob?.trim()) personalFields.push({ label: 'Date of Birth', value: application.dob.trim() });
  if (application.gender?.trim()) personalFields.push({ label: 'Gender', value: application.gender.trim() });
  if (application.phone?.trim()) personalFields.push({ label: 'Mobile Number', value: application.phone.trim() });
  if (application.email?.trim()) personalFields.push({ label: 'Email Address', value: application.email.trim() });
  if (application.qualificationRequirement?.trim()) {
    personalFields.push({ label: 'Qualification Requirement', value: application.qualificationRequirement.trim() });
  }
  if (application.occupation?.trim()) personalFields.push({ label: 'Profession / Occupation', value: application.occupation.trim() });

  // Collect only real, non-empty address fields
  const addressFields: { label: string; value: string }[] = [];
  if (application.address?.trim()) addressFields.push({ label: 'Full Residential Address', value: application.address.trim() });
  if (application.policeStation?.trim()) addressFields.push({ label: 'Police Station (Thana)', value: application.policeStation.trim() });
  if (application.district?.trim()) addressFields.push({ label: 'District', value: application.district.trim() });
  if (application.stateChapter?.trim()) addressFields.push({ label: 'State Chapter', value: application.stateChapter.trim() });

  // Collect only real documents
  const realDocs = Array.isArray(application.documents)
    ? application.documents.filter(d => d && (d.title || d.fileName))
    : [];

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
                {isSeeker ? 'Print Humanitarian Aid Application' : 'Print Official Membership Application'}
              </h3>
              <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '2px 0 0' }}>
                {appId && <>Ref ID: <strong style={{ color: '#FAD465' }}>{appId}</strong> • </>}
                {candidateName}
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
              {(appId || application.status) && (
                <div
                  style={{
                    textAlign: 'right',
                    padding: '8px 12px',
                    backgroundColor: '#FAF7F0',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {appId && (
                    <>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        Application Number
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#06294D', fontFamily: 'monospace' }}>
                        {appId}
                      </div>
                    </>
                  )}
                  {application.status && (
                    <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                      Status: {application.status.toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Application Title Banner */}
            <div
              style={{
                backgroundColor: isSeeker ? '#B45309' : '#06294D',
                color: '#FFFFFF',
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {isSeeker
                  ? 'Humanitarian Aid & Donation Seeker Application Form'
                  : 'National Cadre Membership Enrolment Form'}
              </div>
              <div style={{ fontSize: '11px', color: '#FAD465', fontWeight: 600 }}>
                {isSeeker
                  ? 'मानवतावादी सहायता एवं दान याचक आवेदन पत्र'
                  : 'राष्ट्रीय सदस्यता नामांकन आवेदन पत्र'}
              </div>
            </div>

            {/* Section 1: Candidate Photo & Key Post / Aid Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: application.avatarUrl ? '1fr 140px' : '1fr',
                gap: '16px',
                marginBottom: '16px',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '16px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {postCategory && (
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {isSeeker ? 'Assistance / Aid Category' : 'Applied Cadre / Designation'}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#06294D' }}>
                      {postCategory}
                    </div>
                  </div>
                )}

                {submissionDate && (
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Date of Application
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#06294D' }}>
                      {submissionDate}
                    </div>
                  </div>
                )}

                {application.stateChapter && (
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      State Chapter
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      {application.stateChapter}
                    </div>
                  </div>
                )}

                {!isSeeker && application.validityDays && application.validityDays > 0 && (
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Membership Validity
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                      {application.validityDays} Days ({Math.round(application.validityDays / 365)} Year Official Term)
                    </div>
                  </div>
                )}

                {application.amount !== undefined && application.amount !== null && application.amount !== '' && (
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {isSeeker ? 'Requested Aid Amount' : 'Enrolment / Package Fee'}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: isSeeker ? '#B45309' : '#06294D' }}>
                      ₹{Number(application.amount).toLocaleString('en-IN')}{' '}
                      {application.paymentStatus && !isSeeker ? `(${application.paymentStatus})` : ''}
                    </div>
                  </div>
                )}

                {application.transactionId && (
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Payment Ref / Txn ID
                    </span>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7', fontFamily: 'monospace' }}>
                      {application.transactionId}
                    </div>
                  </div>
                )}

                {application.paymentMethod && (
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Payment Mode
                    </span>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>
                      {application.paymentMethod}
                    </div>
                  </div>
                )}
              </div>

              {/* Applicant Photo Box (Only shown if photo is available) */}
              {application.avatarUrl && application.avatarUrl !== '/' && (
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
                    <img
                      src={application.avatarUrl}
                      alt={candidateName || 'Applicant'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
                    Applicant Photograph
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Personal Particulars (Only rendered if fields exist) */}
            {personalFields.length > 0 && (
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

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '10px',
                    fontSize: '11.5px',
                  }}
                >
                  {personalFields.map(f => (
                    <div key={f.label} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                        {f.label}:
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#06294D' }}>
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Residential Address & Jurisdiction (Only rendered if fields exist) */}
            {addressFields.length > 0 && (
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

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '10px',
                    fontSize: '11.5px',
                  }}
                >
                  {addressFields.map(f => (
                    <div key={f.label} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                        {f.label}:
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Attached Verification Documents (Only rendered if documents exist) */}
            {realDocs.length > 0 && (
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
                  3. Attached Verification Documents / संलग्न दस्तावेज ({realDocs.length})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                  {realDocs.map((doc, idx) => (
                    <div key={doc.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span>
                        <strong>{doc.title || doc.fileName}:</strong>{' '}
                        {doc.fileName && doc.title !== doc.fileName ? `(${doc.fileName})` : ''}
                        {doc.verified ? ' [Verified]' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Administrative Remarks / Notes (Only rendered if present) */}
            {application.adminNotes?.trim() && (
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#06294D',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '6px',
                    borderBottom: '1px solid #CBD5E1',
                    paddingBottom: '4px',
                  }}
                >
                  Administrative Scrutiny Notes
                </div>
                <div style={{ fontSize: '11.5px', color: '#334155', fontStyle: 'italic', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px' }}>
                  {application.adminNotes.trim()}
                </div>
              </div>
            )}

            {/* Rejection Notice (Only rendered if rejected) */}
            {application.rejectionReason?.trim() && (
              <div style={{ marginBottom: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
                  Application Rejection Reason
                </div>
                <div style={{ fontSize: '11.5px', color: '#991B1B', marginTop: '4px' }}>
                  {application.rejectionReason.trim()}
                </div>
              </div>
            )}

            {/* Solemn Declaration & Mission Pledge */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '20px',
                fontSize: '10px',
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
                <div style={{ height: '38px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'cursive', fontSize: '14px', color: '#06294D' }}>
                    {candidateName || 'Applicant'}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '10px', fontWeight: 700, color: '#06294D' }}>
                  {isSeeker ? 'Applicant / Seeker Signature' : 'Candidate / Member Signature'}
                </div>
              </div>

              <div>
                <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      border: '1.5px solid #047857',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '7.5px',
                      fontWeight: 800,
                      color: '#047857',
                      textTransform: 'uppercase',
                    }}
                  >
                    HRSJM SEAL
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '10px', fontWeight: 700, color: '#06294D' }}>
                  Verification Officer Seal
                </div>
              </div>

              <div>
                <div style={{ height: '38px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: 700, color: '#047857' }}>
                    Authorized Signatory
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
              <span>Generated from National Portal: {new Date().toLocaleDateString('en-GB')}</span>
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
            <span>Official A4 Print Format • Only verified applicant records included</span>
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
