const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  await page.setContent(`
    <img id="blue" src="http://localhost:8080/new_blue.png" crossorigin="anonymous" />
  `);
  
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
    let mastX = null;
    
    // Find the very first non-transparent pixel from top
    for(let y=0; y<canvas.height; y++){
      for(let x=0; x<canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (data[i+3] > 50) {
          if (mastY === null) {
            mastY = y;
            mastX = x;
          }
        }
      }
      if (mastY !== null) break;
    }
    return { mastY, mastX, width: canvas.width, height: canvas.height };
  });
  console.log(pos);
  await browser.close();
  process.exit(0);
})();
