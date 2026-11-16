/**
 * Resolves the publicly accessible verification URL for member QR codes.
 *
 * CRITICAL FIX:
 * Never emit "localhost" or "127.0.0.1" inside generated QR codes. When scanned by
 * an external mobile device (iPhone / Android), "localhost" resolves to the phone itself,
 * causing Safari's "cannot connect to the server" error.
 */

export function getPublicVerificationUrl(tokenOrId: string): string {
  const clean = encodeURIComponent(String(tokenOrId || '').trim());

  // 1. Explicit override from environment if provided
  const envUrl = (
    import.meta.env.VITE_PUBLIC_VERIFICATION_URL ||
    import.meta.env.VITE_PUBLIC_APP_URL ||
    ''
  ).trim();

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return `${envUrl.replace(/\/+$/, '')}/verify/${clean}`;
  }

  // 2. If the current browser is running on a genuine public domain (Vercel, custom domain, etc.)
  if (typeof window !== 'undefined' && window.location.origin) {
    const host = window.location.hostname;
    if (
      host !== 'localhost' &&
      host !== '127.0.0.1' &&
      !host.startsWith('192.168.') &&
      !host.startsWith('10.') &&
      !host.endsWith('.local')
    ) {
      return `${window.location.origin}/verify/${clean}`;
    }
  }

  // 3. In local development, use the accessible LAN network IP so smartphones on the Wi-Fi connect
  const localLanIp = (import.meta.env.VITE_LOCAL_NETWORK_IP || '192.168.0.164').trim();
  const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : ':5173';

  return `http://${localLanIp}${port}/verify/${clean}`;
}
