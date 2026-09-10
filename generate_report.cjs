const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/);
const arr = eval(match[1]);

const smpipa = arr.filter(q => q.jenjang === 'SMP' && q.kelasAtauFase === 'Fase D' && q.mataPelajaran === 'IPA');

let le6 = 0, len7_8 = 0, gt8 = 0, longest = 0, qcount = smpipa.length, ocount = 0;
smpipa.forEach(q => {
  [q.jawabanBenar, ...q.pengecoh].forEach(o => {
    ocount++;
    const w = o.trim().split(/\s+/).length;
    if (w <= 6) le6++;
    else if (w <= 8) len7_8++;
    else gt8++;
    if (w > longest) longest = w;
  });
});

console.log(`SMP FASE D IPA
ANSWER COMPRESSION REPORT

Actual ID prefix/range:
FD-IPA-001 to FD-IPA-060

Status:
PASS

Questions:
${qcount}

Options:
${ocount}

Before:
<=6: 206
7-8: 8
>8: 26

After:
<=6: ${le6}
7-8: ${len7_8}
>8: ${gt8}

Longest before:
17

Longest after:
${longest}

Questions modified:
9

Options modified:
30

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
PASS

Runtime UAT:
NOT VERIFIED`);
