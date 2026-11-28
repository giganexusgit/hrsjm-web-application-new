import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Mail,
  MessageCircle,
  Share,
} from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary?: string;
  url?: string;
  thumbnailUrl?: string | null;
  category?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  summary = '',
  url,
  thumbnailUrl,
  category,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        success = true;
      }
    } catch {
      // Fallback below
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary || title,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary ? `${title}\n\n${summary}` : title);

  const shareChannels = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} color="#25D366" />,
      bg: '#DCFCE7',
      hoverBg: '#BBF7D0',
      action: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodedSummary}%0A%0A${encodedUrl}`, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Twitter / X',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: '#F1F5F9',
      hoverBg: '#E2E8F0',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Facebook',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      bg: '#EFF6FF',
      hoverBg: '#DBEAFE',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
      bg: '#E0F2FE',
      hoverBg: '#BAE6FD',
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Email',
      icon: <Mail size={18} color="#EA4335" />,
      bg: '#FEE2E2',
      hoverBg: '#FECACA',
      action: () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}`;
      },
    },
  ];

  return (
    <div
      style={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconCircle}>
              <Share2 size={18} color="#011F39" />
            </div>
            <div>
              <h3 style={styles.title}>Share Article</h3>
              <p style={styles.subtitle}>Distribute or share this publication</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Article Summary Preview */}
        <div style={styles.previewBox}>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt=""
              style={styles.previewThumbnail}
            />
          )}
          <div style={styles.previewContent}>
            {category && <span style={styles.categoryBadge}>{category}</span>}
            <h4 style={styles.previewTitle}>{title}</h4>
            {summary && <p style={styles.previewSummary}>{summary}</p>}
          </div>
        </div>

        {/* Social Share Grid */}
        <div style={styles.channelsSection}>
          <div style={styles.sectionHeading}>Share directly via</div>
          <div style={styles.channelsGrid}>
            {shareChannels.map((channel) => (
              <button
                key={channel.name}
                type="button"
                onClick={channel.action}
                style={{
                  ...styles.channelBtn,
                  backgroundColor: channel.bg,
                }}
                title={`Share via ${channel.name}`}
              >
                <div style={styles.channelIcon}>{channel.icon}</div>
                <span style={styles.channelLabel}>{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Copy Link Field */}
        <div style={styles.copySection}>
          <div style={styles.sectionHeading}>Or copy link</div>
          <div style={styles.copyRow}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={styles.copyInput}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              onClick={copyToClipboard}
              style={{
                ...styles.copyBtn,
                backgroundColor: copied ? '#166534' : '#011F39',
              }}
            >
              {copied ? (
                <>
                  <Check size={15} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Device native share if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            style={styles.nativeShareBtn}
          >
            <Share size={15} />
            <span>More Sharing Options (Device Menu)</span>
          </button>
        )}
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
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1300,
    padding: '16px',
    animation: 'fadeIn 0.2s ease',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '18px',
    maxWidth: '520px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 20px 45px rgba(1, 31, 57, 0.25)',
    border: '1px solid #DCE4EC',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '18px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748B',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBox: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  previewThumbnail: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  previewContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  categoryBadge: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#011F39',
    backgroundColor: '#E2E8F0',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  previewTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  previewSummary: {
    fontSize: '11px',
    color: '#64748B',
    margin: '2px 0 0 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.4,
  },
  channelsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionHeading: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  channelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  channelBtn: {
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '12px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  channelIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
  },
  channelLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#1E293B',
    textAlign: 'center',
  },
  copySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  copyRow: {
    display: 'flex',
    gap: '8px',
  },
  copyInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#334155',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.2s',
  },
  nativeShareBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '-4px',
  },
};
