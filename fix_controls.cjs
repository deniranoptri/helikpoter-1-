const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// Revert the bad patch
code = code.replace(
  'className={`flex gap-1 min-[400px]:gap-3 md:gap-6 items-center justify-center ${reverse ? \\\'flex-row-reverse\\\' : \\\'flex-row\\\'} origin-center`} style={{ transform: `scale(${Math.max(0.85, Math.min(1, compositionScaleRef.current * 1.5))})` }}',
  'className={`flex gap-1 min-[400px]:gap-3 md:gap-6 items-center justify-center ${reverse ? \'flex-row-reverse\' : \'flex-row\'} origin-center scale-[0.85] min-[400px]:scale-100`}'
);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Controls reverted');
