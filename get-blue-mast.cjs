const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setContent(`
    <img id="blue" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYDVoRnmkwz7tzJ8gCbdCE2MTCDkCpthRnaD6finiz_qOS43Y03FBorL9bje9AuhFswztA8TPBP0F_71PzHCbfJTlWUq_wA7AB6HdsD78n7vcEnkvS6mIdJcbeR6RWGa5S-Osnpz0qV0i4HEFBsVmmky5EWCeK6av8Xr-BRzRL_6RCHIAP4btmmRayw9E/s320/Helikopter%20Biru.png" crossorigin="anonymous" />
  `);
  await page.evaluate(async () => {
    const img = document.getElementById('blue');
    if (img.complete) return;
    return new Promise(r => { img.onload = r; img.onerror = r; });
  });
  const pos = await page.evaluate(() => {
    const img = document.getElementById('blue');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minY = canvas.height;
    for(let y=0; y<100; y++){
      // scan middle area for mast (width is 213, center is 106.5)
      for(let x=100; x<113; x++) {
        if (data[(y * canvas.width + x) * 4 + 3] > 100) {
          if (y < minY) minY = y;
        }
      }
    }
    return minY;
  });
  console.log('Blue Mast top Y:', pos);
  await browser.close();
})();
