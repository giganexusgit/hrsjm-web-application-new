import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsStore } from '../store/applicationsStore';
import { ApplicationPrintModal } from '../components/ApplicationPrintModal';
import { Loader2 } from 'lucide-react';

export const ApplicationPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsStore.fetchApplications().finally(() => {
      setLoading(false);
    });
  }, []);

  const application = id ? applicationsStore.getApplicationById(id) : undefined;

  useEffect(() => {
    if (!loading && application) {
      // Auto open print dialog after brief render delay
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [loading, application]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '10px' }}>
        <Loader2 className="animate-spin text-[#06294D]" size={32} />
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#06294D' }}>Preparing Application Print Form...</span>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center', padding: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#06294D' }}>Application Not Found</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
          Could not locate membership application reference ID: {id}
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/membership-applications')}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#06294D',
            color: '#FFFFFF',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <ApplicationPrintModal
      isOpen={true}
      application={application}
      onClose={() => navigate(-1)}
    />
  );
};
