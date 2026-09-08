const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png');
  const dims = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    for(let y=0; y<canvas.height; y++){
      for(let x=0; x<canvas.width; x++){
        const alpha = data[(y*canvas.width + x)*4 + 3];
        if(alpha > 10){
          if(x < minX) minX = x;
          if(x > maxX) maxX = x;
          if(y < minY) minY = y;
          if(y > maxY) maxY = y;
        }
      }
    }
    return {width: canvas.width, height: canvas.height, minX, minY, maxX, maxY};
  });
  console.log(dims);
  await browser.close();
})();
