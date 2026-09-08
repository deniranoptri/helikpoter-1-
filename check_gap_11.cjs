const { Jimp } = require('jimp');
async function run() {
  const body = await Jimp.read('green.png');
  const rotor = await Jimp.read('rotor.png');

  const w = body.bitmap.width;
  const h = body.bitmap.height;
  
  const rw = Math.round(w * 0.9);
  const rh = Math.round(h * 0.0625);
  rotor.resize({ w: rw, h: rh });

  const comp = body.clone();
  const topY = Math.round(h * 0.115);
  const leftX = Math.round(w * 0.455) - Math.round(rw / 2);
  comp.composite(rotor, leftX, topY, {
    mode: Jimp.BLEND_SOURCE_OVER,
  });

  const cropped = comp.crop({x: 170, y: 70, w: 40, h: 40});
  
  const chars = " .:-=+*#%@";
  for(let y=0; y<40; y++) {
    let row = "";
    for(let x=0; x<40; x++) {
      const hex = cropped.getPixelColor(x,y);
      const a = hex & 0xff;
      if (a < 100) row += " ";
      else {
        const r = (hex>>>24)&0xff, g = (hex>>>16)&0xff, b = (hex>>>8)&0xff;
        const l = (r+g+b)/3;
        row += chars[Math.floor((l/255)*9)];
      }
    }
    console.log(row);
  }
}
run();
