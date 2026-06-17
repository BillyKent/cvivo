// Capture screenshots of the running app for visual review.
// Usage: node scripts/screenshot.mjs /              (defaults to "/")
//        node scripts/screenshot.mjs / /signup /signin
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const paths = process.argv.slice(2);
if (paths.length === 0) paths.push('/');

mkdirSync('.screenshots', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const p of paths) {
  await page.goto(BASE + p, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const name = p === '/' ? 'home' : p.replace(/\//g, '_').replace(/^_/, '');
  const file = `.screenshots/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log('saved', file);
}

await browser.close();
