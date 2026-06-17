/**
 * Render a CV to a PDF (A4) by driving Chromium to the owner-only /print/[cvId] page — the
 * same components and compiled CSS as on screen, so the PDF is faithful (Principle II, FR-012).
 * The caller's auth cookie is forwarded so the private print page renders for the owner.
 *
 * Two engines: production (Vercel/Lambda, Linux) uses puppeteer-core + the size-optimized
 * @sparticuz/chromium; local dev/test uses Playwright's Chromium (puppeteer-core cannot spawn
 * Playwright's build on some platforms, and there is no guaranteed system browser).
 */
export async function renderCVPdf({
  cvId,
  cookie,
  origin,
}: {
  cvId: string;
  cookie: string;
  origin: string;
}): Promise<Uint8Array> {
  const url = `${origin}/print/${cvId}`;
  const margin = { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' };

  if (process.env.NODE_ENV === 'production') {
    const chromium = (await import('@sparticuz/chromium')).default;
    const { default: puppeteer } = await import('puppeteer-core');
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    try {
      const page = await browser.newPage();
      if (cookie) await page.setExtraHTTPHeaders({ cookie });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });
      return await page.pdf({ format: 'A4', printBackground: true, margin });
    } finally {
      await browser.close();
    }
  }

  // Local dev/test.
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext(cookie ? { extraHTTPHeaders: { cookie } } : {});
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
    await page.evaluate(() => (document as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready);
    return await page.pdf({ format: 'A4', printBackground: true, margin });
  } finally {
    await browser.close();
  }
}
