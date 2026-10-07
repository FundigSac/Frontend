import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('home page leads to the product catalog', async ({ app, browser, screen }) => {
  await app.open('/');

  await expect(screen.getByRole('heading', 'Componentes para redes que tienen que funcionar.')).toBeVisible();
  await expect(screen.getByRole('link', 'Explorar productos')).toBeVisible();
  await expect(browser).toHaveURL('/');

  const lang = await browser.evaluate(() => document.documentElement.lang);
  const title = await browser.title();
  expect(lang).toBe('es');
  expect(title).toContain('FUNDIGSAC');
});

test('product can be added to a quotation', async ({ app, screen, browser }) => {
  await app.open('/productos/valvula-check-flex');
  await expect(screen.getByRole('heading', 'Válvula check flex')).toBeVisible();
  await screen.getByRole('button', 'Agregar a cotización').click();
  await expect(screen.getByRole('link', 'Ver mi cotización')).toBeVisible();
  await screen.getByRole('link', 'Ver mi cotización').click();
  await expect(screen.getByRole('heading', 'Solicitar cotización')).toBeVisible();
  const stored = await browser.evaluate(() => localStorage.getItem('fundigsac-quote'));
  expect(stored).toContain('valvula-check-flex');
});

test('technical search finds a PDF-backed variant', async ({ app, screen }) => {
  await app.open('/productos');
  await screen.getByRole('textbox', 'Buscar en catálogo').fill('DN100');
  await screen.getByRole('button', 'Buscar').click();
  await expect(screen.getByRole('link', { name: /Acople gran rango AGR/ })).toBeVisible();
});

test('HDPE product exposes source-backed variants', async ({ app, screen }) => {
  await app.open('/productos/codo-hdpe-termofusion-90-sdr11');
  await expect(screen.getByRole('heading', 'Codo HDPE termofusión 90° SDR11')).toBeVisible();
  await screen.getByRole('combobox', 'Medida / variante').selectOption({ label: '110 mm' });
  await expect(screen.getByText('S/ 22.00')).toBeVisible();
});

test('unknown route renders the framework 404 page', async ({ app, browser }) => {
  await app.open('/ruta-qa-inexistente');

  const notFound = await browser.evaluate(() => document.body.innerText.includes('404'));
  expect(notFound).toBe(true);
});
