const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// 1. Add compScale prop to PlayerTouchControls
code = code.replace(
  '  keyStateRef: React.MutableRefObject<any>;\n  inputManager?: any;\n}) => {',
  '  keyStateRef: React.MutableRefObject<any>;\n  inputManager?: any;\n  compScale?: number;\n}) => {'
);

// 2. Use compScale
code = code.replace(
  'className={`flex gap-1 min-[400px]:gap-3 md:gap-6 items-center justify-center ${reverse ? \'flex-row-reverse\' : \'flex-row\'} origin-center scale-[0.85] min-[400px]:scale-100`}',
  'className={`flex gap-1 min-[400px]:gap-3 md:gap-6 items-center justify-center ${reverse ? \'flex-row-reverse\' : \'flex-row\'} origin-center`} style={{ transform: `scale(${Math.max(0.75, Math.min(1, (compScale || 1) * 1.5))})` }}'
);

// 3. Pass compositionScale to PlayerTouchControls
code = code.replace(/<PlayerTouchControls /g, '<PlayerTouchControls compScale={compositionScale} ');

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Controls prop added');
