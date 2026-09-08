const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

code = code.replace(/rectW/g, 'rect.width');

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed rectW');
