const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  await page.setContent(`
    <img id="rotor" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png" crossorigin="anonymous" />
  `);
  
  await page.evaluate(async () => {
    const img = document.getElementById('rotor');
    if (img.complete) return;
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  const pos = await page.evaluate(() => {
    const img = document.getElementById('rotor');
    if (img.naturalWidth === 0) return { error: 'naturalWidth is 0' };

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; // 320
    canvas.height = img.naturalHeight; // 160
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Find non-transparent bounding box to find true visual center
    let minX = canvas.width, maxX = 0;
    let minY = canvas.height, maxY = 0;
    for(let y=0; y<canvas.height; y++){
      for(let x=0; x<canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (data[i+3] > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    return { minX, maxX, minY, maxY, width: canvas.width, height: canvas.height };
  });
  console.log(pos);
  await browser.close();
})();
