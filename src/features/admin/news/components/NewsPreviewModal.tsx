import React, { useEffect } from 'react';
import { X, Calendar, Clock, User, Eye, Tag } from 'lucide-react';
import type { CreateNewsFormState } from '../types/news.types';
import { STATUS_META } from '../types/news.types';

interface NewsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: CreateNewsFormState;
}

export const NewsPreviewModal: React.FC<NewsPreviewModalProps> = ({
  isOpen,
  onClose,
  form,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const statusInfo = STATUS_META[form.status] || STATUS_META.DRAFT;
  const paragraphs = form.content
    ? form.content.split('\n\n').filter((p) => p.trim().length > 0)
    : [];

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        {/* Header Bar */}
        <div style={styles.header}>
          <div>
            <span style={styles.previewTag}>READER PREVIEW MODE</span>
            <h2 style={styles.modalTitle}>Article Preview</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} color="#64748B" />
          </button>
        </div>

        {/* Scrollable Preview Canvas */}
        <div style={styles.scrollCanvas}>
          {/* Cover Image */}
          {form.featuredImageUri && (
            <div style={styles.coverWrapper}>
              <img
                src={form.featuredImageUri}
                alt={form.headline}
                style={styles.coverImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
                }}
              />
            </div>
          )}

          <div style={styles.contentPad}>
            {/* Chips Row */}
            <div style={styles.badgesRow}>
              {form.category && <span style={styles.categoryChip}>{form.category}</span>}
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: statusInfo.badgeBg,
                  color: statusInfo.badgeColor,
                }}
              >
                <span
                  style={{
                    ...styles.statusDot,
                    backgroundColor: statusInfo.dotColor,
                  }}
                />
                {statusInfo.label}
              </span>
            </div>

            {/* Headline */}
            <h1 style={styles.headline}>
              {form.headline || 'Untitled News Article'}
            </h1>

            {/* Metadata Bar */}
            <div style={styles.metaBar}>
              <div style={styles.metaItem}>
                <Calendar size={14} color="#64748B" />
                <span>{form.publishDate || 'Immediate'}</span>
              </div>
              <div style={styles.metaItem}>
                <Clock size={14} color="#64748B" />
                <span>{form.publishTime || 'Now'}</span>
              </div>
              <div style={styles.metaItem}>
                <User size={14} color="#64748B" />
                <span>{form.author || 'HRSJM Team'}</span>
              </div>
              <div style={styles.metaItem}>
                <Eye size={14} color="#64748B" />
                <span>0 views</span>
              </div>
            </div>

            {/* Summary Box */}
            {form.summary && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryHeader}>SUMMARY</div>
                <p style={styles.summaryText}>{form.summary}</p>
              </div>
            )}

            {/* Content Paragraphs */}
            <div style={styles.articleBody}>
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p key={i} style={styles.paragraph}>
                    {p}
                  </p>
                ))
              ) : (
                <p style={{ ...styles.paragraph, color: '#94A3B8', fontStyle: 'italic' }}>
                  No article body content entered yet.
                </p>
              )}
            </div>

            {/* Tags */}
            {form.tags && form.tags.length > 0 && (
              <div style={styles.tagsSection}>
                <div style={styles.tagsTitle}>
                  <Tag size={14} color="#64748B" />
                  <span>TAGS & TOPICS</span>
                </div>
                <div style={styles.tagsList}>
                  {form.tags.map((t) => (
                    <span key={t} style={styles.tagChip}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.doneBtn}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(1, 31, 57, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '760px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px rgba(1, 31, 57, 0.25)',
    overflow: 'hidden',
  },
  header: {
    padding: '18px 24px',
    borderBottom: '1px solid #DCE4EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F0',
  },
  previewTag: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#011F39',
  },
  modalTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '20px',
    fontWeight: 700,
    color: '#011F39',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  scrollCanvas: {
    overflowY: 'auto',
    flex: 1,
  },
  coverWrapper: {
    width: '100%',
    height: '280px',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contentPad: {
    padding: '24px 32px',
  },
  badgesRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: '#EBF3FA',
    color: '#011F39',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  headline: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '26px',
    fontWeight: 700,
    color: '#011F39',
    lineHeight: 1.3,
    margin: '0 0 16px 0',
  },
  metaBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    paddingBottom: '16px',
    marginBottom: '20px',
    borderBottom: '1px solid #E2E8F0',
    fontSize: '13px',
    color: '#64748B',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  summaryCard: {
    backgroundColor: '#FAF7F0',
    borderLeft: '4px solid #FAD465',
    borderRadius: '0 10px 10px 0',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  summaryHeader: {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    color: '#011F39',
    marginBottom: '6px',
  },
  summaryText: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#1E293B',
    fontStyle: 'italic',
    margin: 0,
  },
  articleBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '28px',
  },
  paragraph: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#334155',
    margin: 0,
  },
  tagsSection: {
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  tagsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748B',
    marginBottom: '10px',
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
  },
  footer: {
    padding: '14px 24px',
    borderTop: '1px solid #DCE4EC',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#F8FAFC',
  },
  doneBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

