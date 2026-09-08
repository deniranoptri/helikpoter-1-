const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgi6IK6pI_i4kyKTdQcTg2SzXlAN-ad5yaLuNg5d8mc_JaCKaq2aVmYZx7U15RpptTLSt8bywjuWUStiwKNBm5JYExwc-9Jbu0r__ixm6xN5_Egl8JHp7_I71w39knNzU-wrIOUq2KyKsJBi7NFq79XaV0_KhGRURFNA1LWbD6lbN6rxa1HeKdLsKQjAr0/s320/Heli%20Hijau.png');
  const dims = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let rows = [];
    for(let y=0; y<30; y++){
      let rowMinX = canvas.width, rowMaxX = 0;
      for(let x=0; x<canvas.width; x++){
        const alpha = data[(y*canvas.width + x)*4 + 3];
        if(alpha > 10){
          if(x < rowMinX) rowMinX = x;
          if(x > rowMaxX) rowMaxX = x;
        }
      }
      if(rowMaxX >= rowMinX) {
        rows.push({y, width: rowMaxX - rowMinX, minX: rowMinX, maxX: rowMaxX});
      }
    }
    return rows;
  });
  console.log(dims);
  await browser.close();
})();
