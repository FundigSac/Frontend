import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { products } from '../src/lib/catalog';

const routes = ['/', '/productos', '/cotizar', '/soluciones', '/industrias', '/nosotros', '/recursos', '/contacto', '/libro-de-reclamos', ...products.map(p => `/productos/${p.slug}`)];

test('every public route loads without broken images or horizontal overflow', async ({ app, browser }) => {
  for (const route of routes) {
    await app.open(route);
    const result = await browser.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.src),
    }));
    expect(result.h1).toBe(1);
    expect(result.overflow).toBe(false);
    expect(result.brokenImages).toEqual([]);
  }
});
