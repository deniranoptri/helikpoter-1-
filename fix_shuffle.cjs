const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const uiSearch = `{hotspotEngine.getHotspots().filter(h => h.displayContent).map((hotspot, idx) => (
               <button`;

const uiReplace = `{hotspotEngine.getHotspots().filter(h => h.displayContent).sort((a, b) => a.id.localeCompare(b.id)).map((hotspot, idx) => (
               <button`;

// Wait, localeCompare on id: target is 'hs_m1_1', distractor is 'hs_m1_dist_0'.
// target will be before 'dist', wait... '1' vs 'd'. '1' < 'd', so target is still first.
// We need a stable random shuffle based on the mission ID.

const safeReplace = `{hotspotEngine.getHotspots().filter(h => h.displayContent).sort((a, b) => {
                 // Stable deterministic shuffle based on hotspot ID
                 let hashA = 0; for(let i=0; i<a.id.length; i++) hashA = Math.imul(31, hashA) + a.id.charCodeAt(i) | 0;
                 let hashB = 0; for(let i=0; i<b.id.length; i++) hashB = Math.imul(31, hashB) + b.id.charCodeAt(i) | 0;
                 return hashA - hashB;
               }).map((hotspot, idx) => (
               <button`;

code = code.replace(uiSearch, safeReplace);

fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed shuffle');
