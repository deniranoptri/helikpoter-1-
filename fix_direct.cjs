const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const regexDirectAnswer = /  const handleDirectAnswer = \(opt: string\) => \{[\s\S]*?  \};\n\n/g;

code = code.replace(regexDirectAnswer, '');
fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Removed handleDirectAnswer');
