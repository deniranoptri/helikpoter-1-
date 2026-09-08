const { Jimp } = require('jimp');

async function check(name) {
  const image = await Jimp.read(name + '.png');
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  let mastPixels = [];
  for (let y = 10; y < 150; y++) {
    for (let x = 30; x < width - 30; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >>> 24) & 0xFF;
      const g = (hex >>> 16) & 0xFF;
      const b = (hex >>> 8) & 0xFF;
      const a = hex & 0xFF;
      // We look for the dark black pixels of the mast
      if (a > 200 && r < 50 && g < 50 && b < 50) {
        mastPixels.push({ x, y });
      }
    }
  }

  mastPixels.sort((a, b) => a.y - b.y);

  if (mastPixels.length > 0) {
    const top = mastPixels.slice(0, 3);
    const avgX = top.reduce((sum, p) => sum + p.x, 0) / top.length;
    const avgY = top.reduce((sum, p) => sum + p.y, 0) / top.length;
    console.log(`${name.padEnd(8)} -> Size: ${width}x${height} | Mast tip: X=${avgX.toFixed(2)} (${(avgX / width * 100).toFixed(2)}%), Y=${avgY.toFixed(2)} (${(avgY / height * 100).toFixed(2)}%)`);
  } else {
    console.log(`${name.padEnd(8)} -> Mast not found`);
  }
}

(async () => {
  for (let c of ['blue', 'green', 'yellow', 'red']) {
    await check(c);
  }
})();
