const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// 1. Root container
code = code.replace(
    'className="flex flex-col w-full h-[100dvh] bg-slate-900 text-white overflow-hidden select-none"',
    'className="flex flex-col w-full h-[100dvh] bg-gradient-to-b from-sky-800 to-sky-900 text-white overflow-hidden select-none relative"'
);

// 2. Header
code = code.replace(
    '<header className="border-b border-slate-800 shrink-0 z-10 bg-slate-900 flex justify-between items-center px-2 sm:px-4 py-1.5 relative">',
    '<header className="shrink-0 z-10 bg-transparent flex justify-between items-center px-2 sm:px-4 py-1 relative pointer-events-auto">'
);

// 3. Question container
code = code.replace(
    '<div className="w-full bg-slate-900 border-b border-slate-800 shrink-0 py-1 sm:py-1.5 px-2 flex flex-col items-center justify-center z-10">',
    '<div className="w-full bg-transparent shrink-0 py-1 px-2 flex flex-col items-center justify-center z-10 pointer-events-none">'
);

// 4. Question inner box
code = code.replace(
    '<div className="text-sm sm:text-base md:text-lg font-bold text-white px-3 py-1 bg-slate-800/90 rounded-lg border border-slate-700 shadow-md text-center max-w-4xl w-full whitespace-normal break-words leading-tight">',
    '<div className="text-sm sm:text-base md:text-lg font-bold text-white px-3 py-1 bg-slate-900/40 backdrop-blur-sm rounded-full border border-slate-700/50 shadow-sm text-center max-w-4xl w-full whitespace-normal break-words leading-tight pointer-events-auto">'
);

// 5. Arena inner container
code = code.replace(
    'className="absolute inset-0 bg-gradient-to-b from-sky-800 to-sky-900 touch-none select-none overflow-hidden cursor-crosshair"',
    'className="absolute inset-0 bg-transparent touch-none select-none overflow-hidden cursor-crosshair"'
);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed transparency');
