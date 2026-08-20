import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

const track = await page.evaluateHandle(() => document.querySelector('nav').nextElementSibling.firstElementChild);
await page.evaluate((t) => { t.classList.remove('snap-x', 'snap-mandatory', 'scroll-smooth'); }, track);

for (const pct of [0.6, 0.8, 0.95]) {
  await page.evaluate(({ t, p }) => { t.scrollLeft = t.clientWidth * p; }, { t: track, p: pct });
  await page.waitForTimeout(180);
  await page.screenshot({ path: `/tmp/fall-${Math.round(pct*100)}.png` });
}
await browser.close();
