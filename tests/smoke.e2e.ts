import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('home page renders its baseline content and migration link', async ({ app, browser, screen }) => {
  await app.open('/');

  await expect(screen.getByRole('heading', 'FUNDIGSAC 2.0')).toBeVisible();
  await expect(screen.getByText('Baseline de migración preparado')).toBeVisible();
  await expect(screen.getByRole('navigation', 'Artefactos de migración')).toBeVisible();
  await expect(screen.getByRole('link', 'Abrir mirror legacy (localhost:4173)')).toBeVisible();
  await expect(browser).toHaveURL('/');

  const lang = await browser.evaluate(() => document.documentElement.lang);
  const title = await browser.title();
  expect(lang).toBe('es');
  expect(title).toBe('FUNDIGSAC 2.0');
});

test('unknown route renders the framework 404 page', async ({ app, browser }) => {
  await app.open('/ruta-qa-inexistente');

  const notFound = await browser.evaluate(() => document.body.innerText.includes('404'));
  expect(notFound).toBe(true);
});
