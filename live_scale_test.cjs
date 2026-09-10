const puppeteer = require('puppeteer');
const express = require('express');

(async () => {
  const app = express();
  app.use(express.static('dist'));
  const server = app.listen(8126);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  const resolutions = [
    { w: 320, h: 568 },
    { w: 375, h: 667 },
    { w: 768, h: 1024 },
    { w: 1024, h: 768 },
    { w: 1280, h: 800 },
    { w: 1366, h: 768 },
    { w: 1920, h: 1080 }
  ];

  console.log("Viewport | Arena (W x H) | Heli DOM (W x H) | % Arena W | % Arena H");
  console.log("---------|---------------|------------------|-----------|-----------");

  for (const res of resolutions) {
    await page.setViewport({ width: res.w, height: res.h });
    await page.goto('http://127.0.0.1:8126/', { waitUntil: 'networkidle0' });

    // Click START (MULAI MISI)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.includes('MULAI') || b.textContent.includes('SOLO'));
      if (startBtn) { startBtn.click(); }
    });

    await new Promise(r => setTimeout(r, 2000));
    
    // Wait for the heli to appear
    try {
      await page.waitForSelector('img[alt="P1 Helicopter"]', { timeout: 2000 });
    } catch(e) {}

    const metrics = await page.evaluate(() => {
      // Find arena container
      const arena = document.querySelector('.bg-sky-200, .bg-sky-400') || document.querySelector('img[alt="P1 Helicopter"]')?.closest('div.relative.overflow-hidden');
      const heliImg = document.querySelector('img[alt="P1 Helicopter"]');
      
      if (!arena || !heliImg) return null;

      const aRect = arena.getBoundingClientRect();
      const hRect = heliImg.getBoundingClientRect();

      return {
        arenaW: aRect.width,
        arenaH: aRect.height,
        heliW: hRect.width,
        heliH: hRect.height
      };
    });

    if (metrics) {
      const pctW = ((metrics.heliW / metrics.arenaW) * 100).toFixed(1);
      const pctH = ((metrics.heliH / metrics.arenaH) * 100).toFixed(1);
      console.log(`${res.w}x${res.h} | ${Math.round(metrics.arenaW)}x${Math.round(metrics.arenaH)} | ${Math.round(metrics.heliW)}x${Math.round(metrics.heliH)} | ${pctW}% | ${pctH}%`);
    } else {
      console.log(`${res.w}x${res.h} | ERROR: Elements not found`);
    }
  }

  await browser.close();
  server.close();
  process.exit(0);
})();
