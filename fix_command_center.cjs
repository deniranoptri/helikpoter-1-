const fs = require('fs');

let content = fs.readFileSync('src/components/CommandCenter.tsx', 'utf-8');

content = content.replace(
  'className="min-h-screen relative overflow-hidden bg-slate-900 font-sans flex items-center justify-center p-4"',
  'className="min-h-[100dvh] relative overflow-y-auto overflow-x-hidden bg-slate-900 font-sans flex items-center justify-center p-2 sm:p-4 py-4"'
);

content = content.replace(
  'className="relative z-10 w-full max-w-xl lg:max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-12"',
  'className="relative z-10 w-full max-w-xl lg:max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-2 sm:gap-6 lg:gap-12"'
);

content = content.replace(
  'className="relative mb-6 group"',
  'className="relative mb-2 sm:mb-6 group"'
);

content = content.replace(
  'className="w-48 lg:w-64 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform duration-500"',
  'className="w-24 sm:w-32 lg:w-64 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform duration-500"'
);

content = content.replace(
  'className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase drop-shadow-lg mb-2"',
  'className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase drop-shadow-lg mb-1 sm:mb-2"'
);

content = content.replace(
  'className="text-lg md:text-xl text-slate-300 font-bold uppercase tracking-widest bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50"',
  'className="text-sm sm:text-lg md:text-xl text-slate-300 font-bold uppercase tracking-widest bg-slate-800/50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-slate-700/50"'
);

content = content.replace(
  'className="glass-panel p-5 md:p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative flex flex-col min-h-[450px]"',
  'className="glass-panel p-3 sm:p-5 md:p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative flex flex-col min-h-[350px] sm:min-h-[450px]"'
);

content = content.replace(
  'className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-wide uppercase mb-4 text-center border-b border-slate-700/50 pb-3 drop-shadow-md"',
  'className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white tracking-wide uppercase mb-2 sm:mb-4 text-center border-b border-slate-700/50 pb-2 sm:pb-3 drop-shadow-md"'
);

content = content.replace(
  'className="mb-4 text-rose-400 font-bold bg-rose-950/60 px-4 py-2 rounded-xl border border-rose-500/40 animate-pop-in shadow-lg text-sm uppercase tracking-wide text-center"',
  'className="mb-2 sm:mb-4 text-rose-400 font-bold bg-rose-950/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-rose-500/40 animate-pop-in shadow-lg text-xs sm:text-sm uppercase tracking-wide text-center"'
);

content = content.replace(
  'className="space-y-3 md:space-y-4 mb-6"',
  'className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-6"'
);

content = content.replace(
  'className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2"',
  'className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-2"'
);
content = content.replace(
  'className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2"',
  'className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-2"'
);

content = content.replace(
  'className="w-full appearance-none bg-slate-800 text-base md:text-lg font-bold text-white p-3 md:p-4 rounded-xl border-2 border-slate-600 group-hover:border-slate-400 focus:border-amber-400 focus:outline-none transition-all cursor-pointer shadow-inner"',
  'className="w-full appearance-none bg-slate-800 text-sm sm:text-base md:text-lg font-bold text-white p-2.5 sm:p-3 md:p-4 rounded-xl border-2 border-slate-600 group-hover:border-slate-400 focus:border-amber-400 focus:outline-none transition-all cursor-pointer shadow-inner"'
);

content = content.replace(
  'className="w-full appearance-none bg-slate-800 text-base md:text-lg font-bold text-white p-3 md:p-4 rounded-xl border-2 border-slate-600 group-hover:border-slate-400 focus:border-amber-400 focus:outline-none transition-all cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"',
  'className="w-full appearance-none bg-slate-800 text-sm sm:text-base md:text-lg font-bold text-white p-2.5 sm:p-3 md:p-4 rounded-xl border-2 border-slate-600 group-hover:border-slate-400 focus:border-amber-400 focus:outline-none transition-all cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"'
);

content = content.replace(
  'className="mb-6"',
  'className="mb-3 sm:mb-6"'
);

content = content.replace(
  'className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 block mb-2"',
  'className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 block mb-1 sm:mb-2"'
);

content = content.replace(
  'className="flex flex-col gap-2 md:gap-3"',
  'className="flex flex-col gap-1.5 sm:gap-2 md:gap-3"'
);

// We need to replace the button inside the map.
// The button has a class: `relative w-full p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all btn-tactile overflow-hidden
content = content.replace(
  /className={`relative w-full p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all btn-tactile overflow-hidden/g,
  'className={`relative w-full p-2 sm:p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all btn-tactile overflow-hidden'
);

content = content.replace(
  /<div className="flex items-center gap-3 relative z-10">/g,
  '<div className="flex items-center gap-2 sm:gap-3 relative z-10">'
);

content = content.replace(
  /<div className={`p-1.5 md:p-2 rounded-lg \${isSelected \? 'bg-amber-400\/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>/g,
  '<div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${isSelected ? \'bg-amber-400/20 text-amber-400\' : \'bg-slate-700 text-slate-400\'}`}>'
);

content = content.replace(
  /<svg className="w-5 h-5 md:w-6 md:h-6"/g,
  '<svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"'
);

content = content.replace(
  /className={`font-black text-base md:text-lg tracking-wide \${isSelected \? 'text-amber-400' : 'text-slate-200'}`}/g,
  'className={`font-black text-sm sm:text-base md:text-lg tracking-wide leading-tight ${isSelected ? \'text-amber-400\' : \'text-slate-200\'}`}'
);

content = content.replace(
  /className="text-\[10px\] md:text-xs font-semibold text-slate-400 uppercase tracking-wider"/g,
  'className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider"'
);

content = content.replace(
  'className="w-full py-4 px-6 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-b-4 border-emerald-800 btn-tactile uppercase tracking-widest text-base md:text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 mt-auto"',
  'className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-b-4 border-emerald-800 btn-tactile uppercase tracking-widest text-sm sm:text-base md:text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 mt-auto"'
);


fs.writeFileSync('src/components/CommandCenter.tsx', content);
console.log('CommandCenter updated');
