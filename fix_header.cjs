const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// 1. Hide subtitle on mobile
code = code.replace(
  '{gameMode !== \'SQUAD\' && <p className="text-slate-400 text-xs mt-1">Padamkan target api yang benar.</p>}',
  '{gameMode !== \'SQUAD\' && <p className="hidden md:block text-slate-400 text-xs mt-1">Padamkan target api yang benar.</p>}'
);

// 2. Hide specific header elements on mobile (Lives, Streak, Water)
// The structure in the header currently has:
// 1. Fires
// 2. Lives (gameMode !== 'SQUAD')
// 3. Streak (gameMode !== 'SQUAD')
// 4. Score
// 5. Water (gameMode !== 'SQUAD')

// Let's add hidden md:flex to the containers for Lives, Streak, and Water.
code = code.replace(
  '{gameMode !== \'SQUAD\' && (\n            <div className="flex items-center gap-2 sm:gap-4 pl-2 pr-1 sm:px-4 border-l border-slate-700/50 min-w-[40px] sm:min-w-[80px]">\n              {gameMode === \'SOLO\' && (\n                <div className="flex flex-col items-center">\n                  <span className="text-[9px] sm:text-xs text-rose-400 font-bold uppercase tracking-wider mb-1 drop-shadow-md">❤️ NYAWA</span>',
  '{gameMode !== \'SQUAD\' && (\n            <div className="hidden md:flex items-center gap-2 sm:gap-4 pl-2 pr-1 sm:px-4 border-l border-slate-700/50 min-w-[40px] sm:min-w-[80px]">\n              {gameMode === \'SOLO\' && (\n                <div className="flex flex-col items-center">\n                  <span className="text-[9px] sm:text-xs text-rose-400 font-bold uppercase tracking-wider mb-1 drop-shadow-md">❤️ NYAWA</span>'
);

code = code.replace(
  '{gameMode !== \'SQUAD\' && (\n            <div className="flex items-center gap-2 sm:gap-4 pl-2 pr-1 sm:px-4 border-l border-slate-700/50 min-w-[40px] sm:min-w-[80px]">\n              {gameMode === \'SOLO\' && (\n                <div className="flex flex-col items-center">\n                  <span className="text-[9px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider mb-1 drop-shadow-md">BERUNTUN</span>',
  '{gameMode !== \'SQUAD\' && (\n            <div className="hidden md:flex items-center gap-2 sm:gap-4 pl-2 pr-1 sm:px-4 border-l border-slate-700/50 min-w-[40px] sm:min-w-[80px]">\n              {gameMode === \'SOLO\' && (\n                <div className="flex flex-col items-center">\n                  <span className="text-[9px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider mb-1 drop-shadow-md">BERUNTUN</span>'
);

code = code.replace(
  '{gameMode !== \'SQUAD\' && (\n            <div className="flex items-center gap-2 sm:gap-6 border-l border-slate-700/50 pl-2 sm:pl-4">\n              <div className="flex flex-col items-center">',
  '{gameMode !== \'SQUAD\' && (\n            <div className="hidden md:flex items-center gap-2 sm:gap-6 border-l border-slate-700/50 pl-2 sm:pl-4">\n              <div className="flex flex-col items-center">'
);

// 3. Make header Title and Buttons more compact on mobile
code = code.replace(
  '<div className="flex-1 flex items-center gap-4">\n          <div>\n            <h1 className={`${gameMode === \'SQUAD\' ? \'text-lg\' : \'text-xl\'} font-bold`}>HELI RESCUE {gameMode === \'DUEL\' && <span className="text-blue-400 text-sm ml-2">DUEL</span>}</h1>',
  '<div className="flex-1 flex items-center gap-2 md:gap-4">\n          <div>\n            <h1 className={`${gameMode === \'SQUAD\' ? \'text-base md:text-lg\' : \'text-lg md:text-xl\'} font-bold whitespace-nowrap`}>HELI RESCUE {gameMode === \'DUEL\' && <span className="text-blue-400 text-xs md:text-sm ml-1 md:ml-2">DUEL</span>}</h1>'
);

// 4. Update the bottom control bar to show player stats for SOLO and DUEL on mobile
// For SOLO and DUEL, the bottom control deck is:
// {(gameMode === 'SOLO' || gameMode === 'DUEL' || gameMode === 'SQUAD') && (
//   <div className={gameMode === 'SQUAD' ? 'flex flex-col items-center justify-center border-r border-b md:border-b-0 border-slate-800/50 py-1' : 'flex-1 min-w-[150px] flex flex-col items-center justify-center border-r border-slate-800/50'}>
//     {gameMode === 'SQUAD' && (
// ...

code = code.replace(
  '{gameMode === \'SQUAD\' && (\n              <div className="flex flex-col items-center gap-0 w-full px-2">\n                <div className="flex items-center gap-2">\n                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P1}</span>\n                  <span className="text-[10px] text-amber-300 font-bold drop-shadow-md flex items-center gap-0.5">⭐ {streaks.P1}</span>\n                </div>\n                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">\n                  <div ref={waterBarP1Ref} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-none will-change-[width]" style={{ width: \'100%\' }} />\n                </div>\n              </div>\n            )}',
  '{(gameMode === \'SQUAD\' || gameMode === \'SOLO\' || gameMode === \'DUEL\') && (\n              <div className={`flex flex-col items-center gap-0 w-full px-2 ${gameMode !== \'SQUAD\' ? \'md:hidden\' : \'\'}`}>\n                <div className="flex items-center gap-2">\n                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P1}</span>\n                  <span className="text-[10px] text-amber-300 font-bold drop-shadow-md flex items-center gap-0.5">⭐ {streaks.P1}</span>\n                </div>\n                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">\n                  <div ref={waterBarP1Ref} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-none will-change-[width]" style={{ width: \'100%\' }} />\n                </div>\n              </div>\n            )}'
);

code = code.replace(
  '{gameMode === \'SQUAD\' && (\n              <div className="flex flex-col items-center gap-0 w-full px-2">\n                <div className="flex items-center gap-2">\n                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P2}</span>\n                  <span className="text-[10px] text-amber-300 font-bold drop-shadow-md flex items-center gap-0.5">⭐ {streaks.P2}</span>\n                </div>\n                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">\n                  <div ref={waterBarP2Ref} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-none will-change-[width]" style={{ width: \'100%\' }} />\n                </div>\n              </div>\n            )}',
  '{(gameMode === \'SQUAD\' || gameMode === \'DUEL\') && (\n              <div className={`flex flex-col items-center gap-0 w-full px-2 ${gameMode !== \'SQUAD\' ? \'md:hidden\' : \'\'}`}>\n                <div className="flex items-center gap-2">\n                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P2}</span>\n                  <span className="text-[10px] text-amber-300 font-bold drop-shadow-md flex items-center gap-0.5">⭐ {streaks.P2}</span>\n                </div>\n                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">\n                  <div ref={waterBarP2Ref} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-none will-change-[width]" style={{ width: \'100%\' }} />\n                </div>\n              </div>\n            )}'
);


fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Done');
