const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const urls = [
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1wRCLOiafO4j-_RG5cyUgccRJBqjpKn2r5osJyH4euoj0T80kUEwojKyjNCBTgb1vLXfv_jy9tQhS4qv2_7_PtF7tUj-r7wlxCloM8gQEAnWmEvtFwyhESiOVSZRtbo-VCyznODkWDT44aMK-uk0fFUGYOsq-nLp9KIj-YNGkNOPThFnWxG87uZhiAUw/s320/Heli%20Biru.png',
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFlxHGzgQHzyplTGsWrcQ2rhyphenhyphenNuOYCzq1QNs1rFV914fYChdef_zquYMJOTVlhRAyeuOsNbtfLGsOl2zpX0NAbU4cScLMoI4uksob5hP-542UgkF9SUbmMNzerWwbhTQ_G01epont9gP9cNewNcVP0mQLAO6T9RqL_GlfB0i0Yw6iNcAbYMFEFBhhQqzc/s320/Heli%20Kuning.png',
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgj2sZ1m9jW1vIWS2O-XIYc9wiblbXKdvIZRzhza0hUxZaMsJwf-oroDSoxWksq37KmWSSqf8fW6bzbG1sMpjomTARiXj8iVVw9s6G5O_QNjg_5l-WKAdw6fETUtJTxXWgYtDuXqkyBNFEYr3q8tVe3eDKxXBm8-CGj7ABh9jt2eomlLTccuGWU0OBzUCY/s320/Heli%20Merah.png'
  ];
  for (const url of urls) {
    const page = await browser.newPage();
    await page.goto(url);
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
      return {url: location.href, minX, minY, maxX, maxY};
    });
    console.log(dims);
  }
  await browser.close();
})();
