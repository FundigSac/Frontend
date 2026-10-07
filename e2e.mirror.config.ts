import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { gateway } from 'ai';

const mirrorApp = (port: number) => ({
  url: process.env.MIRROR_URL ?? `http://localhost:${port}`,
  command: {
    executable: process.platform === 'win32' ? 'cmd.exe' : 'pnpm',
    args: process.platform === 'win32'
      ? ['/d', '/s', '/c', `pnpm exec serve legacy/mirror --listen tcp://127.0.0.1:${port}`]
      : ['exec', 'serve', 'legacy/mirror', '--listen', `tcp://127.0.0.1:${port}`],
    reuseExisting: true,
    log: `.e2e/logs/mirror-${port}.log`,
  },
});

export default {
  tests: ['qa/mirror/**/*.e2e.ts'],
  agents: {
    default: {
      model: gateway('openai/gpt-6-luna-fast'),
      system: 'Explore the site as a careful QA tester. Report only observable behavior.',
    },
  },
  targets: [
    { name: 'mirror-desktop', engine: web({ browser: 'chromium', viewport: { width: 1440, height: 900 } }), app: mirrorApp(4310) },
    { name: 'mirror-laptop', engine: web({ browser: 'chromium', viewport: { width: 1366, height: 768 } }), app: mirrorApp(4311) },
    { name: 'mirror-tablet', engine: web({ browser: 'chromium', viewport: { width: 820, height: 1180 } }), app: mirrorApp(4312) },
    { name: 'mirror-tablet-small', engine: web({ browser: 'chromium', viewport: { width: 768, height: 1024 } }), app: mirrorApp(4313) },
    { name: 'mirror-mobile', engine: web({ browser: 'chromium', viewport: { width: 390, height: 844 } }), app: mirrorApp(4314) },
    { name: 'mirror-mobile-small', engine: web({ browser: 'chromium', viewport: { width: 360, height: 800 } }), app: mirrorApp(4315) },
    { name: 'mirror-desktop-firefox', engine: web({ browser: 'firefox', viewport: { width: 1440, height: 900 } }), app: mirrorApp(4316) },
    { name: 'mirror-mobile-webkit', engine: web({ browser: 'webkit', viewport: { width: 390, height: 844 } }), app: mirrorApp(4317) },
  ],
  workers: 1,
  retries: 1,
  trace: 'retain-on-failure',
} satisfies E2EConfig;
