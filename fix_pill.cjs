const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

code = code.replace(
    'bg-slate-900/40 backdrop-blur-sm rounded-full border border-slate-700/50',
    'bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50'
);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed pill');
