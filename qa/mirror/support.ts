import type { App } from 'e2e';
import type { Browser } from '@e2e-dev/web';

/** The captured HTML embeds asset URLs on port 4173; route them to this test target's local mirror server. */
export async function routeMirrorResources(browser: Browser, app: App) {
  if (!app.baseUrl) throw new Error('Mirror browser target has no base URL');
  const origin = new URL(app.baseUrl).origin;

  await browser.route('http://localhost:4173/**', async (route) => {
    const url = route.request.url.replace('http://localhost:4173', origin);
    await route.continue({ url });
  });
}
