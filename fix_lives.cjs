const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// The block for P1 in bottom bar
const p1BlockStr = `{(gameMode === 'SQUAD' || gameMode === 'SOLO' || gameMode === 'DUEL') && (
              <div className={\`flex flex-col items-center gap-0 w-full px-2 \${gameMode !== 'SQUAD' ? 'md:hidden' : ''}\`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P1}</span>
                  
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP1Ref} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}`;

const newP1BlockStr = `{gameMode === 'SQUAD' && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P1}</span>
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP1Ref} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            {(gameMode === 'SOLO' || gameMode === 'DUEL') && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-1 mb-2">
                  <div ref={waterBarP1Ref} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}`;

code = code.replace(p1BlockStr, newP1BlockStr);

// Same for P2
const p2BlockStr = `{(gameMode === 'SQUAD' || gameMode === 'DUEL') && (
              <div className={\`flex flex-col items-center gap-0 w-full px-2 \${gameMode !== 'SQUAD' ? 'md:hidden' : ''}\`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P2}</span>
                  
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP2Ref} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}`;

const newP2BlockStr = `{gameMode === 'SQUAD' && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P2}</span>
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP2Ref} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            {gameMode === 'DUEL' && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-1 mb-2">
                  <div ref={waterBarP2Ref} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}`;

code = code.replace(p2BlockStr, newP2BlockStr);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Done lives cleanup in bottom bar for SOLO/DUEL');
