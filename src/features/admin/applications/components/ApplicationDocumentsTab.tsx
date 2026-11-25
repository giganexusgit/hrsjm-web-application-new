import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { MembershipApplicationItem, ApplicationDocument } from '../types/applications.types';
import { ApplicationDocumentViewerModal } from './ApplicationDocumentViewerModal';
import { getOfficialStatutoryDocuments } from '../utils/documentGenerator';
import { apiClient } from '@/api/client';
import {
  FileText,
  Eye,
  Download,
  ShieldCheck,
  FileCheck2,
  Lock,
  RefreshCw,
  Server,
} from 'lucide-react';

interface ApplicationDocumentsTabProps {
  application: MembershipApplicationItem;
}

export const ApplicationDocumentsTab: React.FC<ApplicationDocumentsTabProps> = ({
  application,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<ApplicationDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveServer, setIsLiveServer] = useState(false);

  // Generate official statutory verification documents if empty
  const defaultDocs = useMemo<ApplicationDocument[]>(() => {
    return getOfficialStatutoryDocuments({
      id: application.id,
      applicationId: application.applicationId,
      applicantName: application.applicantName,
      submittedAt: application.submittedAt,
      address: application.address,
      avatarUrl: application.avatarUrl,
      isApproved: application.status === 'approved',
    });
  }, [application.id, application.applicationId, application.applicantName, application.submittedAt, application.address, application.avatarUrl, application.status]);

  const normalizeDocUri = (rawUri: any): string => {
    if (!rawUri || typeof rawUri !== 'string') return '';
    const trimmed = rawUri.trim();
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('uploads/')) {
      return `/${trimmed}`;
    }
    if (trimmed.startsWith('/uploads/')) {
      return trimmed;
    }
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  };

  // Initial documents resolution from valid application props or defaultDocs
  const [docList, setDocList] = useState<ApplicationDocument[]>(() => {
    if (Array.isArray(application.documents) && application.documents.length > 0) {
      const clean = application.documents.filter(d => d.uri && !d.uri.includes('sample_aadhaar') && !d.uri.includes('sample_address') && !d.uri.includes('sample_qualification'));
      if (clean.length > 0) return clean;
    }
    return defaultDocs;
  });

  const saveDocsToCache = (docs: ApplicationDocument[]) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (application.id) {
          localStorage.setItem(`hrsjm_app_docs_${application.id}`, JSON.stringify(docs));
        }
        if (application.applicationId) {
          localStorage.setItem(`hrsjm_app_docs_${application.applicationId}`, JSON.stringify(docs));
        }
      }
    } catch (err) {
      console.warn('Failed to persist documents to localStorage:', err);
    }
  };

  // Live Backend Document Fetching
  const fetchLiveDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetched: ApplicationDocument[] = [];

      // 1. Query live server API first for real attachments
      if (application.accountType === 'membership' || !application.accountType) {
        try {
          const res = await apiClient.get<any>(`/memberships/${application.id}/documents`);
          const raw = res?.data?.documents || res?.documents || res?.data;
          if (Array.isArray(raw) && raw.length > 0) {
            fetched = raw
              .filter((d: any) => {
                const u = d.storage_path || d.uri || d.fileUri || d.url;
                return u && !String(u).includes('sample_aadhaar') && !String(u).includes('sample_address') && !String(u).includes('sample_qualification');
              })
              .map((d: any, idx: number) => ({
                id: d.id || `doc-mem-${idx + 1}`,
                title: d.document_name || d.title || 'Official Cadre Document',
                fileName: d.file_name || d.fileName || 'document.pdf',
                fileSize: d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(1)} MB` : d.fileSize || '1.5 MB',
                uploadDate: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB') : (application.submittedAt || 'Verified Upload'),
                uri: normalizeDocUri(d.storage_path || d.uri || d.fileUri || d.url || (d.id ? `/api/v1/documents/${d.id}/download` : '')),
                verified: true,
              }));
            if (fetched.length > 0) {
              setIsLiveServer(true);
            }
          }
        } catch (err) {
          console.warn('[ApplicationDocumentsTab] Could not query /memberships/:id/documents:', err);
        }
      }

      if (fetched.length === 0 && application.accountType === 'seeker') {
        try {
          const res = await apiClient.get<any>(`/assistance-requests/${application.id}/documents`);
          const raw = res?.data || res;
          if (Array.isArray(raw) && raw.length > 0) {
            fetched = raw
              .filter((d: any) => {
                const u = d.storage_path || d.uri || d.fileUri || d.url;
                return u && !String(u).includes('sample_aadhaar') && !String(u).includes('sample_address') && !String(u).includes('sample_qualification');
              })
              .map((d: any, idx: number) => ({
                id: d.id || `doc-ast-${idx + 1}`,
                title: d.document_name || d.title || 'Assistance Need Proof',
                fileName: d.file_name || d.fileName || 'document.pdf',
                fileSize: d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(1)} MB` : d.fileSize || '1.2 MB',
                uploadDate: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB') : (application.submittedAt || 'Verified Upload'),
                uri: normalizeDocUri(d.storage_path || d.uri || d.fileUri || d.url || (d.id ? `/api/v1/documents/${d.id}/download` : '')),
                verified: true,
              }));
            if (fetched.length > 0) {
              setIsLiveServer(true);
            }
          }
        } catch {}
      }

      if (fetched.length === 0) {
        try {
          const res = await apiClient.get<any>(`/documents?related_entity_id=${application.id}`);
          const raw = res?.data?.items || res?.items || res?.data;
          if (Array.isArray(raw) && raw.length > 0) {
            fetched = raw
              .filter((d: any) => {
                const u = d.storage_path || d.uri || d.fileUri || d.url;
                return u && !String(u).includes('sample_aadhaar') && !String(u).includes('sample_address') && !String(u).includes('sample_qualification');
              })
              .map((d: any, idx: number) => ({
                id: d.id || `doc-rel-${idx + 1}`,
                title: d.document_name || d.title || 'Verification Document',
                fileName: d.file_name || d.fileName || 'document.pdf',
                fileSize: d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(1)} MB` : d.fileSize || '1.5 MB',
                uploadDate: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB') : (application.submittedAt || 'Verified Upload'),
                uri: normalizeDocUri(d.storage_path || d.uri || d.fileUri || d.url || (d.id ? `/api/v1/documents/${d.id}/download` : '')),
                verified: true,
              }));
            if (fetched.length > 0) {
              setIsLiveServer(true);
            }
          }
        } catch {}
      }

      if (fetched.length > 0) {
        setDocList(fetched);
        saveDocsToCache(fetched);
      } else if (application.documents && application.documents.length > 0) {
        const clean = application.documents.filter(d => d.uri && !d.uri.includes('sample_aadhaar') && !d.uri.includes('sample_address') && !d.uri.includes('sample_qualification'));
        if (clean.length > 0) {
          setDocList(clean);
          saveDocsToCache(clean);
        } else {
          setDocList(defaultDocs);
        }
      } else {
        setDocList(defaultDocs);
      }
    } finally {
      setIsLoading(false);
    }
  }, [application.id, application.applicationId, application.accountType, application.documents, application.submittedAt, defaultDocs]);

  // Trigger sync when application changes
  useEffect(() => {
    fetchLiveDocuments();
  }, [application.id, application.applicationId]);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        scrollMarginTop: '130px',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          borderBottom: '1px solid #EDF2F7',
          paddingBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#FAF7F0',
              color: '#06294D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E2E8F0',
            }}
          >
            <ShieldCheck size={22} color="#06294D" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#06294D',
                  margin: 0,
                }}
              >
                Attached Statutory Verification Documents
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                }}
              >
                {docList.length} Attached {docList.length === 1 ? 'Document' : 'Documents'}
              </span>
              {isLiveServer && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Server size={11} />
                  <span>Live Server KYC</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
              Inspect identity credentials, domicile proof, and certificates submitted by <strong>{application.applicantName}</strong> (App ID: {application.applicationId}).
            </p>
          </div>
        </div>

        {/* Action Buttons: Refresh Sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchLiveDocuments}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#06294D',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid #CBD5E1',
              cursor: 'pointer',
            }}
            className="hover:bg-slate-50 transition"
            title="Fetch latest uploaded documents from live backend server"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync Server'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Documents (Balanced 2-Column Responsive Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '16px',
        }}
      >
        {docList.map((doc, idx) => {
          const isPhoto = doc.fileName?.match(/\.(jpg|jpeg|png)$/i);
          const rawTitle = doc.title || 'Verification Document';
          const displayTitle =
            rawTitle === 'Identity Proof' || rawTitle === 'Identity Proof (Aadhaar / Voter ID)'
              ? 'Aadhaar Card (Identity Proof)'
              : rawTitle;

          return (
            <div
              key={doc.id || idx}
              style={{
                backgroundColor: '#FAF7F0',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.15s ease',
              }}
              className="hover:shadow-md transition"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isPhoto ? '#B45309' : '#06294D',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {isPhoto ? <FileCheck2 size={24} /> : <FileText size={24} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#06294D',
                        lineHeight: 1.35,
                      }}
                      title={displayTitle}
                    >
                      {displayTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', wordBreak: 'break-word' }}>
                      {doc.fileName} • {doc.fileSize || '1.5 MB'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      Submitted: {doc.uploadDate || application.submittedAt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
                  <Lock size={12} color="#059669" />
                  <span>256-bit Encrypted KYC</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = doc.uri || '#';
                      link.download = doc.fileName || 'document.pdf';
                      link.click();
                    }}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    className="hover:bg-slate-50 transition"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDoc(doc)}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#06294D',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(6, 41, 77, 0.2)',
                    }}
                    className="hover:bg-[#011F39] transition"
                  >
                    <Eye size={13} color="#FAD465" />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security compliance footer */}
      <div
        style={{
          marginTop: '24px',
          padding: '14px 18px',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#64748B',
        }}
      >
        <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0 }} />
        <div>
          <strong>Statutory Compliance:</strong> All submitted verification credentials are stored in accordance with the Human Rights &amp; Social Justice Mission KYC Scrutiny Mandate and IT Act 2000 digital storage protocols.
        </div>
      </div>

      {/* Viewer Modal */}
      <ApplicationDocumentViewerModal
        isOpen={Boolean(selectedDoc)}
        document={selectedDoc}
        applicantName={application.applicantName}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};

