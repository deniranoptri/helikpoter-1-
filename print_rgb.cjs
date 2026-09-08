const { Jimp } = require('jimp');
(async () => {
  const image = await Jimp.read('blue.png');
  for (let x=94; x<=102; x++) {
    const hex = image.getPixelColor(x, 37);
    const r = (hex >>> 24) & 0xFF;
    const g = (hex >>> 16) & 0xFF;
    const b = (hex >>> 8) & 0xFF;
    console.log(`x=${x}: r=${r} g=${g} b=${b}`);
  }
})();
