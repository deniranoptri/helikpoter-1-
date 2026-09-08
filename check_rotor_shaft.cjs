const { Jimp } = require('jimp');

async function run() {
  const rotor = await Jimp.read('rotor.png');
  const w = rotor.bitmap.width;
  const h = rotor.bitmap.height;

  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 140; x < 180; x++) { // Center shaft area
      const hex = rotor.getPixelColor(x, y);
      if ((hex & 0xFF) > 200) {
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Rotor shaft bottom Y: ${maxY}`);
}
run();
