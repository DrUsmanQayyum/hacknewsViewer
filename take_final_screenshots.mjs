import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const screenshotDir = '/opt/cursor/artifacts';

async function captureScreenshots() {
  await mkdir(screenshotDir, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Loading http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log('✓ Homepage loaded');
  await page.screenshot({ path: `${screenshotDir}/final-desktop-home.png` });

  console.log('Testing search...');
  await page.locator('input[placeholder*="Search"]').fill('neural network');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/final-desktop-search.png` });

  console.log('Testing video card click...');
  await page.locator('input[placeholder*="Search"]').clear();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  const firstCard = page.locator('[role="button"]').first();
  await firstCard.click({ force: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screenshotDir}/final-desktop-player.png` });

  console.log('Testing mobile view...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screenshotDir}/final-mobile.png` });

  await browser.close();
  console.log('\n✅ Final screenshots saved');
}

captureScreenshots().catch(console.error);
