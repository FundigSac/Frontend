import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { routeMirrorResources } from './support.ts';

const modelUnavailable = process.env.AI_GATEWAY_API_KEY
  ? false
  : 'AI_GATEWAY_API_KEY is not configured and e2e reports no stored model login';

test('agent explores the primary navigation to contact', { skip: modelUnavailable, tags: ['exploratory'] }, async ({ app, agent, browser, screen }) => {
  await routeMirrorResources(browser, app);
  await app.open('/');
  await agent.act('Use the main navigation to open the contact page.');
  await expect(browser).toHaveURL('/contactanos/');
  await expect(screen.getByPlaceholder('Email')).toBeVisible();
});
