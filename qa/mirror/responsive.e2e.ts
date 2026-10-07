import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { routeMirrorResources } from './support.ts';

const pages = [
  '/',
  '/shop/',
  '/nosotros/',
  '/contactanos/',
  '/libro-de-reclamos/',
  '/product-category/valvulas-hierro-ductil/',
  '/product/valvula-check-flex/',
];

test('primary legacy pages fit the viewport without horizontal overflow', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  const overflowPages: string[] = [];

  for (const path of pages) {
    await app.open(path);
    const overflowing = await browser.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    if (overflowing) overflowPages.push(path);
  }

  expect(overflowPages).toEqual([]);
});

test('mobile menu state remains closed and layout fits after mobile to desktop resize', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  await browser.setViewport({ width: 390, height: 844 });
  await app.open('/');
  await browser.setViewport({ width: 1440, height: 900 });

  const state = await browser.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    expanded: document.querySelector('[aria-label="Menu Toggle"]')?.getAttribute('aria-expanded') ?? '',
  }));
  expect(state.scrollWidth).toBeLessThanOrEqual(state.width);
  expect(state.expanded).toBe('false');
});

test('home and product imagery loads without broken img elements', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  const failures: string[] = [];
  for (const path of ['/', '/product/valvula-check-flex/']) {
    await app.open(path);
    const brokenImages = await browser.evaluate(() =>
      Array.from(document.images)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    );
    for (const image of brokenImages) failures.push(`${path}: ${image}`);
  }
  expect(failures).toEqual([]);
});
