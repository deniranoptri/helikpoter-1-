const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setContent(`
    <html>
      <head>
        <style>
          body { background: #1e293b; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { position: relative; width: 320px; outline: 1px solid rgba(255,0,0,0.5); }
          .body {
            position: relative;
            z-index: 10;
            width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
             <div class="absolute pointer-events-none z-0" style="position: absolute; width: 90%; height: 6.25%; top: 11%; left: 46%; transform: translateX(-50%); outline: 1px solid lime;">
               <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png" style="width: 100%; height: 100%; display: block; transform-origin: center center;" draggable="false" />
             </div>
          <img class="body" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYDVoRnmkwz7tzJ8gCbdCE2MTCDkCpthRnaD6finiz_qOS43Y03FBorL9bje9AuhFswztA8TPBP0F_71PzHCbfJTlWUq_wA7AB6HdsD78n7vcEnkvS6mIdJcbeR6RWGa5S-Osnpz0qV0i4HEFBsVmmky5EWCeK6av8Xr-BRzRL_6RCHIAP4btmmRayw9E/s320/Helikopter%20Biru.png" />
        </div>
      </body>
    </html>
  `);

  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 1000));
  
  const rects = await page.evaluate(() => {
    const anchor = document.querySelector('.absolute.pointer-events-none');
    const body = document.querySelector('.body');
    const ar = anchor.getBoundingClientRect();
    const br = body.getBoundingClientRect();
    return {
       anchor: { top: ar.top - br.top, center: ar.top + ar.height/2 - br.top, height: ar.height, left: ar.left - br.left, h_center: ar.left + ar.width/2 - br.left },
       body: { height: br.height, width: br.width }
    };
  });
  console.log(rects);
  
  await browser.close();
})();
