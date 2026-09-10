const fs = require('fs');
const kka = JSON.parse(fs.readFileSync('fd_kka.json', 'utf8'));

let out = '';
kka.forEach(q => {
  out += `ID: ${q.id}\n`;
  out += `J_ORIG: ${q.jawabanBenar}\n`;
  out += `J_NEW: \n`;
  q.pengecoh.forEach((p, i) => {
    out += `P${i}_ORIG: ${p}\n`;
    out += `P${i}_NEW: \n`;
  });
  out += '\n';
});

fs.writeFileSync('kka_compress.txt', out);
console.log('Prepared kka_compress.txt');
