import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';

const chromiumPath = execSync('which chromium || which chromium-browser || which google-chrome').toString().trim();

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  const title = await page.evaluate(() => document.title);
  const desc = await page.evaluate(() => document.querySelector('meta[name="description"]')?.content);
  console.log('document.title: ' + title);
  console.log('meta description: ' + desc);
  await browser.close();
})();
