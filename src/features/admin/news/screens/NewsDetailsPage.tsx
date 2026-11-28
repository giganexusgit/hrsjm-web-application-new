import React, { useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  User,
  Share2,
  Edit,
  Send,
  FileEdit,
  Archive,
  RefreshCw,
  Trash2,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { newsStore } from '../store/newsStore';
import { STATUS_META, formatViews } from '../types/news.types';
import { NewsDeleteModal } from '../components/NewsDeleteModal';

export const NewsDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSyncExternalStore(newsStore.subscribe, newsStore.getSnapshot);

  const news = id ? newsStore.getNewsById(id) : undefined;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!news) {
    return (
      <div style={styles.notFoundWrapper}>
        <h2 style={styles.notFoundTitle}>Article Not Found</h2>
        <p style={styles.notFoundText}>
          The news article you requested ({id}) could not be found or may have been deleted.
        </p>
        <button onClick={() => navigate('/admin/news')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to News & Press</span>
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_META[news.status] || STATUS_META.PUBLISHED;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusUpdate = async (newStatus: any) => {
    await newsStore.updateStatus(news.id, newStatus);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await newsStore.deleteNews(news.id);
      navigate('/admin/news');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation & Breadcrumbs */}
      <div style={styles.topBar}>
        <button onClick={() => navigate('/admin/news')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to News</span>
        </button>

        <div style={styles.topActions}>
          <button onClick={handleCopyLink} style={styles.shareBtn} title="Copy shareable link">
            {copiedLink ? <Check size={16} color="#166534" /> : <Share2 size={16} />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={() => navigate(`/admin/news/${news.id}/edit`)}
            style={styles.editBtn}
          >
            <Edit size={16} />
            <span>Edit Article</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout Card */}
      <div style={styles.mainCard}>
        {/* Hero Featured Cover */}
        {news.thumbnailUrl && (
          <div style={styles.coverWrapper}>
            <img
              src={news.thumbnailUrl}
              alt={news.title}
              style={styles.coverImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&q=80';
              }}
            />
          </div>
        )}

        <div style={styles.contentInner}>
          {/* Category & Status Chips */}
          <div style={styles.chipsRow}>
            <span style={styles.categoryChip}>{news.category}</span>
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
          <h1 style={styles.headline}>{news.title}</h1>

          {/* Metadata Bar */}
          <div style={styles.metaBar}>
            <div style={styles.metaItem}>
              <Calendar size={15} color="#64748B" />
              <span>Published: {news.date}</span>
            </div>
            <div style={styles.metaItem}>
              <Clock size={15} color="#64748B" />
              <span>Time: {news.time}</span>
            </div>
            <div style={styles.metaItem}>
              <Eye size={15} color="#64748B" />
              <span>{formatViews(news.views)} Total Views</span>
            </div>
            {news.author && (
              <div style={styles.metaItem}>
                <User size={15} color="#64748B" />
                <span>Author: {news.author}</span>
              </div>
            )}
          </div>

          {/* Executive Summary Card */}
          {(news.summaryDetailed || news.summary) && (
            <div style={styles.summaryCard}>
              <div style={styles.summaryHeader}>EXECUTIVE SUMMARY</div>
              <p style={styles.summaryText}>
                {news.summaryDetailed || news.summary}
              </p>
            </div>
          )}

          {/* Article Body Content */}
          <div style={styles.bodySection}>
            <h2 style={styles.sectionHeader}>Article Content</h2>
            {news.content && news.content.length > 0 ? (
              news.content.map((p, idx) => (
                <p key={idx} style={styles.paragraph}>
                  {p}
                </p>
              ))
            ) : (
              <p style={styles.paragraph}>{news.summary}</p>
            )}
          </div>

          {/* Key Highlights */}
          {news.highlights && news.highlights.length > 0 && (
            <div style={styles.highlightsSection}>
              <h2 style={styles.sectionHeader}>Key Highlights</h2>
              <div style={styles.highlightsList}>
                {news.highlights.map((hl, idx) => (
                  <div key={idx} style={styles.highlightItem}>
                    <CheckCircle2 size={18} color="#166534" style={{ flexShrink: 0 }} />
                    <span style={styles.highlightText}>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {news.gallery && news.gallery.length > 0 && (
            <div style={styles.gallerySection}>
              <h2 style={styles.sectionHeader}>
                <ImageIcon size={18} color="#011F39" />
                <span>Photo Gallery</span>
              </h2>
              <div style={styles.galleryGrid}>
                {news.gallery.map((imgUrl, idx) => (
                  <div key={idx} style={styles.galleryItem}>
                    <img
                      src={imgUrl}
                      alt={`Gallery ${idx + 1}`}
                      style={styles.galleryImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div style={styles.tagsSection}>
              <div style={styles.tagsLabel}>
                <Tag size={14} color="#64748B" />
                <span>TAGS & CATEGORIES</span>
              </div>
              <div style={styles.tagsList}>
                {news.tags.map((t) => (
                  <span key={t} style={styles.tagChip}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Operations Footer */}
          <div style={styles.actionBar}>
            <div style={styles.actionLeft}>
              <button
                onClick={() => navigate(`/admin/news/${news.id}/edit`)}
                style={styles.primaryEditBtn}
              >
                <Edit size={16} />
                <span>Edit Article</span>
              </button>

              {news.status !== 'PUBLISHED' && (
                <button
                  onClick={() => handleStatusUpdate('PUBLISHED')}
                  style={styles.publishBtn}
                >
                  <Send size={16} />
                  <span>Publish Live</span>
                </button>
              )}

              {news.status === 'PUBLISHED' && (
                <button
                  onClick={() => handleStatusUpdate('DRAFT')}
                  style={styles.draftBtn}
                >
                  <FileEdit size={16} />
                  <span>Revert to Draft</span>
                </button>
              )}

              {news.status !== 'ARCHIVED' && (
                <button
                  onClick={() => handleStatusUpdate('ARCHIVED')}
                  style={styles.archiveBtn}
                >
                  <Archive size={16} />
                  <span>Archive</span>
                </button>
              )}

              {news.status === 'ARCHIVED' && (
                <button
                  onClick={() => handleStatusUpdate('PUBLISHED')}
                  style={styles.publishBtn}
                >
                  <RefreshCw size={16} />
                  <span>Restore Article</span>
                </button>
              )}
            </div>

            <button onClick={() => setDeleteModalOpen(true)} style={styles.deleteBtn}>
              <Trash2 size={16} />
              <span>Delete Article</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <NewsDeleteModal
        isOpen={deleteModalOpen}
        news={news}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  topActions: {
    display: 'flex',
    gap: '10px',
  },
  shareBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#34516D',
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
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(1, 31, 57, 0.05)',
  },
  coverWrapper: {
    width: '100%',
    height: '340px',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contentInner: {
    padding: '32px 36px',
  },
  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  categoryChip: {
    backgroundColor: '#EBF3FA',
    color: '#011F39',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
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
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  headline: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '30px',
    fontWeight: 700,
    color: '#011F39',
    lineHeight: 1.3,
    margin: '0 0 16px 0',
  },
  metaBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    alignItems: 'center',
    paddingBottom: '20px',
    marginBottom: '24px',
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
    borderRadius: '0 12px 12px 0',
    padding: '20px 24px',
    marginBottom: '28px',
  },
  summaryHeader: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#011F39',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  },
  summaryText: {
    fontSize: '15px',
    color: '#1E293B',
    lineHeight: 1.6,
    fontStyle: 'italic',
    margin: 0,
  },
  bodySection: {
    marginBottom: '28px',
  },
  sectionHeader: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '18px',
    color: '#011F39',
    margin: '0 0 14px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  paragraph: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#334155',
    marginBottom: '14px',
  },
  highlightsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    padding: '20px 24px',
    marginBottom: '28px',
  },
  highlightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  highlightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  highlightText: {
    fontSize: '14px',
    color: '#1E293B',
    lineHeight: 1.5,
  },
  gallerySection: {
    marginBottom: '28px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '14px',
  },
  galleryItem: {
    height: '140px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  tagsSection: {
    paddingTop: '20px',
    borderTop: '1px solid #E2E8F0',
    marginBottom: '32px',
  },
  tagsLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748B',
    letterSpacing: '0.04em',
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
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
  },
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '14px',
    paddingTop: '24px',
    borderTop: '1px solid #E2E8F0',
  },
  actionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  primaryEditBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    borderRadius: '8px',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  publishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#DCFCE7',
    color: '#166534',
    border: '1px solid #BBF7D0',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  draftBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    border: '1px solid #FDE68A',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  archiveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#FDEEEF',
    color: '#DC2626',
    border: '1px solid #FED7D7',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  notFoundWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '60px auto',
    boxShadow: '0 4px 20px rgba(1, 31, 57, 0.05)',
  },
  notFoundTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '24px',
    color: '#011F39',
    margin: '0 0 12px 0',
  },
  notFoundText: {
    fontSize: '14px',
    color: '#64748B',
    marginBottom: '24px',
    lineHeight: 1.5,
  },
};
