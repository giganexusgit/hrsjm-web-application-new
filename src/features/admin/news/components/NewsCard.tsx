import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  User,
  MoreVertical,
  ExternalLink,
  Edit,
  Send,
  FileEdit,
  Archive,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import type { NewsListItem } from '../types/news.types';
import { STATUS_META, formatViews } from '../types/news.types';

interface NewsCardProps {
  news: NewsListItem;
  onView: (news: NewsListItem) => void;
  onEdit: (news: NewsListItem) => void;
  onStatusChange: (news: NewsListItem, status: any) => void;
  onDelete: (news: NewsListItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusInfo = STATUS_META[news.status] || STATUS_META.PUBLISHED;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div style={styles.card}>
      {/* Featured Thumbnail */}
      <div style={styles.thumbWrapper} onClick={() => onView(news)}>
        <img
          src={news.thumbnailUrl || 'https://picsum.photos/seed/hrsjm-news/400/250'}
          alt={news.title}
          style={styles.thumbnail}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&q=80';
          }}
        />
        <div style={styles.categoryBadge}>{news.category}</div>
      </div>

      {/* Content Body */}
      <div style={styles.body}>
        {/* Status & Menu Row */}
        <div style={styles.topMetaRow}>
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

          {/* Action Menu */}
          <div style={styles.menuContainer} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={styles.menuBtn}
              title="Article Actions"
            >
              <MoreVertical size={16} color="#64748B" />
            </button>

            {menuOpen && (
              <div style={styles.dropdown}>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onView(news);
                  }}
                  style={styles.dropdownItem}
                >
                  <ExternalLink size={14} color="#011F39" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(news);
                  }}
                  style={styles.dropdownItem}
                >
                  <Edit size={14} color="#011F39" />
                  <span>Edit Article</span>
                </button>

                <div style={styles.dropdownDivider} />

                {news.status !== 'PUBLISHED' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onStatusChange(news, 'PUBLISHED');
                    }}
                    style={styles.dropdownItem}
                  >
                    <Send size={14} color="#166534" />
                    <span style={{ color: '#166534' }}>Publish Now</span>
                  </button>
                )}

                {news.status === 'PUBLISHED' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onStatusChange(news, 'DRAFT');
                    }}
                    style={styles.dropdownItem}
                  >
                    <FileEdit size={14} color="#92400E" />
                    <span>Revert to Draft</span>
                  </button>
                )}

                {news.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onStatusChange(news, 'ARCHIVED');
                    }}
                    style={styles.dropdownItem}
                  >
                    <Archive size={14} color="#475569" />
                    <span>Archive Article</span>
                  </button>
                )}

                {news.status === 'ARCHIVED' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onStatusChange(news, 'PUBLISHED');
                    }}
                    style={styles.dropdownItem}
                  >
                    <RefreshCw size={14} color="#166534" />
                    <span>Restore Article</span>
                  </button>
                )}

                <div style={styles.dropdownDivider} />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(news);
                  }}
                  style={{ ...styles.dropdownItem, color: '#DC2626' }}
                >
                  <Trash2 size={14} color="#DC2626" />
                  <span>Delete Article</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Headline */}
        <h3 style={styles.title} onClick={() => onView(news)}>
          {news.title}
        </h3>

        {/* Short Summary */}
        <p style={styles.summary}>{news.summary}</p>

        {/* Metadata Footer */}
        <div style={styles.footer}>
          <div style={styles.metaItem}>
            <Calendar size={13} color="#64748B" />
            <span>{news.date}</span>
          </div>
          <div style={styles.metaItem}>
            <Clock size={13} color="#64748B" />
            <span>{news.time}</span>
          </div>
          <div style={styles.metaItem}>
            <Eye size={13} color="#64748B" />
            <span>{formatViews(news.views)}</span>
          </div>
          {news.author && (
            <div style={styles.metaItem}>
              <User size={13} color="#64748B" />
              <span>{news.author}</span>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div style={styles.actionRow}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(news);
            }}
            style={styles.deleteBtn}
            title="Delete article"
          >
            <Trash2 size={14} />
          </button>

          <div style={styles.actionGroup}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(news);
              }}
              style={styles.editBtn}
              title="Edit article"
            >
              <Edit size={12} color="#011F39" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView(news);
              }}
              style={styles.viewBtn}
            >
              <span>View Details</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #DCE4EC',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(1, 31, 57, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  thumbWrapper: {
    position: 'relative',
    width: '100%',
    height: '180px',
    backgroundColor: '#E2E8F0',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(1, 31, 57, 0.85)',
    backdropFilter: 'blur(4px)',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  body: {
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  topMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  menuContainer: {
    position: 'relative',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '28px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(1, 31, 57, 0.12)',
    padding: '6px',
    zIndex: 20,
    minWidth: '170px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: 500,
    color: '#011F39',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.1s',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#E2E8F0',
    margin: '4px 0',
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    margin: '0 0 8px 0',
    lineHeight: 1.35,
    cursor: 'pointer',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  summary: {
    fontSize: '13px',
    color: '#64748B',
    lineHeight: 1.5,
    margin: '0 0 16px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1,
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #F1F5F9',
    fontSize: '12px',
    color: '#64748B',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    marginTop: 'auto',
    borderTop: '1px solid #F1F5F9',
    gap: '8px',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  deleteBtn: {
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color: '#94A3B8',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    backgroundColor: '#FFF9E6',
    border: '1px solid #FDE68A',
    color: '#011F39',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    backgroundColor: '#011F39',
    border: '1px solid #011F39',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
