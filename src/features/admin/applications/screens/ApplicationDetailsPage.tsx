import React, { useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsStore } from '../store/applicationsStore';
import type { ApplicationStatus } from '../types/applications.types';
import { ApplicationApplicantSummaryCard } from '../components/ApplicationApplicantSummaryCard';
import { ApplicationDetailsInfoTab } from '../components/ApplicationDetailsInfoTab';
import { ApplicationDocumentsTab } from '../components/ApplicationDocumentsTab';
import { ApplicationActivityLogTab } from '../components/ApplicationActivityLogTab';
import { ApplicationStatusConfirmationModal } from '../components/ApplicationStatusConfirmationModal';
import type { ConfirmationType } from '../components/ApplicationStatusConfirmationModal';
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  FileText,
  History,
  AlertCircle,
} from 'lucide-react';

export type DetailsTabKey = 'details' | 'documents' | 'activity';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  submitted: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'Submitted' },
  under_review: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'Under Review' },
  approved: { bg: '#ECFDF5', text: '#059669', dot: '#10B981', label: 'Approved' },
  rejected: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444', label: 'Rejected' },
};

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useSyncExternalStore(applicationsStore.subscribe, applicationsStore.getSnapshot);

  const application = id ? applicationsStore.getApplicationById(id) : undefined;
  const [loading, setLoading] = useState<boolean>(!application);

  const [activeTab, setActiveTab] = useState<DetailsTabKey>('details');
  const [confirmationType, setConfirmationType] = useState<ConfirmationType | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (id) {
      applicationsStore.markApplicationViewed(id);
    }
    if (!application && id) {
      applicationsStore.fetchApplications().finally(() => {
        setLoading(false);
      });
    }
  }, [id, application]);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '80px auto',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          padding: '40px 30px',
          borderRadius: '16px',
          border: '1px solid #EDF2F7',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div className="w-8 h-8 border-3 border-[#011F39] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#011F39' }}>Loading Application Details...</h3>
        <p style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>Connecting to official HRSJM registry</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '60px auto',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          padding: '40px 30px',
          borderRadius: '16px',
          border: '1px solid #EDF2F7',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
        <h2
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '22px',
            color: '#011F39',
            margin: '0 0 8px',
          }}
        >
          Application Not Found
        </h2>
        <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 24px' }}>
          Unable to find membership application with ID: {id || 'N/A'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/membership-applications')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: ApplicationStatus, reason?: string) => {
    if (!application.id && !application.applicationId) return;
    const targetId = application.id || application.applicationId;
    setActionError(null);

    try {
      await applicationsStore.updateStatus(targetId, newStatus, reason);

      if (newStatus === 'approved') {
        setActionSuccess(`Application for ${application.applicantName} approved successfully!`);
      } else if (newStatus === 'rejected') {
        setActionSuccess(`Application for ${application.applicantName} rejected.`);
      } else if (newStatus === 'under_review') {
        setActionSuccess(`Application marked under active review.`);
      }
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update application status on server. Please try again.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const tabs: { key: DetailsTabKey; label: string; icon: any }[] = [
    { key: 'details', label: 'Application Details', icon: FileText },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'activity', label: 'Activity Log', icon: History },
  ];

  const isApproved = application.status === 'approved';
  const isRejected = application.status === 'rejected';

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingTop: '8px', paddingBottom: '60px' }}>
      {/* Top back navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/admin/membership-applications')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#011F39',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={18} />
          <span>Back to Applications</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '14px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: (STATUS_STYLES[application.status] || STATUS_STYLES.submitted).bg,
              color: (STATUS_STYLES[application.status] || STATUS_STYLES.submitted).text,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: (STATUS_STYLES[application.status] || STATUS_STYLES.submitted).dot,
              }}
            />
            {(STATUS_STYLES[application.status] || STATUS_STYLES.submitted).label}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Applicant Summary Banner */}
      <ApplicationApplicantSummaryCard application={application} />

      {/* Tab selection buttons */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '12px',
          paddingTop: '8px',
          overflowX: 'auto',
          position: 'sticky',
          top: '68px',
          zIndex: 20,
          backgroundColor: '#FAF7F0',
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          const docCount = application.documents?.length || 4;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '24px',
                border: isActive ? '1px solid #06294D' : '1px solid #E2E8F0',
                backgroundColor: isActive ? '#06294D' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(6, 41, 77, 0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                whiteSpace: 'nowrap',
              }}
              className="hover:scale-102 active:scale-98"
            >
              <TabIcon size={16} color={isActive ? '#FAD465' : '#64748B'} />
              <span>{tab.label}</span>
              {tab.key === 'documents' && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: isActive ? '#FAD465' : '#F1F5F9',
                    color: '#06294D',
                  }}
                >
                  {docCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ marginBottom: '28px' }}>
        {activeTab === 'details' && <ApplicationDetailsInfoTab application={application} />}
        {activeTab === 'documents' && <ApplicationDocumentsTab application={application} />}
        {activeTab === 'activity' && <ApplicationActivityLogTab application={application} />}
      </div>

      {/* Fixed / Floating Decision Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #EDF2F7',
          padding: '18px 24px',
          boxShadow: '0 4px 16px rgba(1, 31, 57, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/admin/membership-applications')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #DBE5EE',
            backgroundColor: '#FFFFFF',
            color: '#34516D',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ChevronLeft size={16} /> Back to List
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Under Review Button (if not already under review or approved) */}
          {!isApproved && application.status !== 'under_review' && (
            <button
              type="button"
              onClick={() => handleStatusChange('under_review')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #FDE68A',
                backgroundColor: '#FFFBEB',
                color: '#D97706',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock3 size={15} /> Mark Under Review
            </button>
          )}

          {/* Reject Button */}
          {!isApproved && !isRejected && (
            <button
              type="button"
              onClick={() => setConfirmationType('reject')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <XCircle size={16} /> Reject Application
            </button>
          )}

          {/* Reconsider Button if already rejected */}
          {isRejected && (
            <button
              type="button"
              onClick={() => handleStatusChange('under_review')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #FDE68A',
                backgroundColor: '#FFFBEB',
                color: '#D97706',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock3 size={15} /> Reconsider Application
            </button>
          )}

          {/* Approve Button */}
          {!isApproved ? (
            <button
              type="button"
              onClick={() => setConfirmationType('approve')}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
              }}
            >
              <CheckCircle2 size={17} /> Approve Application
            </button>
          ) : (
            <div
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #A7F3D0',
              }}
            >
              <CheckCircle2 size={16} /> Application Approved (Terminal State)
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ApplicationStatusConfirmationModal
        isOpen={Boolean(confirmationType)}
        type={confirmationType}
        applicantName={application.applicantName}
        onClose={() => setConfirmationType(null)}
        onConfirm={reason => {
          if (confirmationType === 'approve') {
            handleStatusChange('approved');
          } else if (confirmationType === 'reject') {
            handleStatusChange('rejected', reason);
          }
          setConfirmationType(null);
        }}
      />
    </div>
  );
};
