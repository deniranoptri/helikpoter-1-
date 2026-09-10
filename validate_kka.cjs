const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/);
const arr = eval(match[1]);

const kka = arr.filter(q => q.id.startsWith('FD-KKA-'));
let le6 = 0;
let len7_8 = 0;
let gt8 = 0;
let longest = 0;
let totalOptions = 0;

kka.forEach(q => {
    const opts = [q.jawabanBenar, ...q.pengecoh];
    opts.forEach(opt => {
        totalOptions++;
        const words = opt.trim().split(/\s+/).length;
        if (words <= 6) le6++;
        else if (words <= 8) len7_8++;
        else gt8++;
        if (words > longest) longest = words;
    });
});

console.log(`Questions: ${kka.length}`);
console.log(`Options: ${totalOptions}`);
console.log(`le6: ${le6}`);
console.log(`len7_8: ${len7_8}`);
console.log(`gt8: ${gt8}`);
console.log(`Longest: ${longest}`);
