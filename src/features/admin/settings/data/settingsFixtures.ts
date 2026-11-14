import type { AdminSettingsState } from '../types/settings.types';

export const INITIAL_SETTINGS: AdminSettingsState = {
  organization: {
    trustName: 'Human Rights &  Social Justice Mission',
    hindiName: 'मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट',
    registrationNumber: 'HR/0092/2019',
    urn80G: 'AAATH1234KF20214',
    panNumber: 'AAATH1234K',
    foundedYear: '2019',
    secretariatAddress: 'Plot No. 14, Human Rights Bhavan, Institutional Area, Lodhi Road',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110003',
    helplinePhone: '+91 11 2345 6789',
    officialEmail: 'contact@hrsjm.org',
    grievanceEmail: 'legaldesk@hrsjm.org',
    websiteUrl: 'https://hrsjm.org',
    missionStatement:
      'Dedicated to advancing fundamental human rights, constitutional justice, legal empowerment, and humanitarian assistance for marginalized communities across India.',
  },
  notifications: {
    inAppAlerts: true,
    emailAlerts: true,
    smsAlerts: false,
    urgentGrievancePush: true,
    membershipApplicationAlerts: true,
    donationReceiptEmails: true,
    weeklyDigestEmail: true,
    systemMaintenanceAlerts: true,
  },
  security: {
    twoFactorAuth: true,
    sessionTimeoutMinutes: 60,
    enforceStrongPassword: true,
    ipWhitelistEnabled: false,
    auditLoggingEnabled: true,
    maxFailedLoginAttempts: 5,
  },
  system: {
    maintenanceMode: false,
    maintenanceMessage:
      'HRSJM Central Platform is currently undergoing scheduled maintenance. Services will resume shortly.',
    appVersion: 'v2.4.0',
    buildNumber: 'Build 2026.11.04-PROD',
    environment: 'Production',
    databaseStatus: 'Healthy',
    lastBackupDate: '04 Nov 2024, 04:00 AM IST',
    apiEndpoint: 'https://api.hrsjm.org/api/v1',
  },
};
