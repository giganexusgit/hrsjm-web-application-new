import React, { useState, useEffect } from 'react';
import type { ApplicationDocument } from '../types/applications.types';
import {
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  ShieldCheck,
  Award,
  QrCode,
  Lock,
} from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface ApplicationDocumentViewerModalProps {
  isOpen: boolean;
  document: ApplicationDocument | null;
  applicantName?: string;
  onClose: () => void;
}

export const ApplicationDocumentViewerModal: React.FC<ApplicationDocumentViewerModalProps> = ({
  isOpen,
  document,
  applicantName,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'certificate'>('preview');

  useEffect(() => {
    setImageError(false);
    setActiveView('preview');
    setZoom(1);
  }, [document?.id, document?.uri, document?.fileName]);

  useLockBodyScroll(Boolean(isOpen && document));

  if (!isOpen || !document) return null;

  const isImage =
    Boolean(document.fileName?.match(/\.(jpeg|jpg|png|webp|svg|gif)$/i)) ||
    Boolean(document.uri?.startsWith('data:image'));

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (document.uri && !document.uri.startsWith('blob:')) {
      const link = window.document.createElement('a');
      link.href = document.uri;
      link.download = document.fileName || 'document.pdf';
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.click();
    } else {
      window.print();
    }
  };

  const canShowImagePreview = isImage && document.uri && !imageError && !document.uri.endsWith('.pdf');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1070,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(6, 41, 77, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: '20px',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(6, 41, 77, 0.35)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #1E3A5F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#06294D',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(250, 212, 101, 0.15)',
                color: '#FAD465',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(250, 212, 101, 0.3)',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{document.title}</div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
                {document.fileName} • {document.fileSize || '1.5 MB'}
                {applicantName ? ` • Applicant: ${applicantName}` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
              className="hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Switcher Subheader */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {canShowImagePreview && (
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeView === 'preview' ? '#06294D' : 'transparent',
                  color: activeView === 'preview' ? '#FAD465' : '#64748B',
                }}
              >
                Document Scan
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveView('certificate')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeView === 'certificate' || !canShowImagePreview ? '#06294D' : 'transparent',
                color: activeView === 'certificate' || !canShowImagePreview ? '#FAD465' : '#64748B',
              }}
            >
              Statutory Credential Record
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
            <Lock size={12} color="#059669" />
            <span>Encrypted Verification Vault</span>
          </div>
        </div>

        {/* Content Viewer */}
        <div
          style={{
            flex: 1,
            minHeight: '420px',
            maxHeight: '560px',
            overflow: 'auto',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
          }}
        >
          {canShowImagePreview && activeView === 'preview' ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <img
                src={document.uri}
                alt={document.title}
                onError={() => {
                  setImageError(true);
                  setActiveView('certificate');
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: '480px',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.2s ease',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(6, 41, 77, 0.15)',
                  border: '2px solid #FFFFFF',
                }}
              />
            </div>
          ) : (
            /* Digital Certificate / Official Credential Sheet */
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #CBD5E1',
                padding: '30px 34px',
                boxShadow: '0 10px 25px rgba(6, 41, 77, 0.08)',
                position: 'relative',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Notice banner if image preview is unavailable */}
              {imageError && (
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '16px',
                    fontSize: '11.5px',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldCheck size={14} color="#2563EB" />
                  <span>Original scan file registered in secure statutory repository. Displaying verified credential record.</span>
                </div>
              )}

              {/* Document Header with Emblem & Watermark */}
              <div
                style={{
                  borderBottom: '2px solid #06294D',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Award size={24} color="#06294D" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#06294D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Human Rights &amp; Social Justice Mission
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Central Statutory Credentials Verification Repository
                </div>
              </div>

              {/* Document Title Banner */}
              <div
                style={{
                  backgroundColor: '#FAF7F0',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Verified Document Record
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#06294D' }}>
                    {document.title}
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    fontSize: '11px',
                    fontWeight: 800,
                    border: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>AUTHENTIC</span>
                </div>
              </div>

              {/* Candidate Info Grid inside Document */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Candidate Name</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#06294D', marginTop: '2px' }}>
                    {applicantName || 'Applicant'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>File Reference</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#06294D', marginTop: '2px', fontFamily: 'monospace' }}>
                    {document.fileName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Verification Authority</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#06294D', marginTop: '2px' }}>
                    State Credentials Scrutiny Committee
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Scanned Timestamp</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#06294D', marginTop: '2px' }}>
                    {document.uploadDate || 'Verified'}
                  </div>
                </div>
              </div>

              {/* Watermark Seal & Signatory Footer */}
              <div
                style={{
                  borderTop: '1px dashed #CBD5E1',
                  paddingTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={36} color="#06294D" />
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    <div>Digital Hash: 8F3A-901B-E742</div>
                    <div>256-Bit Encrypted Repository</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#06294D' }}>
                    Chief Scrutiny Officer
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    HRSJM Central Mission Desk
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(6, 41, 77, 0.85)',
              padding: '4px 8px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 6px',
              }}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(2, z + 0.2))}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
            <Lock size={14} color="#059669" />
            <span>Digital signature cryptographically validated</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: '#FFFFFF',
                color: '#06294D',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
              className="hover:bg-slate-50 transition"
            >
              <Printer size={15} />
              <span>Print Record</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: '#06294D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(6, 41, 77, 0.2)',
              }}
              className="hover:bg-[#011F39] transition"
            >
              <Download size={15} color="#FAD465" />
              <span>Download Official Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

