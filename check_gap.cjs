const { Jimp } = require('jimp');
async function run() {
  const comp = await Jimp.read('public/test_9.5.png');
  // Crop around the mast to see what it looks like in ascii
  const cropped = comp.crop(170, 70, 40, 40);
  
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
