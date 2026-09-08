const { Jimp } = require('jimp');

async function run() {
  const body = await Jimp.read('green.png');
  const w = body.bitmap.width; // 408
  const h = body.bitmap.height; // 612

  // The black mast is around X=170..210, Y=70..100
  let minX = w, maxX = 0, minY = h;
  
  for (let y = 50; y < 150; y++) {
    for (let x = 150; x < 250; x++) {
      const hex = body.getPixelColor(x, y);
      const a = hex & 0xFF;
      if (a > 200) {
        const r = (hex >>> 24) & 0xFF;
        const g = (hex >>> 16) & 0xFF;
        const b = (hex >>> 8) & 0xFF;
        
        // Dark pixels
        if (r < 60 && g < 60 && b < 60) {
          if (y < minY) minY = y;
          if (y < 90) { // Top part of the mast
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
  console.log(`Mast Width: ${maxX - minX}`);

  const rotor = await Jimp.read('rotor.png');
  // Rotor original size: 320x160
  // Rendered size: 367x38
  // Let's find the exact bottom center of the rotor shaft in its rendered size.
  const rw = Math.round(w * 0.9);
  const rh = Math.round(h * 0.0625);
  rotor.resize({ w: rw, h: rh });

  let rotorBottomY = 0;
  let rMinX = rw, rMaxX = 0;
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const hex = rotor.getPixelColor(x, y);
      if ((hex & 0xFF) > 100) {
        const r = (hex >>> 24) & 0xFF;
        const g = (hex >>> 16) & 0xFF;
        const b = (hex >>> 8) & 0xFF;
        if (r < 60 && g < 60 && b < 60) {
          if (y > rotorBottomY) {
            rotorBottomY = y;
            rMinX = x;
            rMaxX = x;
          } else if (y === rotorBottomY) {
            if (x < rMinX) rMinX = x;
            if (x > rMaxX) rMaxX = x;
          }
        }
      }
    }
  }
  
  const rotorCenterX = (rMinX + rMaxX) / 2;
  console.log(`Rotor Bottom Y offset within rotor image: ${rotorBottomY}`);
  console.log(`Rotor Shaft Center X within rotor image: ${rotorCenterX}`);
  
  // We want: 
  // rotorLeftX + rotorCenterX = bodyMastCenterX
  const idealLeftX = centerX - rotorCenterX;
  const idealLeftPercent = (idealLeftX / w) * 100;

  // We want:
  // rotorTopY + rotorBottomY = bodyMastTopY  (or maybe slightly lower to overlap)
  const idealTopY = minY - rotorBottomY + 2; // +2 pixels for slight overlap
  const idealTopPercent = (idealTopY / h) * 100;

  console.log(`IDEAL LEFT %: ${idealLeftPercent.toFixed(4)}`);
  console.log(`IDEAL TOP %: ${idealTopPercent.toFixed(4)}`);
}
run();
