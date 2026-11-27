import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isLocalPortOpen(host: string, port: number, timeoutMs = 150): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (ok: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hasLocalBackend3000 = await isLocalPortOpen('127.0.0.1', 3000);
  const hasLocalBackend5000 = await isLocalPortOpen('127.0.0.1', 5000);
  const localTarget = hasLocalBackend3000
    ? 'http://127.0.0.1:3000'
    : hasLocalBackend5000
      ? 'http://127.0.0.1:5000'
      : 'http://127.0.0.1:3000';

  const appEnv = (
    env.VITE_APP_ENV ||
    env.APP_ENV ||
    ''
  ).toLowerCase().trim();

  let proxyTarget: string;
  if (appEnv === 'local' || appEnv === 'development' || appEnv === 'dev') {
    proxyTarget = env.VITE_LOCAL_BACKEND_URL || localTarget;
  } else if (appEnv === 'production' || appEnv === 'prod') {
    proxyTarget = env.VITE_PROD_BACKEND_URL || 'https://webapp.hrsjm.org';
  } else {
    // If not explicitly set, prioritize explicit override, then auto-detect local, then production
    proxyTarget =
      env.VITE_BACKEND_PROXY_TARGET ||
      env.BACKEND_PROXY_TARGET ||
      (hasLocalBackend3000 || hasLocalBackend5000 ? localTarget : 'https://webapp.hrsjm.org');
  }

  console.log(`\n🚀 [HRSJM Admin Web App] Environment: ${appEnv || 'auto'} | API Proxy Target: ${proxyTarget}\n`);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5173,
      host: true,
      proxy: {
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy: any) => {
            proxy.on('error', (_err: unknown, _req: unknown, res: any) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    message: `Backend proxy target (${proxyTarget}) unreachable. Operating in resilient offline fallback mode.`,
                  })
                );
              }
            });
          },
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
