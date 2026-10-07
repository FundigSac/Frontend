import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';

const app = {
  url: process.env.APP_URL ?? 'http://localhost:3000',
  command: {
    executable: process.platform === 'win32' ? 'cmd.exe' : 'pnpm',
    args: process.platform === 'win32' ? ['/d', '/s', '/c', 'pnpm dev'] : ['dev'],
    reuseExisting: true,
    log: '.e2e/logs/app.log',
  },
};

export default {
  targets: [
    { name: 'desktop-chromium', engine: web({ browser: 'chromium', viewport: { width: 1440, height: 900 } }), app },
    { name: 'laptop-chromium', engine: web({ browser: 'chromium', viewport: { width: 1366, height: 768 } }), app },
    { name: 'tablet-chromium', engine: web({ browser: 'chromium', viewport: { width: 820, height: 1180 } }), app },
    { name: 'tablet-small-chromium', engine: web({ browser: 'chromium', viewport: { width: 768, height: 1024 } }), app },
    { name: 'mobile-chromium', engine: web({ browser: 'chromium', viewport: { width: 390, height: 844 } }), app },
    { name: 'mobile-small-chromium', engine: web({ browser: 'chromium', viewport: { width: 360, height: 800 } }), app },
    { name: 'desktop-firefox', engine: web({ browser: 'firefox', viewport: { width: 1440, height: 900 } }), app },
    { name: 'mobile-webkit', engine: web({ browser: 'webkit', viewport: { width: 390, height: 844 } }), app },
  ],
  workers: 4,
  retries: 1,
  trace: 'retain-on-failure',
} satisfies E2EConfig;
