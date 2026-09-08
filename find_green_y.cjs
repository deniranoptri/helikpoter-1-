const { Jimp } = require('jimp');

async function findGreenIdeal() {
  const body = await Jimp.read('green.png');
  const rotor = await Jimp.read('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png'); 

  const bodyW = body.bitmap.width;
  const bodyH = body.bitmap.height;

  const renderWidth = Math.round(bodyW * 0.9);
  const renderHeight = Math.round(bodyH * 0.0625);
  rotor.resize({ w: renderWidth, h: renderHeight });

  // Find mast tip Y
  let mastTipY = bodyH;
  for (let y = 10; y < 150; y++) {
    for (let x = 30; x < bodyW - 30; x++) {
      const h = body.getPixelColor(x, y);
      const a = h & 0xFF;
      if (a > 200) {
        const r = (h >>> 24) & 0xFF, g = (h >>> 16) & 0xFF, b = (h >>> 8) & 0xFF;
        if (r < 50 && g < 50 && b < 50) {
          if (y < mastTipY) {
            mastTipY = y;
          }
        }
      }
    }
  }

  // Find rotor bottom offset relative to topY
  let rotorBottomOffset = 0;
  for (let y = 0; y < renderHeight; y++) {
    for (let x = 0; x < renderWidth; x++) {
      const h = rotor.getPixelColor(x, y);
      if ((h & 0xFF) > 200) {
        const r = (h >>> 24) & 0xFF, g = (h >>> 16) & 0xFF, b = (h >>> 8) & 0xFF;
        if (r < 50 && g < 50 && b < 50) {
          if (y > rotorBottomOffset) {
            rotorBottomOffset = y;
          }
        }
      }
    }
  }

  // We want topY + rotorBottomOffset = mastTipY
  const idealTopY = mastTipY - rotorBottomOffset;
  const idealTopPercent = (idealTopY / bodyH) * 100;
  console.log(`Green Mast Y: ${mastTipY}`);
  console.log(`Rotor bottom offset: ${rotorBottomOffset}`);
  console.log(`Ideal Top Y: ${idealTopY}`);
  console.log(`Ideal Top Percent: ${idealTopPercent}%`);
}

findGreenIdeal();
