const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const target1 = `         // Safe horizontal spacing avoiding negative available width on narrow screens
         const safeMargin = Math.min(100, rect.width * 0.15);
         const startX = safeMargin;
         const endX = rect.width - safeMargin;
         const availableW = Math.max(50, endX - startX);`;

const replacement1 = `         // Responsive horizontal spacing preventing negative available width on narrow screens
         let marginX = 200;
         let clampX = 150;
         
         if (rect.width < 600) {
            marginX = Math.max(40, rect.width * 0.15);
            clampX = Math.max(30, rect.width * 0.10);
         }
         
         const startX = marginX;
         const endX = rect.width - marginX;
         const availableW = Math.max(50, endX - startX);`;

code = code.replace(target1, replacement1);

const target2 = `            px = Math.min(Math.max(px, safeMargin), rect.width - safeMargin);`;
const replacement2 = `            px = Math.min(Math.max(px, clampX), rect.width - clampX);`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed hotspots');
