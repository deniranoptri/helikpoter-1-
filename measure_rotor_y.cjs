const { Jimp } = require('jimp');
(async () => {
  try {
    const image = await Jimp.read('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png');
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    let hubPixels = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const hex = image.getPixelColor(x, y);
        const a = hex & 0xFF;
        if (a > 200) {
          const r = (hex >>> 24) & 0xFF;
          const g = (hex >>> 16) & 0xFF;
          const b = (hex >>> 8) & 0xFF;
          if (r < 50 && g < 50 && b < 50) {
            hubPixels.push({ x, y });
          }
        }
      }
    }

    if (hubPixels.length > 0) {
      let minY = height, maxY = 0;
      for (let p of hubPixels) {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      console.log(`Rotor hub Y range: ${minY} to ${maxY}`);
      const center = (minY + maxY) / 2;
      console.log(`Rotor hub center Y: ${center} (${(center / height * 100).toFixed(2)}%)`);
    }
  } catch (e) { console.error(e); }
})();
