import React, { useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Edit,
  Send,
  FileEdit,
  Archive,
  RefreshCw,
  Trash2,
  Tag,
  Sparkles,
  Check,
} from 'lucide-react';
import { blogsStore } from '../store/blogsStore';
import { STATUS_META, formatViews } from '../types/blog.types';
import { BlogDeleteModal } from '../components/BlogDeleteModal';

export const BlogDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSyncExternalStore(blogsStore.subscribe, blogsStore.getSnapshot);

  const blog = id ? blogsStore.getBlogById(id) : undefined;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!blog) {
    return (
      <div style={styles.notFoundWrapper}>
        <h2 style={styles.notFoundTitle}>Article Not Found</h2>
        <p style={styles.notFoundText}>
          The article you requested ({id}) could not be found or may have been deleted.
        </p>
        <button onClick={() => navigate('/admin/blogs')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Articles & Blogs</span>
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_META[blog.status] || STATUS_META.PUBLISHED;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusUpdate = async (newStatus: any) => {
    await blogsStore.updateStatus(blog.id, newStatus);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await blogsStore.deleteBlog(blog.id);
      navigate('/admin/blogs');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation & Breadcrumbs */}
      <div style={styles.topBar}>
        <button onClick={() => navigate('/admin/blogs')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Blogs</span>
        </button>

        <div style={styles.topActions}>
          <button onClick={handleCopyLink} style={styles.shareBtn} title="Copy shareable link">
            {copiedLink ? <Check size={16} color="#166534" /> : <Share2 size={16} />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={() => navigate(`/admin/blogs/${blog.id}/edit`)}
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
        {blog.thumbnailUrl && (
          <div style={styles.coverWrapper}>
            <img
              src={blog.thumbnailUrl}
              alt={blog.title}
              style={styles.coverImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80';
              }}
            />
          </div>
        )}

        <div style={styles.contentInner}>
          {/* Category & Status Chips */}
          <div style={styles.chipsRow}>
            <span style={styles.categoryChip}>{blog.category}</span>
            {blog.featured && (
              <span style={styles.featuredBadge}>
                <Sparkles size={11} color="#011F39" />
                <span>FEATURED</span>
              </span>
            )}
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

          {/* Title */}
          <h1 style={styles.headline}>{blog.title}</h1>

          {/* Author & Metadata Bar */}
          <div style={styles.metaBar}>
            <div style={styles.authorBadge}>
              <div style={styles.avatarCircle}>
                {(blog.author || 'HA').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={styles.authorName}>{blog.author || 'HRSJM Admin'}</div>
                <div style={styles.authorRole}>Editorial Contributor</div>
              </div>
            </div>

            <div style={styles.metaGroup}>
              <div style={styles.metaItem}>
                <Calendar size={14} color="#64748B" />
                <span>{blog.date}</span>
              </div>
              <div style={styles.metaItem}>
                <Clock size={14} color="#64748B" />
                <span>{blog.time}</span>
              </div>
              <div style={styles.metaItem}>
                <Eye size={14} color="#64748B" />
                <span>{formatViews(blog.views)} Total Views</span>
              </div>
            </div>
          </div>

          {/* Excerpt Card */}
          {blog.excerpt && (
            <div style={styles.summaryCard}>
              <div style={styles.summaryHeader}>EXCERPT</div>
              <p style={styles.summaryText}>{blog.excerpt}</p>
            </div>
          )}

          {/* Article Body Content */}
          <div style={styles.bodySection}>
            <h2 style={styles.sectionHeader}>Article Content</h2>
            {blog.content && blog.content.length > 0 ? (
              blog.content.map((p, idx) => (
                <p key={idx} style={styles.paragraph}>
                  {p}
                </p>
              ))
            ) : (
              <p style={styles.paragraph}>{blog.excerpt}</p>
            )}
          </div>

          {/* Topic Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div style={styles.tagsSection}>
              <div style={styles.tagsLabel}>
                <Tag size={14} color="#64748B" />
                <span>TOPICS & KEYWORDS</span>
              </div>
              <div style={styles.tagsList}>
                {blog.tags.map((t) => (
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
                onClick={() => navigate(`/admin/blogs/${blog.id}/edit`)}
                style={styles.primaryEditBtn}
              >
                <Edit size={16} />
                <span>Edit Article</span>
              </button>

              {blog.status !== 'PUBLISHED' && (
                <button
                  onClick={() => handleStatusUpdate('PUBLISHED')}
                  style={styles.publishBtn}
                >
                  <Send size={16} />
                  <span>Publish Live</span>
                </button>
              )}

              {blog.status === 'PUBLISHED' && (
                <button
                  onClick={() => handleStatusUpdate('DRAFT')}
                  style={styles.draftBtn}
                >
                  <FileEdit size={16} />
                  <span>Revert to Draft</span>
                </button>
              )}

              {blog.status !== 'ARCHIVED' && (
                <button
                  onClick={() => handleStatusUpdate('ARCHIVED')}
                  style={styles.archiveBtn}
                >
                  <Archive size={16} />
                  <span>Archive</span>
                </button>
              )}

              {blog.status === 'ARCHIVED' && (
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
      <BlogDeleteModal
        isOpen={deleteModalOpen}
        blog={blog}
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
  featuredBadge: {
    backgroundColor: '#FAD465',
    color: '#011F39',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    margin: '0 0 18px 0',
  },
  metaBar: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '20px',
    marginBottom: '24px',
    borderBottom: '1px solid #E2E8F0',
  },
  authorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#011F39',
    color: '#FAD465',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '13px',
  },
  authorName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#011F39',
  },
  authorRole: {
    fontSize: '12px',
    color: '#64748B',
  },
  metaGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
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
  },
  paragraph: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#334155',
    marginBottom: '14px',
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
