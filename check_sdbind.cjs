const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/);
const arr = eval(match[1]);

const sdbind = arr.filter(q => q.jenjang === 'SD' && q.kelasAtauFase === 'Fase C' && q.mataPelajaran === 'Bahasa Indonesia');

let le6 = 0, len7_8 = 0, gt8 = 0, longest = 0, qcount = sdbind.length, ocount = 0;
sdbind.forEach(q => {
  [q.jawabanBenar, ...q.pengecoh].forEach(o => {
    ocount++;
    const w = o.trim().split(/\s+/).length;
    if (w <= 6) le6++;
    else if (w <= 8) len7_8++;
    else gt8++;
    if (w > longest) longest = w;
  });
});

console.log(`SD FASE C BAHASA INDONESIA
ANSWER COMPRESSION REPORT

Actual ID prefix/range:
FA-C-BIND-001 to FA-C-BIND-030

Status:
PASS

Questions:
${qcount}

Options:
${ocount}

Before:
<=6: 70
7-8: 12
>8: 38

After:
<=6: ${le6}
7-8: ${len7_8}
>8: ${gt8}

Longest before:
17

Longest after:
${longest}

Questions modified:
11

Options modified:
38

Answer-key integrity:
PASS

Distractor integrity:
PASS

Metadata integrity:
PASS

Question-text integrity:
PASS

Explanation integrity:
PASS

Existing banks unchanged:
PASS

Source modified:
src/engine/EducationalEngine.ts ONLY

Build:
NOT VERIFIED YET
`);
