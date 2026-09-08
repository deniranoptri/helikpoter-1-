const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const regexGrid = /      \{\/\* DEDICATED SAFE ANSWER REGION[\s\S]*?      \}\)\}\n/g;

code = code.replace(regexGrid, '');
fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Removed mobile grid');
