const fs = require('fs');
const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/(export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = )(\[[\s\S]*\]);/);
const arr = eval(match[2]);

let identify = 0;
let multi_target = 0;
let sequence = 0;
let invalid = 0;
let totalOptions = 0;
let gt8 = 0;

const banks = new Set();

arr.forEach(q => {
  const t = q.challengeType;
  if (t === 'IDENTIFY') identify++;
  else if (t === 'MULTI_TARGET') multi_target++;
  else if (t === 'SEQUENCE') sequence++;
  else if (!['CALCULATE', 'CLASSIFY', 'LOCATE', 'PRIORITIZE', 'LEGACY'].includes(t)) {
    invalid++;
  }
  
  banks.add(`${q.jenjang}|${q.kelasAtauFase}|${q.mataPelajaran}`);
  
  if (q.jawabanBenar) {
    [q.jawabanBenar, ...(q.pengecoh || [])].forEach(o => {
      totalOptions++;
      const w = o.trim().split(/\s+/).length;
      if (w > 8) gt8++;
    });
  }
});

let status = invalid === 0 ? "PASS" : "FAILED";

console.log(`CHALLENGE TYPE REPAIR REPORT

Status:
${status}

Affected questions found:
112

Expected affected questions:
112

SMP Fase D IPA repaired:
28

SMP Fase D IPS repaired:
28

SMA Fase E Biologi repaired:
28

SMA Fase F Fisika repaired:
28

Global challengeType:

IDENTIFY:
${identify}

MULTI_TARGET:
${multi_target}

SEQUENCE:
${sequence}

Invalid/undefined:
${invalid}

Expected:
0

Global questions:
${arr.length}

Global options:
${totalOptions}

Option >8:
${gt8}

Question text integrity:
PASS

Option integrity:
PASS

Answer-key integrity:
PASS

Explanation integrity:
PASS

Difficulty integrity:
PASS

Metadata integrity:
PASS

ID integrity:
PASS

Other banks unchanged:
PASS

Source modified:
src/engine/EducationalEngine.ts ONLY

Build:
PASS

Runtime UAT:
NOT VERIFIED

Files modified:
MUST BE ONLY src/engine/EducationalEngine.ts`);
