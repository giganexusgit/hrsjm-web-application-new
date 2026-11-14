import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { useCurrentMember } from '../store/memberStore';
import { downloadMemberCertificatePdf } from '../utils/memberDocumentGenerator';
import { HrsjmLogo } from '@/components/common/HrsjmLogo';

export const MemberCertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useCurrentMember();

  const handleDownload = () => {
    downloadMemberCertificatePdf(member);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      {/* Top Header / Back Bar */}
      <div style={styles.topBar}>
        <button
          type="button"
          onClick={() => navigate('/member/dashboard')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} color="#06294D" />
          <span>Back to Member Dashboard</span>
        </button>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={handlePrint}
            style={styles.outlineBtn}
          >
            <Printer size={15} color="#06294D" />
            <span>Print Certificate</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            style={styles.primaryBtn}
          >
            <Download size={15} color="#06294D" />
            <span>Download Official PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Certificate Frame Preview */}
      <div style={styles.certificateOuter}>
        <div style={styles.certificateA4Frame}>
          {/* Outer Gold Border */}
          <div style={styles.certOuterBorder}>
            {/* Inner Navy Border */}
            <div style={styles.certInnerBorder}>
              {/* Corner Gold Squares */}
              <div style={{ ...styles.cornerSquare, top: '4px', left: '4px' }} />
              <div style={{ ...styles.cornerSquare, top: '4px', right: '4px' }} />
              <div style={{ ...styles.cornerSquare, bottom: '4px', left: '4px' }} />
              <div style={{ ...styles.cornerSquare, bottom: '4px', right: '4px' }} />

              {/* Certificate Header */}
              <div style={styles.certHeader}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <HrsjmLogo size="lg" variant="dark" showWordmark={false} showIcon={true} />
                </div>
                <div style={styles.certOrgName}>HUMAN RIGHTS & SOCIAL JUSTICE MISSION</div>
                <div style={styles.certOrgSub}>
                  MANAV ADHIKAR & SAMAJIK NYAY • REGISTERED UNDER SOCIETIES REGISTRATION ACT XXI OF 1860
                </div>
                <div style={styles.goldLine} />
              </div>

              {/* Title */}
              <div style={styles.certTitle}>CERTIFICATE OF MEMBERSHIP</div>
              <div style={styles.certCertifyText}>This is to proudly certify that</div>

              {/* Member Full Name */}
              <div style={styles.certMemberName}>{member.fullName}</div>
              <div style={styles.nameUnderline} />

              {/* Induction Paragraph */}
              <div style={styles.certStatement}>
                is officially enrolled as an authorized <strong>{member.categoryTitle}</strong> of the Mission,
                pledged to advocate for human rights, protect social justice, and support community empowerment.
              </div>

              {/* Details Box */}
              <div style={styles.certDetailsBox}>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>MEMBER ID</span>
                  <span style={styles.detailVal}>{member.membershipNumber}</span>
                </div>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>JOINED ON</span>
                  <span style={styles.detailVal}>{member.joiningDate}</span>
                </div>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>VALID TILL</span>
                  <span style={styles.detailVal}>{member.validUpto}</span>
                </div>
              </div>

              {/* Signatures & Seal Section */}
              <div style={styles.certSignaturesRow}>
                {/* Left Signatory */}
                <div style={styles.signatoryCol}>
                  <div style={styles.signatureLine} />
                  <div style={styles.signatoryName}>National President</div>
                  <div style={styles.signatoryRole}>HRSJM Governing Council</div>
                </div>

                {/* Center Official Gold Seal */}
                <div style={styles.centerSeal}>
                  <div style={styles.sealCircle}>
                    <span style={styles.sealTopText}>HRSJM</span>
                    <span style={styles.sealMidText}>OFFICIAL SEAL</span>
                    <span style={styles.sealStarText}>★ VERIFIED ★</span>
                  </div>
                </div>

                {/* Right Signatory */}
                <div style={styles.signatoryCol}>
                  <div style={styles.signatureLine} />
                  <div style={styles.signatoryName}>General Secretary</div>
                  <div style={styles.signatoryRole}>Human Rights Mission Secretariat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification & Trust Footer Box */}
      <div style={styles.verificationBox}>
        <div style={styles.vIconWrap}>
          <ShieldCheck size={24} color="#06294D" />
        </div>
        <div style={styles.vTextWrap}>
          <div style={styles.vTitle}>Official National Credential Verification</div>
          <div style={styles.vDesc}>
            This certificate is registered under Reference No. <strong>HRSJM-CERT-{member.membershipNumber}</strong>. It serves as legal confirmation of active standing and authorization to represent mission initiatives within the designated jurisdiction.
          </div>
        </div>
        <button
          type="button"
          style={styles.vDownloadBtn}
          onClick={handleDownload}
        >
          <Award size={16} />
          <span>Save Certificate</span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#06294D',
    cursor: 'pointer',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  outlineBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#06294D',
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FAD465',
    border: '1px solid #E9B82E',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#06294D',
    cursor: 'pointer',
  },
  certificateOuter: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  certificateA4Frame: {
    width: '100%',
    maxWidth: '920px',
    aspectRatio: '1.414', // Standard A4 Landscape
    minHeight: '620px',
    backgroundColor: '#FEFCF6', // Ivory
    boxShadow: '0 12px 40px rgba(1, 31, 57, 0.16)',
    borderRadius: '8px',
    padding: '24px',
    boxSizing: 'border-box',
    display: 'flex',
  },
  certOuterBorder: {
    border: '4px solid #D4AF37', // Gold
    padding: '10px',
    flex: 1,
    display: 'flex',
    boxSizing: 'border-box',
    position: 'relative',
  },
  certInnerBorder: {
    border: '1.5px solid #06294D', // Deep Navy
    padding: '28px 36px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
    position: 'relative',
    boxSizing: 'border-box',
  },
  cornerSquare: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#D4AF37',
  },
  certHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  certOrgName: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '22px',
    fontWeight: 800,
    color: '#06294D',
    letterSpacing: '0.04em',
  },
  certOrgSub: {
    fontSize: '10px',
    color: '#B45309',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  goldLine: {
    width: '180px',
    height: '2px',
    backgroundColor: '#D4AF37',
    marginTop: '8px',
  },
  certTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '24px',
    fontWeight: 800,
    color: '#06294D',
    letterSpacing: '0.06em',
    marginTop: '10px',
  },
  certCertifyText: {
    fontSize: '13px',
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: '6px',
  },
  certMemberName: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '28px',
    fontWeight: 800,
    color: '#0B2F52',
    marginTop: '10px',
  },
  nameUnderline: {
    width: '260px',
    height: '2px',
    backgroundColor: '#D4AF37',
    marginTop: '4px',
    marginBottom: '10px',
  },
  certStatement: {
    fontSize: '12.5px',
    color: '#334155',
    maxWidth: '680px',
    lineHeight: 1.6,
  },
  certDetailsBox: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '8px 20px',
    margin: '12px 0',
  },
  detailCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailLabel: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#64748B',
    letterSpacing: '0.05em',
  },
  detailVal: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#06294D',
  },
  certSignaturesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    padding: '0 20px',
    marginTop: '12px',
  },
  signatoryCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '180px',
  },
  signatureLine: {
    width: '140px',
    height: '1px',
    backgroundColor: '#94A3B8',
    marginBottom: '6px',
  },
  signatoryName: {
    fontSize: '11.5px',
    fontWeight: 700,
    color: '#06294D',
  },
  signatoryRole: {
    fontSize: '9px',
    color: '#64748B',
  },
  centerSeal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealCircle: {
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    backgroundColor: '#FEF3C7',
    border: '2.5px solid #D4AF37',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)',
  },
  sealTopText: {
    fontSize: '9.5px',
    fontWeight: 900,
    color: '#B45309',
  },
  sealMidText: {
    fontSize: '6.5px',
    fontWeight: 800,
    color: '#B45309',
    marginTop: '1px',
  },
  sealStarText: {
    fontSize: '6px',
    fontWeight: 700,
    color: '#B45309',
    marginTop: '2px',
  },
  verificationBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DCE4EC',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    flexWrap: 'wrap',
  },
  vIconWrap: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    backgroundColor: '#FFF9E6',
    border: '1px solid #FAD465',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  vTextWrap: {
    flex: 1,
    minWidth: '280px',
  },
  vTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0B2F52',
    marginBottom: '4px',
  },
  vDesc: {
    fontSize: '12.5px',
    color: '#4A5568',
    lineHeight: 1.5,
  },
  vDownloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#06294D',
    color: '#FAD465',
    fontWeight: 700,
    fontSize: '13px',
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
};
