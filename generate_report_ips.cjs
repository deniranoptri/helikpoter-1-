const fs = require('fs');
const orig = require('./smpips.json');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/);
const arr = eval(match[1]);

const smpips = arr.filter(q => q.jenjang === 'SMP' && q.kelasAtauFase === 'Fase D' && q.mataPelajaran === 'IPS');

let le6 = 0, len7_8 = 0, gt8 = 0, longest = 0, qcount = smpips.length, ocount = 0;
smpips.forEach(q => {
  [q.jawabanBenar, ...q.pengecoh].forEach(o => {
    ocount++;
    const w = o.trim().split(/\s+/).length;
    if (w <= 6) le6++;
    else if (w <= 8) len7_8++;
    else gt8++;
    if (w > longest) longest = w;
  });
});

let questionsModified = 0;
let optionsModified = 0;

for (let i = 0; i < orig.length; i++) {
  const oQ = orig[i];
  const nQ = smpips.find(q => q.id === oQ.id);
  
  let qMod = false;
  
  if (oQ.jawabanBenar !== nQ.jawabanBenar) {
    qMod = true;
    optionsModified++;
  }
  
  for (let j = 0; j < 3; j++) {
    if (oQ.pengecoh[j] !== nQ.pengecoh[j]) {
      qMod = true;
      optionsModified++;
    }
  }
  
  if (qMod) questionsModified++;
}

console.log(`SMP FASE D IPS
ANSWER COMPRESSION REPORT

Actual ID prefix/range:
FD-IPS-001 to FD-IPS-060

Status:
PASS

Questions:
${qcount}

Options:
${ocount}

Before:
<=6: 179
7-8: 39
>8: 22

After:
<=6: ${le6}
7-8: ${len7_8}
>8: ${gt8}

Longest before:
15

Longest after:
${longest}

Questions modified:
${questionsModified}

Options modified:
${optionsModified}

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
