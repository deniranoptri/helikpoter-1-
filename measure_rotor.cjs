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
        const r = (hex >>> 24) & 0xFF;
        const g = (hex >>> 16) & 0xFF;
        const b = (hex >>> 8) & 0xFF;
        const a = hex & 0xFF;
        if (a > 200 && r < 50 && g < 50 && b < 50) {
          hubPixels.push({ x, y });
        }
      }
    }

    if (hubPixels.length > 0) {
      const avgX = hubPixels.reduce((sum, p) => sum + p.x, 0) / hubPixels.length;
      console.log(`Rotor hub center: X=${avgX} (${(avgX / width * 100).toFixed(2)}%)`);
      console.log(`Rotor image size: ${width}x${height}`);
    } else {
      console.log("No hub pixels found");
    }
  } catch (e) {
    console.error(e);
  }
})();
