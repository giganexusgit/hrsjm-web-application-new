/**
 * Settings & Preferences Domain Types for HRSJM Admin Web Application.
 * Parity with mobile APK src/app/navigation/AdminSettingsScreen.tsx
 * and central system governance configurations.
 */

export type SettingsTabId = 'GENERAL' | 'NOTIFICATIONS' | 'SECURITY' | 'SYSTEM';

/** Organization Profile & Contact Details */
export interface OrganizationSettings {
  trustName: string;
  hindiName: string;
  registrationNumber: string;
  urn80G: string;
  panNumber: string;
  foundedYear: string;
  secretariatAddress: string;
  city: string;
  state: string;
  pincode: string;
  helplinePhone: string;
  officialEmail: string;
  grievanceEmail: string;
  websiteUrl: string;
  missionStatement: string;
}

/** Notification & Dispatch Preferences */
export interface NotificationPreferences {
  inAppAlerts: boolean;
  pushAlerts?: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  urgentGrievancePush: boolean;
  membershipApplicationAlerts: boolean;
  donationReceiptEmails: boolean;
  weeklyDigestEmail: boolean;
  systemMaintenanceAlerts: boolean;
}

/** Security & Access Control Settings */
export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeoutMinutes: number; // 15, 30, 60, 240
  enforceStrongPassword: boolean;
  ipWhitelistEnabled: boolean;
  auditLoggingEnabled: boolean;
  maxFailedLoginAttempts: number;
}

/** System Maintenance & Platform Details */
export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  appVersion: string;
  buildNumber: string;
  environment: 'Production' | 'Staging' | 'Development';
  databaseStatus: 'Healthy' | 'Degraded' | 'Maintenance';
  lastBackupDate: string;
  apiEndpoint: string;
}

/** Unified Administrative Settings State */
export interface AdminSettingsState {
  organization: OrganizationSettings;
  notifications: NotificationPreferences;
  security: SecuritySettings;
  system: SystemSettings;
}
