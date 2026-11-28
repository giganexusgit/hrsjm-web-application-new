export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

class PushNotificationService {
  private static instance: PushNotificationService;

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): PushPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return (window.Notification?.permission || 'default') as PushPermissionState;
  }

  public async requestPermission(): Promise<PushPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const result = await window.Notification.requestPermission();
      if (result === 'granted') {
        this.showNotification('HRSJM Push Notifications Active 🔔', {
          body: 'You are now connected to real-time administrative and system alerts.',
        });
      }
      return result as PushPermissionState;
    } catch (err) {
      console.warn('Failed to request push notification permission:', err);
      return this.getPermission();
    }
  }

  public showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      tag?: string;
      data?: any;
    }
  ): Notification | null {
    if (!this.isSupported()) return null;
    if (this.getPermission() !== 'granted') return null;

    try {
      const notif = new window.Notification(title, {
        body: options?.body,
        icon: options?.icon || '/favicon.ico',
        tag: options?.tag,
        data: options?.data,
      });

      notif.onclick = () => {
        window.focus();
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
        notif.close();
      };

      return notif;
    } catch (err) {
      console.warn('Failed to display native desktop notification:', err);
      return null;
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
