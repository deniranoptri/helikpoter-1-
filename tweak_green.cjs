const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  await page.setContent(`
    <html>
      <head>
        <style>
          body { background: #8bc34a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .heli-container { position: relative; width: 408px; }
          .rotor-container { position: absolute; pointer-events: none; z-index: 0; transform: translateX(-50%); }
          .rotor-container img { width: 100%; height: 100%; display: block; }
          .body-img { width: 100%; height: auto; display: block; position: relative; z-index: 10; opacity: 0.8; }
        </style>
      </head>
      <body>
        <!-- 9.5% -->
        <div class="heli-container" style="margin-right: 20px;">
          <div class="rotor-container" style="width: 90%; height: 6.25%; top: 9.5%; left: 45.5%;">
             <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png" />
          </div>
          <img src="https://raw.githubusercontent.com/deniranoptri/media/sibungas/Helikopter%20Hijau.png" class="body-img" />
          <div style="position:absolute; bottom: -20px; color: black;">9.5%, 45.5%</div>
        </div>

        <!-- 11.5% -->
        <div class="heli-container" style="margin-right: 20px;">
          <div class="rotor-container" style="width: 90%; height: 6.25%; top: 11.5%; left: 45.5%;">
             <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png" />
          </div>
          <img src="https://raw.githubusercontent.com/deniranoptri/media/sibungas/Helikopter%20Hijau.png" class="body-img" />
          <div style="position:absolute; bottom: -20px; color: black;">11.5%, 45.5%</div>
        </div>
        
        <!-- 13.5% -->
        <div class="heli-container">
          <div class="rotor-container" style="width: 90%; height: 6.25%; top: 13.5%; left: 45.5%;">
             <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png" />
          </div>
          <img src="https://raw.githubusercontent.com/deniranoptri/media/sibungas/Helikopter%20Hijau.png" class="body-img" />
          <div style="position:absolute; bottom: -20px; color: black;">13.5%, 45.5%</div>
        </div>
      </body>
    </html>
  `);

  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'tweak_green.png' });
  console.log('Saved to tweak_green.png');
  await browser.close();
})();
