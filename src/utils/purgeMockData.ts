/**
 * Purges old mock fixtures and dev seeds from localStorage
 * to ensure all application data strictly reflects the live backend database.
 */
export function purgeMockDataFromLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const keysToClean = [
    'hrsjm_local_members_v1',
    'hrsjm_local_assistance_v1',
    'hrsjm_local_support_tickets_v1',
    'hrsjm_local_support_messages_v1',
    'hrsjm_local_events_v1',
    'hrsjm_local_news_v1',
    'hrsjm_local_blogs_v1',
    'hrsjm_local_rights_v1',
    'hrsjm_local_expenses_v1',
    'hrsjm_local_receipts_v1',
    'hrsjm_admin_notifications_v1',
    'hrsjm_admin_broadcasts_v1',
    'hrsjm_active_member',
    'hrsjm_member_passbook_data',
    'hrsjm_local_donations_v1',
  ];

  for (const key of keysToClean) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  // Also scan all localStorage keys for any mock remnants
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.includes('mock') || key.includes('fixtures') || key.includes('seed'))) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}
