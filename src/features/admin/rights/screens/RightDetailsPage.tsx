import type React from 'react';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Eye,
  Edit,
  Send,
  EyeOff,
  Archive,
  RotateCcw,
  Trash2,
  Bookmark,
  Tag,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { rightsStore } from '../store/rightsStore';
import { RightsDeleteModal } from '../components/RightsDeleteModal';
import { ShareModal } from '@/components/common/ShareModal';
import {
  RIGHTS_STATUS_TONES,
  RIGHTS_STATUS_LABELS,
  formatRightsViews,
} from '../types/rights.types';

export const RightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const snapshot = useSyncExternalStore(rightsStore.subscribe, rightsStore.getSnapshot);
  const article = snapshot.articles.find((a) => a.id === id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Increment views once on mount
  useEffect(() => {
    if (id) {
      rightsStore.incrementViews(id);
    }
  }, [id]);

  if (!article) {
    return (
      <div style={styles.notFoundContainer}>
        <AlertCircle size={48} color="#94A3B8" />
        <h2 style={styles.notFoundTitle}>Rights Article Not Found</h2>
        <p style={styles.notFoundText}>
          The legal rights guide you are looking for does not exist or may have been deleted.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/rights')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Back to Rights Directory</span>
        </button>
      </div>
    );
  }

  const statusTone = RIGHTS_STATUS_TONES[article.status] || RIGHTS_STATUS_TONES.DRAFT;

  const handleTogglePublish = async () => {
    const nextStatus = article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await rightsStore.updateStatus(article.id, nextStatus);
  };

  const handleToggleArchive = async () => {
    const nextStatus = article.status === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED';
    await rightsStore.updateStatus(article.id, nextStatus);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await rightsStore.delete(article.id);
      navigate('/admin/rights');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top Header / Nav Bar */}
      <div style={styles.topBar}>
        <button
          type="button"
          onClick={() => navigate('/admin/rights')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Back to Rights</span>
        </button>

        <div style={styles.actionsBar}>
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            style={styles.secondaryBtn}
            title="Share article"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/admin/rights/${article.id}/edit`)}
            style={styles.editBtn}
          >
            <Edit size={15} />
            <span>Edit Article</span>
          </button>

          {article.status === 'PUBLISHED' ? (
            <button
              type="button"
              onClick={handleTogglePublish}
              style={styles.unpublishBtn}
            >
              <EyeOff size={15} />
              <span>Unpublish</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTogglePublish}
              style={styles.publishBtn}
            >
              <Send size={15} />
              <span>Publish Live</span>
            </button>
          )}

          {article.status === 'ARCHIVED' ? (
            <button
              type="button"
              onClick={handleToggleArchive}
              style={styles.restoreBtn}
            >
              <RotateCcw size={15} />
              <span>Restore</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleArchive}
              style={styles.archiveBtn}
            >
              <Archive size={15} />
              <span>Archive</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            style={styles.deleteBtn}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content Article Card */}
      <div style={styles.card}>
        {/* Cover Image */}
        {article.thumbnailUrl ? (
          <div style={styles.coverWrapper}>
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              style={styles.coverImg}
            />
          </div>
        ) : (
          <div style={styles.coverFallback}>
            <span style={styles.fallbackTitle}>HRSJM STATUTORY HUMAN RIGHTS DIRECTORY</span>
          </div>
        )}

        <div style={styles.cardInner}>
          {/* Metadata badges */}
          <div style={styles.metaRow}>
            <span style={styles.categoryBadge}>{article.category}</span>
            <div
              style={{
                ...styles.statusBadge,
                backgroundColor: statusTone.bg,
                borderColor: statusTone.border,
                color: statusTone.text,
              }}
            >
              <span style={{ ...styles.statusDot, backgroundColor: statusTone.dot }} />
              <span>{RIGHTS_STATUS_LABELS[article.status]}</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={14} color="#64748B" />
              <span>Updated: {article.lastUpdatedDate} • {article.lastUpdatedTime}</span>
            </div>
            <div style={styles.metaItem}>
              <Eye size={14} color="#64748B" />
              <span>{formatRightsViews(article.views)} views</span>
            </div>
          </div>

          {/* Title */}
          <h1 style={styles.title}>{article.title}</h1>

          {/* Lead / Short Summary */}
          <div style={styles.leadBox}>
            <p style={styles.leadText}>{article.description}</p>
          </div>

          {/* Author Card */}
          <div style={styles.authorCard}>
            <div style={styles.authorAvatar}>
              {article.author
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div style={styles.authorInfo}>
              <div style={styles.authorName}>{article.author}</div>
              <div style={styles.authorRole}>
                {article.authorRole} • {article.organization}
              </div>
            </div>
          </div>

          {/* Key Highlights Section */}
          {article.highlights && article.highlights.length > 0 && (
            <div style={styles.highlightsContainer}>
              <h3 style={styles.highlightsHeader}>
                <Bookmark size={18} color="#06294D" />
                <span>Key Statutory Highlights & Legal Protections</span>
              </h3>
              <div style={styles.highlightsGrid}>
                {article.highlights.map((h, i) => (
                  <div key={i} style={styles.highlightItem}>
                    <div style={styles.highlightNum}>{i + 1}</div>
                    <div style={styles.highlightText}>
                      <div style={styles.highlightTitle}>{h.title}</div>
                      <div style={styles.highlightDesc}>{h.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Body Content */}
          <div style={styles.bodyContent}>
            {article.content && article.content.length > 0 ? (
              article.content.map((para, i) => (
                <p key={i} style={styles.para}>
                  {para}
                </p>
              ))
            ) : (
              <p style={styles.para}>{article.description}</p>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div style={styles.tagsRow}>
              <Tag size={15} color="#64748B" />
              <div style={styles.tagsList}>
                {article.tags.map((t) => (
                  <span key={t} style={styles.tagChip}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <RightsDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        article={article}
        isDeleting={isDeleting}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={article.title}
        summary={article.description}
        thumbnailUrl={article.thumbnailUrl || undefined}
        category={article.category}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px 32px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#06294D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  publishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  unpublishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #FED7AA',
    backgroundColor: '#FFF7ED',
    color: '#D97706',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  archiveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  restoreBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #BFDBFE',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  coverWrapper: {
    width: '100%',
    height: '340px',
    backgroundColor: '#011F39',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverFallback: {
    width: '100%',
    height: '180px',
    backgroundColor: '#011F39',
    color: '#FAD465',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackTitle: {
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.1em',
  },
  cardInner: {
    padding: '36px 44px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  categoryBadge: {
    display: 'inline-flex',
    padding: '4px 12px',
    borderRadius: '6px',
    backgroundColor: '#EFF6FF',
    color: '#0369A1',
    fontSize: '12px',
    fontWeight: 700,
    border: '1px solid #BAE6FD',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: 700,
    border: '1px solid',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748B',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '32px',
    fontWeight: 700,
    color: '#011F39',
    fontFamily: 'Playfair Display, Georgia, serif',
    lineHeight: 1.25,
  },
  leadBox: {
    padding: '16px 20px',
    backgroundColor: '#FAF7F0',
    borderRadius: '0 8px 8px 0',
    borderLeft: '4px solid #06294D',
    marginBottom: '24px',
  },
  leadText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#334155',
    fontStyle: 'italic',
  },
  authorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    marginBottom: '28px',
  },
  authorAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#011F39',
    color: '#FAD465',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  authorName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0F172A',
  },
  authorRole: {
    fontSize: '12px',
    color: '#64748B',
  },
  highlightsContainer: {
    marginBottom: '32px',
  },
  highlightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 0 14px 0',
    fontSize: '17px',
    fontWeight: 700,
    color: '#06294D',
    fontFamily: 'Playfair Display, Georgia, serif',
  },
  highlightsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  highlightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '14px 18px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  highlightNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#06294D',
    color: '#FAD465',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  highlightText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  highlightTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0F172A',
  },
  highlightDesc: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.45,
  },
  bodyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontSize: '15px',
    lineHeight: 1.75,
    color: '#1E293B',
    marginBottom: '32px',
  },
  para: {
    margin: 0,
  },
  tagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #E2E8F0',
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tagChip: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0284C7',
    backgroundColor: '#F0F9FF',
    padding: '4px 12px',
    borderRadius: '4px',
    border: '1px solid #BAE6FD',
  },
  notFoundContainer: {
    padding: '80px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    margin: '16px 0 8px 0',
    fontSize: '22px',
    fontWeight: 700,
    color: '#1E293B',
  },
  notFoundText: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#64748B',
  },
};

