const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// The crash is inside PlayerTouchControls because compositionScaleRef is defined inside the Arena component,
// but PlayerTouchControls is defined outside the Arena component scope.
// It should use the compScale prop instead of compositionScaleRef.current.

code = code.replace(
  '      <div className={`flex gap-1 min-[400px]:gap-3 md:gap-6 items-center justify-center ${reverse ? \'flex-row-reverse\' : \'flex-row\'} origin-center`} style={{ transform: `scale(${Math.max(0.85, Math.min(1, compositionScaleRef.current * 1.5))})` }}>',
  '      <div className={`flex gap-1 min-[400px]:gap-3 md:gap-6 items-center justify-center ${reverse ? \'flex-row-reverse\' : \'flex-row\'} origin-center`} style={{ transform: `scale(${Math.max(0.75, Math.min(1, (compScale || 1) * 1.5))})` }}>'
);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Crash fixed');
