const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// 1. Move Header and Question into absolute wrapper above main
const oldHeaderAndQuestion = `<header className="shrink-0 z-10 bg-transparent flex justify-between items-center px-2 sm:px-4 py-1 relative pointer-events-auto">
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
      </header>

      {activeMission && (
        <div className="w-full bg-transparent shrink-0 py-1 px-2 flex flex-col items-center justify-center z-10 pointer-events-none">
           <div className="text-sm sm:text-base md:text-lg font-bold text-white px-3 py-1 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-sm text-center max-w-4xl w-full whitespace-normal break-words leading-tight pointer-events-auto">
              {activeMission.pertanyaan || activeMission.question}
            </div>
        </div>
      )}`;

const newHeaderAndQuestion = `      {/* HUD OVERLAYS - ZERO HEIGHT TO NOT PUSH MAIN DOWN */}
      <div className="w-full h-0 z-[60] pointer-events-none overflow-visible relative">
        <div className="w-full flex flex-col">
          <header className="shrink-0 bg-transparent flex justify-between items-center px-2 sm:px-4 py-1 pointer-events-auto w-full">
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
          </header>

          {activeMission && (
            <div className="w-full bg-transparent shrink-0 py-1 px-2 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-sm sm:text-base md:text-lg font-bold text-white px-3 py-1 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-sm text-center max-w-4xl w-full whitespace-normal break-words leading-tight pointer-events-auto">
                  {activeMission.pertanyaan || activeMission.question}
                </div>
            </div>
          )}
        </div>
      </div>`;

code = code.replace(oldHeaderAndQuestion, newHeaderAndQuestion);


// 2. Change clamping logic
const oldClamping = `          // Clamp targets to screen
          entityP1.targetX = Math.max(scaledWidthP1/2, Math.min(rect.width - scaledWidthP1/2, entityP1.targetX));
          entityP1.targetY = Math.max(scaledHeightP1/2, Math.min(rect.height - scaledHeightP1/2, entityP1.targetY));

          if (gameModeRef.current === 'SOLO') {
             // Reflect clamping back to input manager
             input.pointerX = entityP1.targetX;
             input.pointerY = entityP1.targetY;
          } else {
             entityP2.targetX = Math.max(scaledWidthP2/2, Math.min(rect.width - scaledWidthP2/2, entityP2.targetX));
             entityP2.targetY = Math.max(scaledHeightP2/2, Math.min(rect.height - scaledHeightP2/2, entityP2.targetY));
             
             if (gameModeRef.current === 'SQUAD') {
               entityP3.targetX = Math.max(scaledWidthP3/2, Math.min(rect.width - scaledWidthP3/2, entityP3.targetX));
               entityP3.targetY = Math.max(scaledHeightP3/2, Math.min(rect.height - scaledHeightP3/2, entityP3.targetY));
               
               entityP4.targetX = Math.max(scaledWidthP4/2, Math.min(rect.width - scaledWidthP4/2, entityP4.targetX));
               entityP4.targetY = Math.max(scaledHeightP4/2, Math.min(rect.height - scaledHeightP4/2, entityP4.targetY));
             }
          }`;

const newClamping = `          // Clamp targets to screen
          const safeTopZone = rect.width < 600 ? 90 : 110;
          entityP1.targetX = Math.max(scaledWidthP1/2, Math.min(rect.width - scaledWidthP1/2, entityP1.targetX));
          entityP1.targetY = Math.max(safeTopZone + scaledHeightP1/2, Math.min(rect.height - scaledHeightP1/2, entityP1.targetY));

          if (gameModeRef.current === 'SOLO') {
             // Reflect clamping back to input manager
             input.pointerX = entityP1.targetX;
             input.pointerY = entityP1.targetY;
          } else {
             entityP2.targetX = Math.max(scaledWidthP2/2, Math.min(rect.width - scaledWidthP2/2, entityP2.targetX));
             entityP2.targetY = Math.max(safeTopZone + scaledHeightP2/2, Math.min(rect.height - scaledHeightP2/2, entityP2.targetY));
             
             if (gameModeRef.current === 'SQUAD') {
               entityP3.targetX = Math.max(scaledWidthP3/2, Math.min(rect.width - scaledWidthP3/2, entityP3.targetX));
               entityP3.targetY = Math.max(safeTopZone + scaledHeightP3/2, Math.min(rect.height - scaledHeightP3/2, entityP3.targetY));
               
               entityP4.targetX = Math.max(scaledWidthP4/2, Math.min(rect.width - scaledWidthP4/2, entityP4.targetX));
               entityP4.targetY = Math.max(safeTopZone + scaledHeightP4/2, Math.min(rect.height - scaledHeightP4/2, entityP4.targetY));
             }
          }`;

code = code.replace(oldClamping, newClamping);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Modified Arena.tsx');
