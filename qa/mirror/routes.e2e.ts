import { test } from '@e2e-dev/web';
import type { Browser } from '@e2e-dev/web';
import { expect } from 'e2e';
import { routeMirrorResources } from './support.ts';

const routes = [
  '/',
  '/shop/',
  '/nosotros/',
  '/contactanos/',
  '/libro-de-reclamos/',
  '/hola-mundo/',
  '/product-category/valvulas-hierro-ductil/',
  '/product/valvula-mariposa-excentrica/',
  '/product/valvula-compuerta-acerrojada/',
  '/product/valvula-check-swing/',
  '/product/valvula-check-flex/',
  '/product/valvula-guillotina/',
  '/product/valvula-de-alivio-bridada/',
  '/product/valvula-flotadora-bridada/',
  '/product/valvula-reductora-de-presion/',
  '/product/valvula-embone-tipo-luflex/',
  '/product/valvula-compuerta-bridada/',
];

async function reduceStaticAssetRequests(browser: Browser) {
  await browser.route('**/*', async (route) => {
    const pathname = new URL(route.request.url).pathname;
    if (/\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|mp4)$/i.test(pathname)) {
      await route.abort();
      return;
    }
    await route.fallback();
  });
}

test('all 17 crawled routes load local content and survive refresh', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  await reduceStaticAssetRequests(browser);
  const failures: string[] = [];

  for (const route of routes) {
    await app.open(route);
    const page = await browser.evaluate(() => ({
      title: document.title.trim(),
      body: document.body.innerText.trim(),
      url: window.location.pathname,
    }));
    if (!page.title || page.body.length < 80 || page.body.includes('404')) failures.push(`${route}: missing or not-found content`);
    if (page.url !== route) failures.push(`${route}: landed at ${page.url}`);

    if (['/', '/shop/', '/product/valvula-check-flex/'].includes(route)) {
      await browser.reload();
      const afterRefresh = await browser.evaluate(() => document.body.innerText.trim().length);
      if (afterRefresh < 80) failures.push(`${route}: empty after refresh`);
    }
  }

  expect(failures).toEqual([]);
});

test('page titles stay in page content rather than the shared header', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  const paths = [
    '/', '/shop/', '/nosotros/', '/contactanos/', '/libro-de-reclamos/',
    '/product-category/valvulas-hierro-ductil/', '/hola-mundo/',
    '/product/valvula-check-flex/', '/product/valvula-check-swing/',
    '/product/valvula-compuerta-acerrojada/', '/product/valvula-compuerta-bridada/',
    '/product/valvula-de-alivio-bridada/', '/product/valvula-embone-tipo-luflex/',
    '/product/valvula-flotadora-bridada/', '/product/valvula-guillotina/',
    '/product/valvula-mariposa-excentrica/', '/product/valvula-reductora-de-presion/',
  ];
  const misplaced: string[] = [];
  for (const path of paths) {
    await app.open(path);
    const headings = await browser.evaluate(() => ({
      count: document.querySelectorAll('h1').length,
      inHeader: !!document.querySelector('.elementor-location-header h1'),
      inPage: !!document.querySelector('main h1, body > .elementor:not(.elementor-location-header):not(.elementor-location-footer) h1, .elementor-location-single h1'),
    }));
    if (headings.count !== 1 || headings.inHeader || !headings.inPage) misplaced.push(path);
  }
  expect(misplaced).toEqual([]);
});

test('footer links point to real local destinations', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  await app.open('/nosotros/');
  const links = await browser.evaluate(async () => {
    const expected = new Map([
      ['Válvulas Hierro dúctil', '/product-category/valvulas-hierro-ductil/'],
      ['Marcos y Tapas de buzón', '/shop/'], ['Tuberías HD', '/shop/'],
      ['Nosotros', '/nosotros/'], ['Productos', '/shop/'],
      ['Libro de Reclamos', '/libro-de-reclamos/'], ['All Products', '/shop/'],
      ['Brands', '/shop/'], ['Special Offers', '/shop/'],
      ['About Us', '/nosotros/'], ['Contact', '/contactanos/'],
    ]);
    const actual = Array.from(document.querySelectorAll('.elementor-location-footer a'))
      .map((anchor) => ({
        label: (anchor.textContent || '').replace(/\s+/g, ' ').trim(),
        href: (anchor as HTMLAnchorElement).getAttribute('href') || '',
      }))
      .filter((link) => expected.has(link.label));
    const statuses = await Promise.all(actual.map(async (link) => {
      try { return [link.label, link.href, (await fetch(link.href)).status] as const; }
      catch { return [link.label, link.href, 0] as const; }
    }));
    return { actual, expected: Array.from(expected.entries()), statuses };
  });
  expect(links.actual.map((link: { label: string; href: string }) => [link.label, link.href])).toEqual(links.expected);
  expect(links.statuses.every(([, , status]: readonly [string, string, number]) => status === 200)).toBe(true);
});

test('footer destination links navigate when selected', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  const destinations = [
    '/product-category/valvulas-hierro-ductil/', '/shop/', '/nosotros/',
    '/libro-de-reclamos/', '/contactanos/',
  ];
  for (const destination of destinations) {
    await app.open('/nosotros/');
    await browser.locator(`.elementor-location-footer a[href="${destination}"]`).first().click();
    await expect(browser).toHaveURL(destination);
  }
});

test('unknown mirror route returns a not found page', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  await reduceStaticAssetRequests(browser);
  await app.open('/ruta-qa-inexistente');
  const text = await browser.evaluate(() => document.body.innerText.trim());
  expect(text.length).toBeGreaterThan(0);
  expect(text.toLowerCase()).toMatch(/not found|404/);
});

test('legacy pages expose basic accessible structure and image alternatives', async ({ app, browser }) => {
  await routeMirrorResources(browser, app);
  const issues: string[] = [];
  const auditedRoutes = [
    '/',
    '/shop/',
    '/nosotros/',
    '/contactanos/',
    '/libro-de-reclamos/',
    '/product-category/valvulas-hierro-ductil/',
  ];

  for (const route of auditedRoutes) {
    await app.open(route);
    const audit = await browser.evaluate(() => ({
      h1Count: document.querySelectorAll('h1').length,
      missingAlt: Array.from(document.images)
        .filter((image) => !image.hasAttribute('alt'))
        .map((image) => image.currentSrc || image.src)
        .slice(0, 5),
      unnamedControls: Array.from(document.querySelectorAll('button, input, select, textarea'))
        .filter((element) => {
          const control = element as HTMLInputElement;
          if (control.type === 'hidden') return false;
          const labelled = control.labels?.length
            || control.getAttribute('aria-label')
            || control.getAttribute('aria-labelledby')
            || control.getAttribute('title')
            || control.value
            || control.textContent?.trim();
          return !labelled;
        })
        .map((element) => `${element.tagName.toLowerCase()}${element.getAttribute('type') ? `[type=${element.getAttribute('type')}]` : ''}${element.id ? `#${element.id}` : ''}${element.getAttribute('placeholder') ? `[placeholder=${element.getAttribute('placeholder')}]` : ''}`)
        .slice(0, 5),
    }));

    if (audit.h1Count !== 1) issues.push(`${route}: expected one H1, found ${audit.h1Count}`);
    for (const image of audit.missingAlt) issues.push(`${route}: image missing alt (${image})`);
    for (const control of audit.unnamedControls) issues.push(`${route}: unnamed control (${control})`);
  }

  expect(issues).toEqual([]);
});

test('mobile menu opens, exposes destinations, and closes with Escape', async ({ app, browser, screen }) => {
  await routeMirrorResources(browser, app);
  await browser.setViewport({ width: 390, height: 844 });
  await app.open('/');
  await expect
    .poll(() => browser.evaluate(() => (window as Window & { __fundigsacMirrorFixes?: string }).__fundigsacMirrorFixes ?? null))
    .toBe('loaded');

  const toggle = screen.getByRole('button', 'Menu Toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const opened = await browser.evaluate(() => ({
    expanded: document.querySelector('[aria-label="Menu Toggle"]')?.getAttribute('aria-expanded') ?? '',
    dropdownHidden: document.querySelector('.elementor-nav-menu--dropdown')?.getAttribute('aria-hidden') ?? '',
  }));
  expect(opened.expanded).toBe('true');
  expect(opened.dropdownHidden).toBe('false');

  await toggle.click();
  const toggledClosed = await browser.evaluate(() => document.querySelector('[aria-label="Menu Toggle"]')?.getAttribute('aria-expanded') ?? 'missing');
  expect(toggledClosed).toBe('false');

  await toggle.click();

  await browser.keyboard.press('Escape');
  const closed = await browser.evaluate(() => document.querySelector('[aria-label="Menu Toggle"]')?.getAttribute('aria-expanded') ?? 'missing');
  expect(closed).toBe('false');
});

test('desktop primary navigation reaches the main legacy pages', async ({ app, browser, screen }) => {
  await routeMirrorResources(browser, app);
  await browser.setViewport({ width: 1440, height: 900 });
  await app.open('/');

  for (const [label, path] of [
    ['Nosotros', '/nosotros/'],
    ['Productos', '/shop/'],
    ['Contáctanos', '/contactanos/'],
  ] as const) {
    await screen.getByRole('navigation', 'Menu').getByRole('link', label).click();
    await expect(browser).toHaveURL(path);
    await app.open('/');
  }
});

test('product search dialog opens, receives focusable input, and closes with Escape', async ({ app, browser, screen }) => {
  await routeMirrorResources(browser, app);
  await browser.setViewport({ width: 390, height: 844 });
  await app.open('/');
  await expect
    .poll(() => browser.evaluate(() => (window as Window & { __fundigsacMirrorFixes?: string }).__fundigsacMirrorFixes ?? null))
    .toBe('loaded');

  await browser.locator('.ekit_navsearch-button').click();
  const dialog = screen.getByRole('dialog', 'Buscar');
  await expect(dialog).toBeVisible();
  await expect(screen.getByPlaceholder('Search...')).toBeVisible();

  await browser.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('contact form treats the subject as text and rejects an invalid email', async ({ app, browser, screen }) => {
  await routeMirrorResources(browser, app);
  await app.open('/contactanos/');

  await screen.getByPlaceholder('Asunto').fill('Consulta sobre válvulas');
  await screen.getByPlaceholder('Email').fill('correo-invalido');
  const validity = await browser.evaluate(() => ({
    subjectType: (document.querySelector('#form-field-field_77c1063') as HTMLInputElement).type,
    invalidEmailIsRejected: !(document.querySelector('#form-field-email') as HTMLInputElement).checkValidity(),
  }));

  expect(validity.subjectType).toBe('text');
  expect(validity.invalidEmailIsRejected).toBe(true);
});

test('complaints form keeps required fields and preserves values while editing', async ({ app, browser, screen }) => {
  await routeMirrorResources(browser, app);
  await app.open('/libro-de-reclamos/');

  const documentNumber = screen.getByLabel('Nùmero de Documento');
  const emptyRequiredFieldIsInvalid = await browser.evaluate(
    () => !(document.querySelector('#form-field-field_a2318ab') as HTMLInputElement).checkValidity(),
  );
  expect(emptyRequiredFieldIsInvalid).toBe(true);

  await documentNumber.fill('12345678');
  await expect(documentNumber).toHaveValue('12345678');
  const required = await browser.evaluate(() => ({
    required: (document.querySelector('#form-field-field_a2318ab') as HTMLInputElement).required,
    validAfterValue: (document.querySelector('#form-field-field_a2318ab') as HTMLInputElement).checkValidity(),
  }));
  expect(required.required).toBe(true);
  expect(required.validAfterValue).toBe(true);
});
