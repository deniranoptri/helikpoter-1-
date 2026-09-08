const { Jimp } = require('jimp');

async function testFit() {
  const body = await Jimp.read('green.png');
  const rotor = await Jimp.read('rotor.png');

  const w = body.bitmap.width;
  const h = body.bitmap.height;
  
  const rw = Math.round(w * 0.9);
  const rh = Math.round(h * 0.0625);
  rotor.resize({ w: rw, h: rh });

  for (let t = 8; t <= 15; t += 0.5) {
    const comp = body.clone();
    const topY = Math.round(h * (t / 100));
    const leftX = Math.round(w * 0.455) - Math.round(rw / 2);
    comp.composite(rotor, leftX, topY, {
      mode: Jimp.BLEND_SOURCE_OVER,
    });
    
    comp.write(`public/test_${t}.png`);
  }
}
testFit();
