const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  await page.setContent(`
    <img id="blue" src="file://${path.resolve('./new_blue.png')}" />
  `);
  
  // Wait for the image to fully load
  await page.evaluate(async () => {
    const img = document.getElementById('blue');
    if (img.complete) return;
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  const pos = await page.evaluate(() => {
    const img = document.getElementById('blue');
    if (img.naturalWidth === 0) return { error: 'naturalWidth is 0' };

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    let mastY = null;
    let minX = canvas.width, maxX = 0;
    
    for(let y=0; y<canvas.height; y++){
      // scan middle area X: 80 to 130
      for(let x=80; x<130; x++) {
        const i = (y * canvas.width + x) * 4;
        if (data[i+3] > 50) {
          if (mastY === null) mastY = y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    return { mastY, minX, maxX, width: canvas.width, height: canvas.height };
  });
  console.log(pos);
  await browser.close();
})();
