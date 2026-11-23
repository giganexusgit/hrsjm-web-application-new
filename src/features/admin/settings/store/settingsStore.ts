import { useSyncExternalStore } from 'react';
import type {
  AdminSettingsState,
  NotificationPreferences,
  OrganizationSettings,
  SecuritySettings,
  SystemSettings,
} from '../types/settings.types';
import { settingsService } from '../services/settingsService';

interface SettingsStoreState {
  settings: AdminSettingsState;
  savedMessage: string | null;
  isLoading: boolean;
  isSaving: boolean;
}

class SettingsStore {
  private state: SettingsStoreState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = {
      settings: settingsService.getSettings(),
      savedMessage: null,
      isLoading: false,
      isSaving: false,
    };
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getSnapshot = (): SettingsStoreState => {
    return this.state;
  };

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public loadSettings = async (): Promise<void> => {
    this.state = { ...this.state, isLoading: true };
    this.notify();
    try {
      const fetched = await settingsService.fetchSettings();
      this.state = {
        ...this.state,
        settings: fetched,
        isLoading: false,
      };
    } catch {
      this.state = { ...this.state, isLoading: false };
    }
    this.notify();
  };

  public updateOrganization = async (org: Partial<OrganizationSettings>): Promise<void> => {
    const current = this.state.settings;
    const optimistic: AdminSettingsState = {
      ...current,
      organization: { ...current.organization, ...org },
    };
    this.state = {
      ...this.state,
      settings: optimistic,
      isSaving: true,
      savedMessage: null,
    };
    this.notify();

    const updated = await settingsService.updateOrganization(org);
    this.state = {
      ...this.state,
      settings: updated,
      isSaving: false,
      savedMessage: 'Organization profile updated and saved to database.',
    };
    this.notify();
  };

  public updateNotifications = async (notifs: Partial<NotificationPreferences>): Promise<void> => {
    const current = this.state.settings;
    const optimistic: AdminSettingsState = {
      ...current,
      notifications: { ...current.notifications, ...notifs },
    };
    this.state = {
      ...this.state,
      settings: optimistic,
      isSaving: true,
      savedMessage: null,
    };
    this.notify();

    const updated = await settingsService.updateNotifications(notifs);
    this.state = {
      ...this.state,
      settings: updated,
      isSaving: false,
      savedMessage: 'Notification preferences saved to database.',
    };
    this.notify();
  };

  public updateSecurity = async (sec: Partial<SecuritySettings>): Promise<void> => {
    const current = this.state.settings;
    const optimistic: AdminSettingsState = {
      ...current,
      security: { ...current.security, ...sec },
    };
    this.state = {
      ...this.state,
      settings: optimistic,
      isSaving: true,
      savedMessage: null,
    };
    this.notify();

    const updated = await settingsService.updateSecurity(sec);
    this.state = {
      ...this.state,
      settings: updated,
      isSaving: false,
      savedMessage: 'Security and session policy updated and saved to database.',
    };
    this.notify();
  };

  public updateSystem = async (sys: Partial<SystemSettings>): Promise<void> => {
    const current = this.state.settings;
    const optimistic: AdminSettingsState = {
      ...current,
      system: { ...current.system, ...sys },
    };
    this.state = {
      ...this.state,
      settings: optimistic,
      isSaving: true,
      savedMessage: null,
    };
    this.notify();

    const updated = await settingsService.updateSystem(sys);
    this.state = {
      ...this.state,
      settings: updated,
      isSaving: false,
      savedMessage: 'System configuration updated and saved to database.',
    };
    this.notify();
  };

  public resetToDefaults = async (): Promise<void> => {
    this.state = { ...this.state, isSaving: true, savedMessage: null };
    this.notify();
    const updated = await settingsService.resetToDefaults();
    this.state = {
      ...this.state,
      settings: updated,
      isSaving: false,
      savedMessage: 'Settings reset to factory defaults in database.',
    };
    this.notify();
  };

  public dismissSavedMessage = (): void => {
    if (this.state.savedMessage) {
      this.state = {
        ...this.state,
        savedMessage: null,
      };
      this.notify();
    }
  };
}

export const settingsStore = new SettingsStore();

export function useSettingsStore(): SettingsStoreState & {
  loadSettings: () => Promise<void>;
  updateOrganization: (org: Partial<OrganizationSettings>) => Promise<void>;
  updateNotifications: (notifs: Partial<NotificationPreferences>) => Promise<void>;
  updateSecurity: (sec: Partial<SecuritySettings>) => Promise<void>;
  updateSystem: (sys: Partial<SystemSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  dismissSavedMessage: () => void;
} {
  const state = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    settingsStore.getSnapshot
  );

  return {
    settings: state.settings,
    savedMessage: state.savedMessage,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    loadSettings: settingsStore.loadSettings,
    updateOrganization: settingsStore.updateOrganization,
    updateNotifications: settingsStore.updateNotifications,
    updateSecurity: settingsStore.updateSecurity,
    updateSystem: settingsStore.updateSystem,
    resetToDefaults: settingsStore.resetToDefaults,
    dismissSavedMessage: settingsStore.dismissSavedMessage,
  };
}
