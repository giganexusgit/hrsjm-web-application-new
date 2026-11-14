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
  const hasLocalBackend = await isLocalPortOpen('127.0.0.1', 3000);
  const proxyTarget =
    env.VITE_BACKEND_PROXY_TARGET ||
    env.BACKEND_PROXY_TARGET ||
    (hasLocalBackend ? 'http://127.0.0.1:3000' : 'http://194.164.151.17:3000');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
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
