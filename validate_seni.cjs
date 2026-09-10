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
  
  const fcSeni = arr.filter(q => q.id.startsWith('FC-SENI-'));
  console.log('Total FC-SENI:', fcSeni.length);
  
  const idSet = new Set(fcSeni.map(q => q.id));
  console.log('Unique IDs:', idSet.size);
  
  let easy = 0, medium = 0, hard = 0, identify = 0;
  fcSeni.forEach(q => {
      if (q.difficulty === 'EASY') easy++;
      if (q.difficulty === 'MEDIUM') medium++;
      if (q.difficulty === 'HARD') hard++;
      if (q.challengeType === 'IDENTIFY') identify++;
  });
  
  console.log('EASY:', easy, 'MEDIUM:', medium, 'HARD:', hard);
  console.log('IDENTIFY:', identify);
  
  let metadataPass = true;
  let choicesCountPass = true;
  let maxLength = 0;
  fcSeni.forEach(q => {
      if (q.jenjang !== 'SD' || q.kelasAtauFase !== 'Fase C' || q.mataPelajaran !== 'Seni Budaya') {
          metadataPass = false;
      }
      if (q.pengecoh.length !== 3 || !q.jawabanBenar) {
          choicesCountPass = false;
      }
      const len = q.jawabanBenar.split(' ').length;
      if (len > maxLength) maxLength = len;
      q.pengecoh.forEach(p => {
          const l = p.split(' ').length;
          if (l > maxLength) maxLength = l;
      });
  });
  console.log('Metadata Pass:', metadataPass);
  console.log('Choices Count Pass:', choicesCountPass);
  console.log('Max Choice Length:', maxLength);
  
  // also check how many existing banks
  const types = new Set(arr.map(q => q.id.split('-')[1]));
  console.log('Existing subjects:', Array.from(types).join(', '));
}
