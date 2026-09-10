const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/);
if (!match) {
  console.log("No content found");
  process.exit(1);
}

const arr = eval(match[1]);

let activeQuestions = arr.length;
let activeOptions = 0;

let w1_2 = 0;
let w3_4 = 0;
let w5_6 = 0;
let w7_8 = 0;
let w_gt8 = 0;

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
    
    if (words > banks[bankKey].max) {
      banks[bankKey].max = words;
    }
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

console.log("BANK DISCOVERY");
console.log("==================================================");
for (let b in banks) {
    const bank = banks[b];
    console.log(`Jenjang: ${bank.jenjang}`);
    console.log(`Fase/Kelas: ${bank.fase}`);
    console.log(`Mata Pelajaran: ${bank.mapel}`);
    console.log(`Question count: ${bank.questions}`);
    console.log(`Option count: ${bank.options}`);
    console.log("---");
}

console.log("\nGLOBAL STATISTICS");
console.log("==================================================");
const totalBanks = Object.keys(banks).length;
console.log(`Total active banks: ${totalBanks}`);
console.log(`Total active questions: ${activeQuestions}`);
console.log(`Total active answer options: ${activeOptions}`);
console.log("");
console.log(`1-2 words: ${w1_2}`);
console.log(`3-4 words: ${w3_4}`);
console.log(`5-6 words: ${w5_6}`);
console.log(`7-8 words: ${w7_8}`);
console.log(`>8 words: ${w_gt8}`);
console.log("");
console.log(`Percentage:`);
console.log(`<=6 words: ${((le6 / activeOptions) * 100).toFixed(2)}%`);
console.log(`7-8 words: ${((w7_8 / activeOptions) * 100).toFixed(2)}%`);
console.log(`>8 words: ${((w_gt8 / activeOptions) * 100).toFixed(2)}%`);
console.log("");
console.log(`Longest option:`);
console.log(`Question ID: ${longestId}`);
console.log(`Bank: ${longestBank}`);
console.log(`Exact option: ${longestOption}`);
console.log(`Word count: ${longestCount}`);
console.log("");

console.log("BANK-BY-BANK TABLE");
console.log("==================================================");
console.log("| Jenjang | Fase | Mapel | Questions | Options | <=6 | 7-8 | >8 | Max |");
console.log("|---------|------|-------|-----------|---------|-----|-----|----|-----|");
for (let b in banks) {
    const bank = banks[b];
    console.log(`| ${bank.jenjang.substring(0, 10)}... | ${bank.fase.substring(0, 10)}... | ${bank.mapel.substring(0, 10)}... | ${bank.questions} | ${bank.options} | ${bank.le6} | ${bank.len7_8} | ${bank.gt8} | ${bank.max} |`);
}
console.log("");

console.log("LIST EVERY REMAINING VIOLATION");
console.log("==================================================");
violations.forEach(v => {
    console.log(`Jenjang: ${v.jenjang}`);
    console.log(`Fase: ${v.fase}`);
    console.log(`Mapel: ${v.mapel}`);
    console.log(`Question ID: ${v.id}`);
    console.log(`Option Type: ${v.type}`);
    console.log(`Exact Option: ${v.text}`);
    console.log(`Word Count: ${v.words}`);
    console.log("---");
});
console.log("");

console.log("POST-COMPRESSION VERIFICATION");
console.log("==================================================");
for (let b in specificBanks) {
    const bank = specificBanks[b];
    if (b === "FC-BIND" && !bank.found) {
        console.log("FC-BIND:");
        console.log("NOT ACTIVE / NOT FOUND");
        console.log("---");
        continue;
    }
    if (bank.found) {
        console.log(`Bank: ${b}`);
        console.log(`Questions: ${bank.q}`);
        console.log(`Options: ${bank.o}`);
        console.log(`>8 words: ${bank.gt8}`);
        console.log(`Longest: ${bank.max}`);
        let expected = bank.gt8 === 0 ? "PASS" : "NEEDS REVISION";
        console.log(`Expected for each: >8 words = 0 (${expected})`);
        console.log("---");
    }
}

let p0 = 0, p1 = 0, p2 = w7_8;
violations.forEach(v => {
    if (v.words >= 9 && v.words <= 12) p1++;
    if (v.words > 12) p0++;
});

let status = "PASS";
if (w_gt8 > 0) status = "NEEDS REVISION";
else if (w7_8 > 0) status = "WATCH";

console.log("");
console.log("FINAL VERDICT");
console.log("==================================================");
console.log("GLOBAL POST-COMPRESSION AUDIT");
console.log("");
console.log(`Status:\n${status}\n`);
console.log(`Active banks:\n${totalBanks}\n`);
console.log(`Active questions:\n${activeQuestions}\n`);
console.log(`Active options:\n${activeOptions}\n`);
console.log(`<=6 words:\n${le6}\n`);
console.log(`7-8 words:\n${w7_8}\n`);
console.log(`>8 words:\n${w_gt8}\n`);
console.log(`Longest option:\n${longestId} - ${longestCount}\n`);
console.log(`Remaining P0:\n${p0}\n`);
console.log(`Remaining P1:\n${p1}\n`);
console.log(`Remaining P2:\n${p2}\n`);
console.log("Source modified:\nNO\n");
console.log("Build:\nNOT RUN — READ ONLY AUDIT\n");
console.log("Runtime UAT:\nNOT VERIFIED");
