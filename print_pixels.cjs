const { Jimp } = require('jimp');

(async () => {
  try {
    const image = await Jimp.read('blue.png');
    console.log("Blue image width:", image.bitmap.width);
    let row = '';
    // Look at y=37
    for (let x=85; x<115; x++) {
      const hex = image.getPixelColor(x, 37);
      const a = hex & 0xFF;
      row += a > 200 ? 'X' : '.';
    }
    console.log("y=37 (x=85 to 114):", row);
  } catch (e) { console.error(e); }
})();
