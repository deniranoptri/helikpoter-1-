const fs = require('fs');
let content = fs.readFileSync('src/components/CommandCenter.tsx', 'utf-8');

// 1. Fix the flex alignment that clips the title on mobile
content = content.replace(
  'className="absolute inset-0 z-10 flex flex-col lg:flex-row items-center justify-center p-4 md:p-6 lg:p-8 gap-6 lg:gap-10 overflow-y-auto"',
  'className="absolute inset-0 z-10 flex flex-col lg:flex-row items-center lg:justify-center justify-start p-4 md:p-6 lg:p-8 gap-2 sm:gap-6 lg:gap-10 overflow-y-auto pt-8 sm:pt-4"'
);

// 2. Reduce the gap and margins in the hero on mobile so they fit vertically
content = content.replace(
  'className="w-full lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left drop-shadow-xl relative mt-4 lg:mt-0"',
  'className="w-full lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left drop-shadow-xl relative mt-2 sm:mt-4 lg:mt-0"'
);

content = content.replace(
  'className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-2 drop-shadow-lg uppercase leading-none"',
  'className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-1 sm:mb-2 drop-shadow-lg uppercase leading-none"'
);

content = content.replace(
  'className="text-lg md:text-xl lg:text-2xl font-bold text-amber-400 mb-2 drop-shadow uppercase tracking-wide"',
  'className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-amber-400 mb-1 sm:mb-2 drop-shadow uppercase tracking-wide"'
);

content = content.replace(
  'className="text-slate-200 font-bold text-xs md:text-sm lg:text-base tracking-widest uppercase opacity-90 mb-6 lg:mb-8"',
  'className="text-slate-200 font-bold text-[10px] sm:text-xs md:text-sm lg:text-base tracking-widest uppercase opacity-90 mb-3 sm:mb-6 lg:mb-8"'
);

// 3. Compact the helicopter hero image on mobile
content = content.replace(
  'className="w-48 md:w-64 lg:w-80 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] animate-heli-float z-10 relative"',
  'className="w-24 sm:w-32 md:w-64 lg:w-80 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] animate-heli-float z-10 relative"'
);

// 4. Reduce gap inside the mission panel again just to be safe
content = content.replace(
  'className="glass-panel p-5 md:p-6 lg:p-8 rounded-3xl flex flex-col border-t-2 border-slate-600 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] animate-pop-in"',
  'className="glass-panel p-3 sm:p-5 md:p-6 lg:p-8 rounded-3xl flex flex-col border-t-2 border-slate-600 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] animate-pop-in mb-8"'
);

fs.writeFileSync('src/components/CommandCenter.tsx', content);
console.log('Mobile title and hero alignment fixed.');
