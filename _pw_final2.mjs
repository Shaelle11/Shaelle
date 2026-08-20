import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/v2-hero.png' });

// check scrollbar is hidden but scroll works
const info = await page.evaluate(() => {
  const track = document.querySelector('nav').nextElementSibling.firstElementChild;
  const cs = getComputedStyle(track);
  return { scrollbarWidth: cs.scrollbarWidth, overflowX: cs.overflowX, scrollWidth: track.scrollWidth, clientWidth: track.clientWidth };
});
console.log('track info:', JSON.stringify(info));

// wheel scroll (vertical deltaY) should move to next section
await page.mouse.move(700, 400);
await page.mouse.wheel(0, 900);
await page.waitForTimeout(500);
const scrollLeftAfterWheel = await page.evaluate(() => document.querySelector('nav').nextElementSibling.firstElementChild.scrollLeft);
console.log('scrollLeft after vertical wheel:', scrollLeftAfterWheel);
await page.screenshot({ path: '/tmp/v2-after-wheel.png' });

// go back via dot click (dot 0, bottom right)
const dots = await page.$$('button[aria-label^="Go to section"]');
console.log('dot count:', dots.length);
await dots[0].click();
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/v2-back-to-hero.png' });

// native horizontal wheel (deltaX) test
await dots[1].click();
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/v2-showcase-settled.png' });

console.log('console errors:', JSON.stringify(errors));
await browser.close();
