import type React from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  Paperclip,
  Globe,
  Smartphone,
  Laptop,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Archive,
} from 'lucide-react';
import type { SupportTicket, TicketStatus } from '../types/support.types';
import {
  shortTicketId,
  STATUS_META,
  resolveTicketSource,
  SOURCE_CONFIG,
  PRIORITIES,
  canTransition,
} from '../types/support.types';

interface SupportTicketRowProps {
  ticket: SupportTicket;
  messageCount: number;
  onView: (ticket: SupportTicket) => void;
  onOpenChat: (ticket: SupportTicket) => void;
  onUpdateStatus: (ticket: SupportTicket, targetStatus: TicketStatus) => void;
}

const STATUS_LEFT_BORDER: Record<TicketStatus, string> = {
  SUBMITTED: '#D97706',
  UNDER_REVIEW: '#0284C7',
  RESOLVED: '#16A34A',
  CLOSED: '#94A3B8',
};

const STATUS_DOT_COLOR: Record<TicketStatus, string> = {
  SUBMITTED: '#D97706',
  UNDER_REVIEW: '#0284C7',
  RESOLVED: '#16A34A',
  CLOSED: '#64748B',
};

export const SupportTicketRow: React.FC<SupportTicketRowProps> = ({
  ticket,
  messageCount,
  onView,
  onOpenChat,
  onUpdateStatus,
}) => {
  const shortId = shortTicketId(ticket.id);
  const statusMeta = STATUS_META[ticket.status] || STATUS_META.SUBMITTED;
  const sourceKey = resolveTicketSource(ticket);
  const sourceMeta = SOURCE_CONFIG[sourceKey] || SOURCE_CONFIG.app;
  const priorityMeta = PRIORITIES.find((p) => p.id === ticket.priority) || PRIORITIES[0];

  const complainantName = ticket.user?.full_name || 'Citizen Complainant';
  const complainantEmail = ticket.user?.email || '';
  const complainantPhone = ticket.user?.mobile_number || '';

  const cleanSubject = ticket.subject.replace(/\[.*?\]\s*/g, '');
  const docCount = (ticket.documents || []).length;

  const dateFormatted = new Date(ticket.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getSourceIcon = () => {
    if (sourceKey === 'website') return <Globe size={12} />;
    if (sourceKey === 'app') return <Smartphone size={12} />;
    return <Laptop size={12} />;
  };

  const leftBorderColor = STATUS_LEFT_BORDER[ticket.status] || '#94A3B8';
  const dotColor = STATUS_DOT_COLOR[ticket.status] || '#64748B';

  return (
    <div
      style={{
        ...styles.card,
        borderLeft: `4px solid ${leftBorderColor}`,
      }}
      className="support-ticket-card"
    >
      {/* Top Meta Bar */}
      <div style={styles.topBar}>
        <div style={styles.idGroup}>
          <span style={styles.idBadge}>#{shortId}</span>

          <span
            style={{
              ...styles.sourceBadge,
              backgroundColor: sourceMeta.bg,
              color: sourceMeta.text,
              borderColor: sourceMeta.border,
            }}
          >
            {getSourceIcon()}
            <span>{sourceMeta.label}</span>
          </span>

          {ticket.category && (
            <span style={styles.categoryBadge}>{ticket.category}</span>
          )}

          {ticket.priority && ticket.priority !== 'NORMAL' && (
            <span
              style={{
                ...styles.priorityBadge,
                backgroundColor: priorityMeta.badgeBg,
                color: priorityMeta.tone,
                borderColor: priorityMeta.border,
              }}
            >
              <AlertTriangle size={11} />
              <span>{priorityMeta.label}</span>
            </span>
          )}
        </div>

        <div style={styles.statusGroup}>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: statusMeta.badgeBg,
              color: statusMeta.badgeText,
              borderColor: statusMeta.border,
            }}
          >
            <span
              style={{
                ...styles.statusDot,
                backgroundColor: dotColor,
              }}
            />
            {statusMeta.label}
          </span>

          <span style={styles.dateText}>
            <Calendar size={12} color="#64748B" />
            <span>{dateFormatted}</span>
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={styles.contentBody}>
        <div style={styles.subjectRow}>
          <h3
            style={styles.subjectText}
            onClick={() => onView(ticket)}
            title="Click to view full ticket details and history"
            className="support-ticket-title"
          >
            {cleanSubject}
          </h3>
          {docCount > 0 && (
            <span style={styles.attachmentPill} title={`${docCount} verified attachment(s)`}>
              <Paperclip size={12} color="#64748B" />
              <span>{docCount} {docCount === 1 ? 'doc' : 'docs'}</span>
            </span>
          )}
        </div>

        {/* Complainant User Info Bar */}
        <div style={styles.userRow}>
          <div style={styles.avatar}>
            {complainantName.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{complainantName}</span>
            <div style={styles.contactRow}>
              {complainantEmail && (
                <span style={styles.contactItem}>
                  <Mail size={11} color="#64748B" />
                  <span>{complainantEmail}</span>
                </span>
              )}
              {complainantPhone && (
                <span style={styles.contactItem}>
                  <Phone size={11} color="#64748B" />
                  <span>{complainantPhone}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={styles.footer}>
        {/* Quick Transition Buttons */}
        <div style={styles.quickTransitions}>
          {canTransition(ticket.status, 'UNDER_REVIEW') && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket, 'UNDER_REVIEW')}
              style={styles.transitionBtnInfo}
              title="Transition ticket to In Progress state"
            >
              <Clock size={13} />
              <span>Mark In Progress</span>
            </button>
          )}

          {canTransition(ticket.status, 'RESOLVED') && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket, 'RESOLVED')}
              style={styles.transitionBtnSuccess}
              title="Mark ticket grievance as Resolved"
            >
              <CheckCircle2 size={13} />
              <span>Mark Resolved</span>
            </button>
          )}

          {canTransition(ticket.status, 'CLOSED') && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket, 'CLOSED')}
              style={styles.transitionBtnNeutral}
              title="Archive and close ticket"
            >
              <Archive size={13} />
              <span>Close</span>
            </button>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div style={styles.navActions}>
          <button
            type="button"
            onClick={() => onOpenChat(ticket)}
            style={styles.chatBtn}
            title="Open ticket conversation messages"
            className="support-chat-btn"
          >
            <MessageSquare size={14} color="#011F39" />
            <span>Chat</span>
            {messageCount > 0 && (
              <span style={styles.chatBadge}>{messageCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onView(ticket)}
            style={styles.viewBtn}
            title="View complete ticket timeline and details"
            className="support-view-btn"
          >
            <span>View Ticket</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    borderTop: '1px solid #E2E8F0',
    borderRight: '1px solid #E2E8F0',
    borderBottom: '1px solid #E2E8F0',
    padding: '16px 20px',
    marginBottom: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '10px',
  },
  idGroup: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  idBadge: {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontWeight: 700,
    fontSize: '12px',
    color: '#011F39',
    backgroundColor: '#EDF2F7',
    border: '1px solid #DCE4EC',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.03em',
  },
  sourceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid',
  },
  categoryBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#FFF9E6',
    color: '#B45309',
    border: '1px solid #FDE68A',
  },
  priorityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid',
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '12px',
    border: '1px solid',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  dateText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748B',
  },
  contentBody: {
    marginBottom: '14px',
  },
  subjectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  subjectText: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    fontSize: '15px',
    fontWeight: 700,
    color: '#0B2F52',
    margin: 0,
    cursor: 'pointer',
    flex: 1,
    lineHeight: 1.35,
    transition: 'color 0.15s ease',
  },
  attachmentPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    padding: '2px 8px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(1, 31, 57, 0.15)',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0B2F52',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  contactItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11.5px',
    color: '#64748B',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    borderTop: '1px solid #F1F5F9',
    paddingTop: '12px',
  },
  quickTransitions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  transitionBtnInfo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #BAE6FD',
    backgroundColor: '#EFF6FF',
    color: '#0284C7',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  transitionBtnSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #BBF7D0',
    backgroundColor: '#F0FDF4',
    color: '#15803D',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  transitionBtnNeutral: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
  },
  chatBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  chatBadge: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '1px 6px',
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 3px rgba(1, 31, 57, 0.2)',
  },
};
