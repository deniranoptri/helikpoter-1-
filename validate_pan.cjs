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
  
  const fcPan = arr.filter(q => q.id.startsWith('FC-PAN-'));
  console.log('Total FC-PAN:', fcPan.length);
  
  const idSet = new Set(fcPan.map(q => q.id));
  console.log('Unique IDs:', idSet.size);
  
  let easy = 0, medium = 0, hard = 0, identify = 0;
  fcPan.forEach(q => {
      if (q.difficulty === 'EASY') easy++;
      if (q.difficulty === 'MEDIUM') medium++;
      if (q.difficulty === 'HARD') hard++;
      if (q.challengeType === 'IDENTIFY') identify++;
  });
  
  console.log('EASY:', easy, 'MEDIUM:', medium, 'HARD:', hard);
  console.log('IDENTIFY:', identify);
  
  const q5 = fcPan.find(q => q.id === 'FC-PAN-005');
  console.log('FC-PAN-005 Correct Answer:', q5.jawabanBenar);
  
  const q14 = fcPan.find(q => q.id === 'FC-PAN-014');
  console.log('FC-PAN-014 Correct Answer:', q14.jawabanBenar);
  
  const q22 = fcPan.find(q => q.id === 'FC-PAN-022');
  console.log('FC-PAN-022 Correct Answer:', q22.jawabanBenar);
  
  const q30 = fcPan.find(q => q.id === 'FC-PAN-030');
  console.log('FC-PAN-030 Correct Answer:', q30.jawabanBenar);
  
  let metadataPass = true;
  let choicesCountPass = true;
  fcPan.forEach(q => {
      if (q.jenjang !== 'SD' || q.kelasAtauFase !== 'Fase C' || q.mataPelajaran !== 'Pendidikan Pancasila') {
          metadataPass = false;
      }
      if (q.pengecoh.length !== 3 || !q.jawabanBenar) {
          choicesCountPass = false;
      }
  });
  console.log('Metadata Pass:', metadataPass);
  console.log('Choices Count Pass:', choicesCountPass);
}
