// LCP real con throttling DevTools (RTT 150 ms, 1,6 Mbps, CPU 4×), versiones intercaladas. Uso: node real.cjs <ruta> <n>
const { chromium } = require('/Volumes/Programas/FundigSac/frontend/node_modules/@playwright/test');
const route = process.argv[2] || '/';
const N = +(process.argv[3] || 5);
const servers = { antes: 'http://127.0.0.1:3201', despues: 'http://127.0.0.1:3200' };
const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: '2026-10', source: 'banner', savedAt: new Date().toISOString() }));
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const res = { antes: [], despues: [] };
  for (let i = 0; i < N; i++) for (const [name, base] of Object.entries(servers)) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
    await ctx.addCookies([{ name: 'fundigsac-consent', value: consent, url: base }]);
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.addInitScript(() => { window.__lcp = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({ t: e.startTime, url: (e.url || '').split('/').pop(), tag: e.element && e.element.tagName }); }).observe({ type: 'largest-contentful-paint', buffered: true }); });
    await p.goto(base + route, { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(2500);
    const d = await p.evaluate(() => {
      const l = window.__lcp[window.__lcp.length - 1] || {};
      const lcpT = l.t || 0;
      const before = performance.getEntriesByType('resource').filter((e) => e.responseEnd <= lcpT);
      const kb = Math.round(before.reduce((s, e) => s + (e.transferSize || 0), 0) / 1024);
      const imgs = performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'img' || /\.webp|\.png|\.jpg/.test(e.name)).filter((e) => e.startTime < lcpT).map((e) => e.name.split('/').pop() + '@' + Math.round(e.startTime) + '-' + Math.round(e.responseEnd));
      return { lcp: Math.round(lcpT), el: (l.tag || '') + ' ' + (l.url || ''), kbBeforeLcp: kb, imgs };
    });
    res[name].push(d);
    await ctx.close();
  }
  const med = (a) => a.map((x) => x.lcp).sort((x, y) => x - y)[Math.floor(a.length / 2)];
  for (const k of ['antes', 'despues']) {
    console.log(k, 'mediana LCP', med(res[k]), 'runs', res[k].map((x) => x.lcp).join(','), '| KB antes del LCP', res[k].map((x) => x.kbBeforeLcp).join(','), '|', res[k][0].el);
    console.log('   imgs antes del LCP (1ª pasada):', res[k][0].imgs.join('  '));
  }
  await b.close();
})();
