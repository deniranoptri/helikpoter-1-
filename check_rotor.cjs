const { Jimp } = require('jimp');
async function check() {
  const img = await Jimp.read('rotor.png');
  console.log(`Rotor size: ${img.bitmap.width}x${img.bitmap.height}`);
  
  // Find where the visible parts are
  let topY = img.bitmap.height;
  let bottomY = 0;
  for (let y = 0; y < img.bitmap.height; y++) {
    for (let x = 0; x < img.bitmap.width; x++) {
      if ((img.getPixelColor(x, y) & 0xFF) > 50) {
        if (y < topY) topY = y;
        if (y > bottomY) bottomY = y;
      }
    }
  }
  console.log(`Visible rotor from Y=${topY} to Y=${bottomY}`);
}
check();
