import type React from 'react';
import { useSyncExternalStore, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { supportStore } from '../store/supportStore';
import { shortTicketId, STATUS_META } from '../types/support.types';
import { TicketChatWidget } from '../components/TicketChatWidget';

export const SupportTicketChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const storeSnapshot = useSyncExternalStore(
    supportStore.subscribe,
    supportStore.getSnapshot
  );

  const ticket = storeSnapshot.tickets.find((t) => t.id === id);
  const messages = id ? storeSnapshot.messagesByTicket[id] || [] : [];

  useEffect(() => {
    if (id) {
      supportStore.markTicketViewed(id);
    }
  }, [id]);

  if (!ticket) {
    return (
      <div style={styles.notFoundContainer}>
        <h2 style={styles.notFoundTitle}>Conversation Not Found</h2>
        <p style={styles.notFoundText}>
          The requested ticket #{id} does not exist in the active records.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/support')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Back to Support Directory</span>
        </button>
      </div>
    );
  }

  const shortId = shortTicketId(ticket.id);
  const statusMeta = STATUS_META[ticket.status] || STATUS_META.SUBMITTED;
  const complainantName = ticket.user?.full_name || 'Citizen Complainant';

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            type="button"
            onClick={() => navigate(`/admin/support/${ticket.id}`)}
            style={styles.backBtn}
          >
            <ArrowLeft size={18} />
            <span>Ticket Details</span>
          </button>
          <div style={styles.divider} />
          <div>
            <div style={styles.ticketIdRow}>
              <span style={styles.ticketIdBadge}>Ticket #{shortId}</span>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: statusMeta.badgeBg,
                  color: statusMeta.badgeText,
                  borderColor: statusMeta.border,
                }}
              >
                {statusMeta.label}
              </span>
            </div>
            <h2 style={styles.title}>{ticket.subject}</h2>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.complainantPill}>
            <User size={14} color="#011F39" />
            <span>{complainantName}</span>
          </div>
        </div>
      </div>

      {/* Embedded Full-height Chat Widget */}
      <div style={styles.chatCard}>
        <TicketChatWidget ticket={ticket} messages={messages} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  notFoundContainer: {
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
  },
  notFoundTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '24px',
    color: '#011F39',
  },
  notFoundText: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #DCE4EC',
    padding: '16px 20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  divider: {
    width: '1px',
    height: '32px',
    backgroundColor: '#DCE4EC',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#011F39',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  ticketIdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  ticketIdBadge: {
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '12px',
    color: '#011F39',
    backgroundColor: '#EDF2F7',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
    border: '1px solid',
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '18px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  complainantPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FAF7F0',
    border: '1px solid #DCE4EC',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#011F39',
  },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    boxShadow: '0 4px 14px rgba(1, 31, 57, 0.04)',
    overflow: 'hidden',
  },
};
