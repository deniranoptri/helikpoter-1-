const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// Make SCORE compact on mobile
code = code.replace(
  '<span className="font-mono text-xl drop-shadow-md">{hudScores.P1.toLocaleString(\'id-ID\')}</span>',
  '<span className="font-mono text-base md:text-xl drop-shadow-md leading-none">{hudScores.P1.toLocaleString(\'id-ID\')}</span>'
);

code = code.replace(
  '<span className="text-[9px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider mb-1 drop-shadow-md">SKOR</span>',
  '<span className="text-[9px] md:text-xs text-amber-400 font-bold uppercase tracking-wider md:mb-1 drop-shadow-md leading-none">SKOR</span>'
);

// Make DUEL SCORE compact
code = code.replace(
  '<div className="flex items-center gap-3 font-mono text-lg">',
  '<div className="flex items-center gap-1 md:gap-3 font-mono text-sm md:text-lg leading-none">'
);

// Make FIRES compact
code = code.replace(
  '<span className={`font-mono drop-shadow-md ${gameMode === \'SQUAD\' ? \'text-lg\' : \'text-xl\'}`}>{activeFiresCount} / 3</span>',
  '<span className={`font-mono drop-shadow-md leading-none ${gameMode === \'SQUAD\' ? \'text-base md:text-lg\' : \'text-base md:text-xl\'}`}>{activeFiresCount} / 3</span>'
);

code = code.replace(
  '<span className={`text-slate-400 font-bold uppercase tracking-wider drop-shadow-md ${gameMode === \'SQUAD\' ? \'text-[10px]\' : \'text-xs\'}`}>Fires</span>',
  '<span className={`text-slate-400 font-bold uppercase tracking-wider drop-shadow-md md:mb-1 leading-none ${gameMode === \'SQUAD\' ? \'text-[9px] md:text-[10px]\' : \'text-[9px] md:text-xs\'}`}>Fires</span>'
);


fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Done');
