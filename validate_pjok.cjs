const fs = require('fs');

const filePath = 'src/engine/EducationalEngine.ts';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/m;
const match = content.match(regex);

if (match) {
  let arr;
  try {
    arr = eval(match[1]);
  } catch (err) {
    console.error('Eval error', err);
    process.exit(1);
  }
  
  const fcPjok = arr.filter(q => q.id.startsWith('FC-PJOK-'));
  console.log('Total FC-PJOK:', fcPjok.length);
  
  const idSet = new Set(fcPjok.map(q => q.id));
  console.log('Unique IDs:', idSet.size);
  
  let easy = 0, medium = 0, hard = 0, identify = 0;
  fcPjok.forEach(q => {
      if (q.difficulty === 'EASY') easy++;
      if (q.difficulty === 'MEDIUM') medium++;
      if (q.difficulty === 'HARD') hard++;
      if (q.challengeType === 'IDENTIFY') identify++;
  });
  
  console.log('EASY:', easy, 'MEDIUM:', medium, 'HARD:', hard);
  console.log('IDENTIFY:', identify);
  
  const q4 = fcPjok.find(q => q.id === 'FC-PJOK-004');
  console.log('FC-PJOK-004 Explanation:', q4.explanation);
  
  const q11 = fcPjok.find(q => q.id === 'FC-PJOK-011');
  console.log('FC-PJOK-011 Pertanyaan:', q11.pertanyaan);
  
  const q25 = fcPjok.find(q => q.id === 'FC-PJOK-025');
  console.log('FC-PJOK-025 Explanation:', q25.explanation);
  
  const q26 = fcPjok.find(q => q.id === 'FC-PJOK-026');
  console.log('FC-PJOK-026 Jawaban:', q26.jawabanBenar);
  console.log('FC-PJOK-026 Explanation:', q26.explanation);
  
  const q28 = fcPjok.find(q => q.id === 'FC-PJOK-028');
  console.log('FC-PJOK-028 Explanation:', q28.explanation);
  
  let metadataPass = true;
  let choicesCountPass = true;
  let maxLength = 0;
  fcPjok.forEach(q => {
      if (q.jenjang !== 'SD' || q.kelasAtauFase !== 'Fase C' || q.mataPelajaran !== 'PJOK') {
          metadataPass = false;
      }
      if (q.pengecoh.length !== 3 || !q.jawabanBenar) {
          choicesCountPass = false;
      }
      const len = q.jawabanBenar.split(' ').length;
      if (len > maxLength) maxLength = len;
  });
  console.log('Metadata Pass:', metadataPass);
  console.log('Choices Count Pass:', choicesCountPass);
  console.log('Max Choice Length:', maxLength);
}
