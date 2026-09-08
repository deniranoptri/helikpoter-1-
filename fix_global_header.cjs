const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// The goal is to replace the ENTIRE <header> ... </header> section.
// First, let's find the header block.
const headerStart = code.indexOf('<header className=');
const headerEnd = code.indexOf('</header>') + '</header>'.length;

const newHeader = `
      <header className="border-b border-slate-800 shrink-0 z-10 bg-slate-900 flex justify-between items-center px-4 py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMuted(sharedAudioEngine.toggleMute())}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          {onReturnToMenu && (
            <button 
              onClick={onReturnToMenu}
              className="px-3 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              MENU
            </button>
          )}
        </div>
        
        {missionFeedback && (
          <div className={\`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-6 py-2 rounded-full font-black text-white shadow-2xl z-50 animate-pop-in \${missionFeedback.isError ? 'bg-red-600 border border-red-400' : 'bg-emerald-500 border border-emerald-400'}\`}>
            {missionFeedback.message}
          </div>
        )}

        <div className="flex items-center gap-4 md:gap-8">
          {gameMode !== 'SQUAD' && (
            <div className="flex items-center gap-4">
              {gameMode === 'SOLO' && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] md:text-xs text-rose-400 font-bold uppercase tracking-wider leading-none mb-1 drop-shadow-md">❤️ NYAWA</span>
                  <span className="font-mono text-base md:text-xl text-rose-400 leading-none drop-shadow-md">{lives.P1}</span>
                </div>
              )}
              {gameMode === 'DUEL' && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] md:text-xs text-rose-400 font-bold uppercase tracking-wider leading-none mb-1 drop-shadow-md">❤️ NYAWA</span>
                  <div className="flex items-center gap-2 md:gap-3 font-mono text-sm md:text-lg text-rose-400 leading-none drop-shadow-md">
                    <span>{lives.P1}</span>
                    <span className="text-slate-600">|</span>
                    <span>{lives.P2}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            {gameMode === 'SOLO' && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-amber-400 font-bold uppercase tracking-wider leading-none mb-1 drop-shadow-md">SKOR</span>
                <span className="font-mono text-base md:text-xl text-amber-400 leading-none drop-shadow-md">{hudScores.P1.toLocaleString('id-ID')}</span>
              </div>
            )}
            {gameMode === 'DUEL' && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-amber-400 font-bold uppercase tracking-wider leading-none mb-1 drop-shadow-md">SKOR</span>
                <div className="flex items-center gap-2 md:gap-3 font-mono text-sm md:text-lg leading-none drop-shadow-md">
                  <span className="text-emerald-400">{hudScores.P1.toLocaleString('id-ID')}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-blue-400">{hudScores.P2.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
            {gameMode === 'SQUAD' && (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 drop-shadow-md leading-none mb-1">
                    <span className="text-emerald-400">🟢</span> 
                    <span className="text-white">TEAM A</span> 
                    <span className="text-blue-400">🔵</span>
                  </span>
                  <span className="font-mono text-sm md:text-lg drop-shadow-md text-white leading-none">
                    {(hudScores.P1 + hudScores.P2).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-700"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 drop-shadow-md leading-none mb-1">
                    <span className="text-yellow-400">🟡</span> 
                    <span className="text-white">TEAM B</span> 
                    <span className="text-rose-400">🔴</span>
                  </span>
                  <span className="font-mono text-sm md:text-lg drop-shadow-md text-white leading-none">
                    {(hudScores.P3 + hudScores.P4).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>`.trim();

code = code.substring(0, headerStart) + newHeader + '\n' + code.substring(headerEnd);

// Next: Simplify the question block. 
// Remove the educational badges (subject, topic, difficulty) completely.
const activeMissionStartStr = '{activeMission && (';
const activeMissionStart = code.indexOf(activeMissionStartStr);

if (activeMissionStart !== -1) {
  // Find the end of the activeMission block
  // It starts with `{activeMission && (` and should end around `)}` after the question div.
  // Actually, let's just replace the exact inner JSX of activeMission.

  // Let's find the current block containing the badges.
  const badgesBlockRegex = /<div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">([\s\S]*?)<\/div>\s*<div className="text-sm sm:text-base md:text-lg lg:text-xl/m;
  code = code.replace(badgesBlockRegex, '<div className="text-sm sm:text-base md:text-lg lg:text-xl');
}

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Done replacement');
