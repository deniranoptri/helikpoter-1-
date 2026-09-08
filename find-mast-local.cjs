const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setContent(`
    <img id="heli" src="file://${path.resolve('./old_green.png')}" />
    <img id="blue" src="file://${path.resolve('./new_blue.png')}" />
  `);
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 1000));
  const pos = await page.evaluate(() => {
    const img = document.getElementById('heli');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    let oldY = null;
    for(let y=0; y<canvas.height; y++){
      const i = (y * canvas.width + 106) * 4;
      if (data[i+3] > 50) {
        oldY = y;
        break;
      }
    }

    const imgBlue = document.getElementById('blue');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBlue, 0, 0);
    const dataBlue = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let blueY = null;
    for(let y=0; y<canvas.height; y++){
      const i = (y * canvas.width + 106) * 4;
      if (dataBlue[i+3] > 50) {
        blueY = y;
        break;
      }
    }

    return { oldY, blueY };
  });
  console.log(pos);
  await browser.close();
})();
