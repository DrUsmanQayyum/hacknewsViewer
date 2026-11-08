import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const screenshotDir = '/opt/cursor/artifacts';

async function verifyApp() {
  await mkdir(screenshotDir, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  
  // Desktop tests
  console.log('\n=== DESKTOP VERIFICATION (1280x800) ===\n');
  const desktop = await browser.newContext({ 
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });
  const desktopPage = await desktop.newPage();

  console.log('Loading production build...');
  await desktopPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);

  // Check computed styles
  console.log('\nVerifying computed styles:');
  const headerBg = await desktopPage.locator('header').first().evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  console.log('  Header background:', headerBg);
  
  const videoCard = await desktopPage.locator('[role="button"]').first().evaluate(el => ({
    bg: window.getComputedStyle(el).backgroundColor,
    borderRadius: window.getComputedStyle(el).borderRadius,
    width: window.getComputedStyle(el).width,
  }));
  console.log('  Video card:', JSON.stringify(videoCard, null, 2));

  const searchInput = await desktopPage.locator('input[placeholder*="Search"]').evaluate(el => ({
    bg: window.getComputedStyle(el).backgroundColor,
    padding: window.getComputedStyle(el).padding,
    border: window.getComputedStyle(el).border,
  }));
  console.log('  Search input:', JSON.stringify(searchInput, null, 2));

  console.log('\nTaking desktop homepage...');
  await desktopPage.screenshot({ 
    path: `${screenshotDir}/desktop-home-verified.png`, 
    fullPage: false 
  });

  console.log('Testing search...');
  await desktopPage.getByPlaceholder('Search videos').fill('neural network');
  await desktopPage.waitForTimeout(1000);
  const searchResults = await desktopPage.locator('[role="button"]').count();
  console.log(`  Found ${searchResults} search results`);
  await desktopPage.screenshot({ 
    path: `${screenshotDir}/desktop-search-verified.png`, 
    fullPage: false 
  });

  console.log('Testing filters...');
  await desktopPage.getByPlaceholder('Search videos').clear();
  await desktopPage.waitForTimeout(500);
  await desktopPage.selectOption('select:has-text("Content Type")', 'talk');
  await desktopPage.waitForTimeout(500);
  const filteredResults = await desktopPage.locator('[role="button"]').count();
  console.log(`  Filtered to ${filteredResults} talks`);
  await desktopPage.screenshot({ 
    path: `${screenshotDir}/desktop-filters-verified.png`, 
    fullPage: false 
  });

  console.log('Testing video player...');
  await desktopPage.selectOption('select:has-text("Content Type")', 'all');
  await desktopPage.waitForTimeout(500);
  await desktopPage.evaluate(() => window.scrollTo(0, 400));
  await desktopPage.waitForTimeout(300);
  await desktopPage.locator('[role="button"]').first().click({ force: true });
  await desktopPage.waitForTimeout(2000);
  const playerVisible = await desktopPage.locator('iframe[src*="youtube"]').isVisible();
  console.log(`  Player visible: ${playerVisible}`);
  await desktopPage.screenshot({ 
    path: `${screenshotDir}/desktop-player-verified.png`, 
    fullPage: false 
  });

  console.log('Testing save functionality...');
  const saveButton = desktopPage.locator('button[aria-label*="Save"]').first();
  await saveButton.click();
  await desktopPage.waitForTimeout(300);
  console.log('  Video saved');

  console.log('Closing player...');
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(500);

  console.log('Testing watch history...');
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(300);
  const watchedButton = desktopPage.locator('nav button').filter({ hasText: /^Watched/ });
  await watchedButton.click();
  await desktopPage.waitForTimeout(1000);
  const watchedCount = await desktopPage.locator('[role="button"]').count();
  console.log(`  Watched videos: ${watchedCount}`);

  console.log('Testing saved videos...');
  const savedButton = desktopPage.locator('nav button').filter({ hasText: /^Saved/ });
  await savedButton.click();
  await desktopPage.waitForTimeout(1000);
  const savedCount = await desktopPage.locator('[role="button"]').count();
  console.log(`  Saved videos: ${savedCount}`);
  await desktopPage.screenshot({ 
    path: `${screenshotDir}/desktop-saved-verified.png`, 
    fullPage: false 
  });

  // Check localStorage
  const localStorage = await desktopPage.evaluate(() => ({
    watched: localStorage.getItem('hacknewsviewer_watched'),
    saved: localStorage.getItem('hacknewsviewer_saved'),
  }));
  console.log('\nLocalStorage persistence:');
  console.log('  Watched:', localStorage.watched ? 'YES' : 'NO');
  console.log('  Saved:', localStorage.saved ? 'YES' : 'NO');

  await desktop.close();

  // Mobile tests
  console.log('\n=== MOBILE VERIFICATION (375x812) ===\n');
  const mobile = await browser.newContext({ 
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobile.newPage();

  console.log('Loading on mobile...');
  await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  const mobileVideoCard = await mobilePage.locator('[role="button"]').first().evaluate(el => ({
    width: window.getComputedStyle(el).width,
    display: window.getComputedStyle(el).display,
  }));
  console.log('  Mobile video card:', JSON.stringify(mobileVideoCard, null, 2));

  await mobilePage.screenshot({ 
    path: `${screenshotDir}/mobile-verified.png`, 
    fullPage: false 
  });

  console.log('Testing mobile filter toggle...');
  const filterToggle = mobilePage.getByText('Show Filters');
  if (await filterToggle.isVisible()) {
    console.log('  Filter toggle visible (correct for mobile)');
  }

  await mobile.close();
  await browser.close();
  
  console.log('\n✅ Verification complete. Screenshots saved to', screenshotDir);
}

verifyApp().catch(console.error);
