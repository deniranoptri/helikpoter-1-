const fs = require('fs');
const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/(export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = )(\[[\s\S]*\]);/);
if (!match) {
  console.log("Not found");
  process.exit(1);
}

const arr = eval(match[2]);
let fixedCount = 0;
let smp_ipa_repaired = 0;
let smp_ips_repaired = 0;
let sma_bio_repaired = 0;
let sma_fis_repaired = 0;

arr.forEach(q => {
  if (q.challengeType === undefined || !['IDENTIFY', 'CALCULATE', 'CLASSIFY', 'SEQUENCE', 'LOCATE', 'PRIORITIZE', 'MULTI_TARGET', 'LEGACY'].includes(q.challengeType)) {
    // Only target banks
    const isSmpIpa = q.id.startsWith('smp_ipa_');
    const isSmpIps = q.id.startsWith('smp_ips_');
    const isSmaBio = q.id.startsWith('sma_bio_');
    const isSmaFis = q.id.startsWith('sma_fis_');

    if (isSmpIpa || isSmpIps || isSmaBio || isSmaFis) {
      q.challengeType = 'IDENTIFY';
      fixedCount++;
      if (isSmpIpa) smp_ipa_repaired++;
      if (isSmpIps) smp_ips_repaired++;
      if (isSmaBio) sma_bio_repaired++;
      if (isSmaFis) sma_fis_repaired++;
    }
  }
});

const newArrStr = JSON.stringify(arr, null, 2);
const newContent = content.substring(0, match.index) + match[1] + newArrStr + ";" + content.substring(match.index + match[0].length);

fs.writeFileSync('src/engine/EducationalEngine.ts', newContent);

console.log(`Fixed ${fixedCount} questions.`);
console.log(`SMP IPA: ${smp_ipa_repaired}`);
console.log(`SMP IPS: ${smp_ips_repaired}`);
console.log(`SMA BIO: ${sma_bio_repaired}`);
console.log(`SMA FIS: ${sma_fis_repaired}`);
