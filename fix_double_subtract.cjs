const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const badLogic = `  // RESPONSIVE COMPOSITION SCALE
  const controlDeckHeight = gameModeRef.current === 'SQUAD' ? 120 : (arenaSize.w < 600 ? 140 : 160);
  const hudOccupancy = 90;
  const groundVisualHeight = Math.max(40, 80 * (arenaSize.h < 600 ? 0.7 : 1));
  const availablePlayableHeight = Math.max(100, arenaSize.h - controlDeckHeight - hudOccupancy);
  const availablePlayableWidth = arenaSize.w;
  
  const scaleW = Math.min(1, availablePlayableWidth / 1024);
  const scaleH = Math.min(1, availablePlayableHeight / 600);`;

const goodLogic = `  // RESPONSIVE COMPOSITION SCALE
  const groundVisualHeight = Math.max(40, 80 * (arenaSize.h < 600 ? 0.7 : 1));
  const availablePlayableHeight = Math.max(100, arenaSize.h); // arenaRef is inside flex-1, already excludes HUD/Deck in DOM flow, except Question which is absolute but doesn't shrink main.
  const availablePlayableWidth = arenaSize.w;
  
  const scaleW = Math.min(1, availablePlayableWidth / 1024);
  const scaleH = Math.min(1, availablePlayableHeight / 600);`;

code = code.replace(badLogic, goodLogic);
fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed double subtract');
