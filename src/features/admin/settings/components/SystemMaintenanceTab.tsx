import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Database,
  Download,
  Trash2,
  AlertOctagon,
  CheckCircle2,
  Server,
} from 'lucide-react';
import type { SystemSettings } from '../types/settings.types';
import { settingsService } from '../services/settingsService';

interface SystemMaintenanceTabProps {
  system: SystemSettings;
  onUpdate: (sys: Partial<SystemSettings>) => void;
  onOpenMaintenanceModal: () => void;
  onOpenClearCacheModal: () => void;
}

export const SystemMaintenanceTab: React.FC<SystemMaintenanceTabProps> = ({
  system,
  onUpdate,
  onOpenMaintenanceModal,
  onOpenClearCacheModal,
}) => {
  const [maintenanceMsg, setMaintenanceMsg] = useState(system.maintenanceMessage);

  useEffect(() => {
    setMaintenanceMsg(system.maintenanceMessage);
  }, [system.maintenanceMessage]);

  const handleSaveMessage = () => {
    onUpdate({ maintenanceMessage: maintenanceMsg });
  };

  return (
    <div style={styles.container}>
      {/* Platform & Cluster Health Overview */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <Server size={18} color="#06294D" />
          </div>
          <div>
            <h3 style={styles.cardTitle}>Platform Cluster & Infrastructure Health</h3>
            <p style={styles.cardSubtitle}>
              Live application status, database operational integrity, and software releases.
            </p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Database Status</span>
            <div style={styles.healthRow}>
              <CheckCircle2 size={15} color="#059669" />
              <strong style={{ color: '#059669', fontSize: '14px' }}>{system.databaseStatus}</strong>
            </div>
            <span style={styles.statSub}>PostgreSQL 16 Cluster</span>
          </div>

          <div style={styles.statBox}>
            <span style={styles.statLabel}>Platform Release</span>
            <strong style={styles.statVal}>{system.appVersion}</strong>
            <span style={styles.statSub}>{system.buildNumber}</span>
          </div>

          <div style={styles.statBox}>
            <span style={styles.statLabel}>Environment</span>
            <strong style={styles.statVal}>{system.environment}</strong>
            <span style={styles.statSub}>AWS Mumbai (ap-south-1)</span>
          </div>

          <div style={styles.statBox}>
            <span style={styles.statLabel}>Last System Backup</span>
            <strong style={{ ...styles.statVal, fontSize: '12.5px' }}>{system.lastBackupDate}</strong>
            <span style={styles.statSub}>Encrypted Cloud Storage</span>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Governance */}
      <div
        style={{
          ...styles.card,
          borderColor: system.maintenanceMode ? '#F87171' : '#E2E8F0',
          backgroundColor: system.maintenanceMode ? '#FEF2F2' : '#FFFFFF',
        }}
      >
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconWrap,
              backgroundColor: system.maintenanceMode ? '#FEE2E2' : '#EEF2F6',
            }}
          >
            <AlertOctagon
              size={18}
              color={system.maintenanceMode ? '#DC2626' : '#06294D'}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={styles.cardTitle}>Emergency Platform Maintenance Mode</h3>
            <p style={styles.cardSubtitle}>
              When activated, public member portals and external applications display a maintenance banner.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenMaintenanceModal}
            style={{
              ...styles.maintenanceBtn,
              backgroundColor: system.maintenanceMode ? '#DC2626' : '#06294D',
            }}
          >
            <Wrench size={14} color="#FFFFFF" />
            <span>
              {system.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </span>
          </button>
        </div>

        <div style={styles.messageBox}>
          <label style={styles.label}>Public Maintenance Banner Message</label>
          <textarea
            rows={2}
            value={maintenanceMsg}
            onChange={(e) => setMaintenanceMsg(e.target.value)}
            onBlur={handleSaveMessage}
            placeholder="Enter public notification text shown during downtime..."
            style={styles.textarea}
          />
        </div>
      </div>

      {/* Backup & Cache Management */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <Database size={18} color="#06294D" />
          </div>
          <div>
            <h3 style={styles.cardTitle}>Configuration Backup & Client Storage</h3>
            <p style={styles.cardSubtitle}>
              Export system settings JSON backups or reset temporary client browser cache.
            </p>
          </div>
        </div>

        <div style={styles.dualActionsGrid}>
          {/* Export JSON */}
          <div style={styles.actionBlock}>
            <div>
              <strong style={styles.actionTitle}>Download Configuration Backup</strong>
              <p style={styles.actionDesc}>
                Export a full JSON backup of legal information, dispatch policies, and administrative security rules.
              </p>
            </div>
            <button
              type="button"
              onClick={() => settingsService.exportBackup()}
              style={styles.backupBtn}
            >
              <Download size={15} color="#06294D" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Clear Cache */}
          <div style={styles.actionBlock}>
            <div>
              <strong style={styles.actionTitle}>Clear Local Platform Cache</strong>
              <p style={styles.actionDesc}>
                Flush temporary view caches and reload latest central API schemas without affecting user sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenClearCacheModal}
              style={styles.clearCacheBtn}
            >
              <Trash2 size={15} color="#DC2626" />
              <span>Clear Local Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid #F1F5F9',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#EEF2F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#64748B',
    margin: '3px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  statVal: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#011F39',
  },
  healthRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  statSub: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  maintenanceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    borderRadius: '8px',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  messageBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  dualActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  actionBlock: {
    backgroundColor: '#F8FAFC',
    padding: '18px 20px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '14px',
  },
  actionTitle: {
    fontSize: '14px',
    color: '#011F39',
    display: 'block',
    marginBottom: '4px',
  },
  actionDesc: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.45,
    margin: 0,
  },
  backupBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  clearCacheBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #FCA5A5',
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
