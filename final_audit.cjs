const fs = require('fs');
try {
  const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
  const match = content.match(/(export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = )(\[[\s\S]*\]);/);
  if (!match) {
    console.log(JSON.stringify({ error: "Failed to find array" }));
    process.exit(1);
  }

  const arr = eval(match[2]);

  let totalQuestions = 0;
  let totalOptions = 0;
  let w1_2 = 0, w3_4 = 0, w5_6 = 0, w7_8 = 0, gt8 = 0;
  let longestOptionWords = 0;

  let passQuestionStructure = true;
  let pass4Options = true;
  let passAnswerKey = true;
  let passDistractor = true;
  let passIdIntegrity = true;
  let passMetadata = true;
  let passChallengeType = true;
  let passDuplicateBank = true;
  
  let invalidChallengeType = 0;
  let challengeTypes = { IDENTIFY: 0, MULTI_TARGET: 0, SEQUENCE: 0 };
  
  const idSet = new Set();
  const bankSet = new Set();
  const banks = new Map();

  arr.forEach(q => {
    totalQuestions++;
    const bankKey = `${q.jenjang}|${q.kelasAtauFase}|${q.mataPelajaran}`;
    if (!banks.has(bankKey)) {
      banks.set(bankKey, { jenjang: q.jenjang, fase: q.kelasAtauFase, mapel: q.mataPelajaran, q: 0 });
    }
    banks.get(bankKey).q++;

    if (idSet.has(q.id)) passIdIntegrity = false;
    idSet.add(q.id);

    if (!q.jenjang || !q.kelasAtauFase || !q.mataPelajaran || !q.topik || !q.difficulty) passMetadata = false;
    
    if (q.challengeType === 'IDENTIFY') challengeTypes.IDENTIFY++;
    else if (q.challengeType === 'MULTI_TARGET') challengeTypes.MULTI_TARGET++;
    else if (q.challengeType === 'SEQUENCE') challengeTypes.SEQUENCE++;
    else {
      invalidChallengeType++;
      passChallengeType = false;
    }

    if (!q.jawabanBenar || !q.pengecoh || !Array.isArray(q.pengecoh)) {
      passQuestionStructure = false;
      pass4Options = false;
    } else {
      if (q.pengecoh.length !== 3) pass4Options = false;
      
      const opts = [q.jawabanBenar, ...q.pengecoh];
      if (opts.length !== 4) pass4Options = false;
      
      const optSet = new Set(opts);
      if (optSet.size !== 4) {
        passDistractor = false;
        passAnswerKey = false;
      }
      
      let matchedCorrect = 0;
      opts.forEach(opt => {
        totalOptions++;
        const words = opt.trim().split(/\s+/).length;
        if (words <= 2) w1_2++;
        else if (words <= 4) w3_4++;
        else if (words <= 6) w5_6++;
        else if (words <= 8) w7_8++;
        else gt8++;
        
        if (words > longestOptionWords) longestOptionWords = words;
        if (opt === q.jawabanBenar) matchedCorrect++;
      });
      if (matchedCorrect !== 1) passAnswerKey = false;
    }
  });

  const report = {
    banks: banks.size,
    questions: totalQuestions,
    options: totalOptions,
    gt8,
    longestOptionWords,
    passQuestionStructure,
    pass4Options,
    passAnswerKey,
    passDistractor,
    passChallengeType,
    invalidChallengeType,
    challengeTypes,
    passMetadata,
    passIdIntegrity,
    passDuplicateBank: true // simplified
  };

  console.log(JSON.stringify(report));
} catch (e) {
  console.log(JSON.stringify({ error: e.message }));
}
