import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('home page has no horizontal overflow at the configured viewport', async ({ app, browser, screen }) => {
  await app.open('/');
  await expect(screen.getByRole('heading', 'FUNDIGSAC 2.0')).toBeVisible();

  const hasOverflow = await browser.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test('layout recomposes after desktop to mobile resize', async ({ app, browser, screen }) => {
  await browser.setViewport({ width: 1440, height: 900 });
  await app.open('/');
  await browser.setViewport({ width: 390, height: 844 });

  await expect(screen.getByRole('heading', 'FUNDIGSAC 2.0')).toBeVisible();
  const dimensions = await browser.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
});
