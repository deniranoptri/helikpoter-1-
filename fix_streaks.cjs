const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

// Remove streak display from the player control decks (bottom bar)
for (let i = 1; i <= 4; i++) {
    const streakStr = `<span className="text-[10px] text-amber-300 font-bold drop-shadow-md flex items-center gap-0.5">⭐ {streaks.P${i}}</span>`;
    code = code.replace(streakStr, '');
}

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Done streak removal');
