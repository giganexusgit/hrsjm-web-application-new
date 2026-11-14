import type React from 'react';
import { useState, useMemo, useSyncExternalStore, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Archive,
  MessageSquare,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  Download,
} from 'lucide-react';
import type { TicketStatus } from '../types/support.types';
import {
  STATUS_META,
  PRIORITIES,
  SOURCE_CONFIG,
  shortTicketId,
  resolveTicketSource,
  canTransition,
} from '../types/support.types';
import { supportStore } from '../store/supportStore';
import { UpdateStatusModal } from '../components/UpdateStatusModal';
import { TicketChatWidget } from '../components/TicketChatWidget';

function parseTicketDescription(rawDescription?: string) {
  const text = (rawDescription || '').trim();
  if (!text) {
    return {
      complainantMeta: null,
      concernDetails: '',
      hasStructuredSubmission: false,
    };
  }

  if (
    text.includes('Complainant Information:') ||
    text.includes('--- Verified Documents') ||
    text.includes('Details of Concern:') ||
    text.includes('Verified Document Attachments:')
  ) {
    const lines = text.split('\n');
    const complainantMeta: Array<{ label: string; value: string }> = [];
    let concernText = '';
    let readingSection: 'complainant' | 'concern' | 'ignore' | 'none' = 'none';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/^Complainant Information:/i.test(line)) {
        readingSection = 'complainant';
        continue;
      }
      if (/^Details of Concern:/i.test(line)) {
        readingSection = 'concern';
        continue;
      }
      if (
        /^--- Verified Documents/i.test(line) ||
        /^Verified Document Attachments:/i.test(line)
      ) {
        readingSection = 'ignore';
        continue;
      }

      if (readingSection === 'complainant') {
        const match = /^-\s*([^:]+)\s*:\s*(.+)$/.exec(line);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.toLowerCase() !== 'source') {
            complainantMeta.push({ label: key, value: val });
          }
        }
      } else if (readingSection === 'concern') {
        concernText += rawLine + '\n';
      }
    }

    return {
      complainantMeta: complainantMeta.length > 0 ? complainantMeta : null,
      concernDetails: concernText.trim() || text,
      hasStructuredSubmission: true,
    };
  }

  return {
    complainantMeta: null,
    concernDetails: text,
    hasStructuredSubmission: false,
  };
}

export const SupportTicketDetailsPage: React.FC = () => {
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

  const [statusModalTarget, setStatusModalTarget] = useState<TicketStatus | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const parsedDesc = useMemo(
    () => parseTicketDescription(ticket?.description),
    [ticket?.description]
  );

  if (!ticket) {
    return (
      <div style={styles.notFoundContainer}>
        <h2 style={styles.notFoundTitle}>Support Ticket Not Found</h2>
        <p style={styles.notFoundText}>
          The requested ticket #{id} could not be located in the system records.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/support')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Back to Support & Complaints</span>
        </button>
      </div>
    );
  }

  const shortId = shortTicketId(ticket.id);
  const statusMeta = STATUS_META[ticket.status] || STATUS_META.SUBMITTED;
  const sourceKey = resolveTicketSource(ticket);
  const sourceMeta = SOURCE_CONFIG[sourceKey] || SOURCE_CONFIG.app;
  const priorityMeta = PRIORITIES.find((p) => p.id === ticket.priority) || PRIORITIES[0];

  const complainantName = ticket.user?.full_name || 'Citizen Complainant';
  const complainantEmail = ticket.user?.email || '—';
  const complainantPhone = ticket.user?.mobile_number || '—';

  const cleanSubject = ticket.subject.replace(/\[.*?\]\s*/g, '');
  const attachments = ticket.documents || [];

  const handleConfirmStatus = async (note?: string): Promise<boolean> => {
    if (!statusModalTarget) return false;
    await supportStore.updateStatus(ticket.id, statusModalTarget, note);
    setSuccessBanner(
      `Ticket #${shortId} status changed to ${STATUS_META[statusModalTarget].label}. Official case log updated.`
    );
    setTimeout(() => setSuccessBanner(null), 4000);
    return true;
  };

  return (
    <div style={styles.container}>
      {/* Back Navigation Bar */}
      <div style={styles.topNav}>
        <button
          type="button"
          onClick={() => navigate('/admin/support')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Back to Support Directory</span>
        </button>
        <div style={styles.topRightActions}>
          <Link
            to={`/admin/support/${ticket.id}/chat`}
            style={styles.openChatLink}
          >
            <MessageSquare size={15} />
            <span>Open Dedicated Chat Window</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div style={styles.successBanner}>
          <span>✓ {successBanner}</span>
        </div>
      )}

      {/* Header Card */}
      <div style={styles.headerCard}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.metaPills}>
              <span style={styles.ticketIdBadge}>Ticket #{shortId}</span>
              <span
                style={{
                  ...styles.sourcePill,
                  backgroundColor: sourceMeta.bg,
                  color: sourceMeta.text,
                  borderColor: sourceMeta.border,
                }}
              >
                {sourceMeta.label}
              </span>
              {ticket.category && (
                <span style={styles.categoryPill}>{ticket.category}</span>
              )}
              {ticket.priority && (
                <span
                  style={{
                    ...styles.priorityPill,
                    backgroundColor: priorityMeta.badgeBg,
                    color: priorityMeta.tone,
                    borderColor: priorityMeta.border,
                  }}
                >
                  {priorityMeta.label}
                </span>
              )}
            </div>
            <h1 style={styles.subjectHeading}>{cleanSubject}</h1>
          </div>

          <div style={styles.headerStatusArea}>
            <span
              style={{
                ...styles.statusBigBadge,
                backgroundColor: statusMeta.badgeBg,
                color: statusMeta.badgeText,
                borderColor: statusMeta.border,
              }}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* Date / Reporter Meta */}
        <div style={styles.dateMetaRow}>
          <div style={styles.dateMetaItem}>
            <Calendar size={14} color="#718096" />
            <span>
              Submitted on{' '}
              {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {ticket.resolved_at && (
            <div style={styles.dateMetaItem}>
              <CheckCircle2 size={14} color="#16A34A" />
              <span>
                Resolved on{' '}
                {new Date(ticket.resolved_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                by {ticket.resolved_by_user?.full_name || 'Admin'}
              </span>
            </div>
          )}
        </div>

        {/* Administrative Action Bar */}
        <div style={styles.actionBar}>
          <span style={styles.actionLabel}>Update Lifecycle Status:</span>
          <div style={styles.actionButtons}>
            {canTransition(ticket.status, 'UNDER_REVIEW') && (
              <button
                type="button"
                onClick={() => setStatusModalTarget('UNDER_REVIEW')}
                style={styles.actionBtnInfo}
              >
                <Clock size={14} />
                <span>Mark In Progress</span>
              </button>
            )}

            {canTransition(ticket.status, 'RESOLVED') && (
              <button
                type="button"
                onClick={() => setStatusModalTarget('RESOLVED')}
                style={styles.actionBtnSuccess}
              >
                <CheckCircle2 size={14} />
                <span>Mark Resolved</span>
              </button>
            )}

            {canTransition(ticket.status, 'CLOSED') && (
              <button
                type="button"
                onClick={() => setStatusModalTarget('CLOSED')}
                style={styles.actionBtnNeutral}
              >
                <Archive size={14} />
                <span>Close Ticket</span>
              </button>
            )}

            {!canTransition(ticket.status, 'UNDER_REVIEW') &&
              !canTransition(ticket.status, 'RESOLVED') &&
              !canTransition(ticket.status, 'CLOSED') && (
                <span style={styles.terminalStatusNotice}>
                  Ticket is in terminal state ({ticket.status}).
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Conversation */}
      <div style={styles.mainGrid}>
        {/* Left Column: Complainant Info, Details of Concern, Attachments */}
        <div style={styles.leftColumn}>
          {/* Complainant Profile Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <User size={18} color="#011F39" />
              <h3 style={styles.cardTitle}>Complainant Information</h3>
            </div>
            <div style={styles.profileContent}>
              <div style={styles.avatarLarge}>
                {complainantName.charAt(0).toUpperCase()}
              </div>
              <div style={styles.profileDetails}>
                <h4 style={styles.profileName}>{complainantName}</h4>
                <div style={styles.contactRow}>
                  <Mail size={13} color="#718096" />
                  <span>{complainantEmail}</span>
                </div>
                <div style={styles.contactRow}>
                  <Phone size={13} color="#718096" />
                  <span>{complainantPhone}</span>
                </div>
              </div>
            </div>

            {/* Structured Meta parsed from description if available */}
            {parsedDesc.complainantMeta && (
              <div style={styles.structuredMetaGrid}>
                {parsedDesc.complainantMeta.map((item, idx) => (
                  <div key={idx} style={styles.structuredMetaItem}>
                    <span style={styles.metaItemLabel}>{item.label}</span>
                    <span style={styles.metaItemValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details of Concern Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FileText size={18} color="#011F39" />
              <h3 style={styles.cardTitle}>Details of Concern / Statement</h3>
            </div>
            <div style={styles.concernBox}>
              <p style={styles.concernText}>
                {parsedDesc.concernDetails || ticket.description}
              </p>
            </div>

            {ticket.resolution_note && (
              <div style={styles.resolutionAuditBox}>
                <div style={styles.resolutionHeader}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span style={styles.resolutionTitle}>Official Resolution Note</span>
                </div>
                <p style={styles.resolutionText}>{ticket.resolution_note}</p>
              </div>
            )}
          </div>

          {/* Verified Document Attachments Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FileText size={18} color="#011F39" />
              <h3 style={styles.cardTitle}>Verified Document Attachments</h3>
              <span style={styles.docCountBadge}>{attachments.length}</span>
            </div>

            {attachments.length === 0 ? (
              <div style={styles.noDocsText}>
                No attachments uploaded for this ticket.
              </div>
            ) : (
              <div style={styles.attachmentList}>
                {attachments.map((doc) => (
                  <div key={doc.id} style={styles.attachmentItem}>
                    <div style={styles.docIconBox}>
                      <FileText size={18} color="#011F39" />
                    </div>
                    <div style={styles.docDetails}>
                      <span style={styles.docName}>{doc.name}</span>
                      <span style={styles.docMeta}>
                        {doc.formattedSize || 'Document'} • {doc.uploadedAt || 'Uploaded'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Viewing document: ${doc.name}`)}
                      style={styles.downloadDocBtn}
                      title="Download document"
                    >
                      <Download size={14} color="#011F39" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Conversation Timeline */}
        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <MessageSquare size={18} color="#011F39" />
              <h3 style={styles.cardTitle}>Case Conversation & Audit Log</h3>
              <span style={styles.docCountBadge}>{messages.length}</span>
            </div>
            <TicketChatWidget ticket={ticket} messages={messages} />
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {statusModalTarget && (
        <UpdateStatusModal
          visible={!!statusModalTarget}
          ticket={ticket}
          targetStatus={statusModalTarget}
          onClose={() => setStatusModalTarget(null)}
          onConfirm={handleConfirmStatus}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1440px',
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
  topNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
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
  topRightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  openChatLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    color: '#011F39',
    fontSize: '12px',
    fontWeight: 600,
    textDecoration: 'none',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#15803D',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    padding: '24px',
    marginBottom: '20px',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '14px',
  },
  metaPills: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px',
  },
  ticketIdBadge: {
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '13px',
    color: '#011F39',
    backgroundColor: '#EDF2F7',
    padding: '3px 10px',
    borderRadius: '6px',
  },
  sourcePill: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid',
  },
  categoryPill: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: '#FFF9E6',
    color: '#B45309',
    border: '1px solid #FDE68A',
  },
  priorityPill: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid',
  },
  subjectHeading: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '22px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  headerStatusArea: {
    display: 'flex',
    alignItems: 'center',
  },
  statusBigBadge: {
    fontSize: '14px',
    fontWeight: 700,
    padding: '6px 16px',
    borderRadius: '16px',
    border: '1px solid',
  },
  dateMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    fontSize: '12px',
    color: '#718096',
    paddingBottom: '16px',
    borderBottom: '1px solid #EDF2F7',
    marginBottom: '16px',
  },
  dateMetaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  actionLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#011F39',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  actionBtnInfo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #BAE6FD',
    backgroundColor: '#EFF6FF',
    color: '#0284C7',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #BBF7D0',
    backgroundColor: '#F0FDF4',
    color: '#15803D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnNeutral: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  terminalStatusNotice: {
    fontSize: '12px',
    color: '#718096',
    fontStyle: 'italic',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #EDF2F7',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
    flex: 1,
  },
  docCountBadge: {
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: '#EDF2F7',
    color: '#011F39',
    borderRadius: '10px',
    padding: '2px 8px',
  },
  profileContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  avatarLarge: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#011F39',
    color: '#FAD465',
    fontSize: '20px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#34516D',
  },
  structuredMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
    backgroundColor: '#FAF7F0',
    border: '1px solid #DCE4EC',
    borderRadius: '10px',
    padding: '12px',
  },
  structuredMetaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metaItemLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#718096',
    textTransform: 'uppercase',
  },
  metaItemValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#011F39',
  },
  concernBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    padding: '16px',
  },
  concernText: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#011F39',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  resolutionAuditBox: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '10px',
    padding: '14px',
    marginTop: '16px',
  },
  resolutionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  resolutionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#15803D',
  },
  resolutionText: {
    fontSize: '13px',
    color: '#166534',
    lineHeight: '1.5',
    margin: 0,
  },
  noDocsText: {
    fontSize: '13px',
    color: '#718096',
    textAlign: 'center',
    padding: '16px',
  },
  attachmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#FAF7F0',
    border: '1px solid #DCE4EC',
  },
  docIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  docName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#011F39',
  },
  docMeta: {
    fontSize: '11px',
    color: '#718096',
  },
  downloadDocBtn: {
    background: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
