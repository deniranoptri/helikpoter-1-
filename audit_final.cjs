const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/);
if (!match) {
  console.log("Failed to find array");
  process.exit(1);
}

const arr = eval(match[1]);

const banks = new Map();
let totalQuestions = 0;
let totalOptions = 0;
let w1_2 = 0, w3_4 = 0, w5_6 = 0, w7_8 = 0, gt8 = 0;
let longestOptionText = "";
let longestOptionWords = 0;
let longestOptionId = "";

let passQuestionStructure = true;
let pass4Options = true;
let passAnswerKey = true;
let passDistractor = true;
let passIdIntegrity = true;
let passMetadata = true;
let passDifficulty = true;
let passChallengeType = true;
let passDuplicateBank = true;
let passDuplicateId = true;
let passQuestionText = true;
let passExplanation = true;

const idSet = new Set();
const bankSet = new Set();

arr.forEach(q => {
  totalQuestions++;
  const bankKey = `${q.jenjang}|${q.kelasAtauFase}|${q.mataPelajaran}`;
  if (!banks.has(bankKey)) {
    banks.set(bankKey, { jenjang: q.jenjang, fase: q.kelasAtauFase, mapel: q.mataPelajaran, questions: 0, options: 0, firstId: q.id, lastId: q.id, le6: 0, len7_8: 0, gt8: 0, max: 0 });
  }
  const b = banks.get(bankKey);
  b.questions++;
  b.lastId = q.id;

  if (idSet.has(q.id)) {
    passDuplicateId = false;
    console.log("Duplicate ID:", q.id);
  }
  idSet.add(q.id);

  if (!q.pertanyaan || q.pertanyaan.trim() === '') passQuestionText = false;
  if (q.explanation === undefined || q.explanation === null) passExplanation = false; 

  if (!q.jenjang || !q.kelasAtauFase || !q.mataPelajaran || !q.topik) passMetadata = false;
  
  if (!['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty)) passDifficulty = false;
  if (!['IDENTIFY', 'CALCULATE', 'CLASSIFY', 'SEQUENCE', 'LOCATE', 'PRIORITIZE', 'MULTI_TARGET', 'LEGACY'].includes(q.challengeType)) {
    passChallengeType = false;
    console.log("Invalid challenge type:", q.challengeType, "in", q.id);
  }

  if (!q.jawabanBenar || !q.pengecoh || !Array.isArray(q.pengecoh)) {
    passQuestionStructure = false;
  } else {
    if (q.pengecoh.length !== 3) pass4Options = false;
    
    const opts = [q.jawabanBenar, ...q.pengecoh];
    if (opts.length !== 4) pass4Options = false;
    
    // Check duplicates in options
    const optSet = new Set(opts);
    if (optSet.size !== 4) {
      passDistractor = false;
      passAnswerKey = false;
      console.log("Duplicate option in:", q.id, opts);
    }
    
    opts.forEach(opt => {
      totalOptions++;
      b.options++;
      const words = opt.trim().split(/\s+/).length;
      
      if (words <= 2) w1_2++;
      else if (words <= 4) w3_4++;
      else if (words <= 6) w5_6++;
      else if (words <= 8) w7_8++;
      else {
        gt8++;
        console.log("GT8 Violation:", q.id, opt);
      }
      
      if (words <= 6) b.le6++;
      else if (words <= 8) b.len7_8++;
      else b.gt8++;
      
      if (words > b.max) b.max = words;
      
      if (words > longestOptionWords) {
        longestOptionWords = words;
        longestOptionText = opt;
        longestOptionId = q.id;
      }
      
      if (!opt || opt.trim() === '') passQuestionStructure = false;
    });
  }
});

let sd_bind_pass = "FAIL";
let smp_ipa_pass = "FAIL";
let smp_ips_pass = "FAIL";

if (banks.has('SD|Fase C|Bahasa Indonesia')) {
  const bk = banks.get('SD|Fase C|Bahasa Indonesia');
  if (bk.questions === 30 && bk.options === 120 && bk.gt8 === 0 && bk.max <= 8) sd_bind_pass = "PASS";
}
if (banks.has('SMP|Fase D|IPA')) {
  const bk = banks.get('SMP|Fase D|IPA');
  if (bk.questions === 60 && bk.options === 240 && bk.gt8 === 0 && bk.max <= 8) smp_ipa_pass = "PASS";
}
if (banks.has('SMP|Fase D|IPS')) {
  const bk = banks.get('SMP|Fase D|IPS');
  if (bk.questions === 60 && bk.options === 240 && bk.gt8 === 0 && bk.max <= 8) smp_ips_pass = "PASS";
}

let overallStatus = "PASS";
if (
  banks.size !== 24 ||
  totalQuestions !== 780 ||
  totalOptions !== 3120 ||
  gt8 !== 0 ||
  !passQuestionStructure ||
  !pass4Options ||
  !passAnswerKey ||
  !passDistractor ||
  !passIdIntegrity ||
  !passMetadata ||
  !passDifficulty ||
  !passChallengeType ||
  !passDuplicateBank ||
  !passDuplicateId ||
  sd_bind_pass === "FAIL" ||
  smp_ipa_pass === "FAIL" ||
  smp_ips_pass === "FAIL"
) {
  overallStatus = "NEEDS REVIEW";
}

console.log(`GLOBAL FINAL AUDIT REPORT

Overall Status:
${overallStatus}

Active Banks:
${banks.size}

Questions:
${totalQuestions}

Options:
${totalOptions}

Option Length:
1–2: ${w1_2}
3–4: ${w3_4}
5–6: ${w5_6}
7–8: ${w7_8}
>8: ${gt8}

Longest Option:
${longestOptionWords} words

Longest Option ID:
${longestOptionId}

Longest Option:
${longestOptionText}

Question Structure:
${passQuestionStructure ? "PASS" : "FAIL"}

4 Options Per Question:
${pass4Options ? "PASS" : "FAIL"}

Answer-Key Integrity:
${passAnswerKey ? "PASS" : "FAIL"}

Distractor Integrity:
${passDistractor ? "PASS" : "FAIL"}

ID Integrity:
${passIdIntegrity ? "PASS" : "FAIL"}

Metadata Integrity:
${passMetadata ? "PASS" : "FAIL"}

Difficulty Integrity:
${passDifficulty ? "PASS" : "FAIL"}

ChallengeType Integrity:
${passChallengeType ? "PASS" : "FAIL"}

Duplicate Bank Check:
${passDuplicateBank ? "PASS" : "FAIL"}

Duplicate Question ID Check:
${passDuplicateId ? "PASS" : "FAIL"}

Question Text Integrity:
${passQuestionText ? "PASS" : "FAIL"}

Explanation Integrity:
${passExplanation ? "PASS" : "FAIL"}

SD Fase C Bahasa Indonesia:
${sd_bind_pass}

SMP Fase D IPA:
${smp_ipa_pass}

SMP Fase D IPS:
${smp_ips_pass}

Source Scope:
src/engine/EducationalEngine.ts ONLY

Build:
NOT YET RUN

Runtime UAT:
NOT VERIFIED

Files Modified:
NONE`);
