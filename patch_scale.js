const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// 1. Add state and update in observer
code = code.replace(
  'const arenaRectRef = useRef({ width: 1200, height: 800, left: 0, top: 0 });',
  `const arenaRectRef = useRef({ width: 1200, height: 800, left: 0, top: 0 });\n  const [arenaSize, setArenaSize] = React.useState({ w: window.innerWidth, h: window.innerHeight });`
);

code = code.replace(
  '          top: rect.top\n        };',
  `          top: rect.top\n        };\n        setArenaSize({ w: rect.width, h: rect.height });`
);

code = code.replace(
  '    arenaRectRef.current = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };',
  `    arenaRectRef.current = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };\n    setArenaSize({ w: rect.width, h: rect.height });`
);

// 2. Replace VISUAL_SCALE constant with dynamic responsive scale
const oldScale = '  const VISUAL_SCALE = 0.5;';
const newScale = `  // RESPONSIVE COMPOSITION SCALE
  const controlDeckHeight = gameModeRef.current === 'SQUAD' ? 120 : (arenaSize.w < 600 ? 140 : 160);
  const hudOccupancy = 90;
  const groundVisualHeight = Math.max(40, 80 * (arenaSize.h < 600 ? 0.7 : 1));
  const availablePlayableHeight = Math.max(100, arenaSize.h - controlDeckHeight - hudOccupancy);
  const availablePlayableWidth = arenaSize.w;
  
  const scaleW = Math.min(1, availablePlayableWidth / 1024);
  const scaleH = Math.min(1, availablePlayableHeight / 600);
  
  // Dynamic composition scale
  const compositionScale = Math.max(0.45, Math.min(1, Math.min(scaleW, scaleH)));
  
  const VISUAL_SCALE = 0.5 * compositionScale;
  const FIRE_VISUAL_SCALE = 0.85 * compositionScale;`;

code = code.replace(oldScale, newScale);
fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Scale setup patched');
