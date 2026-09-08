const { Jimp } = require('jimp');

async function check() {
  const image = await Jimp.read('green.png');
  let hasDarkPixels = false;
  for (let y = 10; y < 150; y++) {
    for (let x = 100; x < 300; x++) {
      const hex = image.getPixelColor(x, y);
      const a = hex & 0xFF;
      if (a > 200) {
        const r = (hex >>> 24) & 0xFF;
        const g = (hex >>> 16) & 0xFF;
        const b = (hex >>> 8) & 0xFF;
        if (r < 50 && g < 50 && b < 50) {
          hasDarkPixels = true;
          console.log(`Found dark pixel at ${x}, ${y} rgb(${r},${g},${b})`);
          break;
        }
      }
    }
    if (hasDarkPixels) break;
  }
}
check();
