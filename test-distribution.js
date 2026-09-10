const fs = require('fs');

const questions = [];
for(let i=0; i<20; i++) {
  const jawabanBenar = "Correct";
  const pengecohList = ["Distractor1", "Distractor2", "Distractor3"];
  const allOptions = [jawabanBenar, ...pengecohList];
  
  const challengeType = 'IDENTIFY';
  const isTrueFalse = false;
  
  let options = [...allOptions];
  if (!isTrueFalse && challengeType === 'IDENTIFY') {
     for (let j = options.length - 1; j > 0; j--) {
         const k = Math.floor(Math.random() * (j + 1));
         [options[j], options[k]] = [options[k], options[j]];
     }
  }
  
  questions.push({ jawabanBenar, options });
}

let counts = [0, 0, 0, 0];
questions.forEach(q => {
   const index = q.options.indexOf(q.jawabanBenar);
   counts[index]++;
});

console.log(`A: ${counts[0]}`);
console.log(`B: ${counts[1]}`);
console.log(`C: ${counts[2]}`);
console.log(`D: ${counts[3]}`);

