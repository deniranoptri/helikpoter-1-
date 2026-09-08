const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// Use exact string replacement since previous one didn't match perfectly
const oldCode = `               }
               if (dist <= 250) {
                 isDetected = true;
               }
               if (dist <= 200) {
                 isReady = true;`;

const newCode = `               }
               const currentCompScale = compositionScaleRef.current;
               if (dist <= 250 * currentCompScale) {
                 isDetected = true;
               }
               if (dist <= 200 * currentCompScale) {
                 isReady = true;`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Detection patched');
