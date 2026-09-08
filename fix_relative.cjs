const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

code = code.replace(
  '<header className="border-b border-slate-800 shrink-0 z-10 bg-slate-900 flex justify-between items-center px-4 py-2">',
  '<header className="border-b border-slate-800 shrink-0 z-10 bg-slate-900 flex justify-between items-center px-4 py-2 relative">'
);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed relative');
