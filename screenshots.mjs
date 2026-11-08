import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const screenshotDir = '/opt/cursor/artifacts';

async function takeScreenshots() {
  await mkdir(screenshotDir, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Taking homepage screenshot...');
  await page.screenshot({ 
    path: `${screenshotDir}/homepage.png`, 
    fullPage: false 
  });

  console.log('Scrolling and taking video grid screenshot...');
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: `${screenshotDir}/video-grid.png`, 
    fullPage: false 
  });

  console.log('Testing search...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.getByPlaceholder('Search videos').fill('neural network');
  await page.waitForTimeout(1000);
  await page.screenshot({ 
    path: `${screenshotDir}/search-results.png`, 
    fullPage: false 
  });

  console.log('Taking filters screenshot...');
  await page.getByPlaceholder('Search videos').clear();
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: `${screenshotDir}/filters.png`, 
    fullPage: false 
  });

  console.log('Testing video click...');
  // Scroll down past the header
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  
  // Click first video card with force
  const firstVideo = page.locator('[role="button"]').first();
  await firstVideo.click({ force: true });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${screenshotDir}/video-player.png`, 
    fullPage: false 
  });

  console.log('Testing saved videos...');
  // Close player with ESC key
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  
  // Click Saved tab button in nav
  await page.locator('nav button').filter({ hasText: /^Saved/ }).click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: `${screenshotDir}/saved-videos.png`, 
    fullPage: false 
  });

  console.log('Testing mobile view...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${screenshotDir}/mobile-view.png`, 
    fullPage: false 
  });

  await browser.close();
  console.log('Screenshots saved to', screenshotDir);
}

takeScreenshots().catch(console.error);
