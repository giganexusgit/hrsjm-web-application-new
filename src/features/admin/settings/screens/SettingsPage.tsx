import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Bell,
  ShieldCheck,
  Wrench,
  Download,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import type { SettingsTabId } from '../types/settings.types';
import { GeneralSettingsTab } from '../components/GeneralSettingsTab';
import { NotificationPreferencesTab } from '../components/NotificationPreferencesTab';
import { SecuritySettingsTab } from '../components/SecuritySettingsTab';
import { SystemMaintenanceTab } from '../components/SystemMaintenanceTab';
import { MaintenanceConfirmModal } from '../components/MaintenanceConfirmModal';
import { ClearCacheModal } from '../components/ClearCacheModal';
import { settingsService } from '../services/settingsService';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings,
    savedMessage,
    isLoading,
    isSaving,
    loadSettings,
    updateOrganization,
    updateNotifications,
    updateSecurity,
    updateSystem,
    resetToDefaults,
    dismissSavedMessage,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTabId>('GENERAL');
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [clearCacheModalOpen, setClearCacheModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleMaintenance = () => {
    updateSystem({ maintenanceMode: !settings.system.maintenanceMode });
  };

  const handleConfirmClearCache = () => {
    settingsService.clearCache();
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert Banner */}
      {savedMessage && (
        <div style={styles.toastBanner}>
          <div style={styles.toastContent}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{savedMessage}</span>
          </div>
          <button type="button" onClick={dismissSavedMessage} style={styles.toastDismiss}>
            ✕
          </button>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div style={styles.header}>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLink} onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <ChevronRight size={13} color="#94A3B8" />
          <span style={styles.breadcrumbActive}>Settings & Preferences</span>
        </div>

        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Settings & Preferences</h1>
            <p style={styles.subtitle}>
              Configure statutory organization credentials, notification dispatches, security policies, and cluster maintenance.
            </p>
          </div>

          <div style={styles.headerActions}>
            {isLoading && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                <Loader2 size={14} className="animate-spin" />
                <span>Syncing DB...</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => settingsService.exportBackup()}
              style={styles.secondaryBtn}
              title="Export all configurations as JSON"
            >
              <Download size={14} color="#06294D" />
              <span>Export Backup</span>
            </button>

            <button
              type="button"
              onClick={resetToDefaults}
              style={styles.resetBtn}
              title="Reset all settings to default values"
            >
              <RotateCcw size={14} color="#64748B" />
              <span>Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div style={styles.tabsWrap}>
        <button
          type="button"
          onClick={() => setActiveTab('GENERAL')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'GENERAL' ? '#06294D' : '#FFFFFF',
            color: activeTab === 'GENERAL' ? '#FFFFFF' : '#475569',
            borderColor: activeTab === 'GENERAL' ? '#06294D' : '#CBD5E1',
          }}
        >
          <Building2 size={15} color={activeTab === 'GENERAL' ? '#FAD465' : '#64748B'} />
          <span>Organization & Legal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NOTIFICATIONS')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'NOTIFICATIONS' ? '#06294D' : '#FFFFFF',
            color: activeTab === 'NOTIFICATIONS' ? '#FFFFFF' : '#475569',
            borderColor: activeTab === 'NOTIFICATIONS' ? '#06294D' : '#CBD5E1',
          }}
        >
          <Bell size={15} color={activeTab === 'NOTIFICATIONS' ? '#FAD465' : '#64748B'} />
          <span>Notifications & Dispatch</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'SECURITY' ? '#06294D' : '#FFFFFF',
            color: activeTab === 'SECURITY' ? '#FFFFFF' : '#475569',
            borderColor: activeTab === 'SECURITY' ? '#06294D' : '#CBD5E1',
          }}
        >
          <ShieldCheck size={15} color={activeTab === 'SECURITY' ? '#FAD465' : '#64748B'} />
          <span>Security & Authentication</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SYSTEM')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'SYSTEM' ? '#06294D' : '#FFFFFF',
            color: activeTab === 'SYSTEM' ? '#FFFFFF' : '#475569',
            borderColor: activeTab === 'SYSTEM' ? '#06294D' : '#CBD5E1',
          }}
        >
          <Wrench size={15} color={activeTab === 'SYSTEM' ? '#FAD465' : '#64748B'} />
          <span>System & Maintenance</span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'GENERAL' && (
          <GeneralSettingsTab
            organization={settings.organization}
            onSave={updateOrganization}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <NotificationPreferencesTab
            notifications={settings.notifications}
            onUpdate={updateNotifications}
          />
        )}

        {activeTab === 'SECURITY' && (
          <SecuritySettingsTab
            security={settings.security}
            onUpdate={updateSecurity}
          />
        )}

        {activeTab === 'SYSTEM' && (
          <SystemMaintenanceTab
            system={settings.system}
            onUpdate={updateSystem}
            onOpenMaintenanceModal={() => setMaintenanceModalOpen(true)}
            onOpenClearCacheModal={() => setClearCacheModalOpen(true)}
          />
        )}
      </div>

      {/* Confirmation Modals */}
      <MaintenanceConfirmModal
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        onConfirm={handleToggleMaintenance}
        isCurrentlyEnabled={settings.system.maintenanceMode}
      />

      <ClearCacheModal
        isOpen={clearCacheModalOpen}
        onClose={() => setClearCacheModalOpen(false)}
        onConfirm={handleConfirmClearCache}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0 0 40px',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  toastBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#065F46',
    padding: '12px 18px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.1)',
  },
  toastContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13.5px',
    fontWeight: 600,
  },
  toastDismiss: {
    background: 'none',
    border: 'none',
    color: '#065F46',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px 6px',
  },
  header: {
    marginBottom: '24px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
    color: '#64748B',
    marginBottom: '10px',
  },
  breadcrumbLink: {
    cursor: 'pointer',
    color: '#06294D',
    fontWeight: 500,
  },
  breadcrumbActive: {
    color: '#0F172A',
    fontWeight: 600,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#011F39',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    color: '#06294D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    color: '#64748B',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tabsWrap: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
  },
};
