import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { categories, products } from '../src/lib/catalog';

test('catalog groups every product under a known family', async () => {
  const known = new Set(categories.map(c => c.slug));
  expect(products.length).toBeGreaterThan(60);
  expect(products.every(p => known.has(p.category))).toBe(true);
  expect(new Set(products.map(p => p.slug)).size).toBe(products.length);
});

test('catalog never publishes prices taken from the reference documents for new references', async () => {
  const priced = products.filter(p => p.variants?.some(v => v.price !== undefined) && !p.needsTechnicalReview);
  // Solo los codos HDPE heredados conservan precio de referencia con aviso de vigencia.
  expect(priced.map(p => p.slug).sort()).toEqual(['codo-hdpe-termofusion-45-sdr11', 'codo-hdpe-termofusion-90-sdr11']);
});

test('family filter lists ductile iron references', async ({ app, screen }) => {
  await app.open('/productos?categoria=hierro-ductil');
  await expect(screen.getByRole('heading', 'Hierro dúctil')).toBeVisible();
  await expect(screen.getByRole('link', { name: /Tubería de hierro dúctil/ })).toBeVisible();
});

test('a new reference can be added with its own measure', async ({ app, screen, browser }) => {
  await app.open('/productos/tee-bridada-tbb');
  await expect(screen.getByRole('heading', 'Tee bridada TBB')).toBeVisible();
  await screen.getByRole('combobox', 'Medida / variante').selectOption({ label: 'DN300 × DN250' });
  await screen.getByRole('button', 'Agregar a cotización').click();
  await expect(screen.getByRole('link', 'Ver mi cotización')).toBeVisible();
  const stored = await browser.evaluate(() => localStorage.getItem('fundigsac-quote'));
  expect(stored).toContain('DN300 × DN250');
});

test('resources page answers questions in an accordion', async ({ app, screen }) => {
  await app.open('/recursos');
  await expect(screen.getByRole('heading', 'Recursos para elegir y cotizar mejor')).toBeVisible();
  await screen.getByText('¿Cómo solicito una cotización?').click();
  await expect(screen.getByText(/Agrega los productos a tu lista/)).toBeVisible();
});

test('contact page offers direct channels', async ({ app, screen }) => {
  await app.open('/contacto');
  await expect(screen.getByRole('heading', 'Hablemos de tu requerimiento')).toBeVisible();
  await expect(screen.getByRole('link', { name: /Abrir WhatsApp/ })).toBeVisible();
  await expect(screen.getByRole('textbox', { name: /Mensaje/ })).toBeVisible();
});
