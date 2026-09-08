const { Jimp } = require('jimp');

async function run() {
  const body = await Jimp.read('blue.png');
  const w = body.bitmap.width; // 213
  const h = body.bitmap.height; // 320

  let minY = h;
  for (let y = 10; y < 100; y++) {
    for (let x = 50; x < 150; x++) {
      const hex = body.getPixelColor(x, y);
      if ((hex & 0xFF) > 200) {
        const r = (hex >>> 24) & 0xFF;
        if (r < 60) {
          if (y < minY) minY = y;
        }
      }
    }
  }
  console.log(`BLUE Mast Top Y: ${minY}`);

  const green = await Jimp.read('green.png');
  const gw = green.bitmap.width; // 408
  const gh = green.bitmap.height; // 612
  let gminY = gh;
  for (let y = 50; y < 150; y++) {
    for (let x = 150; x < 250; x++) {
      const hex = green.getPixelColor(x, y);
      if ((hex & 0xFF) > 200) {
        const r = (hex >>> 24) & 0xFF;
        if (r < 60) {
          if (y < gminY) gminY = y;
        }
      }
    }
  }
  console.log(`GREEN Mast Top Y: ${gminY}`);
}
run();
