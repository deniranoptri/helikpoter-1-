const { Jimp } = require('jimp');

async function run() {
  const body = await Jimp.read('blue.png');
  const w = body.bitmap.width; // 213
  const h = body.bitmap.height; // 320

  let minX = w, maxX = 0, minY = h;
  
  for (let y = 10; y < 100; y++) {
    for (let x = 50; x < 150; x++) {
      const hex = body.getPixelColor(x, y);
      const a = hex & 0xFF;
      if (a > 200) {
        const r = (hex >>> 24) & 0xFF;
        const g = (hex >>> 16) & 0xFF;
        const b = (hex >>> 8) & 0xFF;
        
        // Dark pixels
        if (r < 60 && g < 60 && b < 60) {
          if (y < minY) minY = y;
          if (y < 45) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }
    }
  }

  const centerX = (minX + maxX) / 2;
  console.log(`Mast Top Y: ${minY} ( ${((minY/h)*100).toFixed(4)}% )`);
  console.log(`Mast Center X: ${centerX} ( ${((centerX/w)*100).toFixed(4)}% )`);
}
run();
