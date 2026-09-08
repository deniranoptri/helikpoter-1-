const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// Replace Header
const headerStart = code.indexOf('<header className=');
const headerEnd = code.indexOf('</header>') + '</header>'.length;

const newHeader = `
      <header className="border-b border-slate-800 shrink-0 z-10 bg-slate-900 flex justify-between items-center px-2 sm:px-4 py-1.5 relative">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsMuted(sharedAudioEngine.toggleMute())}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs sm:text-sm"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          {onReturnToMenu && (
            <button 
              onClick={onReturnToMenu}
              className="px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              MENU
            </button>
          )}
        </div>
        
        {missionFeedback && (
          <div className={\`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-4 py-1 sm:px-6 sm:py-2 rounded-full font-black text-white shadow-2xl z-50 animate-pop-in text-xs sm:text-sm \${missionFeedback.isError ? 'bg-red-600 border border-red-400' : 'bg-emerald-500 border border-emerald-400'}\`}>
            {missionFeedback.message}
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-6">
          {gameMode !== 'SQUAD' && (
            <div className="flex items-center">
              {gameMode === 'SOLO' && (
                <div className="flex items-center gap-1 font-mono text-xs sm:text-sm md:text-base font-bold text-rose-400 drop-shadow-md">
                  <span>❤️</span><span>{lives.P1}</span>
                </div>
              )}
              {gameMode === 'DUEL' && (
                <div className="flex items-center gap-1 font-mono text-xs sm:text-sm md:text-base font-bold text-rose-400 drop-shadow-md">
                  <span>❤️</span><span>{lives.P1}</span><span className="text-slate-600 px-0.5">|</span><span>{lives.P2}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center">
            {gameMode === 'SOLO' && (
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm md:text-base font-bold text-amber-400 drop-shadow-md">
                <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-amber-500">SKOR</span>
                <span>{hudScores.P1.toLocaleString('id-ID')}</span>
              </div>
            )}
            {gameMode === 'DUEL' && (
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm md:text-base font-bold drop-shadow-md">
                <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-amber-500">SKOR</span>
                <span className="text-emerald-400">{hudScores.P1.toLocaleString('id-ID')}</span>
                <span className="text-slate-600 px-0.5">|</span>
                <span className="text-blue-400">{hudScores.P2.toLocaleString('id-ID')}</span>
              </div>
            )}
            {gameMode === 'SQUAD' && (
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm md:text-base font-bold drop-shadow-md text-white">
                <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-amber-500">SKOR</span>
                <span className="flex items-center gap-0.5"><span className="text-[10px] sm:text-xs">🟢🔵</span> {(hudScores.P1 + hudScores.P2).toLocaleString('id-ID')}</span>
                <span className="text-slate-600 px-1">|</span>
                <span className="flex items-center gap-0.5"><span className="text-[10px] sm:text-xs">🟡🔴</span> {(hudScores.P3 + hudScores.P4).toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        </div>
      </header>`.trim();

code = code.substring(0, headerStart) + newHeader + '\n' + code.substring(headerEnd);

// Replace activeMission block to make it slimmer
const activeMissionStr = `{activeMission && (
        <div className="w-full bg-slate-900 border-b border-slate-800 shrink-0 py-2 px-2 sm:px-4 flex flex-col items-center justify-center z-10 shadow-md">
           <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white px-3 py-1.5 sm:px-4 bg-slate-800/90 rounded-xl border border-slate-600 shadow-xl drop-shadow-md text-center max-w-4xl w-full whitespace-normal break-words leading-tight">
              {activeMission.pertanyaan || activeMission.question}
            </div>
        </div>
      )}`;

const newActiveMissionStr = `{activeMission && (
        <div className="w-full bg-slate-900 border-b border-slate-800 shrink-0 py-1 sm:py-1.5 px-2 flex flex-col items-center justify-center z-10">
           <div className="text-sm sm:text-base md:text-lg font-bold text-white px-3 py-1 bg-slate-800/90 rounded-lg border border-slate-700 shadow-md text-center max-w-4xl w-full whitespace-normal break-words leading-tight">
              {activeMission.pertanyaan || activeMission.question}
            </div>
        </div>
      )}`;

code = code.replace(activeMissionStr, newActiveMissionStr);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed ultra slim');
