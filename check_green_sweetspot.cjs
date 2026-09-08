const { Jimp } = require('jimp');

async function run() {
  const body = await Jimp.read('green.png');
  const rotor = await Jimp.read('rotor.png');

  const w = body.bitmap.width; // 408
  const h = body.bitmap.height; // 612
  
  const rw = Math.round(w * 0.9); // 367
  const rh = Math.round(h * 0.0625); // 38
  rotor.resize({ w: rw, h: rh });

  for (let percent of [9.5, 9.6, 9.7, 9.8]) {
    const comp = body.clone();
    const topY = Math.round(h * (percent / 100));
    const leftX = Math.round(w * 0.465) - Math.round(rw / 2); // 190 - 183 = 7
    comp.composite(rotor, leftX, topY, {
      mode: Jimp.BLEND_SOURCE_OVER,
    });

    console.log(`\n--- PERCENT: ${percent}% (topY = ${topY}) ---`);
    const cropped = comp.crop({x: 180, y: 78, w: 20, h: 10});
    
    const chars = " .:-=+*#%@";
    for(let y=0; y<10; y++) {
      let row = "";
      for(let x=0; x<20; x++) {
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
}
run();
