import type React from 'react';
import { Link } from 'react-router-dom';
import { Gift, ShieldCheck, ArrowRight, ReceiptText } from 'lucide-react';

export interface FinancialSummaryCardProps {
  totalCollections?: number;
  receiptsCount?: number;
  averageDonation?: number;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  totalCollections,
  receiptsCount,
  averageDonation,
}) => {
  const displayTotal = totalCollections !== undefined
    ? `₹${totalCollections.toLocaleString('en-IN')}`
    : '₹0';

  const displayReceipts = receiptsCount !== undefined
    ? receiptsCount.toLocaleString('en-IN')
    : '0';

  const calculatedAverage = averageDonation !== undefined
    ? averageDonation
    : (receiptsCount && receiptsCount > 0 && totalCollections
        ? Math.round(totalCollections / receiptsCount)
        : 0);

  const displayAverage = `₹${calculatedAverage.toLocaleString('en-IN')}`;
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <div style={styles.iconWrap}>
            <Gift size={18} color="#06294D" />
          </div>
          <div>
            <h4 style={styles.title}>Donations & 80G Tax Exemption</h4>
            <p style={styles.subtitle}>Direct philanthropic income summary</p>
          </div>
        </div>

        <Link to="/admin/donations" style={styles.viewAllLink}>
          <span>Manage Donations</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div style={styles.grid}>
        <div style={styles.metricBlock}>
          <span style={styles.metricLabel}>Total Collections (YTD)</span>
          <span style={styles.metricValue}>{displayTotal}</span>
          <div style={styles.metricTag}>
            <span style={styles.greenDot} />
            <span>100% Tax Compliant</span>
          </div>
        </div>

        <div style={styles.metricBlock}>
          <span style={styles.metricLabel}>80G Receipts Issued</span>
          <span style={styles.metricValue}>{displayReceipts}</span>
          <div style={styles.metricTag}>
            <ReceiptText size={12} color="#174A78" />
            <span>Digital Receipts</span>
          </div>
        </div>

        <div style={styles.metricBlock}>
          <span style={styles.metricLabel}>Average Donation</span>
          <span style={styles.metricValue}>{displayAverage}</span>
          <div style={styles.metricTag}>
            <ShieldCheck size={12} color="#047857" />
            <span>Verified Donors</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 2px 8px -2px rgba(1, 31, 57, 0.05)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#EDF2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0B2F52',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  viewAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#174A78',
    textDecoration: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  metricBlock: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#718096',
  },
  metricValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0B2F52',
    letterSpacing: '-0.02em',
  },
  metricTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#174A78',
    marginTop: '4px',
  },
  greenDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#16A34A',
  },
};

