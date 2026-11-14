import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Printer,
  ArrowRight,
  Phone,
  LayoutDashboard,
} from 'lucide-react';
import { useMembershipApply } from '../store/membershipApplyStore';
import { Download } from 'lucide-react';
import { cashfreeService } from '../../payments';

export const MembershipSubmittedPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeTrackRecord, formData } = useMembershipApply();

  const appId = activeTrackRecord?.applicationId || 'HRSJM-APP-2026-9481';
  const postName = activeTrackRecord?.postName || formData.selectedPost.postName;
  const applicantName = activeTrackRecord?.fullName || formData.personal.fullName || 'Registered Applicant';

  const handlePrintAcknowledgement = () => {
    window.print();
  };

  const handleDownloadSlip = () => {
    if (activeTrackRecord?.paymentReceipt) {
      cashfreeService.downloadMembershipApplicationPdf(activeTrackRecord.paymentReceipt);
      return;
    }
    cashfreeService.downloadMembershipApplicationPdf({
      orderId: activeTrackRecord?.paymentOrderId || `CF_ORD_${appId}`,
      transactionId: activeTrackRecord?.paymentTransactionId || `TXN_${Date.now()}`,
      amount: activeTrackRecord?.categoryFee || formData.selectedPost.feeAmount,
      purpose: 'membership',
      purposeTitle: `Membership: ${postName}`,
      donorName: applicantName,
      donorMobile: activeTrackRecord?.phone || formData.personal.mobileNumber,
      donorEmail: activeTrackRecord?.email || formData.personal.email,
      paidAt: activeTrackRecord?.submittedAt || new Date().toISOString(),
      receiptNumber: `HRSJM/MEM/${new Date().getFullYear()}/${appId.replace(/\D/g, '').slice(-4) || '1001'}`,
      status: 'SUCCESS',
      applicationId: appId,
      paymentMethod: 'Cashfree PG',
      is80GEligible: false,
    });
  };

  return (
    <div style={styles.container}>
      {/* Success Card */}
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <CheckCircle2 size={44} color="#16A34A" />
        </div>

        <span style={styles.badgeSuccess}>APPLICATION SUBMITTED SUCCESSFULLY</span>

        <h1 style={styles.title}>Welcome to the Mission Accreditation Registry</h1>
        <p style={styles.subtitle}>
          Your formal application for induction into the Human Rights & Social Justice Mission has been safely recorded in the central national registry.
        </p>

        {/* Application ID Highlight Box */}
        <div style={styles.appIdBox}>
          <div style={styles.appIdLabel}>YOUR APPLICATION REFERENCE NUMBER</div>
          <div style={styles.appIdValue}>{appId}</div>
          <div style={styles.appIdNote}>
            Save this reference number. You will need it to track verification and ID card issuance.
          </div>
        </div>

        {/* Quick Details Summary Table */}
        <div style={styles.summaryTable}>
          <div style={styles.summaryRow}>
            <span>Applicant Name:</span>
            <strong>{applicantName}</strong>
          </div>
          <div style={styles.summaryRow}>
            <span>Post Applied For:</span>
            <strong>{postName}</strong>
          </div>
          <div style={styles.summaryRow}>
            <span>Submission Timestamp:</span>
            <span>{activeTrackRecord?.submittedAt ? new Date(activeTrackRecord.submittedAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Official Record'}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Payment Status:</span>
            <span style={{ color: '#16A34A', fontWeight: 700 }}>
              {activeTrackRecord?.paymentStatus === 'PAID' ? 'PAID & VERIFIED (Cashfree)' : 'CONFIRMED'}
            </span>
          </div>
          {activeTrackRecord?.paymentTransactionId && (
            <div style={styles.summaryRow}>
              <span>Transaction Ref:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#06294D' }}>
                {activeTrackRecord.paymentTransactionId}
              </span>
            </div>
          )}
          <div style={styles.summaryRow}>
            <span>Current Status:</span>
            <span style={{ color: '#D97706', fontWeight: 700 }}>UNDER SCRUTINY (Stage 1 Completed)</span>
          </div>
        </div>

        {/* 3-Stage Verification Roadmap */}
        <div style={styles.roadmapCard}>
          <div style={styles.roadmapTitle}>What happens next?</div>
          <div style={styles.roadmapSteps}>
            <div style={styles.roadmapItem}>
              <div style={styles.stepNum}>1</div>
              <div style={styles.stepText}>
                <strong>Document Scrutiny (24-48 hrs):</strong> Verification of identity proof, photograph, and police station clearance by State Scrutiny Cell.
              </div>
            </div>
            <div style={styles.roadmapItem}>
              <div style={styles.stepNum}>2</div>
              <div style={styles.stepText}>
                <strong>Executive Approval:</strong> Endorsement by the District Coordinator and Central Secretariat Directorate.
              </div>
            </div>
            <div style={styles.roadmapItem}>
              <div style={styles.stepNum}>3</div>
              <div style={styles.stepText}>
                <strong>ID Card & Induction:</strong> Permanent Member ID issued, Digital Card activated for instant download, and physical PVC badge dispatched.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionsRow}>
          <button
            type="button"
            onClick={handleDownloadSlip}
            style={{
              ...styles.outlineBtn,
              backgroundColor: '#06294D',
              color: '#FAD465',
              borderColor: '#06294D',
            }}
          >
            <Download size={16} />
            <span>Download Official Application Slip (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintAcknowledgement}
            style={styles.outlineBtn}
          >
            <Printer size={16} />
            <span>Print Acknowledgement</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/membership/status')}
            style={styles.primaryBtn}
          >
            <Clock size={16} />
            <span>Go to My Application</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/user/dashboard')}
            style={{
              ...styles.outlineBtn,
              backgroundColor: '#011F39',
              color: '#FFFFFF',
              borderColor: '#011F39',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Go to User Dashboard</span>
          </button>
        </div>

        {/* Support Helpdesk Notice */}
        <div style={styles.supportNote}>
          <Phone size={14} color="#718096" />
          <span>Questions regarding your application? Call National Secretariat Support: +91 11 2345 6789</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '820px',
    margin: '0 auto',
    padding: '40px 20px 80px 20px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    backgroundColor: '#EAF7EE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  badgeSuccess: {
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: '#EAF7EE',
    color: '#16A34A',
    padding: '3px 12px',
    borderRadius: '999px',
    letterSpacing: '0.06em',
    marginBottom: '16px',
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '28px',
    fontWeight: 800,
    color: '#06294D',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '14.5px',
    color: '#4A5568',
    lineHeight: 1.6,
    maxWidth: '620px',
    margin: '0 0 24px 0',
  },
  appIdBox: {
    backgroundColor: '#FAF7F0',
    border: '2px dashed #E9B82E',
    borderRadius: '12px',
    padding: '20px 24px',
    width: '100%',
    maxWidth: '560px',
    marginBottom: '28px',
  },
  appIdLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#718096',
    letterSpacing: '0.06em',
    marginBottom: '6px',
  },
  appIdValue: {
    fontFamily: 'monospace',
    fontSize: '26px',
    fontWeight: 800,
    color: '#06294D',
    letterSpacing: '0.08em',
  },
  appIdNote: {
    fontSize: '12px',
    color: '#34516D',
    marginTop: '6px',
  },
  summaryTable: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EDF2F7',
    borderRadius: '10px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '28px',
    textAlign: 'left',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#334155',
  },
  roadmapCard: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '680px',
    textAlign: 'left',
    marginBottom: '32px',
  },
  roadmapTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#06294D',
    marginBottom: '16px',
  },
  roadmapSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  roadmapItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  stepNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#06294D',
    color: '#FAD465',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  stepText: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.5,
  },
  actionsRow: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  outlineBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#06294D',
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#06294D',
    color: '#FAD465',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '13.5px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  supportNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#718096',
  },
};
