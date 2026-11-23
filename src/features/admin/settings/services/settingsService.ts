import { apiClient, ENDPOINTS } from '@/api';
import type {
  AdminSettingsState,
  NotificationPreferences,
  OrganizationSettings,
  SecuritySettings,
  SystemSettings,
} from '../types/settings.types';
import { INITIAL_SETTINGS } from '../data/settingsFixtures';

const SETTINGS_STORAGE_KEY = 'hrsjm_admin_settings_data_v1';

export class SettingsService {
  private static instance: SettingsService;
  private cachedSettings: AdminSettingsState | null = null;

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Synchronously returns cached settings (from memory, localStorage, or initial fallback)
   */
  public getSettings(): AdminSettingsState {
    if (this.cachedSettings) {
      return this.cachedSettings;
    }
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cachedSettings = {
          organization: { ...INITIAL_SETTINGS.organization, ...(parsed.organization || {}) },
          notifications: { ...INITIAL_SETTINGS.notifications, ...(parsed.notifications || {}) },
          security: { ...INITIAL_SETTINGS.security, ...(parsed.security || {}) },
          system: { ...INITIAL_SETTINGS.system, ...(parsed.system || {}) },
        };
        return this.cachedSettings;
      }
    } catch {
      // fallback
    }
    this.cachedSettings = { ...INITIAL_SETTINGS };
    return this.cachedSettings;
  }

  /**
   * Fetches the latest system settings directly from PostgreSQL via backend API.
   * If remote data exists, merges with local state and caches in localStorage.
   */
  public async fetchSettings(): Promise<AdminSettingsState> {
    try {
      const remoteData = await apiClient.get<Record<string, any>>(ENDPOINTS.settings.all);
      if (remoteData && typeof remoteData === 'object') {
        const current = this.getSettings();
        const merged: AdminSettingsState = {
          organization: {
            ...INITIAL_SETTINGS.organization,
            ...current.organization,
            ...(remoteData.organization || {}),
          },
          notifications: {
            ...INITIAL_SETTINGS.notifications,
            ...current.notifications,
            ...(remoteData.notifications || {}),
          },
          security: {
            ...INITIAL_SETTINGS.security,
            ...current.security,
            ...(remoteData.security || {}),
          },
          system: {
            ...INITIAL_SETTINGS.system,
            ...current.system,
            ...(remoteData.system || {}),
          },
        };
        this.cachedSettings = merged;
        this.saveSettings(merged);
        return merged;
      }
    } catch (err) {
      console.warn('[SettingsService] Failed to fetch settings from API, using cached:', err);
    }
    return this.getSettings();
  }

  public saveSettings(settings: AdminSettingsState): void {
    this.cachedSettings = settings;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  public async updateOrganization(org: Partial<OrganizationSettings>): Promise<AdminSettingsState> {
    const current = this.getSettings();
    const updated: AdminSettingsState = {
      ...current,
      organization: {
        ...current.organization,
        ...org,
      },
    };
    this.saveSettings(updated);

    try {
      await apiClient.put(ENDPOINTS.settings.updateByKey('organization'), updated.organization);
    } catch (err) {
      console.warn('[SettingsService] Failed to persist organization to backend:', err);
    }

    return updated;
  }

  public async updateNotifications(notifs: Partial<NotificationPreferences>): Promise<AdminSettingsState> {
    const current = this.getSettings();
    const updated: AdminSettingsState = {
      ...current,
      notifications: {
        ...current.notifications,
        ...notifs,
      },
    };
    this.saveSettings(updated);

    try {
      await apiClient.put(ENDPOINTS.settings.updateByKey('notifications'), updated.notifications);
    } catch (err) {
      console.warn('[SettingsService] Failed to persist notifications to backend:', err);
    }

    return updated;
  }

  public async updateSecurity(sec: Partial<SecuritySettings>): Promise<AdminSettingsState> {
    const current = this.getSettings();
    const updated: AdminSettingsState = {
      ...current,
      security: {
        ...current.security,
        ...sec,
      },
    };
    this.saveSettings(updated);

    try {
      await apiClient.put(ENDPOINTS.settings.updateByKey('security'), updated.security);
    } catch (err) {
      console.warn('[SettingsService] Failed to persist security to backend:', err);
    }

    return updated;
  }

  public async updateSystem(sys: Partial<SystemSettings>): Promise<AdminSettingsState> {
    const current = this.getSettings();
    const updated: AdminSettingsState = {
      ...current,
      system: {
        ...current.system,
        ...sys,
      },
    };
    this.saveSettings(updated);

    try {
      await apiClient.put(ENDPOINTS.settings.updateByKey('system'), updated.system);
    } catch (err) {
      console.warn('[SettingsService] Failed to persist system to backend:', err);
    }

    return updated;
  }

  public async resetToDefaults(): Promise<AdminSettingsState> {
    this.saveSettings(INITIAL_SETTINGS);

    try {
      await Promise.allSettled([
        apiClient.put(ENDPOINTS.settings.updateByKey('organization'), INITIAL_SETTINGS.organization),
        apiClient.put(ENDPOINTS.settings.updateByKey('notifications'), INITIAL_SETTINGS.notifications),
        apiClient.put(ENDPOINTS.settings.updateByKey('security'), INITIAL_SETTINGS.security),
        apiClient.put(ENDPOINTS.settings.updateByKey('system'), INITIAL_SETTINGS.system),
      ]);
    } catch (err) {
      console.warn('[SettingsService] Failed to persist defaults to backend:', err);
    }

    return INITIAL_SETTINGS;
  }

  /**
   * Generates a downloadable JSON backup file of all administrative configurations.
   */
  public exportBackup(): void {
    const settings = this.getSettings();
    const exportData = {
      organization: settings.organization.trustName,
      timestamp: new Date().toISOString(),
      version: settings.system.appVersion,
      settings,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HRSJM_System_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public clearCache(): void {
    try {
      sessionStorage.clear();
      // Keep primary auth / credentials intact while clearing transient cached caches
    } catch {
      // ignore
    }
  }
}

export const settingsService = SettingsService.getInstance();
