const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/);
const arr = eval(match[1]);

let activeQuestions = arr.length;
let activeOptions = 0;

let w1_2 = 0, w3_4 = 0, w5_6 = 0, w7_8 = 0, w_gt8 = 0;
let le6 = 0;

let longestCount = 0;
let longestId = "";
let longestOption = "";
let longestBank = "";

const banks = {};
const violations = [];

const specificBanks = {
  "FD-KKA": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FD-PAN": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FC-KKA": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FD-BIND": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FD-PJOK": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FD-INF": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FD-SENI": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FD-ENG": { q: 0, o: 0, gt8: 0, max: 0, found: false },
  "FC-BIND": { q: 0, o: 0, gt8: 0, max: 0, found: false }
};

arr.forEach(q => {
  const bankKey = `${q.jenjang}|${q.kelasAtauFase}|${q.mataPelajaran}`;
  if (!banks[bankKey]) {
    banks[bankKey] = {
      jenjang: q.jenjang,
      fase: q.kelasAtauFase,
      mapel: q.mataPelajaran,
      questions: 0,
      options: 0,
      le6: 0,
      len7_8: 0,
      gt8: 0,
      max: 0
    };
  }
  banks[bankKey].questions++;
  
  let prefix = "";
  if (q.id.includes('-')) {
    prefix = q.id.split('-').slice(0, 2).join('-');
  } else {
    prefix = q.id.split('_').slice(0, 2).join('_');
  }
  
  if (specificBanks[prefix] !== undefined) {
      specificBanks[prefix].found = true;
      specificBanks[prefix].q++;
  }

  const opts = [{type: 'jawabanBenar', text: q.jawabanBenar}];
  q.pengecoh.forEach((p, idx) => opts.push({type: `pengecoh ${idx+1}`, text: p}));
  
  opts.forEach(opt => {
    activeOptions++;
    banks[bankKey].options++;
    if (specificBanks[prefix] !== undefined) specificBanks[prefix].o++;
    
    const words = opt.text.trim().split(/\s+/).length;
    
    if (words <= 2) w1_2++;
    else if (words <= 4) w3_4++;
    else if (words <= 6) w5_6++;
    else if (words <= 8) w7_8++;
    else w_gt8++;
    
    if (words <= 6) {
      le6++;
      banks[bankKey].le6++;
    } else if (words <= 8) {
      banks[bankKey].len7_8++;
    } else {
      banks[bankKey].gt8++;
      if (specificBanks[prefix] !== undefined) specificBanks[prefix].gt8++;
      violations.push({
        jenjang: q.jenjang,
        fase: q.kelasAtauFase,
        mapel: q.mataPelajaran,
        id: q.id,
        type: opt.type,
        text: opt.text,
        words: words
      });
    }
    
    if (words > banks[bankKey].max) banks[bankKey].max = words;
    if (specificBanks[prefix] !== undefined && words > specificBanks[prefix].max) {
        specificBanks[prefix].max = words;
    }
    
    if (words > longestCount) {
      longestCount = words;
      longestId = q.id;
      longestOption = opt.text;
      longestBank = bankKey;
    }
  });
});

console.log(`GLOBAL POST-COMPRESSION AUDIT

Status:
NEEDS REVISION

Active banks:
${Object.keys(banks).length}

Active questions:
${activeQuestions}

Active options:
${activeOptions}

≤6 words:
${le6}

7–8 words:
${w7_8}

>8 words:
${w_gt8}

Longest option:
${longestId} — ${longestCount}

Remaining P0:
${violations.filter(v => v.words > 12).length}

Remaining P1:
${violations.filter(v => v.words >= 9 && v.words <= 12).length}

Remaining P2:
${w7_8}

Source modified:
NO

Build:
NOT RUN — READ ONLY AUDIT

Runtime UAT:
NOT VERIFIED

==================================================
BANK DISCOVERY
==================================================`);

for (let b in banks) {
    const bank = banks[b];
    console.log(`Jenjang: ${bank.jenjang}`);
    console.log(`Fase/Kelas: ${bank.fase}`);
    console.log(`Mata Pelajaran: ${bank.mapel}`);
    console.log(`Question count: ${bank.questions}`);
    console.log(`Option count: ${bank.options}`);
    console.log("---");
}

console.log(`==================================================
GLOBAL STATISTICS
==================================================
Total active banks: ${Object.keys(banks).length}
Total active questions: ${activeQuestions}
Total active answer options: ${activeOptions}

1–2 words: ${w1_2}
3–4 words: ${w3_4}
5–6 words: ${w5_6}
7–8 words: ${w7_8}
>8 words: ${w_gt8}

Percentage:

≤6 words: ${((le6 / activeOptions) * 100).toFixed(2)}%
7–8 words: ${((w7_8 / activeOptions) * 100).toFixed(2)}%
>8 words: ${((w_gt8 / activeOptions) * 100).toFixed(2)}%

Longest option:
Question ID: ${longestId}
Bank: ${longestBank.replace(/\|/g, ' - ')}
Exact option: ${longestOption}
Word count: ${longestCount}

==================================================
BANK-BY-BANK TABLE
==================================================
| Jenjang | Fase | Mapel | Questions | Options | ≤6 | 7–8 | >8 | Max |
|---------|------|-------|-----------|---------|-----|-----|-----|-----|`);

for (let b in banks) {
    const bank = banks[b];
    console.log(`| ${bank.jenjang} | ${bank.fase} | ${bank.mapel} | ${bank.questions} | ${bank.options} | ${bank.le6} | ${bank.len7_8} | ${bank.gt8} | ${bank.max} |`);
}

console.log(`
==================================================
LIST EVERY REMAINING VIOLATION
==================================================`);
violations.forEach(v => {
    console.log(`Jenjang: ${v.jenjang}`);
    console.log(`Fase: ${v.fase}`);
    console.log(`Mapel: ${v.mapel}`);
    console.log(`Question ID: ${v.id}`);
    console.log(`Option Type: ${v.type}`);
    console.log(`Exact Option: ${v.text}`);
    console.log(`Word Count: ${v.words}`);
    console.log("");
});

console.log(`==================================================
POST-COMPRESSION VERIFICATION
==================================================`);

for (let b in specificBanks) {
    const bank = specificBanks[b];
    if (b === "FC-BIND" && !bank.found) {
        console.log(`Bank: ${b}
Questions: 0
Options: 0
>8 words: 0
Longest: 0
Expected for each: >8 words = 0

FC-BIND:
NOT ACTIVE / NOT FOUND
`);
        continue;
    }
    if (bank.found) {
        console.log(`Bank: ${b}
Questions: ${bank.q}
Options: ${bank.o}
>8 words: ${bank.gt8}
Longest: ${bank.max}

Expected for each:
>8 words = 0`);
        if (bank.gt8 > 0) {
            console.log("NEEDS REVISION");
        }
        console.log("");
    }
}
